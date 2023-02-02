import type { CacheableRemoteUser } from "@/models/entities/user.js";
import type { IPost, IUpdate } from "../../type.js";
import { getApType, isActor } from "../../type.js";
import { apLogger } from "../../logger.js";
import Resolver from "../../resolver.js";
import { updatePerson } from "../../models/person.js";
import { updatePost } from "../../models/note.js";

/**
 * Handler for the Update activity
 */
export default async (
	actor: CacheableRemoteUser,
	activity: IUpdate,
): Promise<string> => {
	if ("actor" in activity && actor.uri !== activity.actor) {
		return "skip: invalid actor";
	}

	apLogger.debug("Update");

	const resolver = new Resolver();

	const object = await resolver.resolve(activity.object).catch((e) => {
		apLogger.error(`Resolution failed: ${e}`);
		throw e;
	});

	if (isActor(object)) {
		await updatePerson(actor.uri!, resolver, object);
		return "ok: Person updated";
	}

	switch (getApType(object)) {
		case 'Question':
		case 'Note':
		case 'Article':
		case 'Document':
		case 'Page':
			await updatePost(activity, object as IPost, resolver);
			return `ok: Post updated`;
		default:
			return `skip: Unknown type: ${getApType(object)}`;
	}
};
