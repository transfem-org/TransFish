import $ from 'cafy';
import define from '../../define';
import config from '../../../../config';
import User, { pack as packUser, IUser } from '../../../../models/user';
import { createPerson } from '../../../../remote/activitypub/models/person';
import Note, { pack as packNote, INote } from '../../../../models/note';
import { createNote } from '../../../../remote/activitypub/models/note';
import Resolver from '../../../../remote/activitypub/resolver';
import { ApiError } from '../../error';
import { extractApHost } from '../../../../misc/convert-host';
import { isActor, isPost, getApId } from '../../../../remote/activitypub/type';
import { isBlockedHost } from '../../../../services/instance-moderation';
import * as ms from 'ms';
import * as escapeRegexp from 'escape-regexp';
import { StatusError } from '../../../../misc/fetch';

export const meta = {
	tags: ['federation'],

	desc: {
		'ja-JP': 'URIを指定してActivityPubオブジェクトを参照します。'
	},

	requireCredential: true as const,

	limit: {
		duration: ms('1hour'),
		max: 3600
	},

	params: {
		uri: {
			validator: $.str,
			desc: {
				'ja-JP': 'ActivityPubオブジェクトのURI'
			}
		},
	},

	errors: {
		noSuchObject: {
			message: 'No such object.',
			code: 'NO_SUCH_OBJECT',
			id: 'dc94d745-1262-4e63-a17d-fecaa57efc82'
		}
	}
};

export default define(meta, async (ps) => {
	try {
		const object = await fetchAny(ps.uri);
		if (object) {
			return object;
		} else {
			throw new ApiError(meta.errors.noSuchObject);
		}
	} catch (e) {
		if (e instanceof RejectedError) {
			throw new ApiError(meta.errors.noSuchObject);
		}

		if (e instanceof StatusError) {
			throw new ApiError(meta.errors.noSuchObject);
		}

		throw e;
	}
});

/***
 * URIからUserかNoteを解決する
 */
async function fetchAny(uri: string) {
	const processLocal = async (uri: string) => {
		// https://local/(users|notes)/:id
		const localIdRegex = new RegExp('^' + escapeRegexp(config.url) + '/' + '(\\w+)' + '/' + '(\\w+)/?$');
		const matchLocalId = uri.match(localIdRegex);
		if (matchLocalId) {
			const type = matchLocalId[1];
			const id = matchLocalId[2];

			if (type === 'users') {
				const user = await User.findOne({ _id: id });
				return await mergePack(user, null);
			}

			if (type === 'notes') {
				const note = await Note.findOne({ _id: id });
				return await mergePack(null, note);
			}

			return null;
		}

		// https://local/@:username
		const localNameRegex = new RegExp('^' + escapeRegexp(config.url) + '/@(\\w+)/?$');
		const matchLocalName = uri.match(localNameRegex);
		if (matchLocalName) {
			const username = matchLocalName[1];
			const user = await User.findOne({ usernameLower: username.toLowerCase() });
			return await mergePack(user, null);
		}

		return null;
	}

	const processRemote = async (uri: string) => {
		const [user, note] = await Promise.all([
			User.findOne({ uri: uri }),
			Note.findOne({ uri: uri })
		]);

		return await mergePack(user, note);
	}

	// URIがこのサーバーを指しているなら、ローカルユーザーIDとしてDBからフェッチ
	if (uri.startsWith(config.url + '/')) {
		const result = await processLocal(uri);
		if (result != null) return result;
	}

	// URI(AP Object id)としてDB検索
	const packed = await processRemote(uri);
	if (packed !== null) return packed;

	// disableFederationならリモート解決しない
	if (config.disableFederation) throw new RejectedError('Federation disabled');

	// ブロックしてたら中断
	if (await isBlockedHost(extractApHost(uri))) throw new RejectedError('Instance blocked');

	// リモートから一旦オブジェクトフェッチ
	const resolver = new Resolver();
	const object = await resolver.resolve(uri);

	// /@user のような正規id以外で取得できるURIが指定されていた場合、ここで初めて正規URIが確定する
	// これはDBに存在する可能性があるため再度DB検索
	if (typeof object.id === 'string' && object.id !== uri) {
		// ブロックしてたら中断
		if (await isBlockedHost(extractApHost(object.id))) throw new RejectedError('Instance blocked');

		if (object.id.startsWith(config.url + '/')) {
			return await processLocal(object.id);
			// ここで見つからなければローカルはなし確定なので流れ落ちなし
		}

		// URI(AP Object id)としてDB検索
		const packed = await processRemote(object.id);
		if (packed !== null) return packed;
	}

	// それでもみつからなければ新規であるため登録
	if (isActor(object)) {
		const user = await createPerson(getApId(object));
		return {
			type: 'User',
			object: await packUser(user, null, { detail: true })
		};
	}

	if (isPost(object)) {
		const note = await createNote(getApId(object), null, true);
		return {
			type: 'Note',
			object: await packNote(note!, null, { detail: true })
		};
	}

	return null;
}

/**
 * Pack DB Object for API Response
 * @param user User DB Object
 * @param note Note DB Object
 * @returns Packed API response, or null on not found.
 * @throws RejectedError on deleted, moderated or hidden.
 */
async function mergePack(user: IUser | null | undefined, note: INote | null | undefined) {
	if (user != null) {
		if (user.isDeleted) throw new RejectedError('User is deleted');
		if (user.isSuspended) throw new RejectedError('User is suspended');
		return {
			type: 'User',
			object: await packUser(user, null, { detail: true })
		};
	}

	if (note != null) {
		const packedNote = await packNote(note, null, { detail: true });
		if (packedNote?.isHidden) throw new RejectedError('Note is hidden');
		return {
			type: 'Note',
			object: packedNote
		};
	}

	return null;
}

class RejectedError extends Error {
	constructor(message: string) {
		super(message);
	}
}
