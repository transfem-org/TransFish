import RE2 from "re2";
import type { Note } from "@/models/entities/note.js";
import type { User } from "@/models/entities/user.js";

type NoteLike = {
	userId: Note["userId"];
	text: Note["text"];
	cw?: Note["cw"];
};

type UserLike = {
	id: User["id"];
};

function escapeRegExp(x: string): string {
	return x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function checkWordMute(
	note: NoteLike,
	mutedWords: Array<string | string[]>,
): boolean {
	if (note == null) return false;

	const text = ((note.cw ?? "") + " " + (note.text ?? "")).trim();
	if (text === "") return false;

	const matched = mutedWords.some(filter => {
		if (Array.isArray(filter)) {
			return filter.every(keyword => text.includes(keyword));
		} else {
			// represents RegExp
			const regexp = filter.match(/^\/(.+)\/(.*)$/);

			// This should never happen due to input sanitisation.
			if (!regexp) {
				console.warn(`Found invalid regex in word mutes: ${mutePattern}`);
				return false;
			}

			try {
				return new RE2(regexp[1], regexp[2]).test(text);
			} catch (err) {
				// This should never happen due to input sanitisation.
				return false;
			}
		}
	});

	return matched;
}

export async function getWordHardMute(
	note: NoteLike,
	me: UserLike | null | undefined,
	mutedWords: Array<string | string[]>,
): Promise<boolean> {
	// 自分自身
	if (me && note.userId === me.id) {
		return false;
	}

	if (mutedWords.length > 0) {
		return (
			checkWordMute(note, mutedWords) ||
			checkWordMute(reply, mutedWords) ||
			checkWordMute(renote, mutedWords)
		);
	}

	return false;
}
