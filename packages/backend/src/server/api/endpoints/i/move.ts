import { In } from 'typeorm';
import { User } from '@/models/entities/user.js';
import { Users, DriveFiles, Notes, Channels, Blockings } from '@/models/index.js';
import { ApiError } from '../../error.js';
import { resolveUser } from '@/remote/resolve-user.js';
import define from '../../define.js';
import { DAY } from '@/const.js';
import DeliverManager from '@/remote/activitypub/deliver-manager.js';
import { renderActivity } from '@/remote/activitypub/renderer/index.js';
import { apiLogger } from '../../logger.js';

export const meta = {
	tags: ['users'],

	secure: true,
	requireCredential: true,

	limit: {
		duration: DAY,
		max: 1,
	},

	errors: {
		noSuchMoveTarget: {
			message: 'No such move target.',
			code: 'NO_SUCH_MOVE_TARGET',
			id: 'b5c90186-4ab0-49c8-9bba-a1f76c202ba4',
		},
		remoteAccountForbids: {
			message: 'Remote account doesn\'t have proper known As.',
			code: 'REMOTE_ACCOUNT_FORBIDS',
			id: 'b5c90186-4ab0-49c8-9bba-a1f766282ba4',
		},
		notRemote: {
			message: 'User not remote.',
			code: 'NOT_REMOTE',
			id: '4362f8dc-731f-4ad8-a694-be2a88922a24',
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

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {

	if(!ps.moveToAccount) throw new ApiError(meta.errors.noSuchMoveTarget);

	let unfiltered: string = ps.moveToAccount;

	if(unfiltered.startsWith('@')) unfiltered = unfiltered.substring(1);
	if(!unfiltered.includes('@')) throw new ApiError(meta.errors.notRemote);
	let userAddress: string[] = unfiltered.split("@");

	const moveTo: User = await resolveUser(userAddress[0], userAddress[1]).catch(e => {
		apiLogger.warn(`failed to resolve remote user: ${e}`);
		throw new ApiError(meta.errors.noSuchMoveTarget);
	});

	let allowed = false;

	moveTo.alsoKnownAs?.array.forEach(element => {
		if(user.uri?.includes(element)) allowed = true;
	});

	if(!allowed || !moveTo.uri || !user.uri) throw new ApiError(meta.errors.remoteAccountForbids);

		(async () => {
			const moveAct = await moveActivity(moveTo.uri!, user.uri!);
			const dm = new DeliverManager(user, moveAct);
			dm.addFollowersRecipe();
			dm.execute();
		})();
	return true;
});

async function moveActivity(to: string, from: string) {

	const activity = {
		id: `foo`,
		actor: from,
		type: 'Move',
		object: from,
		target: to,
	} as any;

	return renderActivity(activity);
}
