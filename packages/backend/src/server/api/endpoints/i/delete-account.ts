import * as bcrypt from 'bcryptjs';
import define from '../../define';
import { UserProfiles, Users } from '@/models/index';
import { doPostSuspend } from '@/services/suspend-user';
import { publishUserEvent } from '@/services/stream';
import { createDeleteAccountJob } from '@/queue';

export const meta = {
	requireCredential: true,

	secure: true,
} as const;

const paramDef = {
	type: 'object',
	properties: {
		password: { type: 'string' },
	},
	required: ['password'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	const profile = await UserProfiles.findOneOrFail(user.id);
	const userDetailed = await Users.findOneOrFail(user.id);
	if (userDetailed.isDeleted) {
		return;
	}

	// Compare password
	const same = await bcrypt.compare(ps.password, profile.password!);

	if (!same) {
		throw new Error('incorrect password');
	}

	// 物理削除する前にDelete activityを送信する
	await doPostSuspend(user).catch(e => {});

	createDeleteAccountJob(user, {
		soft: false,
	});

	await Users.update(user.id, {
		isDeleted: true,
	});

	// Terminate streaming
	publishUserEvent(user.id, 'terminate', {});
});