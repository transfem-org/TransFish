import config from "@/config/index.js";
import { Client } from "cassandra-driver";

function newClient(): Client | null {
	if (!config.scylla) {
		return null;
	}

	return new Client({
		contactPoints: config.scylla.nodes,
		keyspace: config.scylla.keyspace,
	});
}

export const scyllaClient = newClient();

export const prepared = {
	timeline: {
		insert: `INSERT INTO note (
				created_at_date,
				created_at,
				id,
				visibility,
				content,
				name,
				cw,
				local_only,
				renote_count,
				replies_count,
				uri,
				url,
				score,
				files,
				visible_users,
				mentions,
				emojis,
				tags,
				has_poll,
				thread_id,
				channel_id,
				channel_name,
				user_id,
				user_id,
				reply_id,
				renote_id,
				note_edit,
				updated_at,
				reactions,
				reaction_emojis
			)
			VALUES
			(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		select: {
			byDate: "SELECT * FROM note WHERE created_at_date = ? AND created_at < ?",
			byId: "SELECT * FROM note WHERE id IN ?",
			byUri: "SELECT * FROM note WHERE uri = ?",
			byUrl: "SELECT * FROM note WHERE url = ?",
			byUserId: "SELECT * FROM note WHERE user_id = ? AND created_at < ?",
		},
		delete: "DELETE FROM note WHERE id IN ?",
	},
}
