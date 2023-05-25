import {Health, MeiliSearch, Stats } from 'meilisearch';
import { dbLogger } from "./logger.js";

import config from "@/config/index.js";
import {Note} from "@/models/entities/note";

const logger = dbLogger.createSubLogger("meilisearch", "gray", false);

logger.info("Connecting to MeiliSearch");

const hasConfig =
	config.meilisearch && (config.meilisearch.host || config.meilisearch.port || config.meilisearch.apiKey);

const host = hasConfig ? config.meilisearch.host ?? "localhost" : "";
const port = hasConfig ? config.meilisearch.port ?? 7700 : 0;
const auth = hasConfig ? config.meilisearch.apiKey ?? "" : "";

const client: MeiliSearch = new MeiliSearch({
	host: `http://${host}:${port}`,
	apiKey: auth,
})

const posts = client.index('posts');

posts.updateSearchableAttributes(['text']);

posts.updateFilterableAttributes(["userId", "userHost", "mediaAttachment"])

logger.info("Connected to MeiliSearch");


export type MeilisearchNote = {
	id: string;
	text: string;
	userId: string;
	userHost: string;
	channelId: string;
	mediaAttachment: string;
}

export default hasConfig ? {
	search: (query : string, limit : number, offset : number) => {
		logger.info(`Searching for ${query}`);
		logger.info(`Limit: ${limit}`);
		logger.info(`Offset: ${offset}`);

		/// Advanced search syntax
		/// from:user => filter by user + optional domain
		/// has:image/video/audio/text/file => filter by attachment types
		/// domain:domain.com => filter by domain

		let constructedFilters: string[] = [];

		let splitSearch = query.split(" ");
		splitSearch.forEach(term => {
			if (term.startsWith("has:")) {
				let fileType = term.slice(4);
				constructedFilters.push(`mediaAttachment = "${fileType}"`)
			}
			if (term.startsWith("from:")) {
				let user = term.slice(5);
				constructedFilters.push(`userId = ${user}`)
			}
			if (term.startsWith("domain:")) {
				let domain = term.slice(7);
				constructedFilters.push(`userHost = ${domain}`)
			}
		})

		return posts.search(query, {
			limit: limit,
			offset: offset,
			filter: constructedFilters
		});
	},
	ingestNote: (note : Note) => {
		logger.info("Indexing note in MeiliSearch: " + note.id);

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
					attachmentType = "file"
					break
			}
		}

		return posts.addDocuments([
			{
				id: note.id.toString(),
				text: note.text,
				userId: note.userId,
				userHost: note.userHost,
				channelId: note.channelId,
				mediaAttachment: attachmentType
			}
		]);
	},
	serverStats: async () => {
		let health : Health = await client.health();
		let stats: Stats = await client.getStats();

		return {
			health: health.status,
			size: stats.databaseSize,
			indexed_count: stats.indexes["posts"].numberOfDocuments
		}
	}
} : null;
