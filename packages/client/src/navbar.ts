import { computed, ref, reactive } from 'vue';
import { $i } from './account';
import { search } from '@/scripts/search';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { ui } from '@/config';
import { unisonReload } from '@/scripts/unison-reload';

export const navbarItemDef = reactive({
	notifications: {
		title: 'notifications',
		icon: 'ph-bell-bold',
		show: computed(() => $i != null),
		indicated: computed(() => $i != null && $i.hasUnreadNotification),
		to: '/my/notifications',
	},
	messaging: {
		title: 'messaging',
		icon: 'ph-chats-teardrop-bold',
		show: computed(() => $i != null),
		indicated: computed(() => $i != null && $i.hasUnreadMessagingMessage),
		to: '/my/messaging',
	},
	drive: {
		title: 'drive',
		icon: 'ph-cloud-bold',
		show: computed(() => $i != null),
		to: '/my/drive',
	},
	followRequests: {
		title: 'followRequests',
		icon: 'ph-hand-waving-bold',
		show: computed(() => $i != null && $i.isLocked),
		indicated: computed(() => $i != null && $i.hasPendingReceivedFollowRequest),
		to: '/my/follow-requests',
	},
	explore: {
		title: 'explore',
		icon: 'ph-hash-bold',
		to: '/explore',
	},
	announcements: {
		title: 'announcements',
		icon: 'ph-megaphone-simple-bold',
		indicated: computed(() => $i != null && $i.hasUnreadAnnouncement),
		to: '/announcements',
	},
	search: {
		title: 'search',
		icon: 'ph-magnifying-glass-bold',
		action: () => search(),
	},
	lists: {
		title: 'lists',
		icon: 'ph-list-bullets-bold',
		show: computed(() => $i != null),
		to: '/my/lists',
	},
	/*
	groups: {
		title: 'groups',
		icon: 'ph-users-bold',
		show: computed(() => $i != null),
		to: '/my/groups',
	},
	*/
	antennas: {
		title: 'antennas',
		icon: 'ph-flying-saucer-bold',
		show: computed(() => $i != null),
		to: '/my/antennas',
	},
	favorites: {
		title: 'favorites',
		icon: 'ph-star-bold',
		show: computed(() => $i != null),
		to: '/my/favorites',
	},
	pages: {
		title: 'pages',
		icon: 'ph-file-text-bold',
		to: '/pages',
	},
	gallery: {
		title: 'gallery',
		icon: 'ph-image-square-bold',
		to: '/gallery',
	},
	clips: {
		title: 'clip',
		icon: 'ph-paperclip-bold',
		show: computed(() => $i != null),
		to: '/my/clips',
	},
	channels: {
		title: 'channel',
		icon: 'ph-television-bold',
		to: '/channels',
	},
	groups: {
		title: 'groups',
		icon: 'ph-users-bold',
		to: '/my/groups',
	},
	ui: {
		title: 'switchUi',
		icon: 'ph-layout-bold',
		action: (ev) => {
			os.popupMenu([{
				text: i18n.ts.default,
				active: ui === 'default' || ui === null,
				action: () => {
					localStorage.setItem('ui', 'default');
					unisonReload();
				},
			}, {
				text: i18n.ts.deck,
				active: ui === 'deck',
				action: () => {
					localStorage.setItem('ui', 'deck');
					unisonReload();
				},
			}, {
				text: i18n.ts.classic,
				active: ui === 'classic',
				action: () => {
					localStorage.setItem('ui', 'classic');
					unisonReload();
				},
			}], ev.currentTarget ?? ev.target);
		},
	},
	reload: {
		title: 'reload',
		icon: 'ph-arrows-clockwise-bold',
		action: (ev) => {
			location.reload();
		},
	},
});
