import type { CacheableRemoteUser } from '@/models/entities/user.js';
import { IRemoteUser, User } from '@/models/entities/user.js';
import DbResolver from '@/remote/activitypub/db-resolver.js';
import { getRemoteUser } from '@/server/api/common/getters.js';
import { updatePerson } from '@/remote/activitypub/models/person.js';
import { Followings, Users } from '@/models/index.js';
import { makePaginationQuery } from '@/server/api/common/make-pagination-query.js';
import deleteFollowing from '@/services/following/delete.js';
import create from '@/services/following/create.js';
import { IdentifiableError } from '@/misc/identifiable-error.js';
import { ApiError } from '@/server/api/error.js';
import { meta } from '@/server/api/endpoints/following/create.js';
import { IObject, IActor } from '../../type.js';
import type { IMove } from '../../type.js';
import Resolver from '@/remote/activitypub/resolver.js';

export default async (actor: CacheableRemoteUser, activity: IMove): Promise<string> => {
	// ※ There is a block target in activity.object, which should be a local user that exists.

	const dbResolver = new DbResolver();
	const resolver = new Resolver();
	let new_acc = await dbResolver.getUserFromApId(activity.target);
	let actor_new;
	let actor_old;
	if (!new_acc) actor_new = await resolver.resolve(<string>activity.target) as IActor;

	let old_acc = actor;
	if (!old_acc) actor_old = await resolver.resolve(<string>activity.actor) as IActor;

	if ((!new_acc || new_acc.uri === null) && (!actor_new || actor_new.id === null)) {
		return 'move: new acc not found';
	}
	if ((!old_acc || old_acc.uri === null) && (!actor_old || actor_old.id === null)) {
		return 'move: old acc not found';
	}

	let newUri: string | null | undefined
	let oldUri: string | null | undefined
	newUri = new_acc ? new_acc.uri :
		actor_new?.url?.toString();

	oldUri = old_acc ? old_acc.uri :
		actor_old?.url?.toString();

	if(newUri === null || newUri === undefined) return 'move: new acc not found #2';
	if(oldUri === null || oldUri === undefined) return 'move: old acc not found #2';

	await updatePerson(newUri);
	await updatePerson(oldUri);

	new_acc = await getRemoteUser(newUri);
	old_acc = await getRemoteUser(oldUri);

	if (old_acc === null || old_acc.uri === null || !new_acc.alsoKnownAs?.includes(old_acc.uri)) return 'move: accounts invalid';

	old_acc.movedToUri = new_acc.uri;

	const query = Followings.createQueryBuilder('following')
		.where('following.followeeId = :userId', { userId: old_acc.id });

	const followings = await query
		.getMany();

	followings.forEach(async following => {
		if (following.follower?.host) {
			const follower = following.follower;
			await deleteFollowing(follower!, old_acc!);
			try {
				await create(follower!, new_acc!);
			} catch (e) {
				if (e instanceof IdentifiableError) {
					if (e.id === '710e8fb0-b8c3-4922-be49-d5d93d8e6a6e') return meta.errors.blocking;
					if (e.id === '3338392a-f764-498d-8855-db939dcf8c48') return meta.errors.blocked;
				}
				return e;
			}
		}
	});

	return 'ok';
};
