import define from "../define.js";
import { redisClient } from "@/db/redis.js";

export const meta = {
	tags: ["meta"],
	description: "Get list of Firefish patrons from Codeberg",

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
		AbortSignal.timeout ??= function timeout(ms) {
			const ctrl = new AbortController()
			setTimeout(() => ctrl.abort(), ms)
			return ctrl.signal
		}

		patrons = await fetch(
			"https://codeberg.org/firefish/firefish/raw/branch/develop/patrons.json",
			{ signal: AbortSignal.timeout(2000) }
		)
			.then((response) => response.json())
			.catch(() => {
				patrons = cachedPatrons ? JSON.parse(cachedPatrons) : [];
			});
		await redisClient.set("patrons", JSON.stringify(patrons), "EX", 3600);
	}

	return patrons["patrons"];
});
