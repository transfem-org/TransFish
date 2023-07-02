<template>
	<div
		v-if="hide"
		class="icozogqfvdetwohsdglrbswgrejoxbdj"
		@click="hide = false"
	>
		<div>
			<b
				><i class="ph-warning ph-bold ph-lg"></i>
				{{ i18n.ts.sensitive }}</b
			>
			<span>{{ i18n.ts.clickToShow }}</span>
		</div>
	</div>
	<div v-else class="video" :class="{ mini }">
		<VuePlyr
			ref="plyr"
			:options="{
				controls: [
					'play-large',
					'play',
					'progress',
					'current-time',
					'mute',
					'volume',
					'pip',
					'download',
					'fullscreen',
				],
				disableContextMenu: false,
			}"
		>
			<video
				:poster="video.thumbnailUrl"
				:aria-label="video.comment"
				preload="none"
				controls
				@contextmenu.stop
			>
				<source :src="video.url" :type="video.type" />
			</video>
		</VuePlyr>
		<div class="buttons">
			<button
				v-if="video.comment"
				v-tooltip="i18n.ts.alt"
				class="_button"
				@click.stop="captionPopup"
			>
				<i class="ph-subtitles ph-bold ph-lg"></i>
			</button>
			<button
				v-tooltip="i18n.ts.hide"
				class="_button"
				@click="hide = true"
			>
				<i class="ph-eye-slash ph-bold ph-lg"></i>
			</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import VuePlyr from "vue-plyr";
import type * as misskey from "firefish-js";
import { defaultStore } from "@/store";
import "vue-plyr/dist/vue-plyr.css";
import { i18n } from "@/i18n";
import * as os from "@/os";

const props = defineProps<{
	video: misskey.entities.DriveFile;
}>();

const plyr = ref();
const mini = ref(false);

const hide = ref(
	defaultStore.state.nsfw === "force"
		? true
		: props.video.isSensitive && defaultStore.state.nsfw !== "ignore"
);

function captionPopup() {
	os.alert({
		type: "info",
		text: props.video.comment,
	});
}

onMounted(() => {
	mini.value = plyr.value.player.media.scrollWidth < 300;
	if (mini.value) {
		plyr.value.player.on("play", () => {
			plyr.value.player.fullscreen.enter();
		});
	}
});
</script>

<style lang="scss" scoped>
.video {
	position: relative;
	--plyr-color-main: var(--accent);

	> .buttons {
		display: flex;
		gap: 4px;
		position: absolute;
		border-radius: 6px;
		overflow: hidden;
		top: 12px;
		right: 12px;
		> * {
			background-color: var(--accentedBg);
			-webkit-backdrop-filter: var(--blur, blur(15px));
			backdrop-filter: var(--blur, blur(15px));
			color: var(--accent);
			font-size: 0.8em;
			padding: 6px 8px;
			text-align: center;
		}
	}

	> video {
		display: flex;
		justify-content: center;
		align-items: center;

		font-size: 3.5em;
		overflow: hidden;
		background-position: center;
		background-size: cover;
		width: 100%;
		height: 100%;
	}

	&.mini {
		:deep(.plyr:not(:fullscreen)) {
			min-width: unset !important;
			.plyr__control--overlaid,
			.plyr__progress__container,
			.plyr__volume,
			[data-plyr="fullscreen"] {
				display: none;
			}
		}
	}
}

.icozogqfvdetwohsdglrbswgrejoxbdj {
	display: flex;
	justify-content: center;
	align-items: center;
	background: #111;
	color: #fff;

	> div {
		display: table-cell;
		text-align: center;
		font-size: 12px;

		> b {
			display: block;
		}
	}
}
</style>
