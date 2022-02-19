import * as bcrypt from 'bcryptjs';
import define from '../../define';
import { UserProfiles } from '@/models/index';

export const meta = {
	requireCredential: true,

	secure: true,
} as const;

const paramDef = {
	type: 'object',
	properties: {
		currentPassword: { type: 'string' },
		newPassword: { type: 'string', minLength: 1 },
	},
	required: ['currentPassword', 'newPassword'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	const profile = await UserProfiles.findOneOrFail(user.id);

	// Compare password
	const same = await bcrypt.compare(ps.currentPassword, profile.password!);

	if (!same) {
		throw new Error('incorrect password');
	}

	// Generate hash of password
	const salt = await bcrypt.genSalt(8);
	const hash = await bcrypt.hash(ps.newPassword, salt);

	await UserProfiles.update(user.id, {
		password: hash,
	});
});