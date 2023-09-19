<template>
	<MkStickyContainer>
		<template #header><MkPageHeader v-model:tab="src" :actions="headerActions" :tabs="$i ? headerTabs : headerTabsWhenNotLogin" :displayMyAvatar="true"/></template>
		<MkSpacer :contentMax="800">
			<div ref="rootEl" v-hotkey.global="keymap">
				<!--<XTutorial v-if="$i && defaultStore.reactiveState.tutorial.value != -1" class="_panel" style="margin-bottom: var(--margin);"/> -->
				<MkPostForm v-if="defaultStore.reactiveState.showFixedPostForm.value" :class="$style.postForm" class="post-form _panel" fixed style="margin-bottom: var(--margin);"/>
	
				<div v-if="queue > 0" :class="$style.new"><button class="_buttonPrimary" :class="$style.newButton" @click="top()">{{ i18n.ts.newNoteRecived }}</button></div>
				<div :class="$style.tl">
					<MkTimeline
						ref="tlComponent"
						:key="src"
						:src="src"
						:sound="true"
						@queue="queueUpdated"
					/>
				</div>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>
	
<script lang="ts" setup>
	import { computed, watch, provide } from 'vue';
	import type { Tab } from '@/components/global/MkPageHeader.tabs.vue';
	import XTutorial from "@/components/MkTutorialDialog.vue";
	import MkTimeline from '@/components/MkTimeline.vue';
	import MkPostForm from '@/components/MkPostForm.vue';
	import { scroll } from '@/scripts/scroll';
	import * as os from '@/os';
	import { defaultStore } from '@/store';
	import { i18n } from '@/i18n';
	import { instance } from '@/instance';
	import { $i } from '@/account';
	import { definePageMetadata } from '@/scripts/page-metadata';
	import { miLocalStorage } from '@/local-storage';
	import { antennasCache, userListsCache } from '@/cache';
	
	provide('shouldOmitHeaderTitle', true);
	
	if (defaultStore.reactiveState.tutorial.value !== -1) {
		os.popup(XTutorial, {}, {}, "closed");
	}
	
	const isLocalTimelineAvailable = ($i != null && !instance.disableLocalTimeline) || ($i == null && !instance.disableGlobalTimeline)
	const isGlobalTimelineAvailable = ($i != null && !instance.disableGlobalTimeline) || ($i == null && !instance.disableGlobalTimeline);
	const keymap = {
		't': focus,
	};
	
	const tlComponent = $shallowRef<InstanceType<typeof MkTimeline>>();
	const rootEl = $shallowRef<HTMLElement>();
	
	let queue = $ref(0);
	let srcWhenNotSignin = $ref(isLocalTimelineAvailable ? 'local' : 'global');
	//@ts-expect-error
	const src = $computed({ get: () => ($i ? defaultStore.reactiveState.tl.value.src : srcWhenNotSignin), set: (x) => saveSrc(x) });
	
	watch ($$(src), () => queue = 0);
	
	function queueUpdated(q: number): void {
		queue = q;
	}
	
	function top(): void {
		if (rootEl) scroll(rootEl, { top: 0 });
	}
	
	async function chooseList(ev: MouseEvent): Promise<void> {
		const lists = await userListsCache.fetch();
		const items = lists.map(list => ({
			type: 'link' as const,
			text: list.name,
			to: `/timeline/list/${list.id}`,
		}));
		//@ts-expect-error
		os.popupMenu(items, ev.currentTarget ?? ev.target);
	}
	
	async function chooseAntenna(ev: MouseEvent): Promise<void> {
		const antennas = await antennasCache.fetch();
		const items = antennas.map(antenna => ({
			type: 'link' as const,
			text: antenna.name,
			indicate: antenna.hasUnreadNote,
			to: `/timeline/antenna/${antenna.id}`,
		}));
		//@ts-expect-error
		os.popupMenu(items, ev.currentTarget ?? ev.target);
	}
	
	async function chooseChannel(ev: MouseEvent): Promise<void> {
		const channels = await os.api('channels/my-favorites', {
			limit: 100,
		});
		const items = channels.map(channel => ({
			type: 'link' as const,
			text: channel.name,
			indicate: channel.hasUnreadNote,
			to: `/channels/${channel.id}`,
		}));
		//@ts-expect-error
		os.popupMenu(items, ev.currentTarget ?? ev.target);
	}
	
	function saveSrc(newSrc: 'home' | 'local' | 'social' | 'global'): void {
		defaultStore.set('tl', {
			...defaultStore.state.tl,
			src: newSrc,
		});
		srcWhenNotSignin = newSrc;
	}
	
	/* async function timetravel(): Promise<void> {
		const { canceled, result: date } = await os.inputDate({
			title: i18n.ts.date,
		});
		if (canceled) return;
	
		tlComponent.timetravel(date);
	} */
	
	function focus(): void {
		tlComponent.focus();
	}
	
	const headerActions = $computed(() => []);
	
	const headerTabs = $computed(() => [{
		key: 'home',
		title: i18n.ts._timelines.home,
		icon: 'ph-house ph-bold ph-lg',
		iconOnly: true,
	}, ...(isLocalTimelineAvailable ? [{
		key: 'local',
		title: i18n.ts._timelines.local,
		icon: 'ph-users ph-bold ph-lg',
		iconOnly: true,
	}, {
		key: 'social',
		title: i18n.ts._timelines.social,
		icon: 'ph-handshake ph-bold ph-lg',
		iconOnly: true,
	}] : []), ...(isGlobalTimelineAvailable ? [{
		key: 'global',
		title: i18n.ts._timelines.global,
		icon: 'ph-planet ph-bold ph-lg',
		iconOnly: true,
	}] : []), {
		icon: 'ph-list-bullets ph-bold ph-lg',
		title: i18n.ts.lists,
		iconOnly: true,
		onClick: chooseList,
	}, {
		icon: 'ph-flying-saucer ph-bold ph-lg',
		title: i18n.ts.antennas,
		iconOnly: true,
		onClick: chooseAntenna,
	}, {
		icon: 'ph-television ph-bold ph-lg',
		title: i18n.ts.channel,
		iconOnly: true,
		onClick: chooseChannel,
	}] as Tab[]);
	
	const headerTabsWhenNotLogin = $computed(() => [
		...(isLocalTimelineAvailable ? [{
			key: 'local',
			title: i18n.ts._timelines.local,
			icon: 'ph-users ph-bold ph-lg',
			iconOnly: true,
		}] : []),
		...(isGlobalTimelineAvailable ? [{
			key: 'global',
			title: i18n.ts._timelines.global,
			icon: 'ph-planet ph-bold ph-lg',
			iconOnly: true,
		}] : []),
	] as Tab[]);
	
	definePageMetadata(computed(() => ({
		title: i18n.ts.timeline,
		icon: src === 'local' ? 'ph-users ph-bold ph-lg' : src === 'social' ? 'ph-handshake ph-bold ph-lg' : src === 'global' ? 'ph-planet ph-bold ph-lg' : 'ph-house ph-bold ph-lg',
	})));
</script>
	
<style lang="scss" module>
	.new {
		position: sticky;
		top: calc(var(--stickyTop, 0px) + 16px);
		z-index: 1000;
		width: 100%;
		margin: calc(-0.675em - 8px) 0;
	
		&:first-child {
			margin-top: calc(-0.675em - 8px - var(--margin));
		}
	}
	
	.newButton {
		display: block;
		margin: var(--margin) auto 0 auto;
		padding: 8px 16px;
		border-radius: 32px;
	}
	
	.postForm {
		border-radius: var(--radius);
	}
	
	.tl {
		background: var(--bg);
		border-radius: var(--radius);
		overflow: clip;
	}
</style>