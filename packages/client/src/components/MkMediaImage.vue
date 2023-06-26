<template>
	<button v-if="hide" class="qjewsnkg" @click="hide = false">
		<ImgWithBlurhash
			:hash="image.blurhash"
			:title="image.comment"
			:alt="image.comment"
		/>
		<div class="text">
			<div class="wrapper">
				<b style="display: block"
					><i class="ph-warning ph-bold ph-lg"></i>
					{{ i18n.ts.sensitive }}</b
				>
				<span style="display: block">{{ i18n.ts.clickToShow }}</span>
			</div>
		</div>
	</button>
	<div v-else class="gqnyydlz">
		<a :href="image.url">
			<ImgWithBlurhash
				:hash="image.blurhash"
				:src="url"
				:alt="image.comment"
				:type="image.type"
				:cover="false"
			/>
			<div v-if="image.type === 'image/gif'" class="gif">GIF</div>
		</a>
		<div class="buttons">
			<button
				v-if="image.comment"
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
import { watch } from "vue";
import type * as misskey from "calckey-js";
import { getStaticImageUrl } from "@/scripts/get-static-image-url";
import ImgWithBlurhash from "@/components/MkImgWithBlurhash.vue";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import * as os from "@/os";


const props = defineProps<{
	image: misskey.entities.DriveFile;
	raw?: boolean;
}>();

let hide = $ref(true);

const url =
	props.raw || defaultStore.state.loadRawImages
		? props.image.url
		: defaultStore.state.disableShowingAnimatedImages
		? getStaticImageUrl(props.image.thumbnailUrl)
		: props.image.thumbnailUrl;

function captionPopup() {
	os.alert({
		type: "info",
		text: props.image.comment
	})
}

// Plugin:register_note_view_interruptor を使って書き換えられる可能性があるためwatchする
watch(
	() => props.image,
	() => {
		hide =
			defaultStore.state.nsfw === "force"
				? true
				: props.image.isSensitive &&
				  defaultStore.state.nsfw !== "ignore";
	},
	{
		deep: true,
		immediate: true,
	}
);
</script>

<style lang="scss" scoped>
.qjewsnkg {
	all: unset;
	position: relative;

	> .text {
		position: relative;
		width: 100%;
		height: 100%;
		z-index: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30px;
		box-sizing: border-box;
		background: rgba(0, 0, 0, 0.5);

		> .wrapper {
			display: table-cell;
			text-align: center;
			font-size: 0.8em;
			color: #fff;
		}
	}

	&:focus-visible {
		border: 2px solid var(--accent);
	}
}

.gqnyydlz {
	position: relative;
	background: var(--bg);

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

	> a {
		display: block;
		cursor: zoom-in;
		overflow: hidden;
		width: 100%;
		height: 100%;
		background-position: center;
		background-size: contain;
		background-repeat: no-repeat;
		box-sizing: border-box;
		&:focus-visible {
			border: 2px solid var(--accent);
		}

		> .gif {
			background-color: var(--fg);
			border-radius: 6px;
			color: var(--accentLighten);
			display: inline-block;
			font-size: 14px;
			font-weight: bold;
			left: 12px;
			opacity: 0.5;
			padding: 0 6px;
			text-align: center;
			top: 12px;
			pointer-events: none;
		}
	}
}
</style>
