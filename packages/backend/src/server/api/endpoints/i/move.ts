import type { User } from '@/models/entities/user.js';
import { resolveUser } from '@/remote/resolve-user.js';
import { DAY } from '@/const.js';
import DeliverManager from '@/remote/activitypub/deliver-manager.js';
import { renderActivity } from '@/remote/activitypub/renderer/index.js';
import { genId } from '@/misc/gen-id.js';
import define from '../../define.js';
import { ApiError } from '../../error.js';
import { apiLogger } from '../../logger.js';
import { UserProfiles } from '@/models/index.js';
import config from '@/config/index.js';

export const meta = {
	tags: ['users'],

	secure: true,
	requireCredential: true,

	limit: {
		duration: DAY,
		max: 3,
	},

	errors: {
		noSuchMoveTarget: {
			message: 'No such move target.',
			code: 'NO_SUCH_MOVE_TARGET',
			id: 'b5c90186-4ab0-49c8-9bba-a1f76c202ba4',
		},
		remoteAccountForbids: {
			message: 'Remote account doesn\'t have proper \'Known As\' alias. Did you remember to set it?',
			code: 'REMOTE_ACCOUNT_FORBIDS',
			id: 'b5c90186-4ab0-49c8-9bba-a1f766282ba4',
		},
		notRemote: {
			message: 'User is not remote. You can only migrate to other instances.',
			code: 'NOT_REMOTE',
			id: '4362f8dc-731f-4ad8-a694-be2a88922a24',
		},
		adminForbidden: {
			message: 'Admins cant migrate.',
			code: 'NOT_ADMIN_FORBIDDEN',
			id: '4362e8dc-731f-4ad8-a694-be2a88922a24',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		moveToAccount: { type: 'string' },
	},
	required: ['moveToAccount'],
} as const;

function moveActivity(toUrl: string, fromUrl: string) {
	const activity = {
		id: genId(),
		actor: fromUrl,
		type: 'Move',
		object: fromUrl,
		target: toUrl,
	} as any;

	return renderActivity(activity);
}

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	if (!ps.moveToAccount) throw new ApiError(meta.errors.noSuchMoveTarget);
	if (user.isAdmin) throw new ApiError(meta.errors.adminForbidden);

	let unfiltered: string = ps.moveToAccount;

	if (unfiltered.startsWith('@')) unfiltered = unfiltered.substring(1);
	if (!unfiltered.includes('@')) throw new ApiError(meta.errors.notRemote);
	const userAddress: string[] = unfiltered.split('@');

	const moveTo: User = await resolveUser(userAddress[0], userAddress[1]).catch(e => {
		apiLogger.warn(`failed to resolve remote user: ${e}`);
		throw new ApiError(meta.errors.noSuchMoveTarget);
	});
	const profileFrom = await UserProfiles.findOneByOrFail({ userId: user.id });
	let fromUrl: string | null = profileFrom.url;
	if(!fromUrl) {
		fromUrl = `${config.url}/@${user.username}`;
	}

	const profileTo = await UserProfiles.findOneByOrFail({ userId: moveTo.id });
	let toUrl: string | null = profileTo.url;
	if(!toUrl) {
		toUrl = `${config.url}/@${moveTo.username}`;
	}

	let allowed = false;

	moveTo.alsoKnownAs?.forEach(element => {
		if (fromUrl!.includes(element)) allowed = true;
	});

	if (!allowed || !toUrl || !fromUrl) throw new ApiError(meta.errors.remoteAccountForbids);

	const moveAct = moveActivity(toUrl, fromUrl);
	const dm = new DeliverManager(user, moveAct);
	dm.addFollowersRecipe();
	dm.execute();

	return true;
});
