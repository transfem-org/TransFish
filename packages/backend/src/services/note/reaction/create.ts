import { publishNoteStream } from "@/services/stream.js";
import { renderLike } from "@/remote/activitypub/renderer/like.js";
import DeliverManager from "@/remote/activitypub/deliver-manager.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { toDbReaction, decodeReaction } from "@/misc/reaction-lib.js";
import type { User, IRemoteUser } from "@/models/entities/user.js";
import type { Note } from "@/models/entities/note.js";
import {
	NoteReactions,
	Users,
	NoteWatchings,
	Notes,
	Emojis,
	Blockings,
} from "@/models/index.js";
import { IsNull, Not } from "typeorm";
import { perUserReactionsChart } from "@/services/chart/index.js";
import { genId } from "@/misc/gen-id.js";
import { createNotification } from "../../create-notification.js";
import deleteReaction from "./delete.js";
import { isDuplicateKeyValueError } from "@/misc/is-duplicate-key-value-error.js";
import type { NoteReaction } from "@/models/entities/note-reaction.js";
import { IdentifiableError } from "@/misc/identifiable-error.js";
import { prepared, scyllaClient } from "@/db/scylla.js";
import { populateEmojis } from "@/misc/populate-emojis.js";

export default async (
	user: { id: User["id"]; host: User["host"] },
	note: Note,
	reaction?: string,
) => {
	// Check blocking
	if (note.userId !== user.id) {
		const block = await Blockings.findOneBy({
			blockerId: note.userId,
			blockeeId: user.id,
		});
		if (block) {
			throw new IdentifiableError("e70412a4-7197-4726-8e74-f3e0deb92aa7");
		}
	}

	// check visibility
	if (!(await Notes.isVisibleForMe(note, user.id))) {
		throw new IdentifiableError(
			"68e9d2d1-48bf-42c2-b90a-b20e09fd3d48",
			"Note not accessible for you.",
		);
	}

	// Emoji data will be cached in toDbReaction.
	const { name: _reaction, emoji: emojiData } = await toDbReaction(
		reaction,
		user.host,
	);

	const record: NoteReaction = {
		id: genId(),
		createdAt: new Date(),
		noteId: note.id,
		userId: user.id,
		reaction: _reaction,
	};

	// Create reaction
	try {
		if (scyllaClient) {
			// INSERT to ScyllaDB is upsert, and the primary key of reaction table is ("noteId", "userId").
			// Thus, a reaction by the same user will be replaced if exists.
			await scyllaClient.execute(
				prepared.reaction.insert,
				[
					record.id,
					record.noteId,
					record.userId,
					_reaction,
					emojiData,
					record.createdAt,
				],
				{ prepare: true },
			);
		} else {
			await NoteReactions.insert(record);
		}
	} catch (e) {
		if (isDuplicateKeyValueError(e)) {
			const exists = await NoteReactions.findOneByOrFail({
				noteId: note.id,
				userId: user.id,
			});

			if (exists.reaction !== _reaction) {
				// 別のリアクションがすでにされていたら置き換える
				await deleteReaction(user, note);
				await NoteReactions.insert(record);
			} else {
				// 同じリアクションがすでにされていたらエラー
				throw new IdentifiableError("51c42bb4-931a-456b-bff7-e5a8a70dd298");
			}
		} else {
			throw e;
		}
	}

	// Increment reactions count
	if (scyllaClient) {
		const current = Math.max(note.reactions[_reaction] ?? 0, 0);
		note.reactions[_reaction] = current + 1;
		const emojiName = decodeReaction(_reaction).reaction.replaceAll(":", "");
		const date = new Date(note.createdAt.getTime());
		await scyllaClient.execute(
			prepared.note.update.reactions,
			[
				note.emojis.concat(emojiName),
				note.reactions,
				(note.score ?? 0) + 1,
				date,
				date,
				note.id,
			],
			{ prepare: true },
		);
	} else {
		const sql = `jsonb_set("reactions", '{${_reaction}}', (COALESCE("reactions"->>'${_reaction}', '0')::int + 1)::text::jsonb)`;
		await Notes.createQueryBuilder()
			.update()
			.set({
				reactions: () => sql,
				score: () => '"score" + 1',
			})
			.where("id = :id", { id: note.id })
			.execute();
	}

	perUserReactionsChart.update(user, note);

	// カスタム絵文字リアクションだったら絵文字情報も送る
	const decodedReaction = decodeReaction(_reaction);

	const emoji = await Emojis.findOne({
		where: {
			name: decodedReaction.name,
			host: decodedReaction.host ?? IsNull(),
		},
		select: ["name", "host", "originalUrl", "publicUrl"],
	});

	publishNoteStream(note.id, "reacted", {
		reaction: decodedReaction.reaction,
		emoji:
			emoji != null
				? {
						name: emoji.host
							? `${emoji.name}@${emoji.host}`
							: `${emoji.name}@.`,
						url: emoji.publicUrl || emoji.originalUrl, // || emoji.originalUrl してるのは後方互換性のため
				  }
				: null,
		userId: user.id,
	});

	// Create notification if the reaction target is a local user.
	if (note.userHost === null) {
		createNotification(note.userId, "reaction", {
			notifierId: user.id,
			note: note,
			noteId: note.id,
			reaction: _reaction,
		});
	}

	// Fetch watchers
	NoteWatchings.findBy({
		noteId: note.id,
		userId: Not(user.id),
	}).then((watchers) => {
		for (const watcher of watchers) {
			createNotification(watcher.userId, "reaction", {
				notifierId: user.id,
				note: note,
				noteId: note.id,
				reaction: _reaction,
			});
		}
	});

	//#region deliver
	if (
		Users.isLocalUser(user) &&
		!note.localOnly &&
		note.visibility !== "hidden"
	) {
		const content = renderActivity(await renderLike(record, note));
		const dm = new DeliverManager(user, content);
		if (note.userHost !== null) {
			const reactee = await Users.findOneBy({ id: note.userId });
			dm.addDirectRecipe(reactee as IRemoteUser);
		}

		if (["public", "home", "followers"].includes(note.visibility)) {
			dm.addFollowersRecipe();
		} else if (note.visibility === "specified") {
			const visibleUsers = await Promise.all(
				note.visibleUserIds.map((id) => Users.findOneBy({ id })),
			);
			for (const u of visibleUsers.filter((u) => u && Users.isRemoteUser(u))) {
				dm.addDirectRecipe(u as IRemoteUser);
			}
		}

		dm.execute();
	}
	//#endregion
};
