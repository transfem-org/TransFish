import * as promiseLimit from 'promise-limit';
import DriveFile, { IDriveFile } from '../models/drive-file';
import del from '../services/drive/delete-file';

const limit = promiseLimit(6);

DriveFile.find({
	'metadata._user.host': {
		$ne: null
	},
	'metadata.deletedAt': { $exists: false }
}, {
	fields: {
		_id: true
	}
}).then(async files => {
	console.log(`there is ${files.length} files`);

	await Promise.all(files.map(file => limit(() => job(file))));

	console.log('ALL DONE');
});

async function job(f: IDriveFile): Promise<any> {
	const file = await DriveFile.findOne({ _id: f._id });
	if (!file) return;
	await del(file, true);

	console.log('done', file._id);
}
