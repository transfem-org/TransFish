import $ from 'cafy';
import { toDbHost } from '../../../../../misc/convert-host';
import File, { packMany } from '../../../../../models/drive-file';
import define from '../../../define';

export const meta = {
	tags: ['admin'],

	requireCredential: false,
	requireModerator: true,

	params: {
		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		offset: {
			validator: $.optional.num.min(0),
			default: 0
		},

		origin: {
			validator: $.optional.str.or([
				'combined',
				'local',
				'remote',
			]),
			default: 'local'
		},

		hostname: {
			validator: $.optional.nullable.str,
			default: null,
		},
	}
};

export default define(meta, async (ps, me) => {
	const q = {
		'metadata.deletedAt': { $exists: false },
	} as any;

	if (ps.hostname != null && ps.hostname.length > 0) {
		q['metadata._user.host'] = toDbHost(ps.hostname);
	} else {
		if (ps.origin == 'local') q['metadata._user.host'] = null;
		if (ps.origin == 'remote') q['metadata._user.host'] = { $ne: null };
	}

	const files = await File
		.find(q, {
			limit: ps.limit,
			sort: { _id: -1 },
			skip: ps.offset
		});

	return await packMany(files, { detail: true, withUser: true, self: true });
});
