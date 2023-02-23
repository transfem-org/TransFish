import { Entity } from "@calckey/megalodon";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { Users, Notes } from "@/models/index.js";
import { IsNull, MoreThan } from "typeorm";

// TODO: add calckey features
export async function getInstance(response: Entity.Instance) {
	const meta = await fetchMeta(true);
	const totalUsers = Users.count({ where: { host: IsNull() } });
	const totalStatuses = Notes.count({ where: { userHost: IsNull() } });
	return {
		uri: response.uri,
		title: response.title || "",
		short_description: response.description || "",
		description: response.description || "",
		email: response.email || "",
		version: "3.0.0 compatible (Calckey)",
		urls: response.urls,
		stats: {
			user_count: (await totalUsers),
			status_count: (await totalStatuses),
			domain_count: response.stats.domain_count
		},
		thumbnail: response.thumbnail || "",
		languages: meta.langs,
		registrations: !meta.disableRegistration || response.registrations,
		approval_required: !response.registrations,
		invites_enabled: response.registrations,
		configuration: {
			accounts: {
				max_featured_tags: 20,
			},
			statuses: {
				max_characters: 3000,
				max_media_attachments: 4,
				characters_reserved_per_url: response.uri.length,
			},
			media_attachments: {
				supported_mime_types: [
					"image/jpeg",
					"image/png",
					"image/gif",
					"image/heic",
					"image/heif",
					"image/webp",
					"image/avif",
					"video/webm",
					"video/mp4",
					"video/quicktime",
					"video/ogg",
					"audio/wave",
					"audio/wav",
					"audio/x-wav",
					"audio/x-pn-wave",
					"audio/vnd.wave",
					"audio/ogg",
					"audio/vorbis",
					"audio/mpeg",
					"audio/mp3",
					"audio/webm",
					"audio/flac",
					"audio/aac",
					"audio/m4a",
					"audio/x-m4a",
					"audio/mp4",
					"audio/3gpp",
					"video/x-ms-asf",
				],
				image_size_limit: 10485760,
				image_matrix_limit: 16777216,
				video_size_limit: 41943040,
				video_frame_rate_limit: 60,
				video_matrix_limit: 2304000,
			},
			polls: {
				max_options: 8,
				max_characters_per_option: 50,
				min_expiration: 300,
				max_expiration: 2629746,
			},
		},
		contact_account: {
			id: "1",
			username: "admin",
			acct: "admin",
			display_name: "admin",
			locked: true,
			bot: true,
			discoverable: false,
			group: false,
			created_at: Math.floor(new Date().getTime() / 1000),
			createdAt: Math.floor(new Date().getTime() / 1000),
			note: "Please refer to the original instance for the actual admin contact.",
			url: "/",
			avatar: "/static-assets/badges/info.png",
			avatar_static: "/static-assets/badges/info.png",
			header: "https://http.cat/404",
			header_static: "https://http.cat/404",
			followers_count: -1,
			following_count: 0,
			statuses_count: 0,
			last_status_at: Math.floor(new Date().getTime() / 1000),
			noindex: true,
			emojis: [],
			fields: [],
		},
		rules: [],
	};
}
