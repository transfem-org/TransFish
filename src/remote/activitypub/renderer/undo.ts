import config from '../../../config';
import { ILocalUser, IUser } from '../../../models/user';

export default (object: any, user: ILocalUser | IUser) => {
	if (object == null) return null;

	return {
		id: (typeof object.id === 'string' && object.id.startsWith(config.url)) ? `${object.id}/undo` : undefined,
		type: 'Undo',
		actor: `${config.url}/users/${user._id}`,
		object,
		published: new Date().toISOString(),
	};
};
