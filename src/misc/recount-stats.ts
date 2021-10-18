import Note from '../models/note';
import User from '../models/user';
import Meta from '../models/meta';

export async function RecountStats() {
	const notesCount = await Note.count({
		deletedAt: { $exists: false },
	});

	const originalNotesCount = await Note.count({
		deletedAt: { $exists: false },
		'_user.host': null,
	});

	const usersCount = await User.count({
		isDeleted: { $ne: true },
		isSuspended: { $ne: true },
	});

	const originalUsersCount = await User.count({
		isDeleted: { $ne: true },
		isSuspended: { $ne: true },
		host: null
	});

	const reactionsCount = await Note.count({});
	//const originalReactionsCount = await Note.count(...);

	Meta.update({}, {
		$set: {
			'stats.notesCount': notesCount,
			'stats.originalNotesCount': originalNotesCount,
			'stats.usersCount': usersCount,
			'stats.originalUsersCount': originalUsersCount,
			'stats.reactionsCount': reactionsCount,
		}
	});
}
