import { redisClient } from "../db/redis.js";
import { Mutex } from "redis-semaphore";

/**
 * Retry delay (ms) for lock acquisition
 */
const retryDelay = 100;

/**
 * Get AP Object lock
 * @param uri AP object ID
 * @param timeout Lock timeout (ms), The timeout releases previous lock.
 * @returns Unlock function
 */
export async function getApLock(
	uri: string,
	timeout = 30 * 1000,
): Promise<Mutex> {
	const lock = new Mutex(redisClient, `ap-object:${uri}`, {
		lockTimeout: timeout,
		retryInterval: retryDelay,
	});
	await lock.acquire();
	return lock;
}

export async function getFetchInstanceMetadataLock(
	host: string,
	timeout = 30 * 1000,
): Promise<Mutex> {
	const lock = new Mutex(redisClient, `instance:${host}`, {
		lockTimeout: timeout,
		retryInterval: retryDelay,
	});
	await lock.acquire();
	return lock;
}

export async function getChartInsertLock(
	lockKey: string,
	timeout = 30 * 1000,
): Promise<Mutex> {
	const lock = new Mutex(redisClient, `chart-insert:${lockKey}`, {
		lockTimeout: timeout,
		retryInterval: retryDelay,
	});
	await lock.acquire();
	return lock;
}
