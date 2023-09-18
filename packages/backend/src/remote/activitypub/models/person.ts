import { URL } from "node:url";
import promiseLimit from "promise-limit";

import config from "@/config/index.js";
import { registerOrFetchInstanceDoc } from "@/services/register-or-fetch-instance-doc.js";
import type { Note } from "@/models/entities/note.js";
import { updateUsertags } from "@/services/update-hashtag.js";
import {
	Users,
	Instances,
	DriveFiles,
	Followings,
	UserProfiles,
	UserPublickeys,
} from "@/models/index.js";
import type { IRemoteUser, CacheableUser } from "@/models/entities/user.js";
import { User } from "@/models/entities/user.js";
import type { Emoji } from "@/models/entities/emoji.js";
import { UserNotePining } from "@/models/entities/user-note-pining.js";
import { genId } from "@/misc/gen-id.js";
import { instanceChart, usersChart } from "@/services/chart/index.js";
import { UserPublickey } from "@/models/entities/user-publickey.js";
import { isDuplicateKeyValueError } from "@/misc/is-duplicate-key-value-error.js";
import { toPuny } from "@/misc/convert-host.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { toArray } from "@/prelude/array.js";
import { fetchInstanceMetadata } from "@/services/fetch-instance-metadata.js";
import { normalizeForSearch } from "@/misc/normalize-for-search.js";
import { truncate } from "@/misc/truncate.js";
import { StatusError } from "@/misc/fetch.js";
import { uriPersonCache } from "@/services/user-cache.js";
import { publishInternalEvent } from "@/services/stream.js";
import { db } from "@/db/postgre.js";
import { apLogger } from "../logger.js";
import { htmlToMfm } from "../misc/html-to-mfm.js";
import { fromHtml } from "../../../mfm/from-html.js";
import type { IActor, IObject, IApPropertyValue } from "../type.js";
import {
	isCollectionOrOrderedCollection,
	isCollection,
	getApId,
	getOneApHrefNullable,
	isPropertyValue,
	getApType,
	isActor,
} from "../type.js";
import Resolver from "../resolver.js";
import { extractApHashtags } from "./tag.js";
import { resolveNote, extractEmojis } from "./note.js";
import { resolveImage } from "./image.js";

const logger = apLogger;

const nameLength = 128;
const summaryLength = 2048;

/**
 * Validate and convert to actor object
 * @param x Fetched object
 * @param uri Fetch target URI
 */
function validateActor(x: IObject, uri: string): IActor {
	const expectHost = toPuny(new URL(uri).hostname);

	if (x == null) {
		throw new Error("invalid Actor: object is null");
	}

	if (!isActor(x)) {
		throw new Error(`invalid Actor type '${x.type}'`);
	}

	if (!(typeof x.id === "string" && x.id.length > 0)) {
		throw new Error("invalid Actor: wrong id");
	}

	if (!(typeof x.inbox === "string" && x.inbox.length > 0)) {
		throw new Error("invalid Actor: wrong inbox");
	}

	if (
		!(
			typeof x.preferredUsername === "string" &&
			x.preferredUsername.length > 0 &&
			x.preferredUsername.length <= 128 &&
			/^\w([\w-.]*\w)?$/.test(x.preferredUsername)
		)
	) {
		throw new Error("invalid Actor: wrong username");
	}

	// These fields are only informational, and some AP software allows these
	// fields to be very long. If they are too long, we cut them off. This way
	// we can at least see these users and their activities.
	if (x.name) {
		if (!(typeof x.name === "string" && x.name.length > 0)) {
			throw new Error("invalid Actor: wrong name");
		}
		x.name = truncate(x.name, nameLength);
	}
	if (x.summary) {
		if (!(typeof x.summary === "string" && x.summary.length > 0)) {
			throw new Error("invalid Actor: wrong summary");
		}
		x.summary = truncate(x.summary, summaryLength);
	}

	const idHost = toPuny(new URL(x.id!).hostname);
	if (idHost !== expectHost) {
		throw new Error("invalid Actor: id has different host");
	}

	if (x.publicKey) {
		if (typeof x.publicKey.id !== "string") {
			throw new Error("invalid Actor: publicKey.id is not a string");
		}

		const publicKeyIdHost = toPuny(new URL(x.publicKey.id).hostname);
		if (publicKeyIdHost !== expectHost) {
			throw new Error("invalid Actor: publicKey.id has different host");
		}
	}

	return x;
}

