import type httpSignature from "@peertube/http-signature";
import { v4 as uuid } from "uuid";

import * as Bull from "bullmq";
import { QUEUE, baseQueueOptions } from "./const.js";

import config from "@/config/index.js";
import type { DriveFile } from "@/models/entities/drive-file.js";
import type { IActivity } from "@/remote/activitypub/type.js";
import type { Webhook, webhookEventTypes } from "@/models/entities/webhook.js";
import { envOption } from "../env.js";

import processDeliver from "./processors/deliver.js";
import processInbox from "./processors/inbox.js";
import processDb from "./processors/db/index.js";
import processObjectStorage from "./processors/object-storage/index.js";
import processSystemQueue from "./processors/system/index.js";
import processWebhookDeliver from "./processors/webhook-deliver.js";
import processBackground from "./processors/background/index.js";
import { endedPollNotification } from "./processors/ended-poll-notification.js";
import { queueLogger } from "./logger.js";
import {
	systemQueue,
	dbQueue,
	deliverQueue,
	inboxQueue,
	objectStorageQueue,
	endedPollNotificationQueue,
	webhookDeliverQueue,
	backgroundQueue,
} from "./queues.js";
import type { ThinUser } from "./types.js";

// ref. https://github.com/misskey-dev/misskey/pull/7635#issue-971097019
function httpRelatedBackoff(attemptsMade: number) {
	const baseDelay = 60 * 1000; // 1min
	const maxBackoff = 8 * 60 * 60 * 1000; // 8hours
	let backoff = (Math.pow(2, attemptsMade) - 1) * baseDelay;
	backoff = Math.min(backoff, maxBackoff);
	backoff += Math.round(backoff * Math.random() * 0.2);
	return backoff;
}

function renderError(e: Error): any {
	return {
		stack: e.stack,
		message: e.message,
		name: e.name,
	};
}

const queueEventLogger = queueLogger.createSubLogger("queueEvent");
const queues = [
	{ queue: systemQueue, logger: systemLogger },
	{ queue: dbQueue, logger: dbLogger },
	{ queue: deliverQueue, logger: deliverLogger },
	{ queue: inboxQueue, logger: inboxLogger },
	{ queue: objectStorageQueue, logger: objectStorageLogger },
	{ queue: endedPollNotificationQueue, logger: pollLogger },
	{ queue: webhookDeliverQueue, logger: webhookLogger },
	{ queue: backgroundQueue, logger: systemLogger },
];

queues.forEach(({ queue, logger }) => {
	const queueName = queue.name;
	const queueEvents = new Bull.QueueEvents(queueName);
	queueEvents.on("waiting", (jobId) => queueEventLogger.debug(`waiting id=${jobId}`));
	queueEvents.on("active", (job) => queueEventLogger.debug(`active id=${job.jobId}`));
	queueEvents.on("completed", (job, result) =>
		queueEventLogger.debug(`completed(${result}) id=${job.jobId}`),
	);
	queueEvents.on("failed", (job, err) =>
		queueEventLogger.warn(`failed(${err}) id=${job.jobId}`, {
			job,
			e: renderError(err),
		}),
	);
	queueEvents.on("error", (err) =>
		queueEventLogger.error(`error(${err})`, {
			e: renderError(err),
		}),
	);
	queueEvents.on("stalled", (job) => queueEventLogger.warn(`stalled id=${job.jobId}`));
});

// const processPair = ({ queue, processor }: { queue: Bull.Queue; processor: Function }) => {
// 	new Bull.Worker(queue.name, (job) => processor(job), {
// 		concurrency: 1,
// 		...baseQueueOptions,
		
// 	});
// };

// const processors = [
// 	{ queue: systemQueue, processor: processSystemQueue },
// 	{ queue: dbQueue, processor: processDb },
// 	{ queue: deliverQueue, processor: processDeliver },
// 	{ queue: inboxQueue, processor: processInbox },
// 	{ queue: objectStorageQueue, processor: processObjectStorage },
// 	{ queue: endedPollNotificationQueue, processor: endedPollNotification },
// 	{ queue: webhookDeliverQueue, processor: processWebhookDeliver },
// 	{ queue: backgroundQueue, processor: processBackground },
// ];

// processors.forEach(processPair);

// Make queue workers for each queue

const systemQueueWorker = new Bull.Worker(QUEUE.SYSTEM, (job) => processSystemQueue(job), {
  concurrency: 10,
  limiter: {
    duration: 1000,
    max: 1,
  },
});


export function deliver(
	user: ThinUser,
	content: IActivity | null,
	to: string | null,
	isSharedInbox: boolean,
) {
	if (content == null) return null;
	if (to == null) return null;

	const data = {
		user: {
			id: user.id,
		},
		content,
		to,
		isSharedInbox,
	};

	return deliverQueue.add(to, data, {
		attempts: config.deliverJobMaxAttempts || 12,
		backoff: {
			type: "apBackoff",
		},
		removeOnComplete: 1000,
		removeOnFail: true,
	});
}

export function inbox(
	activity: IActivity,
	signature: httpSignature.IParsedSignature,
) {
	const data = {
		activity: activity,
		signature,
	};

	return inboxQueue.add(data, {
		attempts: config.inboxJobMaxAttempts || 8,
		timeout: 5 * 60 * 1000, // 5min
		backoff: {
			type: "apBackoff",
		},
		removeOnComplete: true,
		removeOnFail: true,
	});
}

