export interface MfmNode {
	/** Node type */
	type: string;
	/** Properties */
	props: Record<string, any>;
	/** Child nodes */
	children: MfmNode[];
}

/** メンション */
export interface MfmMentionNode extends MfmNode {
	type: 'mention';
	props: {
		username: string;
		host: string | null;
		/** 入力された表記 */
		acct: string;
		/** ローカルホストの場合省略される, punycodeはデコードされる 表記 */
		canonical: string;
	};
}
export const isMfmMention = (node: MfmNode): node is MfmMentionNode => node.type === 'mention';

/** ハッシュタグ */
export interface MfmHashtagNode extends MfmNode {
	type: 'hashtag';
	props: {
		/** ハッシュタグ (#は含まない) */
		hashtag: string;
	};
}
export const isMfmHashtag = (node: MfmNode): node is MfmHashtagNode => node.type === 'hashtag';

/** 絵文字 */
export interface MfmEmojiNode extends MfmNode {
	type: 'emoji';
	props: {
		/** カスタム絵文字の場合 カスタム絵文字名 (:は含まない) */
		name?: string;
		/** Unicode絵文字の場合 絵文字 */
		emoji?: string;
		/** Unicode絵文字の場合 Twemojiを迂回するか */
		vendor?: boolean;
		/** Unicode絵文字の場合 ローカル定義の絵文字か */
		local?: boolean;
	};
}
export const isMfmEmoji = (node: MfmNode): node is MfmEmojiNode => node.type === 'emoji';

/** カスタム絵文字 */
export interface MfmCustomEmojiNode extends MfmEmojiNode {
	type: 'emoji';
	props: {
		/** カスタム絵文字名 (:は含まない) */
		name: string;
	};
}
export const isMfmCustomEmoji = (node: MfmNode): node is MfmCustomEmojiNode => isMfmEmoji(node) && node.props.name != null;

/** Unicode絵文字 */
export interface MfmUnicodeEmojiNode extends MfmEmojiNode {
	type: 'emoji';
	props: {
		/** 絵文字 */
		emoji: string;
		/** Twemojiを迂回するか */
		vendor: boolean;
		/** ローカル定義の絵文字か */
		local: boolean;
	};
}
export const isMfmUnicodeEmoji = (node: MfmNode): node is MfmUnicodeEmojiNode => isMfmEmoji(node) && node.props.emoji != null;

/** リンク */
export interface MfmLinkNode extends MfmNode {
	type: 'link';
	props: {
		/** URL */
		url: string;
		/** プレビューを表示しない */
		silent: boolean;
	};
}
export const isMfmLink = (node: MfmNode): node is MfmLinkNode => node.type === 'link';