/**
 * Fetch a Person.
 *
 * If the target Person is registered in Firefish, it will be returned.
 */
export async function fetchPerson(
	uri: string,
	resolver?: Resolver,
): Promise<CacheableUser | null> {
	if (typeof uri !== "string") throw new Error("uri is not string");

	const cached = await uriPersonCache.get(uri, true);
	if (cached) return cached;

	// Fetch from the database if the URI points to this server
	if (uri.startsWith(`${config.url}/`)) {
		const id = uri.split("/").pop();
		const u = await Users.findOneBy({ id });
		if (u) await uriPersonCache.set(uri, u);
		return u;
	}

	//#region Returns if already registered with this server
	const user = await Users.findOneBy({ uri });

	if (user != null) {
		await uriPersonCache.set(uri, user);
		return user;
	}
	//#endregion

	return null;
}

/**
 * Create Person.
 */
export async function createPerson(
	uri: string,
	resolver?: Resolver,
): Promise<User> {
	if (typeof uri !== "string") throw new Error("uri is not string");

	if (uri.startsWith(config.url)) {
		throw new StatusError(
			"cannot resolve local user",
			400,
			"cannot resolve local user",
		);
	}

	if (resolver == null) resolver = new Resolver();

	const object = (await resolver.resolve(uri)) as any;

	const person = validateActor(object, uri);

	logger.info(`Creating the Person: ${person.id}`);

	const host = toPuny(new URL(object.id).hostname);

	const { fields } = analyzeAttachments(person.attachment || []);

	const tags = extractApHashtags(person.tag)
		.map((tag) => normalizeForSearch(tag))
		.splice(0, 32);

	const isBot = getApType(object) !== "Person";

	const bday = person["vcard:bday"]?.match(/^\d{4}-\d{2}-\d{2}/);

	const url = getOneApHrefNullable(person.url);

	if (url && !url.startsWith("https://")) {
		throw new Error(`unexpected schema of person url: ${url}`);
	}

	let followersCount: number | undefined;

	if (typeof person.followers === "string") {
		try {
			const data = await fetch(person.followers, {
				headers: { Accept: "application/json" },
			});
			const json_data = JSON.parse(await data.text());

			followersCount = json_data.totalItems;
		} catch {
			followersCount = undefined;
		}
	}

	let followingCount: number | undefined;

	if (typeof person.following === "string") {
		try {
			const data = await fetch(person.following, {
				headers: { Accept: "application/json" },
			});
			const json_data = JSON.parse(await data.text());

			followingCount = json_data.totalItems;
		} catch (e) {
			followingCount = undefined;
		}
	}

	let notesCount: number | undefined;

	if (typeof person.outbox === "string") {
		try {
			const data = await fetch(person.outbox, {
				headers: { Accept: "application/json" },
			});
			const json_data = JSON.parse(await data.text());

			notesCount = json_data.totalItems;
		} catch (e) {
			notesCount = undefined;
		}
	}

	// Create user
	let user: IRemoteUser;
	try {
		// Start transaction
		await db.transaction(async (transactionalEntityManager) => {
			user = (await transactionalEntityManager.save(
				new User({
					id: genId(),
					avatarId: null,
					bannerId: null,
					createdAt: new Date(),
					lastFetchedAt: new Date(),
					name: truncate(person.name, nameLength),
					isLocked: !!person.manuallyApprovesFollowers,
					movedToUri: person.movedTo,
					alsoKnownAs: person.alsoKnownAs,
					isExplorable: !!person.discoverable,
					username: person.preferredUsername,
					usernameLower: person.preferredUsername!.toLowerCase(),
					host,
					inbox: person.inbox,
					sharedInbox:
						person.sharedInbox ||
						(person.endpoints ? person.endpoints.sharedInbox : undefined),
					followersUri: person.followers
						? getApId(person.followers)
						: undefined,
					followersCount:
						followersCount !== undefined
							? followersCount
							: person.followers &&
							  typeof person.followers !== "string" &&
							  isCollectionOrOrderedCollection(person.followers)
							? person.followers.totalItems
							: undefined,
					followingCount:
						followingCount !== undefined
							? followingCount
							: person.following &&
							  typeof person.following !== "string" &&
							  isCollectionOrOrderedCollection(person.following)
							? person.following.totalItems
							: undefined,
					notesCount:
						notesCount !== undefined
							? notesCount
							: person.outbox &&
							  typeof person.outbox !== "string" &&
							  isCollectionOrOrderedCollection(person.outbox)
							? person.outbox.totalItems
							: undefined,
					featured: person.featured ? getApId(person.featured) : undefined,
					uri: person.id,
					tags,
					isBot,
					isCat: (person as any).isCat === true,
					speakAsCat: person.speakAsCat,
					isIndexable: person.indexable,
				}),
			)) as IRemoteUser;

			await transactionalEntityManager.save(
				new UserProfile({
					userId: user.id,
					description: person.summary
						? htmlToMfm(truncate(person.summary, summaryLength), person.tag)
						: null,
					url: url,
					fields,
					birthday: bday ? bday[0] : null,
					location: person["vcard:Address"] || null,
					userHost: host,
				}),
			);

			if (person.publicKey) {
				await transactionalEntityManager.save(
					new UserPublickey({
						userId: user.id,
						keyId: person.publicKey.id,
						keyPem: person.publicKey.publicKeyPem,
					}),
				);
			}
		});
	} catch (e) {
		// duplicate key error
		if (isDuplicateKeyValueError(e)) {
			// /users/@a => /users/:id Corresponds to an error that may occur when the input is an alias like
			const u = await Users.findOneBy({
				uri: person.id,
			});

			if (u) {
				user = u as IRemoteUser;
			} else {
				throw new Error("already registered");
			}
		} else {
			logger.error(e instanceof Error ? e : new Error(e as string));
			throw e;
		}
	}

	// Register host
	registerOrFetchInstanceDoc(host).then((i) => {
		Instances.increment({ id: i.id }, "usersCount", 1);
		instanceChart.newUser(i.host);
		fetchInstanceMetadata(i);
	});

	usersChart.update(user!, true);

	// Hashtag update
	updateUsertags(user!, tags);

	//#region Fetch avatar and header image
	const [avatar, banner] = await Promise.all(
		[person.icon, person.image].map((img) =>
			img == null
				? Promise.resolve(null)
				: resolveImage(user!, img).catch(() => null),
		),
	);

	const avatarId = avatar ? avatar.id : null;
	const bannerId = banner ? banner.id : null;

	await Users.update(user!.id, {
		avatarId,
		bannerId,
	});

	user!.avatarId = avatarId;
	user!.bannerId = bannerId;
	//#endregion

	//#region Get custom emoji
	const emojis = await extractEmojis(person.tag || [], host).catch((e) => {
		logger.info(`extractEmojis: ${e}`);
		return [] as Emoji[];
	});

	const emojiNames = emojis.map((emoji) => emoji.name);

	await Users.update(user!.id, {
		emojis: emojiNames,
	});
	//#endregion

	await updateFeatured(user!.id, resolver).catch((err) => logger.error(err));

	return user!;
}

