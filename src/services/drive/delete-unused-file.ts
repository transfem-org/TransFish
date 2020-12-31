import DriveFile from '../../models/drive-file';
import { ObjectID } from 'mongodb';
import User, { isRemoteUser } from '../../models/user';
import deleteFile from './delete-file';
import { oidEquals } from '../../prelude/oid';

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

	if (oidEquals(file._id, user.avatarId) || oidEquals(file._id, user.bannerId)) {
		return;
	}

	await deleteFile(file);
}
