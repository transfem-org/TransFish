<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
				:noTabCollapse="true"
		/></template>
		<div class="lznhrdub">
			<swiper
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
				@swiper="setSwiperRef"
				@slide-change="onSlideChange"
			>
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
		</div>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch, onMounted } from "vue";
import { Virtual } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
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
import "swiper/scss";
import "swiper/scss/virtual";

const tabs = [
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
	syncSlide(tabs.indexOf(swiperRef.activeIndex));
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
