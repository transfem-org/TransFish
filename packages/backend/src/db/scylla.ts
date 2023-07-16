import config from "@/config/index.js";
import { Client } from "cassandra-driver";

function newClient(): Client | null {
	if (!config.scylla) {
		return null;
	}

	return new Client({
		contactPoints: config.scylla.nodes,
		keyspace: config.scylla.keyspace,
	});
}

export const scyllaClient = newClient();

export const prepared = {
	timeline: {
		insert: "",
		select: "",
		delete: "",
	},
	notification: {
		insert: "",
		select: "",
		delete: "",
	}
}
