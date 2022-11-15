<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<div v-if="user">
		<swiper
			:modules="[Virtual]"
			:space-between="20"
			:virtual="true"
			:allow-touch-move="!(deviceKind === 'desktop' && !defaultStore.state.swipeOnDesktop)"
			@swiper="setSwiperRef"
			@slide-change="onSlideChange"
		>
			<swiper-slide>
				<div class="home">
					<XHome :user="user"/>
				</div>
			</swiper-slide>
			<swiper-slide>
				<div class="reactions">
					<XReactions :user="user"/>
				</div>
			</swiper-slide>
			<swiper-slide>
				<div class="clips">
					<XClips :user="user"/>
				</div>
			</swiper-slide>
			<swiper-slide>
				<div class="pages">
					<XPages :user="user"/>
				</div>
			</swiper-slide>
			<swiper-slide>
				<div class="gallery">
					<XGallery :user="user"/>
				</div>
			</swiper-slide>
		</swiper>
	</div>
	<MkError v-else-if="error" @retry="fetchUser()"/>
	<MkLoading v-else/>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, computed, inject, onMounted, onUnmounted, watch } from 'vue';
import { Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import * as Acct from 'misskey-js/built/acct';
import type * as misskey from 'misskey-js';
import { userPage, acct as getAcct } from '@/filters/user';
import * as os from '@/os';
import { useRouter } from '@/router';
import { definePageMetadata } from '@/scripts/page-metadata';
import { deviceKind } from '@/scripts/device-kind';
import { i18n } from '@/i18n';
import { $i } from '@/account';
import { defaultStore } from '@/store';
import 'swiper/scss';
import 'swiper/scss/virtual';

const XHome = defineAsyncComponent(() => import('./home.vue'));
const XReactions = defineAsyncComponent(() => import('./reactions.vue'));
const XClips = defineAsyncComponent(() => import('./clips.vue'));
const XPages = defineAsyncComponent(() => import('./pages.vue'));
const XGallery = defineAsyncComponent(() => import('./gallery.vue'));

const props = withDefaults(defineProps<{
	acct: string;
	page?: string;
}>(), {
	page: 'home',
});

const router = useRouter();

let tabs = ['home'];
let user = $ref<null | misskey.entities.UserDetailed>(null);
if (($i && ($i.id === user?.id)) || user?.publicReactions) {
	tabs.push('reactions');
}
if ((user?.instance != null)) {
	tabs.push('clips', 'pages', 'gallery');
}
let tab = $ref(tabs[0]);
watch($$(tab), () => (syncSlide(tabs.indexOf(tab))));

let error = $ref(null);

function fetchUser(): void {
	if (props.acct == null) return;
	user = null;
	os.api('users/show', Acct.parse(props.acct)).then(u => {
		user = u;
	}).catch(err => {
		error = err;
	});
}

watch(() => props.acct, fetchUser, {
	immediate: true,
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => user ? [{
	key: 'home',
	title: i18n.ts.overview,
	icon: 'ph-house-bold ph-lg',
}, ...($i && ($i.id === user.id)) || user.publicReactions ? [{
	key: 'reactions',
	title: i18n.ts.reaction,
	icon: 'ph-smiley-bold ph-lg',
}] : [], {
	key: 'clips',
	title: i18n.ts.clips,
	icon: 'ph-paperclip-bold ph-lg',
}, {
	key: 'pages',
	title: i18n.ts.pages,
	icon: 'ph-file-text-bold ph-lg',
}, {
	key: 'gallery',
	title: i18n.ts.gallery,
	icon: 'ph-image-square-bold ph-lg',
}] : null);

definePageMetadata(computed(() => user ? {
	icon: 'ph-user-bold ph-lg',
	title: user.name ? `${user.name} (@${user.username})` : `@${user.username}`,
	subtitle: `@${getAcct(user)}`,
	userName: user,
	avatar: user,
	path: `/@${user.username}`,
	share: {
		title: user.name,
	},
} : null));

let swiperRef = null;

function setSwiperRef(swiper) {
	swiperRef = swiper;
	syncSlide(tabs.indexOf(tab));
}

function onSlideChange() {
	tab = tabs[swiperRef.activeIndex];
}

function syncSlide(index) {
	swiperRef.slideTo(index);
}

onMounted(() => {
	syncSlide(tabs.indexOf(swiperRef.activeIndex));
});
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.125s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
