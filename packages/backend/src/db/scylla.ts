import config from "@/config/index.js";
import type { PopulatedEmoji } from "@/misc/populate-emojis.js";
import type { Note } from "@/models/entities/note.js";
import type { NoteReaction } from "@/models/entities/note-reaction.js";
import { Client, types } from "cassandra-driver";
import type { User } from "@/models/entities/user.js";
import { LocalFollowingsCache } from "@/misc/cache.js";

function newClient(): Client | null {
	if (!config.scylla) {
		return null;
	}

	return new Client({
		contactPoints: config.scylla.nodes,
		localDataCenter: config.scylla.localDataCentre,
		keyspace: config.scylla.keyspace,
	});
}

export const scyllaClient = newClient();

export const prepared = {
	note: {
		insert: `INSERT INTO note (
				"createdAtDate",
				"createdAt",
				"id",
				"visibility",
				"content",
				"name",
				"cw",
				"localOnly",
				"renoteCount",
				"repliesCount",
				"uri",
				"url",
				"score",
				"files",
				"visibleUserIds",
				"mentions",
				"emojis",
				"tags",
				"hasPoll",
				"threadId",
				"channelId",
				"channelName",
				"userId",
				"userHost",
				"replyId",
				"replyUserId",
				"replyUserHost",
				"renoteId",
				"renoteUserId",
				"renoteUserHost",
				"reactions",
				"noteEdit",
				"updatedAt"
			)
			VALUES
			(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		select: {
			byDate: `SELECT * FROM note WHERE "createdAtDate" IN ?`,
			byId: `SELECT * FROM note WHERE "id" IN ?`,
			byUri: `SELECT * FROM note WHERE "uri" IN ?`,
			byUrl: `SELECT * FROM note WHERE "url" IN ?`,
			byUserId: `SELECT * FROM note_by_userid WHERE "userId" IN ?`,
		},
		delete: `DELETE FROM note WHERE "createdAtDate" = ? AND "createdAt" = ? AND "id" = ?`,
		update: {
			renoteCount: `UPDATE note SET
				"renoteCount" = ?,
				"score" = ?
				WHERE "createdAtDate" = ? AND "createdAt" = ? AND "id" = ? IF EXISTS`,
			reactions: `UPDATE note SET
				"emojis" = ?,
				"reactions" = ?,
				"score" = ?
				WHERE "createdAtDate" = ? AND "createdAt" = ? AND "id" = ? IF EXISTS`,
		},
	},
	reaction: {
		insert: `INSERT INTO reaction
			("id", "noteId", "userId", "reaction", "emoji", "createdAt")
			VALUES (?, ?, ?, ?, ?, ?)`,
		select: {
			byNoteId: `SELECT * FROM reaction WHERE "noteId" IN ?`,
			byUserId: `SELECT * FROM reaction_by_userid WHERE "userId" IN ?`,
			byNoteAndUser: `SELECT * FROM reaction WHERE "noteId" = ? AND "userId" = ?`,
			byId: `SELECT * FROM reaction WHERE "id" IN ?`,
		},
		delete: `DELETE FROM reaction WHERE "noteId" = ? AND "userId" = ?`,
	},
};

export interface ScyllaDriveFile {
	id: string;
	type: string;
	createdAt: Date;
	name: string;
	comment: string | null;
	blurhash: string | null;
	url: string;
	thumbnailUrl: string;
	isSensitive: boolean;
	isLink: boolean;
	md5: string;
	size: number;
}

export interface ScyllaNoteEditHistory {
	content: string;
	cw: string;
	files: ScyllaDriveFile[];
	updatedAt: Date;
}

export type ScyllaNote = Note & {
	createdAtDate: Date;
	files: ScyllaDriveFile[];
	channelName: string;
	noteEdit: ScyllaNoteEditHistory[];
};

export function parseScyllaNote(row: types.Row): ScyllaNote {
	const files: ScyllaDriveFile[] = row.get("files");
	return {
		createdAtDate: row.get("createdAtDate"),
		createdAt: row.get("createdAt"),
		id: row.get("id"),
		visibility: row.get("visibility"),
		text: row.get("content"),
		name: row.get("name"),
		cw: row.get("cw"),
		localOnly: row.get("localOnly"),
		renoteCount: row.get("renoteCount"),
		repliesCount: row.get("repliesCount"),
		uri: row.get("uri"),
		url: row.get("url"),
		score: row.get("score"),
		files,
		fileIds: files.map((file) => file.id),
		attachedFileTypes: files.map((file) => file.type),
		visibleUserIds: row.get("visibleUserIds"),
		mentions: row.get("mentions"),
		emojis: row.get("emojis"),
		tags: row.get("tags"),
		hasPoll: row.get("hasPoll"),
		threadId: row.get("threadId"),
		channelId: row.get("channelId"),
		channelName: row.get("channelName"),
		userId: row.get("userId"),
		userHost: row.get("userHost"),
		replyId: row.get("replyId"),
		replyUserId: row.get("replyUserId"),
		replyUserHost: row.get("replyUserHost"),
		renoteId: row.get("replyId"),
		renoteUserId: row.get("renoteUserId"),
		renoteUserHost: row.get("renoteUserHost"),
		reactions: row.get("reactions"),
		noteEdit: row.get("noteEdit"),
		updatedAt: row.get("updatedAt"),
		/* unused postgres denormalization */
		channel: null,
		renote: null,
		reply: null,
		mentionedRemoteUsers: "",
		user: null,
	};
}

export interface ScyllaNoteReaction extends NoteReaction {
	emoji: PopulatedEmoji;
}

export function parseScyllaReaction(row: types.Row): ScyllaNoteReaction {
	return {
		id: row.get("id"),
		noteId: row.get("noteId"),
		userId: row.get("userId"),
		reaction: row.get("reaction"),
		createdAt: row.get("createdAt"),
		emoji: row.get("emoji"),
	};
}

export async function isVisible(
	note: ScyllaNote,
	user: { id: User["id"] } | null,
): Promise<boolean> {
	let visible = false;

	if (
		["public", "home"].includes(note.visibility) // public post
	) {
		visible = true;
	} else if (user) {
		const cache = await LocalFollowingsCache.init(user.id);

		visible =
			note.userId === user.id || // my own post
			note.visibleUserIds.includes(user.id) || // visible to me
			note.mentions.includes(user.id) || // mentioned me
			(note.visibility === "followers" &&
				(await cache.isFollowing(note.userId))) || // following
			note.replyUserId === user.id; // replied to myself
	}

	return visible;
}
