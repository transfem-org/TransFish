import { MeiliSearch } from 'meilisearch';
import { dbLogger } from "./logger.js";

import config from "@/config/index.js";
import {Note} from "@/models/entities/note";
import {normalizeForSearch} from "@/misc/normalize-for-search";

const logger = dbLogger.createSubLogger("meilisearch", "gray", false);

logger.info("Connecting to MeiliSearch");

const hasConfig =
	config.meilisearch && (config.meilisearch.host || config.meilisearch.port || config.meilisearch.apiKey);

const host = hasConfig ? config.meilisearch.host ?? "localhost" : "";
const port = hasConfig ? config.meilisearch.port ?? 7700 : 0;
const auth = hasConfig ? config.meilisearch.apiKey ?? "" : "";

const client = new MeiliSearch({
	host: `http://${host}:${port}`,
	apiKey: auth,
})

const posts = client.index('posts');

posts.updateSearchableAttributes(['text']);

logger.info("Connected to MeiliSearch");


export type MeilisearchNote = {
	id: string;
	text: string;
	userId: string;
	userHost: string;
	channelId: string;
}

export default hasConfig ? {
	search: (query : string, limit : number, offset : number) => {
		logger.info(`Searching for ${query}`);
		logger.info(`Limit: ${limit}`);
		logger.info(`Offset: ${offset}`);

		return posts.search(query, {
			limit: limit,
			offset: offset,
		});
	},
	ingestNote: (note : Note) => {
		logger.info("Indexing note in MeiliSearch: " + note.id);

		return posts.addDocuments([
			{
				id: note.id.toString(),
				text: note.text,
				userId: note.userId,
				userHost: note.userHost,
				channelId: note.channelId,
			}
		])
	},
} : null;
