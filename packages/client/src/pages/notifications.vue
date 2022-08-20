<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="800">
		<div v-if="tab === 'all' || tab === 'unread'">
			<XNotifications class="notifications" :include-types="includeTypes" :unread-only="unreadOnly"/>
		</div>
		<div v-else-if="tab === 'mentions'">
			<XNotes :pagination="mentionsPagination"/>
		</div>
		<div v-else-if="tab === 'directNotes'">
			<XNotes :pagination="directNotesPagination"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { notificationTypes } from 'misskey-js';
import XNotifications from '@/components/notifications.vue';
import XNotes from '@/components/notes.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import { deviceKind } from '@/scripts/device-kind';

let tab = $ref('all');
let includeTypes = $ref<string[] | null>(null);
let unreadOnly = $computed(() => tab === 'unread');
os.api('notifications/mark-all-as-read');

const MOBILE_THRESHOLD = 500;
const isMobile = ref(
	deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD
);
window.addEventListener('resize', () => {
	isMobile.value =
		deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const mentionsPagination = {
	endpoint: 'notes/mentions' as const,
	limit: 10,
};

const directNotesPagination = {
	endpoint: 'notes/mentions' as const,
	limit: 10,
	params: {
		visibility: 'specified',
	},
};

function setFilter(ev) {
	const typeItems = notificationTypes.map(t => ({
		text: i18n.t(`_notification._types.${t}`),
		active: includeTypes && includeTypes.includes(t),
		action: () => {
			includeTypes = [t];
		},
	}));
	const items = includeTypes != null ? [{
		icon: 'fas fa-times',
		text: i18n.ts.clear,
		action: () => {
			includeTypes = null;
		},
	}, null, ...typeItems] : typeItems;
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

const headerActions = $computed(() => [tab === 'all' ? {
	text: i18n.ts.filter,
	icon: 'fas fa-filter',
	highlighted: includeTypes != null,
	handler: setFilter,
} : undefined, tab === 'all' ? {
	text: i18n.ts.markAllAsRead,
	icon: 'fas fa-check',
	handler: () => {
		os.apiWithDialog('notifications/mark-all-as-read');
	},
} : undefined].filter(x => x !== undefined));

const headerTabs = $computed(() => [{
	key: 'all',
	title: i18n.ts.all,
}, {
	key: 'unread',
	title: i18n.ts.unread,
}, {
	key: 'mentions',
	title: i18n.ts.mentions,
	icon: 'fas fa-at',
}, {
	key: 'directNotes',
	title: i18n.ts.directNotes,
	icon: 'fas fa-envelope',
}]);

definePageMetadata(computed(() => ({
	title: i18n.ts.notifications,
	icon: 'fas fa-bell',
})));

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
		let tabs = ['all', 'unread', 'mentions', 'directNotes'];

		if (Math.abs(xDiff) > Math.abs(yDiff)) {
			if (xDiff > 0) {
				if (tab === 'all') {
					next = 'directNotes';
				}
				else {
					next = tabs[(tabs.indexOf(tab) + 1) % tabs.length];
				}
			} else {
				next = tabs[(tabs.indexOf(tab) - 1) % tabs.length];
			}
			tab = next;
		}
		xDown = null;
		yDown = null;
		return;
	}
}
</script>