/**
 * Update Person data from remote.
 * If the target Person is not registered in Firefish, it is ignored.
 * @param uri URI of Person
 * @param resolver Resolver
 * @param hint Hint of Person object (If this value is a valid Person, it is used for updating without Remote resolve)
 */
export async function updatePerson(
	uri: string,
	resolver?: Resolver | null,
	hint?: IObject,
): Promise<void> {
	if (typeof uri !== "string") throw new Error("uri is not string");

	// Skip if the URI points to this server
	if (uri.startsWith(`${config.url}/`)) {
		return;
	}

	//#region Already registered on this server?
	const user = (await Users.findOneBy({ uri })) as IRemoteUser;

	if (user == null) {
		return;
	}
	//#endregion

	if (resolver == null) resolver = new Resolver();

	const object = hint || (await resolver.resolve(uri));

	const person = validateActor(object, uri);

	logger.info(`Updating the Person: ${person.id}`);

	// Fetch avatar and header image
	const [avatar, banner] = await Promise.all(
		[person.icon, person.image].map((img) =>
			img == null
				? Promise.resolve(null)
				: resolveImage(user, img).catch(() => null),
		),
	);

	// Custom pictogram acquisition
	const emojis = await extractEmojis(person.tag || [], user.host).catch((e) => {
		logger.info(`extractEmojis: ${e}`);
		return [] as Emoji[];
	});

	const emojiNames = emojis.map((emoji) => emoji.name);

	const { fields } = analyzeAttachments(person.attachment || []);

	const tags = extractApHashtags(person.tag)
		.map((tag) => normalizeForSearch(tag))
		.splice(0, 32);

	const bday = person["vcard:bday"]?.match(/^\d{4}-\d{2}-\d{2}/);

	const url = getOneApHrefNullable(person.url);

	if (url && !url.startsWith("https://")) {
		throw new Error(`unexpected schema of person url: ${url}`);
	}

	let followersCount: number | undefined;

	if (typeof person.followers === "string") {
		try {
			let data = await fetch(person.followers, {
				headers: { Accept: "application/json" },
			});
			let json_data = JSON.parse(await data.text());

			followersCount = json_data.totalItems;
		} catch {
			followersCount = undefined;
		}
	}

	let followingCount: number | undefined;

	if (typeof person.following === "string") {
		try {
			let data = await fetch(person.following, {
				headers: { Accept: "application/json" },
			});
			let json_data = JSON.parse(await data.text());

			followingCount = json_data.totalItems;
		} catch {
			followingCount = undefined;
		}
	}

	let notesCount: number | undefined;

	if (typeof person.outbox === "string") {
		try {
			let data = await fetch(person.outbox, {
				headers: { Accept: "application/json" },
			});
			let json_data = JSON.parse(await data.text());

			notesCount = json_data.totalItems;
		} catch (e) {
			notesCount = undefined;
		}
	}

	const updates = {
		lastFetchedAt: new Date(),
		inbox: person.inbox,
		sharedInbox:
			person.sharedInbox ||
			(person.endpoints ? person.endpoints.sharedInbox : undefined),
		followersUri: person.followers ? getApId(person.followers) : undefined,
		followersCount:
			followersCount !== undefined
				? followersCount
				: person.followers &&
				  typeof person.followers !== "string" &&
				  isCollectionOrOrderedCollection(person.followers)
				? person.followers.totalItems
				: undefined,
		followingCount:
			followingCount !== undefined
				? followingCount
				: person.following &&
				  typeof person.following !== "string" &&
				  isCollectionOrOrderedCollection(person.following)
				? person.following.totalItems
				: undefined,
		notesCount:
			notesCount !== undefined
				? notesCount
				: person.outbox &&
				  typeof person.outbox !== "string" &&
				  isCollectionOrOrderedCollection(person.outbox)
				? person.outbox.totalItems
				: undefined,
		featured: person.featured,
		emojis: emojiNames,
		name: truncate(person.name, nameLength),
		tags,
		isBot: getApType(object) !== "Person",
		isCat: (person as any).isCat === true,
		isIndexable: person.indexable,
		isLocked: !!person.manuallyApprovesFollowers,
		movedToUri: person.movedTo || null,
		alsoKnownAs: person.alsoKnownAs || null,
		isExplorable: !!person.discoverable,
	} as Partial<User>;

	if (avatar) {
		updates.avatarId = avatar.id;
	}

	if (banner) {
		updates.bannerId = banner.id;
	}

	// Update user
	await Users.update(user.id, updates);

	if (person.publicKey) {
		await UserPublickeys.update(
			{ userId: user.id },
			{
				keyId: person.publicKey.id,
				keyPem: person.publicKey.publicKeyPem,
			},
		);
	}

	await UserProfiles.update(
		{ userId: user.id },
		{
			url: url,
			fields,
			description: person.summary
				? htmlToMfm(truncate(person.summary, summaryLength), person.tag)
				: null,
			birthday: bday ? bday[0] : null,
			location: person["vcard:Address"] || null,
		},
	);

	publishInternalEvent("remoteUserUpdated", { id: user.id });

	// Hashtag Update
	updateUsertags(user, tags);

	// If the user in question is a follower, followers will also be updated.
	await Followings.update(
		{
			followerId: user.id,
		},
		{
			followerSharedInbox:
				person.sharedInbox ||
				(person.endpoints ? person.endpoints.sharedInbox : null),
		},
	);

	await updateFeatured(user.id, resolver).catch((err) => logger.error(err));
}

