import define from "../define.js";
import { redisClient } from "@/db/redis.js";

export const meta = {
	tags: ["meta"],
	description: "Get list of Calckey patrons from Codeberg",

	requireCredential: false,
	requireCredentialPrivateMode: false,
} as const;

export const paramDef = {
	type: "object",
	properties: {
		forceUpdate: { type: "boolean", default: false },
	},
	required: [],
} as const;

export default define(meta, paramDef, async (ps) => {
	let patrons;
	const cachedPatrons = await redisClient.get("patrons");
	if (!ps.forceUpdate && cachedPatrons) {
		patrons = JSON.parse(cachedPatrons);
	} else {
		patrons = await fetch(
			"https://codeberg.org/calckey/calckey/raw/branch/develop/patrons.json",
		)
			.then((response) => response.json())
			.catch(() => {
				patrons = cachedPatrons ? JSON.parse(cachedPatrons) : [];
			});
		await redisClient.set("patrons", JSON.stringify(patrons), "EX", 3600);
	}

	return patrons["patrons"];
});
