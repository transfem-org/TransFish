import define from "../../../define.js";
import { DriveFiles, Emojis } from "@/models/index.js";
import { In } from "typeorm";
import { deleteFile } from "@/services/drive/delete-file.js";
import { insertModerationLog } from "@/services/insert-moderation-log.js";
import { ApiError } from "../../../error.js";
import { db } from "@/db/postgre.js";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireModerator: true,
} as const;

export const paramDef = {
	type: "object",
	properties: {
		ids: {
			type: "array",
			items: {
				type: "string",
				format: "misskey:id",
			},
		},
	},
	required: ["ids"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const emojis = await Emojis.findBy({
		id: In(ps.ids),
	});

	for (const emoji of emojis) {
		const file = await DriveFiles.findOneBy({ url: emoji.publicUrl || emoji.originalUrl });

		if (file !== null) deleteFile(file);

		await Emojis.delete(emoji.id);

		await db.queryResultCache!.remove(["meta_emojis"]);

		insertModerationLog(me, "deleteEmoji", {
			emoji: emoji,
		});
	}
});
