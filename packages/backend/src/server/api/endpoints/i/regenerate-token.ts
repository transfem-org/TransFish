import * as bcrypt from 'bcryptjs';
import { publishMainStream, publishUserEvent } from '@/services/stream';
import generateUserToken from '../../common/generate-native-user-token';
import define from '../../define';
import { Users, UserProfiles } from '@/models/index';

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

	// Compare password
	const same = await bcrypt.compare(ps.password, profile.password!);

	if (!same) {
		throw new Error('incorrect password');
	}

	// Generate secret
	const secret = generateUserToken();

	await Users.update(user.id, {
		token: secret,
	});

	// Publish event
	publishMainStream(user.id, 'myTokenRegenerated');

	// Terminate streaming
	setTimeout(() => {
		publishUserEvent(user.id, 'terminate', {});
	}, 5000);
});