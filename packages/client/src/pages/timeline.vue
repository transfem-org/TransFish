<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader
			v-model:tab="src"
			:actions="headerActions"
			:tabs="headerTabs"
			:display-my-avatar="true"
		/>
	</template>
	<MkSpacer :content-max="800">
		<div ref="rootEl" v-hotkey.global="keymap" class="cmuxhskf">
			<XTutorial
				v-if="$store.reactiveState.tutorial.value != -1"
				class="tutorial _block"
			/>
			<XPostForm
				v-if="$store.reactiveState.showFixedPostForm.value"
				class="post-form _block"
				fixed
			/>

			<div v-if="queue > 0" class="new">
				<button class="_buttonPrimary" @click="top()">
					{{ i18n.ts.newNoteRecived }}
				</button>
			</div>
			<div class="tl _block">
				<XTimeline
					ref="tl"
					:key="src"
					class="tl"
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
import { defineAsyncComponent, computed, watch, ref } from 'vue';
import XTimeline from '@/components/timeline.vue';
import XPostForm from '@/components/post-form.vue';
import { scroll } from '@/scripts/scroll';
import * as os from '@/os';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import { $i } from '@/account';
import { definePageMetadata } from '@/scripts/page-metadata';
import { deviceKind } from '@/scripts/device-kind';

const XTutorial = defineAsyncComponent(() => import('./timeline.tutorial.vue'));

const isLocalTimelineAvailable =
	!instance.disableLocalTimeline ||
	($i != null && ($i.isModerator || $i.isAdmin));
const isRecommendedTimelineAvailable =
	!instance.disableRecommendedTimeline ||
	($i != null && ($i.isModerator || $i.isAdmin));
const isGlobalTimelineAvailable =
	!instance.disableGlobalTimeline ||
	($i != null && ($i.isModerator || $i.isAdmin));
const enableGuestTimeline = instance.enableGuestTimeline;
const keymap = {
	t: focus,
};

const DESKTOP_THRESHOLD = 1100;
const MOBILE_THRESHOLD = 500;

