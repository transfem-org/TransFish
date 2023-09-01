<template>
	<transition
		:name="defaultStore.state.animation ? 'zoom' : ''"
		mode="out-in"
	>
		<!-- v-if="!fetching" for now, I think there's something
			 weird w/ some links stuck loading (?) -->
		<article v-if="!fetching" class="url-preview" @click.stop>
			<component
				:is="self ? 'MkA' : 'a'"
				:[attr]="self ? url.substring(local.length) : url"
				rel="nofollow noopener"
				:target="target"
				:title="url"
				:class="{
					hasButton: tweetId || player.url,
				}"
			>
				<div v-if="thumbnail" class="thumbnail">
					<img :src="thumbnail" loading="lazy" />
					<button
						v-if="tweetId"
						v-tooltip="
							tweetExpanded ? i18n.ts.close : i18n.ts.expandTweet
						"
						class="_button"
						@click.stop.prevent="tweetExpanded = !tweetExpanded"
					>
						<i
							v-if="!tweetExpanded"
							class="ph-twitter-logo ph-bold ph-lg"
						></i>
						<i v-else class="ph-x ph-bold ph-lg"></i>
					</button>
					<button
						v-else-if="player.url"
						v-tooltip="
							playerEnabled ? i18n.ts.close : i18n.ts.enablePlayer
						"
						class="_button"
						@click.stop.prevent="playerEnabled = !playerEnabled"
					>
						<i
							v-if="!playerEnabled"
							class="ph-play ph-bold ph-lg"
						></i>
						<i v-else class="ph-x ph-bold ph-lg"></i>
					</button>
				</div>
				<div v-if="fetching">
					<MkLoading mini />
				</div>
				<div v-else>
					<h3 :title="title || undefined">{{ title || url }}</h3>
					<p :title="description">
						<span>
							<span :title="sitename || undefined">
								<img v-if="icon" class="icon" :src="icon" />
								{{ sitename }}
							</span>
							{{ description }}
						</span>
					</p>
				</div>
			</component>
			<iframe
				v-if="playerEnabled"
				:src="
					player.url +
					(player.url.match(/\?/)
						? '&autoplay=1&auto_play=1'
						: '?autoplay=1&auto_play=1')
				"
				:style="`aspect-ratio: ${
					(player.width || 1) / (player.height || 1)
				}`"
				frameborder="0"
				allow="autoplay; encrypted-media"
				allowfullscreen
				@click.stop
			/>
			<iframe
				v-else-if="tweetId && tweetExpanded"
				ref="tweet"
				scrolling="no"
				frameborder="no"
				:style="{
					position: 'relative',
					width: '100%',
					height: `${tweetHeight}px`,
				}"
				:src="`https://platform.twitter.com/embed/index.html?embedId=${embedId}&amp;hideCard=false&amp;hideThread=false&amp;lang=en&amp;theme=${
					defaultStore.state.darkMode ? 'dark' : 'light'
				}&amp;id=${tweetId}`"
				@click.stop
			></iframe>
		</article>
	</transition>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from "vue";
import { lang, url as local } from "@/config";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";

const props = withDefaults(
	defineProps<{
		url: string;
		detail?: boolean;
	}>(),
	{
		detail: false,
	},
);

const self = props.url.startsWith(local);
const attr = self ? "to" : "href";
const target = self ? null : "_blank";
const fetching = ref(true);
const title = ref<string | null>(null);
const description = ref<string | null>(null);
const thumbnail = ref<string | null>(null);
const icon = ref<string | null>(null);
const sitename = ref<string | null>(null);
const player = ref({
	url: null,
	width: null,
	height: null,
});
const playerEnabled = ref(false);
const tweetId = ref<string | null>(null);
const tweetExpanded = ref(props.detail);
const embedId = `embed${Math.random().toString().replace(/\D/, "")}`;
const tweetHeight = ref(150);

const requestUrl = new URL(props.url);
if (!["http:", "https:"].includes(requestUrl.protocol))
	throw new Error("invalid url");

if (
	["twitter.com", "mobile.twitter.com", "x.com"].includes(requestUrl.hostname)
) {
	const m = requestUrl.pathname.match(/^\/.+\/status(?:es)?\/(\d+)/);
	if (m) tweetId.value = m[1];
}

if (
	requestUrl.hostname === "music.youtube.com" &&
	requestUrl.pathname.match("^/(?:watch|channel)")
) {
	requestUrl.hostname = "www.youtube.com";
}

const requestLang = (lang || "ja-JP").replace("ja-KS", "ja-JP");

requestUrl.hash = "";

fetch(
	`/url?url=${encodeURIComponent(requestUrl.href)}&lang=${requestLang}`,
).then((res) => {
	res.json().then((info) => {
		if (info.url == null) return;
		title.value = info.title;
		description.value = info.description;
		thumbnail.value = info.thumbnail;
		icon.value = info.icon;
		sitename.value = info.sitename;
		fetching.value = false;
		player.value = info.player;
	});
});

function adjustTweetHeight(message: any) {
	if (message.origin !== "https://platform.twitter.com") return;
	const embed = message.data?.["twttr.embed"];
	if (embed?.method !== "twttr.private.resize") return;
	if (embed?.id !== embedId) return;
	const height = embed?.params[0]?.height;
	if (height) tweetHeight.value = height;
}

(window as any).addEventListener("message", adjustTweetHeight);

onUnmounted(() => {
	(window as any).removeEventListener("message", adjustTweetHeight);
});
</script>

<style lang="scss" scoped>
.url-preview {
	border: 1px solid var(--divider);
	border-radius: var(--radius);
	overflow: hidden;
	> a {
		display: flex;
		transition: background 0.2s;
		text-decoration: none;
		> div:first-child:not(:last-child) {
			position: relative;
			width: 90px;
			overflow: hidden;
			display: flex;
			justify-content: center;
			align-items: center;
			img {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
				object-fit: cover;
				transition: opacity 0.2s;
			}
			button {
				display: flex;
				width: 100%;
				height: 100%;
				i {
					background: var(--bg);
					padding: 14px;
					border-radius: var(--radius);
					transform: scale(0.95);
					opacity: 0.8;
					transition:
						transform 0.2s,
						opacity 0.2s,
						background 0.2s;
				}
				&:hover,
				&:focus {
					i {
						background: var(--panelHighlight) !important;
						transform: scale(1.1) !important;
					}
				}
			}
		}
		> div:last-child {
			padding: 14px 16px;
			width: 0;
			flex-grow: 1;
		}
		h3,
		p {
			display: block;
			margin: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 100%;
		}
		h3 {
			font-size: 1em;
			white-space: nowrap;
			margin-bottom: 0.2em;
			text-decoration: underline;
			text-decoration-color: transparent;
			transition: text-decoration-color 0.2s;
		}
		p {
			margin-bottom: -0.5em;
			> span {
				display: -webkit-inline-box;
				font-size: 0.8em;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				overflow: hidden;
				> span {
					font-weight: 600;
					margin-right: 0.4em;
				}
			}
		}
		.icon {
			width: 1.2em;
			height: 1.2em;
			vertical-align: middle;
			border-radius: 4px;
		}
		&:hover,
		&:focus,
		&:focus-within {
			background: var(--panelHighlight);
			h3 {
				text-decoration-color: currentColor;
			}
		}
	}
	&:hover,
	&:focus-within {
		> .hasButton {
			> div:first-child {
				img {
					opacity: 0.2;
				}
				button i {
					transform: none;
					opacity: 1;
				}
			}
		}
	}
	iframe {
		border-top: 1px solid var(--divider);
		display: block;
		width: 100%;
		overflow-y: auto;
		&:not([src^="https://platform.twitter"])
		{
			max-height: 70vh;
		}
	}
}
</style>
