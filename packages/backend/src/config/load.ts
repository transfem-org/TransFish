/**
 * Config loader
 */

import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import * as yaml from "js-yaml";
import type { Source, Mixin } from "./types.js";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

/**
 * Path of configuration directory
 */
const dir = `${_dirname}/../../../../.config`;

/**
 * Path of configuration file
 */
const path =
	process.env.NODE_ENV === "test" ? `${dir}/test.yml` : `${dir}/default.yml`;

export default function load() {
	const meta = JSON.parse(
		fs.readFileSync(`${_dirname}/../../../../built/meta.json`, "utf-8"),
	);
	const clientManifest = JSON.parse(
		fs.readFileSync(
			`${_dirname}/../../../../built/_client_dist_/manifest.json`,
			"utf-8",
		),
	);
	const config = yaml.load(fs.readFileSync(path, "utf-8")) as Source;

	const mixin = {} as Mixin;

	const url = tryCreateUrl(config.url);

	config.url = url.origin;

	config.port = config.port || parseInt(process.env.PORT || "", 10);
	config.bind = config.bind || process.env.BIND;

	mixin.version = meta.version;
	mixin.host = url.host;
	mixin.hostname = url.hostname;
	mixin.scheme = url.protocol.replace(/:$/, "");
	mixin.wsScheme = mixin.scheme.replace("http", "ws");
	mixin.wsUrl = `${mixin.wsScheme}://${mixin.host}`;
	mixin.apiUrl = `${mixin.scheme}://${mixin.host}/api`;
	mixin.authUrl = `${mixin.scheme}://${mixin.host}/auth`;
	mixin.driveUrl = `${mixin.scheme}://${mixin.host}/files`;
	mixin.userAgent = `Firefish/${meta.version} (${config.url})`;
	mixin.clientEntry = clientManifest["src/init.ts"];

	if (!config.redis.prefix) config.redis.prefix = mixin.hostname;
	if (config.cacheServer && !config.cacheServer.prefix)
		config.cacheServer.prefix = mixin.hostname;

	if (!config.clusterLimits) {
		config.clusterLimits = {
			web: 1,
			queue: 1,
		};
	} else {
		config.clusterLimits = {
			web: 1,
			queue: 1,
			...config.clusterLimits,
		};

		if (config.clusterLimits.web! < 1 || config.clusterLimits.queue! < 1) {
			throw new Error("Invalid cluster limits");
		}
	}

	return Object.assign(config, mixin);
}

function tryCreateUrl(url: string) {
	try {
		return new URL(url);
	} catch (e) {
		throw new Error(`url="${url}" is not a valid URL.`);
	}
}
