import type Bull from "bull";

import { UserProfiles } from "@/models/index.js";
import { Not } from "typeorm";
import { queueLogger } from "../../logger.js";
import { getRelMeLinks } from "@/services/fetch-rel-me.js";
import config from "@/config/index.js";

const logger = queueLogger.createSubLogger("verify-links");

export async function verifyLinks(
	job: Bull.Job<Record<string, unknown>>,
	done: any,
): Promise<void> {
	logger.info("Verifying links...");

	const usersToVerify = await UserProfiles.findBy({
		fields: Not(null),
		userHost: "",
	});
	for (const user of usersToVerify) {
		const fields = user.fields
			.filter(
				(x) =>
					typeof x.name === "string" &&
					x.name !== "" &&
					typeof x.value === "string" &&
					x.value !== "" &&
					((x.lastVerified &&
						x.lastVerified.getTime() < Date.now() - 1000 * 60 * 60 * 24 * 14) ||
						!x.lastVerified),
			)
			.map(async (x) => {
				const relMeLinks = await getRelMeLinks(x.value);
				const verified = relMeLinks.some((link) =>
					link.includes(`${config.host}/@${user.user?.host}`),
				);
				return {
					name: x.name,
					value: x.value,
					verified: verified,
					lastVerified: new Date(),
				};
			});
		if (fields.length > 0) {
			const fieldsFinal = await Promise.all(fields);
			try {
				await UserProfiles.update(user.userId, {
					fields: fieldsFinal,
				});
			}
			catch (e: any) {
				logger.error(`Failed to update user ${user.userId} ${e}`);
				done(e);
				break;
			}
		}
	}

	logger.succ("All links successfully verified.");
	done();
}
