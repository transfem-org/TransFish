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
	const object = await fetchAny(ps.uri);
	if (object) {
		return object;
	} else {
		throw new ApiError(meta.errors.noSuchObject);
	}
});

/***
 * URIからUserかNoteを解決する
 */
async function fetchAny(uri: string) {
	// URIがこのサーバーを指しているなら、ローカルユーザーIDとしてDBからフェッチ
	if (uri.startsWith(config.url + '/')) {
		// https://local/(users|notes)/:id
		const localIdRegex = new RegExp('^' + escapeRegexp(config.url) + '/' + '(\\w+)' + '/' + '(\\w+)');
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
		const localNameRegex = new RegExp('^' + escapeRegexp(config.url) + '/@(\\w+)');
		const matchLocalName = uri.match(localNameRegex);
		if (matchLocalName) {
			const username = matchLocalName[1];
			const user = await User.findOne({ usernameLower: username.toLowerCase() });
			return await mergePack(user, null);
		}

		return null;
	}

	// ブロックしてたら中断
	if (await isBlockedHost(extractApHost(uri))) return null;

	// URI(AP Object id)としてDB検索
	{
		const [user, note] = await Promise.all([
			User.findOne({ uri: uri }),
			Note.findOne({ uri: uri })
		]);

		const packed = await mergePack(user, note);
		if (packed !== null) return packed;
	}

	// disableFederationならリモート解決しない
	if (config.disableFederation) return null;

	// リモートから一旦オブジェクトフェッチ
	const resolver = new Resolver();
	const object = await resolver.resolve(uri);

	// /@user のような正規id以外で取得できるURIが指定されていた場合、ここで初めて正規URIが確定する
	// これはDBに存在する可能性があるため再度DB検索
	if (uri !== object.id) {
		const [user, note] = await Promise.all([
			User.findOne({ uri: object.id }),
			Note.findOne({ uri: object.id })
		]);

		const packed = await mergePack(user, note);
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

async function mergePack(user?: IUser | null, note?: INote | null) {
	if (user != null) {
		return {
			type: 'User',
			object: await packUser(user, null, { detail: true })
		};
	}

	if (note != null) {
		return {
			type: 'Note',
			object: await packNote(note, null, { detail: true })
		};
	}

	return null;
}
