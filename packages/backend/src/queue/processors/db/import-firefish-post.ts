import * as Post from "@/misc/post.js";
import create from "@/services/note/create.js";
import { Users } from "@/models/index.js";
import type { DbUserImportMastoPostJobData } from "@/queue/types.js";
import { queueLogger } from "../../logger.js";
import { uploadFromUrl } from "@/services/drive/upload-from-url.js";
import type { DriveFile } from "@/models/entities/drive-file.js";
import type Bull from "bull";
import { createImportCkPostJob } from "@/queue/index.js";
import { Notes, NoteEdits } from "@/models/index.js";
import type { Note } from "@/models/entities/note.js";
import { genId } from "@/misc/gen-id.js";

const logger = queueLogger.createSubLogger("import-firefish-post");

export async function importCkPost(
	job: Bull.Job<DbUserImportMastoPostJobData>,
	done: any,
): Promise<void> {
	const user = await Users.findOneBy({ id: job.data.user.id });
	if (user == null) {
		done();
		return;
	}
	const post = job.data.post;
	/*
	if (post.replyId != null) {
		done();
		return;
	}
	if (post.renoteId != null) {
		done();
		return;
	}
	if (post.visibility !== "public") {
		done();
		return;
	}
	*/
	const urls = (post.files || [])
		.map((x: any) => x.url)
		.filter((x: String) => x.startsWith("http"));
	const files: DriveFile[] = [];
	for (const url of urls) {
		try {
			const file = await uploadFromUrl({
				url: url,
				user: user,
			});
			files.push(file);
		} catch (e) {
			logger.error(`Skipped adding file to drive: ${url}`);
		}
	}
	const { text, cw, localOnly, createdAt, visibility } = Post.parse(post);
	let note = await Notes.findOneBy({
		createdAt: createdAt,
		text: text,
		userId: user.id,
	});

	if (note && (note?.fileIds?.length || 0) < files.length) {
		const update: Partial<Note> = {};
		update.fileIds = files.map((x) => x.id);
		await Notes.update(note.id, update);
		await NoteEdits.insert({
			id: genId(),
			noteId: note.id,
			text: note.text || undefined,
			cw: note.cw,
			fileIds: note.fileIds,
			updatedAt: new Date(),
		});
		logger.info(`Note file updated`);
	}
	if (!note) {
		note = await create(user, {
			createdAt: createdAt,
			files: files.length == 0 ? undefined : files,
			poll: undefined,
			text: text || undefined,
			reply: post.replyId ? job.data.parent : null,
			renote: post.renoteId ? job.data.parent : null,
			cw: cw,
			localOnly,
			visibility: visibility,
			visibleUsers: [],
			channel: null,
			apMentions: new Array(0),
			apHashtags: undefined,
			apEmojis: undefined,
		});
		logger.info(`Create new note`);
	} else {
		logger.info(`Note exist`);
	}
	logger.succ("Imported");
	if (post.childNotes) {
		for (const child of post.childNotes) {
			createImportCkPostJob(
				job.data.user,
				child,
				job.data.signatureCheck,
				note,
			);
		}
	}
	done();
}
