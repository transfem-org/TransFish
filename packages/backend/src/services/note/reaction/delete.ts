import { publishNoteStream } from "@/services/stream.js";
import { renderLike } from "@/remote/activitypub/renderer/like.js";
import renderUndo from "@/remote/activitypub/renderer/undo.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import DeliverManager from "@/remote/activitypub/deliver-manager.js";
import { IdentifiableError } from "@/misc/identifiable-error.js";
import type { User, IRemoteUser } from "@/models/entities/user.js";
import type { Note } from "@/models/entities/note.js";
import { NoteReactions, Users, Notes } from "@/models/index.js";
import { decodeReaction } from "@/misc/reaction-lib.js";
import { parseScyllaReaction, prepared, scyllaClient } from "@/db/scylla.js";
import type { NoteReaction } from "@/models/entities/note-reaction.js";

export default async (
	user: { id: User["id"]; host: User["host"] },
	note: Note,
) => {
	let reaction: NoteReaction | null;
	if (scyllaClient) {
		const result = await scyllaClient.execute(
			prepared.reaction.select.byNoteAndUser,
			[note.id, user.id],
			{ prepare: true },
		);
		reaction =
			result.rowLength > 0 ? parseScyllaReaction(result.rows[0]) : null;
	} else {
		reaction = await NoteReactions.findOneBy({
			noteId: note.id,
			userId: user.id,
		});
	}

	// Delete reaction
	if (reaction) {
		if (scyllaClient) {
			await scyllaClient.execute(prepared.reaction.delete, [note.id, user.id], {
				prepare: true,
			});
		} else {
			await NoteReactions.delete(reaction.id);
		}
	} else {
		throw new IdentifiableError(
			"60527ec9-b4cb-4a88-a6bd-32d3ad26817d",
			"not reacted",
		);
	}

	// Decrement reactions count
	if (scyllaClient) {
		const count = Math.max((note.reactions[reaction.reaction] ?? 0) - 1, 0);
		if (count === 0) {
			delete note.reactions[reaction.reaction];
		} else {
			note.reactions[reaction.reaction] = count;
		}
		const date = new Date(note.createdAt.getTime());
		const emojiName = reaction.reaction.replaceAll(":", "");
		const emojiIndex = note.emojis.indexOf(emojiName);
		if (emojiIndex >= 0 && count === 0) note.emojis.splice(emojiIndex, 1);
		await scyllaClient.execute(
			prepared.note.update.reactions,
			[
				note.emojis,
				note.reactions,
				Math.max((note.score ?? 0) - 1, 0),
				date,
				date,
				note.id,
			],
			{ prepare: true },
		);
	} else {
		const sql = `jsonb_set("reactions", '{${reaction.reaction}}', (COALESCE("reactions"->>'${reaction.reaction}', '0')::int - 1)::text::jsonb)`;
		await Notes.createQueryBuilder()
			.update()
			.set({
				reactions: () => sql,
			})
			.where("id = :id", { id: note.id })
			.execute();

		Notes.decrement({ id: note.id }, "score", 1);
	}

	publishNoteStream(note.id, "unreacted", {
		reaction: decodeReaction(reaction.reaction).reaction,
		userId: user.id,
	});

	//#region 配信
	if (Users.isLocalUser(user) && !note.localOnly) {
		const content = renderActivity(
			renderUndo(await renderLike(reaction, note), user),
		);
		const dm = new DeliverManager(user, content);
		if (note.userHost !== null) {
			const reactee = await Users.findOneBy({ id: note.userId });
			dm.addDirectRecipe(reactee as IRemoteUser);
		}
		dm.addFollowersRecipe();
		dm.execute();
	}
	//#endregion
};
