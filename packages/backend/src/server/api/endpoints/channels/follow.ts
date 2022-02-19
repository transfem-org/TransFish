import define from '../../define';
import { ApiError } from '../../error';
import { Channels, ChannelFollowings } from '@/models/index';
import { genId } from '@/misc/gen-id';
import { publishUserEvent } from '@/services/stream';

export const meta = {
	tags: ['channels'],

	requireCredential: true,

	kind: 'write:channels',

	errors: {
		noSuchChannel: {
			message: 'No such channel.',
			code: 'NO_SUCH_CHANNEL',
			id: 'c0031718-d573-4e85-928e-10039f1fbb68',
		},
	},
} as const;

const paramDef = {
	type: 'object',
	properties: {
		channelId: { type: 'string', format: 'misskey:id' },
	},
	required: ['channelId'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	const channel = await Channels.findOne({
		id: ps.channelId,
	});

	if (channel == null) {
		throw new ApiError(meta.errors.noSuchChannel);
	}

	await ChannelFollowings.insert({
		id: genId(),
		createdAt: new Date(),
		followerId: user.id,
		followeeId: channel.id,
	});

	publishUserEvent(user.id, 'followChannel', channel);
});