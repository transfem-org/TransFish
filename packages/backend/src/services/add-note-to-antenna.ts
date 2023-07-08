import type { Antenna } from "@/models/entities/antenna.js";
import type { Note } from "@/models/entities/note.js";
import { genId } from "@/misc/gen-id.js";
import { redisClient } from "@/db/redis.js";
import { publishAntennaStream } from "@/services/stream.js";
import type { User } from "@/models/entities/user.js";

export async function addNoteToAntenna(
	antenna: Antenna,
	note: Note,
	noteUser: { id: User["id"] },
) {
	// 通知しない設定になっているか、自分自身の投稿なら既読にする
	const read = !antenna.notify || antenna.userId === noteUser.id;

	redisClient.xadd(
		`antennaTimeline:${antenna.id}`,
		"MAXLEN",
		"~",
		"200",
		`${genId(note.createdAt)}-*`,
		"note",
		note.id,
	);

	publishAntennaStream(antenna.id, "note", note);
}
