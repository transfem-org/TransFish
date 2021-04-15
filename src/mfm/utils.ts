import { MfmNode } from './types';

export function createMfmNode(type: string, props: Record<string, any> = {}, children: MfmNode[] = []): MfmNode {
	return {
		type,
		props,
		children
	}
}

export function isHashtag(hashtag: string): boolean {
	if (Array.from(hashtag || '').length > 256) return false;
	return true;
}

// eslint-disable-next-line no-useless-escape
export const urlRegex     = /^https?:\/\/[\w\/:%#@\$&\?!\(\)\[\]~\.,=\+\-]+/;
export const urlRegexFull = /^https?:\/\/[\w\/:%#@\$&\?!\(\)\[\]~\.,=\+\-]+$/;
