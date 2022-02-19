import define from '../../define';
import { ApiError } from '../../error';
import { Clips } from '@/models/index';

export const meta = {
	tags: ['clips', 'account'],

	requireCredential: false,

	kind: 'read:account',

	errors: {
		noSuchClip: {
			message: 'No such clip.',
			code: 'NO_SUCH_CLIP',
			id: 'c3c5fe33-d62c-44d2-9ea5-d997703f5c20',
		},
	},

	res: {
		type: 'object',
		optional: false, nullable: false,
		ref: 'Clip',
	},
} as const;

const paramDef = {
	type: 'object',
	properties: {
		clipId: { type: 'string', format: 'misskey:id' },
	},
	required: ['clipId'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	// Fetch the clip
	const clip = await Clips.findOne({
		id: ps.clipId,
	});

	if (clip == null) {
		throw new ApiError(meta.errors.noSuchClip);
	}

	if (!clip.isPublic && (me == null || (clip.userId !== me.id))) {
		throw new ApiError(meta.errors.noSuchClip);
	}

	return await Clips.pack(clip);
});