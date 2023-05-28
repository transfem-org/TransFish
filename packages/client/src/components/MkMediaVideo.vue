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
				:title="video.comment"
				:aria-label="video.comment"
				preload="none"
				controls
				@contextmenu.stop
			>
				<source :src="video.url" :type="video.type" />
			</video>
		</VuePlyr>
		<button
			v-tooltip="i18n.ts.hide"
			class="_button hide"
			@click="hide = true"
		>
			<i class="ph-eye-slash ph-bold ph-lg"></i>
		</button>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import VuePlyr from "vue-plyr";
import type * as misskey from "calckey-js";
import { defaultStore } from "@/store";
import "vue-plyr/dist/vue-plyr.css";
import { i18n } from "@/i18n";

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

onMounted(() => {
	mini.value = plyr.value.player.media.scrollWidth < 300;
	if (mini.value) {
		plyr.value.player.on('play', () => {
			plyr.value.player.fullscreen.enter();
		});
	}
})
</script>

<style lang="scss" scoped>
.video {
	position: relative;
	--plyr-color-main: var(--accent);

	> .hide {
		display: block;
		position: absolute;
		border-radius: 6px;
		background-color: var(--accentedBg);
		-webkit-backdrop-filter: var(--blur, blur(15px));
		backdrop-filter: var(--blur, blur(15px));
		color: var(--accent);
		font-size: 0.8em;
		padding: 6px 8px;
		text-align: center;
		top: 12px;
		right: 12px;

		> i {
			display: block;
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