/**
 * Resolve Person.
 *
 * If the target person is registered in Firefish, it returns it;
 * otherwise, it fetches it from the remote server, registers it in Firefish, and returns it.
 */
export async function resolvePerson(
	uri: string,
	resolver?: Resolver,
): Promise<CacheableUser> {
	if (typeof uri !== "string") throw new Error("uri is not string");

	//#region If already registered on this server, return it.
	const user = await fetchPerson(uri);

	if (user != null) {
		return user;
	}
	//#endregion

	// Fetched from remote server and registered
	if (resolver == null) resolver = new Resolver();
	return await createPerson(uri, resolver);
}

const services: {
	[x: string]: (id: string, username: string) => any;
} = {
	"misskey:authentication:twitter": (userId, screenName) => ({
		userId,
		screenName,
	}),
	"misskey:authentication:github": (id, login) => ({ id, login }),
	"misskey:authentication:discord": (id, name) => $discord(id, name),
};

const $discord = (id: string, name: string) => {
	if (typeof name !== "string") {
		name = "unknown#0000";
	}
	const [username, discriminator] = name.split("#");
	return { id, username, discriminator };
};

function addService(target: { [x: string]: any }, source: IApPropertyValue) {
	const service = services[source.name];

	if (typeof source.value !== "string") {
		source.value = "unknown";
	}

	const [id, username] = source.value.split("@");

	if (service) {
		target[source.name.split(":")[2]] = service(id, username);
	}
}

