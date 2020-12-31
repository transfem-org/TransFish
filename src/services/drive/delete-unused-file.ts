import DriveFile from '../../models/drive-file';
import { ObjectID } from 'mongodb';
import User, { isRemoteUser } from '../../models/user';
import deleteFile from './delete-file';

export async function deleteUnusedFile(fileId: ObjectID) {
	const file = await DriveFile.findOne(fileId);
	if (!file?.metadata?.userId) {
		return;
	}

	const user = await User.findOne(file.metadata.userId)
	if (!isRemoteUser(user)) {
		return;
	}

	if (!file.metadata.attachedNoteIds || file.metadata.attachedNoteIds.length !== 0) {
		return;
	}

	await deleteFile(file);
}
