import { IsNull } from "typeorm";
import follow from "@/services/following/create.js";

import * as Post from "@/misc/post.js";
import create from "@/services/note/create.js";
import { downloadTextFile } from "@/misc/download-text-file.js";
import { Users, DriveFiles } from "@/models/index.js";
import type { DbUserImportJobData } from "@/queue/types.js";
import { queueLogger } from "../../logger.js";
import type Bull from "bull";

const logger = queueLogger.createSubLogger("import-posts");

export async function importPosts(
	job: Bull.Job<DbUserImportJobData>,
	done: any,
): Promise<void> {
	logger.info(`Importing posts of ${job.data.user.id} ...`);

	const user = await Users.findOneBy({ id: job.data.user.id });
	if (user == null) {
		done();
		return;
	}

	const file = await DriveFiles.findOneBy({
		id: job.data.fileId,
	});
	if (file == null) {
		done();
		return;
	}

	const json = await downloadTextFile(file.url);

	let linenum = 0;

	try {
		for (const post of JSON.parse(json)) {
			try {
				linenum++;
				if (post.replyId != null) {
					logger.info(`Is reply, skip [${linenum}] ...`);
					continue;
				}
				if (post.renoteId != null) {
					logger.info(`Is boost, skip [${linenum}] ...`);
					continue;
				}
				if (post.visibility !== "public") {
					logger.info(`Is non-public, skip [${linenum}] ...`);
					continue;
				}
				const { text, cw, localOnly, createdAt } = Post.parse(post);

				logger.info(`Posting[${linenum}] ...`);

				const note = await create(user, {
					createdAt: createdAt,
					files: undefined,
					poll: undefined,
					text: text || undefined,
					reply: null,
					renote: null,
					cw: cw,
					localOnly,
					visibility: "public",
					visibleUsers: [],
					channel: null,
					apMentions: null,
					apHashtags: undefined,
					apEmojis: undefined,
				});
			} catch (e) {
				logger.warn(`Error in line:${linenum} ${e}`);
			}
		}
	} catch (e) {
		// handle error
		logger.warn(`Error reading: ${e}`);
	}

	logger.succ("Imported");
	done();
}
