<template>
	<MkModal ref="modal" :z-priority="'middle'" @closed="$emit('closed')">
		<div :class="$style.root">
			<div :class="$style.title">
				<MkSparkle v-if="isGoodNews">{{ title }}</MkSparkle>
				<p v-else>{{ title }}</p>
			</div>
			<Mfm :text="text" />
			<img
				v-if="imageUrl != null"
				:style="$style.image"
				:key="imageUrl"
				:src="imageUrl"
				alt="attached image"
			/>
			<MkButton
				:class="$style.gotIt"
				primary
				full
				@click="$refs.modal.close() && markAsRead()"
				>{{ i18n.ts.gotIt }}</MkButton
			>
		</div>
	</MkModal>
</template>

<script lang="ts" setup>
import { shallowRef } from "vue";
import MkModal from "@/components/MkModal.vue";
import MkSparkle from "@/components/MkSparkle.vue";
import MkButton from "@/components/MkButton.vue";
import { version } from "@/config";
import { i18n } from "@/i18n";
import * as os from "@/os";

const props = defineProps<{
	announcement: Announcement;
}>();

const { id, text, title, imageUrl, isGoodNews } = props.announcement;

const modal = shallowRef<InstanceType<typeof MkModal>>();

function markAsRead() {
	os.api("i/read-announcement", { announcementId: props.announcement.id });
}
</script>

<style lang="scss" module>
.root {
	margin: auto;
	position: relative;
	padding: 32px;
	min-width: 320px;
	max-width: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--panel);
	border-radius: var(--radius);
}

.title {
	font-weight: bold;
}

.version {
	margin: 1em 0;
}

.image {
	max-width: 500px;
}

.gotIt {
	margin: 8px 0 0 0;
}

.releaseNotes {
	> img {
		border-radius: 10px;
	}
}
</style>