export function createDeleteDriveFilesJob(user: ThinUser) {
	return dbQueue.add(
		"deleteDriveFiles",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportCustomEmojisJob(user: ThinUser) {
	return dbQueue.add(
		"exportCustomEmojis",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportNotesJob(user: ThinUser) {
	return dbQueue.add(
		"exportNotes",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportFollowingJob(
	user: ThinUser,
	excludeMuting = false,
	excludeInactive = false,
) {
	return dbQueue.add(
		"exportFollowing",
		{
			user: user,
			excludeMuting,
			excludeInactive,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportMuteJob(user: ThinUser) {
	return dbQueue.add(
		"exportMute",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportBlockingJob(user: ThinUser) {
	return dbQueue.add(
		"exportBlocking",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createExportUserListsJob(user: ThinUser) {
	return dbQueue.add(
		"exportUserLists",
		{
			user: user,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportFollowingJob(
	user: ThinUser,
	fileId: DriveFile["id"],
) {
	return dbQueue.add(
		"importFollowing",
		{
			user: user,
			fileId: fileId,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportPostsJob(
	user: ThinUser,
	fileId: DriveFile["id"],
	signatureCheck: boolean,
) {
	return dbQueue.add(
		"importPosts",
		{
			user: user,
			fileId: fileId,
			signatureCheck: signatureCheck,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportMastoPostJob(
	user: ThinUser,
	post: any,
	signatureCheck: boolean,
) {
	return dbQueue.add(
		"importMastoPost",
		{
			user: user,
			post: post,
			signatureCheck: signatureCheck,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
			attempts: config.inboxJobMaxAttempts || 8,
			timeout: 60 * 1000, // 1min
		},
	);
}

export function createImportCkPostJob(
	user: ThinUser,
	post: any,
	signatureCheck: boolean,
) {
	return dbQueue.add(
		"importCkPost",
		{
			user: user,
			post: post,
			signatureCheck: signatureCheck,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportMutingJob(user: ThinUser, fileId: DriveFile["id"]) {
	return dbQueue.add(
		"importMuting",
		{
			user: user,
			fileId: fileId,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportBlockingJob(
	user: ThinUser,
	fileId: DriveFile["id"],
) {
	return dbQueue.add(
		"importBlocking",
		{
			user: user,
			fileId: fileId,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportUserListsJob(
	user: ThinUser,
	fileId: DriveFile["id"],
) {
	return dbQueue.add(
		"importUserLists",
		{
			user: user,
			fileId: fileId,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createImportCustomEmojisJob(
	user: ThinUser,
	fileId: DriveFile["id"],
) {
	return dbQueue.add(
		"importCustomEmojis",
		{
			user: user,
			fileId: fileId,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createDeleteAccountJob(
	user: ThinUser,
	opts: { soft?: boolean } = {},
) {
	return dbQueue.add(
		"deleteAccount",
		{
			user: user,
			soft: opts.soft,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createDeleteObjectStorageFileJob(key: string) {
	return objectStorageQueue.add(
		"deleteFile",
		{
			key: key,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createCleanRemoteFilesJob() {
	return objectStorageQueue.add(
		"cleanRemoteFiles",
		{},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createIndexAllNotesJob(data = {}) {
	return backgroundQueue.add("indexAllNotes", data, {
		removeOnComplete: true,
		removeOnFail: true,
	});
}

export function webhookDeliver(
	webhook: Webhook,
	type: typeof webhookEventTypes[number],
	content: unknown,
) {
	const data = {
		type,
		content,
		webhookId: webhook.id,
		userId: webhook.userId,
		to: webhook.url,
		secret: webhook.secret,
		createdAt: Date.now(),
		eventId: uuid(),
	};

	return webhookDeliverQueue.add(data, {
		attempts: 4,
		timeout: 1 * 60 * 1000, // 1min
		backoff: {
			type: "apBackoff",
		},
		removeOnComplete: true,
		removeOnFail: true,
	});
}

export default function () {
	if (envOption.onlyServer) return;

	deliverQueue.process(config.deliverJobConcurrency || 128, processDeliver);
	inboxQueue.process(config.inboxJobConcurrency || 16, processInbox);
	endedPollNotificationQueue.process(endedPollNotification);
	webhookDeliverQueue.process(64, processWebhookDeliver);
	processDb(dbQueue);
	processObjectStorage(objectStorageQueue);
	processBackground(backgroundQueue);

	systemQueue.add(
		"tickCharts",
		{},
		{
			repeat: { pattern: "55 * * * *" },
		},
	);

	systemQueue.add(
		"resyncCharts",
		{},
		{
			repeat: { pattern: "0 0 * * *" },
			removeOnComplete: true,
		},
	);

	systemQueue.add(
		"cleanCharts",
		{},
		{
			repeat: { pattern: "0 0 * * *" },
			removeOnComplete: true,
		},
	);

	systemQueue.add(
		"clean",
		{},
		{
			repeat: { pattern: "0 0 * * *" },
			removeOnComplete: true,
		},
	);

	systemQueue.add(
		"checkExpiredMutings",
		{},
		{
			repeat: { pattern: "*/5 * * * *" },
			removeOnComplete: true,
		},
	);

	systemQueue.add(
		"setLocalEmojiSizes",
		{},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);

	processSystemQueue(systemQueue);
}

export function destroy() {
	deliverQueue.once("cleaned", (jobs, status) => {
		deliverLogger.succ(`Cleaned ${jobs.length} ${status} jobs`);
	});
	deliverQueue.drain();

	inboxQueue.once("cleaned", (jobs, status) => {
		inboxLogger.succ(`Cleaned ${jobs.length} ${status} jobs`);
	});
	inboxQueue.drain();
}
