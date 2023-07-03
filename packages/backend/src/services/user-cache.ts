import type {
	CacheableLocalUser,
	CacheableUser,
	ILocalUser,
} from "@/models/entities/user.js";
import { User } from "@/models/entities/user.js";
import { Users } from "@/models/index.js";
import { Cache } from "@/misc/cache.js";
import { redisClient, subscriber } from "@/db/redis.js";

export const userByIdCache = new Cache<CacheableUser>(Infinity);
export const localUserByNativeTokenCache = new Cache<CacheableLocalUser | null>(
	Infinity,
);
export const localUserByIdCache = new Cache<CacheableLocalUser>(Infinity);
export const uriPersonCache = new Cache<CacheableUser | null>(Infinity);

subscriber.on("message", async (_, data) => {
	const obj = JSON.parse(data);

	if (obj.channel === "internal") {
		const { type, body } = obj.message;
		switch (type) {
			case "localUserUpdated": {
				await userByIdCache.delete(body.id);
				await localUserByIdCache.delete(body.id);
				const toDelete = Array.from(await localUserByNativeTokenCache.getAll())
					.filter((v) => v[1]?.id === body.id)
					.map((v) => v[0]);
				await localUserByNativeTokenCache.delete(...toDelete);
				break;
			}
			case "userChangeSuspendedState":
			case "userChangeSilencedState":
			case "userChangeModeratorState":
			case "remoteUserUpdated": {
				const user = await Users.findOneByOrFail({ id: body.id });
				await userByIdCache.set(user.id, user);
				const trans = redisClient.multi();
				for (const [k, v] of (await uriPersonCache.getAll()).entries()) {
					if (v?.id === user.id) {
						await uriPersonCache.set(k, user, trans);
					}
				}
				await trans.exec();
				if (Users.isLocalUser(user)) {
					await localUserByNativeTokenCache.set(user.token, user);
					await localUserByIdCache.set(user.id, user);
				}
				break;
			}
			case "userTokenRegenerated": {
				const user = (await Users.findOneByOrFail({
					id: body.id,
				})) as ILocalUser;
				await localUserByNativeTokenCache.delete(body.oldToken);
				await localUserByNativeTokenCache.set(body.newToken, user);
				break;
			}
			default:
				break;
		}
	}
});
