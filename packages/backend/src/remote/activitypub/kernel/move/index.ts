import {CacheableRemoteUser, IRemoteUser, User} from '@/models/entities/user.js';
import {IMove, IObject, IActor} from '../../type.js';
import DbResolver from "@/remote/activitypub/db-resolver";
import {getRemoteUser} from '@/server/api/common/getters.js';
import { updatePerson } from '@/remote/activitypub/models/person.js';
import {Followings, Users} from "@/models";
import {makePaginationQuery} from "@/server/api/common/make-pagination-query";
import deleteFollowing from '@/services/following/delete.js';
import create from '@/services/following/create.js';
import {IdentifiableError} from "@/misc/identifiable-error";
import {ApiError} from "@/server/api/error";
import {meta} from "@/server/api/endpoints/following/create";

export default async (actor: CacheableRemoteUser, activity: IMove): Promise<string> => {
	// ※ There is a block target in activity.object, which should be a local user that exists.

	const dbResolver = new DbResolver();
	let new_acc = await dbResolver.getUserFromApId(activity.target);
	if (!new_acc) new_acc = await getRemoteUser(<string>activity.target);

	let old_acc = await dbResolver.getUserFromApId(activity.actor);
	if (!old_acc) new_acc = await getRemoteUser(<string>activity.actor);

	if (!new_acc || new_acc.uri === null) {
		return `move: new acc not found`;
	}
	if (!old_acc || old_acc.uri === null) {
		return `move: old acc not found`;
	}
	await updatePerson(new_acc.uri);
	await updatePerson(old_acc.uri);
	new_acc = await getRemoteUser(new_acc.uri);
	old_acc = await getRemoteUser(old_acc.uri);

	if(old_acc === null || old_acc.uri === null || !new_acc?.alsoKnownAs?.includes(old_acc.uri)) return `move: accounts invalid`;

	old_acc.movedToUri = new_acc?.uri

	const query = makePaginationQuery(Followings.createQueryBuilder('following'))
		.andWhere('following.followeeId = :userId', { userId: old_acc.id })
		.innerJoinAndSelect('following.follower', 'follower');

	const followings = await query
		.getMany();

	followings.forEach(following => {
		if(!following.follower?.host) {
			let follower = following.follower;
			deleteFollowing(follower!, old_acc!);
			try {
				create(follower!, new_acc!);
			} catch (e) {
				if (e instanceof IdentifiableError) {
					if (e.id === '710e8fb0-b8c3-4922-be49-d5d93d8e6a6e') throw new ApiError(meta.errors.blocking);
					if (e.id === '3338392a-f764-498d-8855-db939dcf8c48') throw new ApiError(meta.errors.blocked);
				}
				throw e;
			}
		}
	})

	return `ok`;
};
