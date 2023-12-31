<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
		/></template>
		<MkSpacer :content-max="700">
			<MkInfo class="_gap" :warn="true">{{
				i18n.ts.channelFederationWarn
			}}</MkInfo>
			<swiper
				:round-lengths="true"
				:touch-angle="25"
				:threshold="10"
				:centered-slides="true"
				:modules="[Virtual]"
				:space-between="20"
				:virtual="true"
				:allow-touch-move="
					defaultStore.state.swipeOnMobile &&
					(deviceKind !== 'desktop' ||
						defaultStore.state.swipeOnDesktop)
				"
				@swiper="setSwiperRef"
				@slide-change="onSlideChange"
			>
				<swiper-slide>
					<div class="_content grwlizim search">
						<MkInput
							v-model="searchQuery"
							:large="true"
							:autofocus="true"
							type="search"
						>
							<template #prefix
								><i
									class="ph-magnifying-glass ph-bold ph-lg"
								></i
							></template>
						</MkInput>
						<MkRadios
							v-model="searchType"
							class="_gap"
							@update:model-value="search()"
						>
							<option value="nameAndDescription">
								{{ i18n.ts._channel.nameAndDescription }}
							</option>
							<option value="nameOnly">
								{{ i18n.ts._channel.nameOnly }}
							</option>
						</MkRadios>
						<MkButton large primary class="_gap" @click="search">{{
							i18n.ts.search
						}}</MkButton>
						<MkFoldableSection v-if="channelPagination">
							<template #header>{{
								i18n.ts.searchResult
							}}</template>
							<MkChannelList
								:key="key"
								:pagination="channelPagination"
							/>
						</MkFoldableSection>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_content grwlizim featured">
						<!-- <MkPagination
							v-slot="{ items }"
							:pagination="featuredPagination"
							:disable-auto-load="true"
						>
							<MkChannelPreview
								v-for="channel in items"
								:key="channel.id"
								class="_gap"
								:channel="channel"
							/>
						</MkPagination> -->
						<MkChannelList
							key="featured"
							:pagination="featuredPagination"
						/>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_content grwlizim following">
						<MkChannelList
							key="following"
							:pagination="followingPagination"
						/>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_content grwlizim owned">
						<MkButton class="new" @click="create()"
							><i class="ph-plus ph-bold ph-lg"></i
						></MkButton>
						<MkChannelList
							key="owned"
							:pagination="ownedPagination"
						/>
					</div>
				</swiper-slide>
			</swiper>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import MkChannelList from "@/components/MkChannelList.vue";
import MkInput from "@/components/form/input.vue";
import MkRadios from "@/components/form/radios.vue";
import MkButton from "@/components/MkButton.vue";
import MkInfo from "@/components/MkInfo.vue";
import { useRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import "swiper/scss";
import "swiper/scss/virtual";

const router = useRouter();

const tabs = ["search", "featured", "following", "owned"];
const tab = ref(tabs[1]);
watch(tab, () => syncSlide(tabs.indexOf(tab.value)));

const props = defineProps<{
	query: string;
	type?: string;
}>();
const key = ref("");
const searchQuery = ref("");
const searchType = ref("nameAndDescription");
const channelPagination = ref();
onMounted(() => {
	searchQuery.value = props.query ?? "";
	searchType.value = props.type ?? "nameAndDescription";
});

const featuredPagination = {
	endpoint: "channels/featured" as const,
	limit: 10,
	noPaging: false,
};
const followingPagination = {
	endpoint: "channels/followed" as const,
	limit: 10,
};
const ownedPagination = {
	endpoint: "channels/owned" as const,
	limit: 10,
};

async function search() {
	const query = searchQuery.value.toString().trim();
	if (query == null || query === "") return;
	const type = searchType.value.toString().trim();
	channelPagination.value = {
		endpoint: "channels/search",
		limit: 10,
		params: {
			query: searchQuery.value,
			type,
		},
	};
	key.value = query + type;
}

function create() {
	router.push("/channels/new");
}

const headerActions = computed(() => [
	{
		icon: "ph-plus ph-bold ph-lg",
		text: i18n.ts.create,
		handler: create,
	},
]);

const headerTabs = computed(() => [
	{
		key: "search",
		title: i18n.ts.search,
		icon: "ph-magnifying-glass ph-bold ph-lg",
	},
	{
		key: "featured",
		title: i18n.ts._channel.featured,
		icon: "ph-fire-simple ph-bold ph-lg",
	},
	{
		key: "following",
		title: i18n.ts._channel.following,
		icon: "ph-heart ph-bold ph-lg",
	},
	{
		key: "owned",
		title: i18n.ts._channel.owned,
		icon: "ph-crown-simple ph-bold ph-lg",
	},
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.channel,
		icon: "ph-television ph-bold ph-lg",
	})),
);

let swiperRef = null;

function setSwiperRef(swiper) {
	swiperRef = swiper;
	syncSlide(tabs.indexOf(tab.value));
}

function onSlideChange() {
	tab.value = tabs[swiperRef.activeIndex];
}

function syncSlide(index) {
	swiperRef.slideTo(index);
}
</script>
