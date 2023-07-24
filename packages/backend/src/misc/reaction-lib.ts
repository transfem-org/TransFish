import { emojiRegex } from "./emoji-regex.js";
import { fetchMeta } from "./fetch-meta.js";
import { Emojis } from "@/models/index.js";
import { toPunyNullable } from "./convert-host.js";
import { IsNull } from "typeorm";
import { EmojiCache } from "@/misc/populate-emojis.js";
import type { Emoji } from "@/models/entities/emoji.js";

const legacies = new Map([
	["like", "👍"],
	["love", "❤️"],
	["laugh", "😆"],
	["hmm", "🤔"],
	["surprise", "😮"],
	["congrats", "🎉"],
	["angry", "💢"],
	["confused", "😥"],
	["rip", "😇"],
	["pudding", "🍮"],
	["star", "⭐"],
]);

async function getFallbackReaction() {
	const meta = await fetchMeta();
	const name = meta.defaultReaction;

	const match = emojiRegex.exec(name);
	if (match) {
		const unicode = match[0];
		return { name: unicode, emoji: null };
	}

	const emoji = await EmojiCache.fetch(`${name} ${null}`, () =>
		Emojis.findOneBy({
			name,
			host: IsNull(),
		}),
	);

	return { name, emoji };
}

export function convertLegacyReactions(reactions: Record<string, number>) {
	const _reactions = new Map();
	const decodedReactions = new Map();

	for (const reaction in reactions) {
		if (reactions[reaction] <= 0) continue;

		let decodedReaction;
		if (decodedReactions.has(reaction)) {
			decodedReaction = decodedReactions.get(reaction);
		} else {
			decodedReaction = decodeReaction(reaction);
			decodedReactions.set(reaction, decodedReaction);
		}

		const emoji = legacies.get(decodedReaction.reaction);
		if (emoji) {
			_reactions.set(emoji, (_reactions.get(emoji) || 0) + reactions[reaction]);
		} else {
			_reactions.set(
				reaction,
				(_reactions.get(reaction) || 0) + reactions[reaction],
			);
		}
	}

	const _reactions2 = new Map();
	for (const [reaction, count] of _reactions) {
		const decodedReaction = decodedReactions.get(reaction);
		_reactions2.set(decodedReaction.reaction, count);
	}

	return Object.fromEntries(_reactions2);
}

export async function toDbReaction(
	reaction?: string | null,
	reacterHost?: string | null,
): Promise<{ name: string; emoji: Emoji | null }> {
	if (!reaction) return await getFallbackReaction();

	const _reacterHost = toPunyNullable(reacterHost);

	// Convert string-type reactions to unicode
	const emoji = legacies.get(reaction) || (reaction === "♥️" ? "❤️" : null);
	if (emoji) return { name: emoji, emoji: null };

	// Allow unicode reactions
	const match = emojiRegex.exec(reaction);
	if (match) {
		const unicode = match[0];
		return { name: unicode, emoji: null };
	}

	const custom = reaction.match(/^:([\w+-]+)(?:@\.)?:$/);
	if (custom) {
		const name = custom[1];
		const emoji = await EmojiCache.fetch(`${name} ${_reacterHost}`, () =>
			Emojis.findOneBy({
				name,
				host: _reacterHost || IsNull(),
			}),
		);

		if (emoji) {
			const emojiName = _reacterHost ? `:${name}@${_reacterHost}:` : `:${name}:`;
			return { name: emojiName, emoji };
		}
	}

	return await getFallbackReaction();
}

type DecodedReaction = {
	/**
	 * リアクション名 (Unicode Emoji or ':name@hostname' or ':name@.:')
	 */
	reaction: string;

	/**
	 * name (カスタム絵文字の場合name, Emojiクエリに使う)
	 */
	name?: string;

	/**
	 * host (カスタム絵文字の場合host, Emojiクエリに使う)
	 */
	host?: string | null;
};

export function decodeReaction(str: string): DecodedReaction {
	const custom = str.match(/^:([\w+-]+)(?:@([\w.-]+))?:$/);

	if (custom) {
		const name = custom[1];
		const host = custom[2] || null;

		return {
			reaction: `:${name}@${host || "."}:`, // ローカル分は@以降を省略するのではなく.にする
			name,
			host,
		};
	}

	return {
		reaction: str,
		name: undefined,
		host: undefined,
	};
}

export function convertLegacyReaction(reaction: string): string {
	const decoded = decodeReaction(reaction).reaction;
	if (legacies.has(decoded)) return legacies.get(decoded)!;
	return decoded;
}
