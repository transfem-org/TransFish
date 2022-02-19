import define from '../../../define';
import { Emojis } from '@/models/index';
import { getConnection } from 'typeorm';
import { ApiError } from '../../../error';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	errors: {
		noSuchEmoji: {
			message: 'No such emoji.',
			code: 'NO_SUCH_EMOJI',
			id: '684dec9d-a8c2-4364-9aa8-456c49cb1dc8',
		},
	},
} as const;

const paramDef = {
	type: 'object',
	properties: {
		id: { type: 'string', format: 'misskey:id' },
		name: { type: 'string' },
		category: { type: 'string', nullable: true },
		aliases: { type: 'array', items: {
			type: 'string',
		} },
	},
	required: ['id', 'name', 'aliases'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps) => {
	const emoji = await Emojis.findOne(ps.id);

	if (emoji == null) throw new ApiError(meta.errors.noSuchEmoji);

	await Emojis.update(emoji.id, {
		updatedAt: new Date(),
		name: ps.name,
		category: ps.category,
		aliases: ps.aliases,
	});

	await getConnection().queryResultCache!.remove(['meta_emojis']);
});