export function analyzeAttachments(
	attachments: IObject | IObject[] | undefined,
) {
	const fields: {
		name: string;
		value: string;
	}[] = [];
	const services: { [x: string]: any } = {};

	if (Array.isArray(attachments)) {
		for (const attachment of attachments.filter(isPropertyValue)) {
			if (isPropertyValue(attachment.identifier)) {
				addService(services, attachment.identifier);
			} else {
				fields.push({
					name: attachment.name,
					value: fromHtml(attachment.value),
				});
			}
		}
	}

	return { fields, services };
}

export async function updateFeatured(userId: User["id"], resolver?: Resolver) {
	const user = await Users.findOneByOrFail({ id: userId });
	if (!Users.isRemoteUser(user)) return;
	if (!user.featured) return;

	logger.info(`Updating the featured: ${user.uri}`);

	if (resolver == null) resolver = new Resolver();

	// Resolve to (Ordered)Collection Object
	const collection = await resolver.resolveCollection(user.featured);
	if (!isCollectionOrOrderedCollection(collection))
		throw new Error("Object is not Collection or OrderedCollection");

	// Resolve to Object(may be Note) arrays
	const unresolvedItems = isCollection(collection)
		? collection.items
		: collection.orderedItems;
	const items = await Promise.all(
		toArray(unresolvedItems).map((x) => resolver?.resolve(x)),
	);

	// Resolve and regist Notes
	const limit = promiseLimit<Note | null>(2);
	const featuredNotes = await Promise.all(
		items
			.filter((item) => getApType(item) === "Note") // TODO: Maybe it doesn't have to be a Note.
			.slice(0, 5)
			.map((item) => limit(() => resolveNote(item, resolver))),
	);

	await db.transaction(async (transactionalEntityManager) => {
		await transactionalEntityManager.delete(UserNotePining, {
			userId: user.id,
		});

		// For now, generate the id at a different time and maintain the order.
		let td = 0;
		for (const note of featuredNotes.filter((note) => note != null)) {
			td -= 1000;
			transactionalEntityManager.insert(UserNotePining, {
				id: genId(new Date(Date.now() + td)),
				createdAt: new Date(),
				userId: user.id,
				noteId: note!.id,
			});
		}
	});
}
