import probeImageSize from "probe-image-size";
import { Mutex } from "redis-semaphore";

import { FILE_TYPE_BROWSERSAFE } from "@/const.js";
import Logger from "@/services/logger.js";
import { redisClient } from "@/db/redis.js";

export type Size = {
	width: number;
	height: number;
};

const logger = new Logger("emoji");

export async function getEmojiSize(url: string): Promise<Size> {
	let attempted = true;

	const lock = new Mutex(redisClient, "getEmojiSize");
	await lock.acquire();
	try {
		const key = `getEmojiSize:${url}`;
		attempted = (await redisClient.get(key)) !== null;
		if (!attempted) {
			await redisClient.set(key, "done", "EX", 60 * 10);
		}
	} finally {
		await lock.release();
	}

	if (attempted) {
		logger.warn(`Attempt limit exceeded: ${url}`);
		throw new Error("attempt limit exceeded");
	}

	try {
		logger.debug(`Retrieving emoji size from ${url}`);
		const { width, height, mime } = await probeImageSize(url, {
			timeout: 5000,
		});
		if (!(mime.startsWith("image/") && FILE_TYPE_BROWSERSAFE.includes(mime))) {
			throw new Error("unsupported image type");
		}
		return { width, height };
	} catch (e) {
		throw new Error(`unable to retrieve metadata: ${e}`);
	}
}

export function getNormalSize(
	{ width, height }: Size,
	orientation?: number,
): Size {
	return (orientation || 0) >= 5
		? { width: height, height: width }
		: { width, height };
}
