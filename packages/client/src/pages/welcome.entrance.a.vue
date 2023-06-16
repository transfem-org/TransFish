<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
				:noTabCollapse="true"
				:displayHomeButton="false"
		/></template>
		<swiper
			id="visitor-view"
			:round-lengths="true"
			:touch-angle="25"
			:threshold="10"
			:centeredSlides="true"
			:space-between="20"
			:allow-touch-move="
				!(
					deviceKind === 'desktop' &&
					!defaultStore.state.swipeOnDesktop
				)
			"
			:set-wrapper-size="true"
			@swiper="setSwiperRef"
			@slide-change="onSlideChange"
		>
			<swiper-slide v-slot="{ isActive }">
				<XKanban v-if="isActive" />
			</swiper-slide>
			<swiper-slide v-slot="{ isActive }">
				<MkSpacer :content-max="800" v-if="isActive">
					<XNotes :pagination="paginationForLocal" />
				</MkSpacer>
			</swiper-slide>
			<swiper-slide v-slot="{ isActive }">
				<MkSpacer :content-max="800" v-if="isActive">
					<XNotes :pagination="paginationForRemote" />
				</MkSpacer>
			</swiper-slide>
			<swiper-slide v-slot="{ isActive }">
				<MkSpacer :content-max="800" v-if="isActive">
					<XChannelList
						key="featured"
						:pagination="featuredPagination"
					/>
				</MkSpacer>
			</swiper-slide>
			<swiper-slide v-slot="{ isActive }">
				<MkSpacer :content-max="800" v-if="isActive">
					<MkPagination
						v-slot="{ items }"
						:pagination="featuredPagesPagination"
					>
						<MkPagePreview
							v-for="page in items"
							:key="page.id"
							class="ckltabjg"
							:page="page"
						/>
					</MkPagination>
				</MkSpacer>
			</swiper-slide>
			<swiper-slide v-slot="{ isActive }">
				<MkSpacer :content-max="1200" v-if="isActive">
					<MkFolder class="_gap">
						<template #header
							><i class="ph-clock ph-bold ph-lg"></i>
							{{ i18n.ts.recentPosts }}</template
						>
						<MkPagination
							v-slot="{ items }"
							:pagination="recentPostsPagination"
							:disable-auto-load="true"
						>
							<div class="vfpdbgtk">
								<MkGalleryPostPreview
									v-for="post in items"
									:key="post.id"
									:post="post"
									class="post"
								/>
							</div>
						</MkPagination>
					</MkFolder>
					<MkFolder class="_gap">
						<template #header
							><i class="ph-fire-simple ph-bold ph-lg"></i>
							{{ i18n.ts.popularPosts }}</template
						>
						<MkPagination
							v-slot="{ items }"
							:pagination="popularPostsPagination"
							:disable-auto-load="true"
						>
							<div class="vfpdbgtk">
								<MkGalleryPostPreview
									v-for="post in items"
									:key="post.id"
									:post="post"
									class="post"
								/>
							</div>
						</MkPagination>
					</MkFolder>
				</MkSpacer>
			</swiper-slide>
			<swiper-slide v-slot="{ isActive }">
				<XUsers v-if="isActive" />
			</swiper-slide>
		</swiper>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch, onMounted, provide } from "vue";
import * as os from "@/os";
import { Swiper, SwiperSlide } from "swiper/vue";
import XKanban from "@/ui/visitor/kanban.vue";
import XNotes from "@/components/MkNotes.vue";
import XUsers from "./explore.users.vue";
import XChannelList from "@/components/MkChannelList.vue";
import MkFolder from "@/components/MkFolder.vue";
import MkPagination from "@/components/MkPagination.vue";
import MkGalleryPostPreview from "@/components/MkGalleryPostPreview.vue";
import { definePageMetadata } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import { DetailedInstanceMetadata } from "calckey-js/built/entities";
import "swiper/scss";
import "swiper/scss/virtual";

const DESKTOP_THRESHOLD = 1100;
let isDesktop = $ref(window.innerWidth >= DESKTOP_THRESHOLD);
matchMedia(`(min-width: ${DESKTOP_THRESHOLD - 1}px)`).onchange = (mql) => {
	isDesktop = mql.matches;
	syncSlide(isDesktop ? 1 : 0);
};

const tabs = [
	"home",
	"local",
	"remote",
	"channels",
	"pages",
	"galleries",
	"users",
];
let tab = $ref(tabs[0]);
watch($$(tab), () => syncSlide(tabs.indexOf(tab)));

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [
	!isDesktop
		? {
				key: "home",
				icon: "ph-house ph-bold ph-lg",
				title: i18n.ts.home,
		  }
		: [],
	{
		key: "local",
		icon: "ph-lightning ph-bold ph-lg",
		title: i18n.ts.featured,
	},
	{
		key: "remote",
		icon: "ph-planet ph-bold ph-lg",
		title: i18n.ts.network,
	},
	{
		key: "channels",
		icon: "ph-television ph-bold ph-lg",
		title: i18n.ts.channel,
	},
	{
		key: "pages",
		icon: "ph-file-text ph-bold ph-lg",
		title: i18n.ts.pages,
	},
	{
		key: "galleries",
		icon: "ph-image-square ph-bold ph-lg",
		title: i18n.ts.gallery,
	},
	{
		key: "users",
		icon: "ph-users ph-bold ph-lg",
		title: i18n.ts.users,
	},
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.explore,
		icon: "ph-compass ph-bold ph-lg",
	}))
);

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
	syncSlide(isDesktop ? 1 : 0);
});

let meta = $ref<DetailedInstanceMetadata>();
let wallpaper = $ref(String);

os.api("meta", { detail: true }).then((res) => {
	meta = res;
	wallpaper = `url("${res.backgroundImageUrl}")`;
});

const paginationForLocal = {
	endpoint: "notes/featured" as const,
	limit: 10,
	origin: "local",
	offsetMode: true,
	params: {
		days: 14,
	},
};
const paginationForRemote = {
	endpoint: "notes/featured" as const,
	limit: 20,
	offsetMode: true,
	params: {
		origin: "remote",
		days: 7,
	},
};
const featuredPagination = {
	endpoint: "channels/featured" as const,
	limit: 10,
	noPaging: false,
};
const featuredPagesPagination = {
	endpoint: "pages/featured" as const,
	limit: 10,
};
const recentPostsPagination = {
	endpoint: "gallery/posts" as const,
	limit: 6,
};
const popularPostsPagination = {
	endpoint: "gallery/featured" as const,
	limit: 5,
};
</script>
<style lang="scss" scoped>
#visitor-view {
	margin-top: -55px;
	padding-top: 55px;
}
// 	:deep(.swiper-wrapper) {
// 		mask: linear-gradient(to bottom, black 70%, transparent 95%);
// 		padding-block: calc(2.5vw + 55px) 30vh;
// 		margin-top: -55px;
// 		max-height: 100vh;
// 		box-sizing: border-box;
// 		overflow: hidden auto !important;
// 	}
// 	&::before {
// 		content: "";
// 		position: fixed;
// 		inset: 0;
// 		background-repeat: no-repeat;
// 		background-size: cover;
// 		background-position: center;
// 		opacity: .5;
// 		filter: blur(4px);
// 		background-image: v-bind("wallpaper");
// 	}
// }
</style>
