import { In } from 'typeorm';
import { User } from '@/models/entities/user.js';
import { Users, DriveFiles, Notes, Channels, Blockings } from '@/models/index.js';
import { ApiError } from '../../error.js';
import define from '../../define.js';
import { DAY } from '@/const.js';

export const meta = {
	tags: ['notes'],

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
	},
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
	// TODO
	return;
});
