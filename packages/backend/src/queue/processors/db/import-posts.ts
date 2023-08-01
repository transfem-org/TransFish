import { downloadTextFile } from "@/misc/download-text-file.js";
import { processMastoNotes } from "@/misc/process-masto-notes.js";
import { Users, DriveFiles } from "@/models/index.js";
import type { DbUserImportPostsJobData } from "@/queue/types.js";
import { queueLogger } from "../../logger.js";
import type Bull from "bull";
import {
	createImportCkPostJob,
	createImportMastoPostJob,
} from "@/queue/index.js";

const logger = queueLogger.createSubLogger("import-posts");

export async function importPosts(
	job: Bull.Job<DbUserImportPostsJobData>,
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

	if (file.name.endsWith("tar.gz") || file.name.endsWith("zip")) {
		try {
			logger.info("Reading Mastodon archive");
			const outbox = await processMastoNotes(
				file.name,
				file.url,
				job.data.user.id,
			);
			for (const post of outbox.orderedItems) {
				createImportMastoPostJob(job.data.user, post, job.data.signatureCheck);
			}
		} catch (e) {
			// handle error
			logger.warn(`Failed reading Mastodon archive: ${e}`);
		}
		logger.succ("Mastodon archive imported");
		done();
		return;
	}

	const json = await downloadTextFile(file.url);

	try {
		const parsed = JSON.parse(json);
		if (parsed instanceof Array) {
			logger.info("Parsing key style posts");
			const arr = recreateChain(parsed);
			for (const post of arr) {
				createImportCkPostJob(job.data.user, post, job.data.signatureCheck);
			}
		} else if (parsed instanceof Object) {
			logger.info("Parsing animal style posts");
			for (const post of parsed.orderedItems) {
				createImportMastoPostJob(job.data.user, post, job.data.signatureCheck);
			}
		}
	} catch (e) {
		// handle error
		logger.warn(`Error reading: ${e}`);
	}

	logger.succ("Imported");
	done();
}

function recreateChain(arr: any[]): any {
	type NotesMap = {
		[id: string]: any;
	};
	const notesTree: any[] = [];
	const lookup: NotesMap = {};
	for (const note of arr) {
		lookup[`${note.id}`] = note;
		note.childNotes = [];
		if (note.replyId == null && note.renoteId == null) {
			notesTree.push(note);
		}
	}
	for (const note of arr) {
		let parent = null;
		if (note.replyId != null) {
			parent = lookup[`${note.replyId}`];
		}
		if (note.renoteId != null) {
			parent = lookup[`${note.renoteId}`];
		}

		if (parent) {
			parent.childNotes.push(note);
		}
	}
	return notesTree;
}
