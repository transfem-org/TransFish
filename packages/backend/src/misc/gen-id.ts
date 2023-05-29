import { init, createId } from "@paralleldrive/cuid2";
import config from "@/config/index.js";

const TIME2000 = 946684800000;
const TIMESTAMP_LENGTH = 8;

const length =
	Math.min(Math.max(config.cuid?.length ?? 16, 16), 24) - TIMESTAMP_LENGTH;
const fingerprint = `${config.cuid?.fingerprint ?? ""}${createId()}`;

const genCuid2 = init({ length, fingerprint });

/**
 * The generated ID results in the form of `[8 chars timestamp] + [cuid2]`.
 * The minimum and maximum lengths are 16 and 24, respectively.
 * With the length of 16, namely 8 for cuid2, roughly 1427399 IDs are needed
 * in the same millisecond to reach 50% chance of collision.
 *
 * Ref: https://github.com/paralleldrive/cuid2#parameterized-length
 */
export function genId(date?: Date): string {
	const now = (date ?? new Date()).getTime();
	const time = Math.max(now - TIME2000, 0);
	const timestamp = time.toString(36).padStart(TIMESTAMP_LENGTH, "0");

	return `${timestamp}${genCuid2()}`;
}