// デスクトップでウィンドウを狭くしたときモバイルUIが表示されて欲しいことはあるので deviceKind === 'desktop' の判定は行わない
const isMobile = ref(
	deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD
);
window.addEventListener('resize', () => {
	isMobile.value =
		deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const tlComponent = $ref<InstanceType<typeof XTimeline>>();
const rootEl = $ref<HTMLElement>();

let queue = $ref(0);
const src = $computed({
	get: () => defaultStore.reactiveState.tl.value.src,
	set: (x) => saveSrc(x),
});

watch($$(src), () => (queue = 0));

function queueUpdated(q: number): void {
	queue = q;
}

function top(): void {
	scroll(rootEl, { top: 0 });
}

async function chooseList(ev: MouseEvent): Promise<void> {
	const lists = await os.api('users/lists/list');
	const items = lists.map((list) => ({
		type: 'link' as const,
		text: list.name,
		to: `/timeline/list/${list.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseAntenna(ev: MouseEvent): Promise<void> {
	const antennas = await os.api('antennas/list');
	const items = antennas.map((antenna) => ({
		type: 'link' as const,
		text: antenna.name,
		indicate: antenna.hasUnreadNote,
		to: `/timeline/antenna/${antenna.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

function saveSrc(
	newSrc: 'home' | 'local' | 'recommended' | 'social' | 'global'
): void {
	defaultStore.set('tl', {
		...defaultStore.state.tl,
		src: newSrc,
	});
}

async function timetravel(): Promise<void> {
	const { canceled, result: date } = await os.inputDate({
		title: i18n.ts.date,
	});
	if (canceled) return;

	tlComponent.timetravel(date);
}

function focus(): void {
	tlComponent.focus();
}

const headerActions = $computed(() => [
	{
		icon: 'fas fa-list-ul',
		title: i18n.ts.lists,
		iconOnly: true,
		handler: chooseList,
	},
	{
		icon: 'fas fa-satellite',
		title: i18n.ts.antennas,
		iconOnly: true,
		handler: chooseAntenna,
	} /* **TODO: fix timetravel** {
	icon: 'fas fa-calendar-alt',
	title: i18n.ts.jumpToSpecifiedDate,
	iconOnly: true,
	handler: timetravel,
}*/,
]);

const headerTabs = $computed(() => [
	{
		key: 'home',
		title: i18n.ts._timelines.home,
		icon: 'fas fa-home',
		iconOnly: true,
	},
	...(isLocalTimelineAvailable
		? [
			{
				key: 'local',
				title: i18n.ts._timelines.local,
				icon: 'fas fa-user-group',
				iconOnly: true,
			},
		]
		: []),
	...(isRecommendedTimelineAvailable
		? [
			{
				key: 'recommended',
				title: i18n.ts._timelines.recommended,
				icon: 'fas fa-signs-post',
				iconOnly: true,
			},
		]
		: []),
	...(isLocalTimelineAvailable
		? [
			{
				key: 'social',
				title: i18n.ts._timelines.social,
				icon: 'fas fa-handshake-simple',
				iconOnly: true,
			},
		]
		: []),
	...(isGlobalTimelineAvailable
		? [
			{
				key: 'global',
				title: i18n.ts._timelines.global,
				icon: 'fas fa-globe',
				iconOnly: true,
			},
		]
		: []),
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.timeline,
		icon:
			src === 'local'
				? 'fas fa-user-group'
				: src === 'social'
					? 'fas fa-handshake-simple'
					: src === 'recommended'
						? 'fas fa-signs-post'
						: src === 'global'
							? 'fas fa-globe'
							: 'fas fa-home',
	}))
);

if (isMobile.value) {
	document.addEventListener('touchstart', handleTouchStart, false);
	document.addEventListener('touchmove', handleTouchMove, false);

	let xDown = null;
	let yDown = null;

	function getTouches(evt) {
		return (
			evt.touches || evt.originalEvent.touches
		);
	}

	function handleTouchStart(evt) {
		const firstTouch = getTouches(evt)[0];
		xDown = firstTouch.clientX;
		yDown = firstTouch.clientY;
	}

	function handleTouchMove(evt) {
		if (!xDown || !yDown) {
			return;
		}

		let xUp = evt.touches[0].clientX;
		let yUp = evt.touches[0].clientY;

		let xDiff = xDown - xUp;
		let yDiff = yDown - yUp;

		let next = 'home';
		let timelines = ['home'];

		if (isLocalTimelineAvailable) {
			timelines.push('local');
		}
		if (isRecommendedTimelineAvailable) {
			timelines.push('recommended');
		}
		if (isLocalTimelineAvailable) {
			timelines.push('social');
		}
		if (isGlobalTimelineAvailable) {
			timelines.push('global');
		}

		if (Math.abs(xDiff) > Math.abs(yDiff)) {
			if (xDiff > 0) {
				if (src === 'home') {
					next = 'global'
				}
				else {
					next = timelines[(timelines.indexOf(src) - 1) % timelines.length];
				}
			} else {
				next = timelines[(timelines.indexOf(src) + 1) % timelines.length];
			}
			saveSrc(next);
		}
		xDown = null;
		yDown = null;
		return;
	}
}
</script>

<style lang="scss" scoped>
.cmuxhskf {
	> .new {
		position: sticky;
		top: calc(var(--stickyTop, 0px) + 16px);
		z-index: 1000;
		width: 100%;

		> button {
			display: block;
			margin: var(--margin) auto 0 auto;
			padding: 8px 16px;
			border-radius: 32px;
		}
	}

	> .post-form {
		border-radius: var(--radius);
	}

	> .tl {
		background: var(--bg);
		border-radius: var(--radius);
		overflow: clip;
	}
}
</style>
