<template>
	<XWindow
		ref="windowEl"
		:initial-width="500"
		:initial-height="500"
		:can-resize="true"
		:close-button="true"
		:buttons-left="buttonsLeft"
		:buttons-right="buttonsRight"
		:contextmenu="contextmenu"
		class="page-window"
		@closed="$emit('closed')"
	>
		<template #header>
			<template v-if="pageMetadata?.value">
				<i
					v-if="pageMetadata.value.icon"
					class="icon"
					:class="pageMetadata.value.icon"
					style="margin-right: 0.5em"
				></i>
				<span>{{ pageMetadata.value.title }}</span>
			</template>
		</template>

		<div class="yrolvcoq" :style="{ background: pageMetadata?.value?.bg }">
			<RouterView :router="router" />
		</div>
	</XWindow>
</template>

<script lang="ts" setup>
import type { ComputedRef } from "vue";
import { computed, provide, ref } from "vue";
import RouterView from "@/components/global/RouterView.vue";
import XWindow from "@/components/MkWindow.vue";
import { popout as _popout } from "@/scripts/popout";
import copyToClipboard from "@/scripts/copy-to-clipboard";
import { url } from "@/config";
import { mainRouter, routes } from "@/router";
import { Router } from "@/nirax";
import { i18n } from "@/i18n";
import type { PageMetadata } from "@/scripts/page-metadata";
import { provideMetadataReceiver } from "@/scripts/page-metadata";

const props = defineProps<{
	initialPath: string;
}>();

defineEmits<{
	(ev: "closed"): void;
}>();

const router = new Router(routes, props.initialPath);

const pageMetadata = ref<null | ComputedRef<PageMetadata>>();
const windowEl = ref<InstanceType<typeof XWindow>>();
const history = ref<{ path: string; key: any }[]>([
	{
		path: router.getCurrentPath(),
		key: router.getCurrentKey(),
	},
]);
const buttonsLeft = computed(() => {
	const buttons = [];

	if (history.value.length > 1) {
		buttons.push({
			icon: "ph-caret-left ph-bold ph-lg",
			onClick: back,
		});
	}

	return buttons;
});
const buttonsRight = computed(() => {
	const buttons = [
		{
			icon: "ph-arrows-out-simple ph-bold ph-lg",
			title: i18n.ts.showInPage,
			onClick: expand,
		},
	];

	return buttons;
});

router.addListener("push", (ctx) => {
	history.value.push({ path: ctx.path, key: ctx.key });
});

provide("router", router);
provideMetadataReceiver((info) => {
	pageMetadata.value = info;
});
provide("shouldOmitHeaderTitle", true);
provide("shouldBackButton", false);
provide("shouldHeaderThin", true);

const contextmenu = computed(() => [
	{
		icon: "ph-arrows-out-simple ph-bold ph-lg",
		text: i18n.ts.showInPage,
		action: expand,
	},
	{
		icon: "ph-arrow-square-out ph-bold ph-lg",
		text: i18n.ts.popout,
		action: popout,
	},
	{
		icon: "ph-arrow-square-out ph-bold ph-lg",
		text: i18n.ts.openInNewTab,
		action: () => {
			window.open(url + router.getCurrentPath(), "_blank");
			windowEl.value.close();
		},
	},
	{
		icon: "ph-link-simple ph-bold ph-lg",
		text: i18n.ts.copyLink,
		action: () => {
			copyToClipboard(url + router.getCurrentPath());
		},
	},
]);

function back() {
	history.value.pop();
	router.replace(
		history.value[history.value.length - 1].path,
		history.value[history.value.length - 1].key,
	);
}

function close() {
	windowEl.value.close();
}

function expand() {
	mainRouter.push(router.getCurrentPath(), "forcePage");
	windowEl.value.close();
}

function popout() {
	_popout(router.getCurrentPath(), windowEl.value.$el);
	windowEl.value.close();
}

defineExpose({
	close,
});
</script>

<style lang="scss" scoped>
.yrolvcoq {
	min-height: 100%;
	background: var(--bg);
}
</style>
