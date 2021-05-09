import * as http from 'http';
import * as https from 'https';
import got from 'got';
import * as Got from 'got';
import { getAgentByUrl } from '../../misc/fetch';
import { sign } from 'http-signature';
import { URL } from 'url';
import * as crypto from 'crypto';
import config from '../../config';
import { ILocalUser } from '../../models/user';

export default async (user: ILocalUser, url: string, object: any) => {
	const timeout = 10 * 1000;

	const data = JSON.stringify(object);

	const sha256 = crypto.createHash('sha256');
	sha256.update(data);
	const hash = sha256.digest('base64');

	const req = got.post<any>(url, {
		body: data,
		headers: {
			'User-Agent': config.userAgent,
			'Content-Type': 'application/activity+json',
			'Digest': `SHA-256=${hash}`
		},
		timeout,
		hooks: {
			beforeRequest: [
				options => {
					options.request = (url: URL, opt: http.RequestOptions, callback?: (response: any) => void) => {
						// Select custom agent by URL
						opt.agent = getAgentByUrl(url, false);

						// Wrap original https?.request
						const requestFunc = url.protocol === 'http:' ? http.request : https.request;
						const clientRequest = requestFunc(url, opt, callback) as http.ClientRequest;

						// HTTP-Signature
						signToRequest(clientRequest, user.keypair, `${config.url}/users/${user._id}#main-key`);

						return clientRequest;
					};
				},
			],
		},
		retry: 0,
	});

	await receiveResponce(req, 10 * 1024 * 1024);
};

/**
 * Get AP object with http-signature
 * @param user http-signature user
 * @param url URL to fetch
 */
export async function signedGet(url: string, user: ILocalUser) {
	const timeout = 10 * 1000;

	const req = got.get<any>(url, {
		headers: {
			'Accept': 'application/activity+json, application/ld+json',
			'User-Agent': config.userAgent,
		},
		responseType: 'json',
		timeout,
		hooks: {
			beforeRequest: [
				options => {
					options.request = (url: URL, opt: http.RequestOptions, callback?: (response: any) => void) => {
						// Select custom agent by URL
						opt.agent = getAgentByUrl(url, false);

						// Wrap original https?.request
						const requestFunc = url.protocol === 'http:' ? http.request : https.request;
						const clientRequest = requestFunc(url, opt, callback) as http.ClientRequest;

						// HTTP-Signature
						signToRequest(clientRequest, user.keypair, `${config.url}/users/${user._id}#main-key`);

						return clientRequest;
					};
				},
			],
		},
		retry: 0,
	});

	const res = await receiveResponce(req, 10 * 1024 * 1024);

	return res.body;
}

/**
 * Sign to ClientRequest
 * @param clientRequest http.ClientRequest
 * @param key Private key as PEM string
 * @param keyId KeyID
 */
function signToRequest(clientRequest: http.ClientRequest, key: string, keyId: string) {
	sign(clientRequest, {
		authorizationHeaderName: 'Signature',
		key,
		keyId,
		headers: ['(request-target)', 'date', 'host', 'digest']
	});
}

async function receiveResponce<T>(req: Got.CancelableRequest<Got.Response<T>>, maxSize: number) {
	// 応答ヘッダでサイズチェック
	req.on('response', (res: Got.Response) => {
		const contentLength = res.headers['content-length'];
		if (contentLength != null) {
			const size = Number(contentLength);
			if (size > maxSize) {
				req.cancel();
			}
		}
	});

	// 受信中のデータでサイズチェック
	req.on('downloadProgress', (progress: Got.Progress) => {
		if (progress.transferred > maxSize) {
			req.cancel();
		}
	});

	// 応答取得 with ステータスコードエラーの整形
	const res = await req.catch(e => {
		if (e.name === 'HTTPError') {
			const statusCode = (e as Got.HTTPError).response.statusCode;
			const statusMessage = (e as Got.HTTPError).response.statusMessage;
			throw {
				name: `StatusError`,
				statusCode,
				statusMessage,
				message: `${statusCode} ${statusMessage}`,
			};
		} else {
			throw e;
		}
	});

	return res;
}
