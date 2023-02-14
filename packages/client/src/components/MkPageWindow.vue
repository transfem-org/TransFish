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
	@closed="$emit('closed')"
>
	<template #header>
		<template v-if="pageMetadata?.value">
			<i v-if="pageMetadata.value.icon" class="icon" :class="pageMetadata.value.icon" style="margin-right: 0.5em;"></i>
			<span>{{ pageMetadata.value.title }}</span>
		</template>
	</template>

	<div class="yrolvcoq" :style="{ background: pageMetadata?.value?.bg }">
		<RouterView :router="router"/>
	</div>
</XWindow>
</template>

<script lang="ts" setup>
import { ComputedRef, inject, provide } from 'vue';
import RouterView from '@/components/global/RouterView.vue';
import XWindow from '@/components/MkWindow.vue';
import { popout as _popout } from '@/scripts/popout';
import copyToClipboard from '@/scripts/copy-to-clipboard';
import { url } from '@/config';
import * as os from '@/os';
import { mainRouter, routes } from '@/router';
import { i18n } from '@/i18n';
import { PageMetadata, provideMetadataReceiver, setPageMetadata } from '@/scripts/page-metadata';

import VueRouter from "vue-router"

const props = defineProps<{
	initialPath: string;
}>();

defineEmits<{
	(ev: 'closed'): void;
}>();

const router = VueRouter.createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: VueRouter.createWebHashHistory(),
  routes, // short for `routes: routes`
})

let pageMetadata = $ref<null | ComputedRef<PageMetadata>>();
let windowEl = $ref<InstanceType<typeof XWindow>>();
	
provide('router', router);
provideMetadataReceiver((info) => {
	pageMetadata = info;
});
provide('shouldOmitHeaderTitle', true);
provide('shouldHeaderThin', true);

const contextmenu = $computed(() => ([{
	icon: 'ph-arrows-out-simple-bold ph-lg',
	text: i18n.ts.showInPage,
	action: expand,
}, {
	icon: 'ph-arrow-square-out-bold ph-lg',
	text: i18n.ts.popout,
	action: popout,
}, {
	icon: 'ph-arrow-square-out-bold ph-lg',
	text: i18n.ts.openInNewTab,
	action: () => {
		window.open(url + router.getCurrentPath(), '_blank');
		windowEl.close();
	},
}, {
	icon: 'ph-link-simple-bold ph-lg',
	text: i18n.ts.copyLink,
	action: () => {
		copyToClipboard(url + router.getCurrentPath());
	},
}]));

function menu(ev) {
	os.popupMenu(contextmenu, ev.currentTarget ?? ev.target);
}

function back() {
	history.pop();
	router.replace(history[history.length - 1].path, history[history.length - 1].key);
}

function close() {
	windowEl.close();
}

function expand() {
	mainRouter.push(router.getCurrentPath(), 'forcePage');
	windowEl.close();
}

function popout() {
	_popout(router.getCurrentPath(), windowEl.$el);
	windowEl.close();
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
