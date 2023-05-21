import * as MeiliSearch from "meilisearch";
import { dbLogger } from "./logger.js";

import config from "@/config/index.js";

const logger = dbLogger.createSubLogger("meilisearch", "gray", false);

logger.info("Connecting to Meilisearch");

const hasConfig =
	config.meilisearch && (config.meilisearch.host || config.meilisearch.port);

const host = hasConfig ? config.meilisearch.host ?? "localhost" : "";
const port = hasConfig ? config.meilisearch.port ?? 7700 : 0;
const ssl = hasConfig ? config.meilisearch.ssl ?? false : true;
const apiKey = hasConfig ? config.meilisearch.apiKey ?? "" : "";

export default hasConfig
	? new MeiliSearch.MeiliSearch({
			host: `${ssl ? "https" : "http"}://${host}:${port}`,
			apiKey,
	  })
	: null;
