import * as Misskey from 'firefish-js';
import { $i } from '@/account';

export function isFfVisibleForMe(user: Misskey.entities.UserDetailed): boolean {
	if ($i && $i.id === user.id) return true;

	if (user.ffVisibility === 'private') return false;
	if (user.ffVisibility === 'followers' && !user.isFollowing) return false;

	return true;
}