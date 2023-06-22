import config from "@/config/index.js";
import Resolver from "../resolver.js";
import { isEvent } from "../type.js";
import { IEvent } from "@/models/entities/event.js";

export async function extractEventFromNote(
	source: string | IEvent,
	resolver?: Resolver,
): Promise<IEvent> {
	if (resolver == null) resolver = new Resolver();

	const note = await resolver.resolve(source);

	if (!isEvent(note)) {
		throw new Error("invalid type");
	}

	if (note.name && note.startTime) {
		const title = note.name;
		const start = note.startTime;
		const end = note.endTime ?? null;

		return {
			title,
			start,
			end,
			metadata: {
				"@type": "Event",
				name: note.name,
				url: note.href,
				startDate: note.startTime.toISOString(),
				endDate: note.endTime?.toISOString(),
				description: note.summary,
				identifier: note.id,
			},
		};
	} else {
		throw new Error("Invalid event properties");
	}
}
