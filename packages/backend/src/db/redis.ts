import Redis from "ioredis";
import config from "@/config/index.js";

export function createConnection() {
	return new Redis({
		port: config.redis.port,
		host: config.redis.host,
		family: config.redis.family ?? 0,
		password: config.redis.pass,
		username: config.redis.user ?? "default",
		keyPrefix: `${config.redis.prefix}:`,
		db: config.redis.db || 0,
		tls: config.redis.tls ? {
			rejectUnauthorized: false, //TODO make configurable
			host: config.redis.host,
		} : undefined,
	});
}

export const subscriber = createConnection();
subscriber.subscribe(config.host);

export const redisClient = createConnection();
