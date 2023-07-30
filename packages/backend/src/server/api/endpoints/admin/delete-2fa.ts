import { Users, UserProfiles } from "@/models/index.js";
import { publishMainStream } from "@/services/stream.js";
import define from "../../define.js";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireAdmin: true,

	res: {},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		userId: { type: "string", format: "misskey:id" },
	},
	required: ["userId"],
} as const;

export default define(meta, paramDef, async (ps) => {
	const user = await Users.findOneByOrFail({ id: ps.userId });
	if (user.isDeleted) {
		return;
	}

	await UserProfiles.update(user.id, {
		twoFactorSecret: null,
		twoFactorEnabled: false,
		usePasswordLessLogin: false,
	});

	const iObj = await Users.pack(user.id, user, {
		detail: true,
		includeSecrets: true,
	});

	publishMainStream(user.id, "meUpdated", iObj);
});
