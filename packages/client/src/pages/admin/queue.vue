<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
		/></template>
		<MkSpacer :content-max="800">
			<XQueue v-if="tab === 'deliver'" domain="deliver" />
			<XQueue v-else-if="tab === 'inbox'" domain="inbox" />
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import XQueue from "./queue.chart.vue";
import * as config from "@/config";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

const tab = ref("deliver");

const headerActions = computed(() => [
	{
		asFullButton: true,
		icon: "ph-arrow-square-up-right ph-bold ph-lg",
		text: i18n.ts.dashboard,
		handler: () => {
			window.open(config.url + "/queue", "_blank");
		},
	},
]);

const headerTabs = computed(() => [
	{
		key: "deliver",
		title: "Deliver",
		icon: "ph-upload ph-bold ph-lg",
	},
	{
		key: "inbox",
		title: "Inbox",
		icon: "ph-download ph-bold ph-lg",
	},
]);

definePageMetadata({
	title: i18n.ts.jobQueue,
	icon: "ph-queue ph-bold ph-lg",
});
</script>
