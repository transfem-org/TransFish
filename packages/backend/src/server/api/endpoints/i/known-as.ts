import { In } from 'typeorm';
import { User } from '@/models/entities/user.js';
import { Users, DriveFiles, Notes, Channels, Blockings } from '@/models/index.js';
import { resolveUser } from '@/remote/resolve-user.js';
import { ApiError } from '../../error.js';
import acceptAllFollowRequests from '@/services/following/requests/accept-all.js';
import { publishToFollowers } from '@/services/i/update.js';
import { apiLogger } from '../../logger.js';
import { publishMainStream, publishUserEvent } from '@/services/stream.js';
import define from '../../define.js';
import { DAY } from '@/const.js';

export const meta = {
	tags: ['users'],

	secure: true,
	requireCredential: true,

	limit: {
		duration: DAY,
		max: 30,
	},

	errors: {
		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: 'fcd2eef9-a9b2-4c4f-8624-038099e90aa5',
		},
		notRemote: {
			message: 'User not remote.',
			code: 'NOT_REMOTE',
			id: '4362f8dc-731f-4ad8-a694-be2a88922a24',
		},
	}
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		alsoKnownAs: { type: 'string' },
	},
	required: ['alsoKnownAs'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {

	if(!ps.alsoKnownAs) throw new ApiError(meta.errors.noSuchUser);

	let unfiltered: string = ps.alsoKnownAs;

	if(unfiltered.startsWith('@')) unfiltered = unfiltered.substring(1);
	if(!unfiltered.includes('@')) throw new ApiError(meta.errors.notRemote);

	let userAddress: string[] = unfiltered.split("@");

	const knownAs: User = await resolveUser(userAddress[0], userAddress[1]).catch(e => {
		apiLogger.warn(`failed to resolve remote user: ${e}`);
		throw new ApiError(meta.errors.noSuchUser);
	});

	const updates = {} as Partial<User>;

	if(!knownAs.uri) knownAs.uri = "";
	updates.alsoKnownAs = [knownAs.uri];

	await Users.update(user.id, updates);

	const iObj = await Users.pack<true, true>(user.id, user, {
		detail: true,
		includeSecrets: true,
	});

	// Publish meUpdated event
	publishMainStream(user.id, 'meUpdated', iObj);

	if (user.isLocked === false) {
		acceptAllFollowRequests(user);
	}

	publishToFollowers(user.id);

	return iObj;
});
