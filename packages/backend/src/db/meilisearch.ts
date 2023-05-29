import { Health, MeiliSearch, Stats } from "meilisearch";
import { dbLogger } from "./logger.js";

import config from "@/config/index.js";
import { Note } from "@/models/entities/note.js";
import * as url from "url";
import { ILocalUser, User } from "@/models/entities/user.js";
import { Followings, Users } from "@/models/index.js";

const logger = dbLogger.createSubLogger("meilisearch", "gray", false);

const hasConfig =
	config.meilisearch &&
	(config.meilisearch.host ||
		config.meilisearch.port ||
		config.meilisearch.apiKey);

const host = hasConfig ? config.meilisearch.host ?? "localhost" : "";
const port = hasConfig ? config.meilisearch.port ?? 7700 : 0;
const auth = hasConfig ? config.meilisearch.apiKey ?? "" : "";
const ssl = hasConfig ? config.meilisearch.ssl ?? false : false;

logger.info("Connecting to MeiliSearch");

const client: MeiliSearch = new MeiliSearch({
	host: `${ssl ? "https" : "http"}://${host}:${port}`,
	apiKey: auth,
});

const posts = client.index("posts");

posts
	.updateSearchableAttributes(["text"])
	.catch((e) =>
		logger.error(`Setting searchable attr failed, searches won't work: ${e}`),
	);

posts
	.updateFilterableAttributes([
		"userName",
		"userHost",
		"mediaAttachment",
		"createdAt",
		"userId",
	])
	.catch((e) =>
		logger.error(
			`Setting filterable attr failed, advanced searches won't work: ${e}`,
		),
	);

posts
	.updateSortableAttributes(["createdAt"])
	.catch((e) =>
		logger.error(
			`Setting sortable attr failed, placeholder searches won't sort properly: ${e}`,
		),
	);

logger.info("Connected to MeiliSearch");

export type MeilisearchNote = {
	id: string;
	text: string;
	userId: string;
	userHost: string;
	userName: string;
	channelId: string;
	mediaAttachment: string;
	createdAt: number;
};

export default hasConfig
	? {
			search: async (
				query: string,
				limit: number,
				offset: number,
				userCtx: ILocalUser | null,
			) => {
				/// Advanced search syntax
				/// from:user => filter by user + optional domain
				/// has:image/video/audio/text/file => filter by attachment types
				/// domain:domain.com => filter by domain
				/// before:Date => show posts made before Date
				/// after: Date => show posts made after Date
				/// "text" => get posts with exact text between quotes
				/// filter:following => show results only from users you follow
				/// filter:followers => show results only from followers

				const constructedFilters: string[] = [];

				const splitSearch = query.split(" ");

				// Detect search operators and remove them from the actual query
				const filteredSearchTerms = (
					await Promise.all(
						splitSearch.map(async (term) => {
							if (term.startsWith("has:")) {
								const fileType = term.slice(4);
								constructedFilters.push(`mediaAttachment = "${fileType}"`);
								return null;
							} else if (term.startsWith("from:")) {
								const user = term.slice(5);
								constructedFilters.push(`userName = ${user}`);
								return null;
							} else if (term.startsWith("domain:")) {
								const domain = term.slice(7);
								constructedFilters.push(`userHost = ${domain}`);
								return null;
							} else if (term.startsWith("after:")) {
								const timestamp = term.slice(6);
								// Try to parse the timestamp as JavaScript Date
								const date = Date.parse(timestamp);
								if (isNaN(date)) return null;
								constructedFilters.push(`createdAt > ${date / 1000}`);
								return null;
							} else if (term.startsWith("before:")) {
								const timestamp = term.slice(7);
								// Try to parse the timestamp as JavaScript Date
								const date = Date.parse(timestamp);
								if (isNaN(date)) return null;
								constructedFilters.push(`createdAt < ${date / 1000}`);
								return null;
							} else if (term.startsWith("filter:following")) {
								// Check if we got a context user
								if (userCtx) {
									// Fetch user follows from DB
									const followedUsers = await Followings.find({
										where: {
											followerId: userCtx.id,
										},
										select: {
											followeeId: true,
										},
									});
									const followIDs = followedUsers.map((user) => user.followeeId);

									if (followIDs.length === 0) return null;

									constructedFilters.push(`userId IN [${followIDs.join(",")}]`);
								} else {
									logger.warn(
										"search filtered to follows called without user context",
									);
								}

								return null;
							} else if (term.startsWith("filter:followers")) {
								// Check if we got a context user
								if (userCtx) {
									// Fetch users follows from DB
									const followedUsers = await Followings.find({
										where: {
											followeeId: userCtx.id,
										},
										select: {
											followerId: true,
										},
									});
									const followIDs = followedUsers.map((user) => user.followerId);

									if (followIDs.length === 0) return null;

									constructedFilters.push(`userId IN [${followIDs.join(",")}]`);
								} else {
									logger.warn(
										"search filtered to followers called without user context",
									);
								}

								return null;
							}

							return term;
						}),
					)
				).filter((term) => term !== null);

				const sortRules = [];

				// An empty search term with defined filters means we have a placeholder search => https://www.meilisearch.com/docs/reference/api/search#placeholder-search
				// These have to be ordered manually, otherwise the *oldest* posts are returned first, which we don't want
				if (filteredSearchTerms.length === 0 && constructedFilters.length > 0) {
					sortRules.push("createdAt:desc");
				}

				logger.info(`Searching for ${filteredSearchTerms.join(" ")}`);
				logger.info(`Limit: ${limit}`);
				logger.info(`Offset: ${offset}`);
				logger.info(`Filters: ${constructedFilters}`);
				logger.info(`Ordering: ${sortRules}`);

				return posts.search(filteredSearchTerms.join(" "), {
					limit: limit,
					offset: offset,
					filter: constructedFilters,
					sort: sortRules,
				});
			},
			ingestNote: async (ingestNotes: Note | Note[]) => {
				if (ingestNotes instanceof Note) {
					ingestNotes = [ingestNotes];
				}

				const indexingBatch: MeilisearchNote[] = [];

				for (const note of ingestNotes) {
					if (note.user === undefined) {
						note.user = await Users.findOne({
							where: {
								id: note.userId,
							},
						});
					}

					let attachmentType = "";
					if (note.attachedFileTypes.length > 0) {
						attachmentType = note.attachedFileTypes[0].split("/")[0];
						switch (attachmentType) {
							case "image":
							case "video":
							case "audio":
							case "text":
								break;
							default:
								attachmentType = "file";
								break;
						}
					}

					indexingBatch.push(<MeilisearchNote>{
						id: note.id.toString(),
						text: note.text ? note.text : "",
						userId: note.userId,
						userHost:
							note.userHost !== ""
								? note.userHost
								: url.parse(config.host).host,
						channelId: note.channelId ? note.channelId : "",
						mediaAttachment: attachmentType,
						userName: note.user?.username ?? "UNKNOWN",
						createdAt: note.createdAt.getTime() / 1000, // division by 1000 is necessary because Node returns in ms-accuracy
					});
				}

				return posts
					.addDocuments(indexingBatch, {
						primaryKey: "id",
					})
					.then(() =>
						console.log(`sent ${indexingBatch.length} posts for indexing`),
					);
			},
			serverStats: async () => {
				const health: Health = await client.health();
				const stats: Stats = await client.getStats();

				return {
					health: health.status,
					size: stats.databaseSize,
					indexed_count: stats.indexes["posts"].numberOfDocuments,
				};
			},
	  }
	: null;
