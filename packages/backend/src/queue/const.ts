import type * as Bull from "bullmq";

export const QUEUE = {
	DELIVER: "deliver",
	INBOX: "inbox",
	SYSTEM: "system",
	ENDED_POLL_NOTIFICATION: "endedPollNotification",
	DB: "db",
	OBJECT_STORAGE: "objectStorage",
	WEBHOOK_DELIVER: "webhookDeliver",
};

export function baseQueueOptions(
	config: any,
	queueName: typeof QUEUE[keyof typeof QUEUE],
): Bull.QueueOptions {
	return {
		connection: {
			port: config.redisForJobQueue.port,
			host: config.redisForJobQueue.host,
			family:
				config.redisForJobQueue.family == null
					? 0
					: config.redisForJobQueue.family,
			password: config.redisForJobQueue.pass,
			db: config.redisForJobQueue.db ?? 0,
		},
		prefix: config.redisForJobQueue.prefix
			? `${config.redisForJobQueue.prefix}:queue:${queueName}`
			: `queue:${queueName}`,
	};
}
