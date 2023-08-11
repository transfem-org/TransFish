import define from "../../../define.js";
import { DriveFiles, Emojis } from "@/models/index.js";
import { deleteFile } from "@/services/drive/delete-file.js";
import { insertModerationLog } from "@/services/insert-moderation-log.js";
import { ApiError } from "../../../error.js";
import { db } from "@/db/postgre.js";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireModerator: true,

	errors: {
		noSuchEmoji: {
			message: "No such emoji.",
			code: "NO_SUCH_EMOJI",
			id: "be83669b-773a-44b7-b1f8-e5e5170ac3c2",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		id: { type: "string", format: "misskey:id" },
	},
	required: ["id"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const emoji = await Emojis.findOneBy({ id: ps.id });

	if (emoji == null) throw new ApiError(meta.errors.noSuchEmoji);

	const file = await DriveFiles.findOneBy({ url: emoji.publicUrl || emoji.originalUrl });

	if (file !== null) deleteFile(file);

	await Emojis.delete(emoji.id);

	await db.queryResultCache!.remove(["meta_emojis"]);

	insertModerationLog(me, "deleteEmoji", {
		emoji: emoji,
	});
});
