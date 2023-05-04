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

	for (const mutePattern of mutedWords) {
		let mute: RE2;
		let matched: string[];
		if (Array.isArray(mutePattern)) {
			matched = mutePattern.filter((keyword) => keyword !== "");

			if (matched.length === 0) {
				continue;
			}
			mute = new RE2(
				`\\b${matched.map(escapeRegExp).join("\\b.*\\b")}\\b`,
				"g",
			);
		} else {
			const regexp = mutePattern.match(/^\/(.+)\/(.*)$/);
			// This should never happen due to input sanitisation.
			if (!regexp) {
				console.warn(`Found invalid regex in word mutes: ${mutePattern}`);
				continue;
			}
			mute = new RE2(regexp[1], regexp[2]);
			matched = [mutePattern];
		}

		try {
			if (mute.test(text)) return true;
		} catch (err) {
			// This should never happen due to input sanitisation.
		}
	}

	return notMuted;
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
