<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
		/></template>
		<MkSpacer :content-max="700">
			<swiper
				:modules="[Virtual]"
				:space-between="20"
				:virtual="true"
				:allow-touch-move="
					!(
						deviceKind === 'desktop' &&
						!defaultStore.state.swipeOnDesktop
					)
				"
				@swiper="setSwiperRef"
				@slide-change="onSlideChange"
			>
				<swiper-slide>
					<div class="_content grwlizim search">
						<div class="gaps">
							<MkInput
								v-model="searchQuery"
								:large="true"
								:autofocus="true"
								type="search"
							>
								<template #prefix
									><i class="ti ti-search"></i
								></template>
							</MkInput>
							<MkRadios
								v-model="searchType"
								@update:model-value="search()"
							>
								<option value="nameAndDescription">
									{{ i18n.ts._channel.nameAndDescription }}
								</option>
								<option value="nameOnly">
									{{ i18n.ts._channel.nameOnly }}
								</option>
							</MkRadios>
							<MkButton
								large
								primary
								gradate
								rounded
								@click="search"
								>{{ i18n.ts.search }}</MkButton
							>
						</div>
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
						<MkPagination
							v-slot="{ items }"
							:pagination="featuredPagination"
						>
							<MkChannelPreview
								v-for="channel in items"
								:key="channel.id"
								class="_gap"
								:channel="channel"
							/>
						</MkPagination>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_content grwlizim following">
						<MkPagination
							v-slot="{ items }"
							:pagination="followingPagination"
						>
							<MkChannelPreview
								v-for="channel in items"
								:key="channel.id"
								class="_gap"
								:channel="channel"
							/>
						</MkPagination>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_content grwlizim owned">
						<MkButton class="new" @click="create()"
							><i class="ph-plus ph-bold ph-lg"></i
						></MkButton>
						<MkPagination
							v-slot="{ items }"
							:pagination="ownedPagination"
						>
							<MkChannelPreview
								v-for="channel in items"
								:key="channel.id"
								class="_gap"
								:channel="channel"
							/>
						</MkPagination>
					</div>
				</swiper-slide>
			</swiper>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted, defineComponent, inject, watch } from "vue";
import { Virtual } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import MkChannelPreview from "@/components/MkChannelPreview.vue";
import MkChannelList from "@/components/MkChannelList.vue";
import MkPagination from "@/components/MkPagination.vue";
import MkInput from "@/components/MkInput.vue";
import MkRadios from "@/components/MkRadios.vue";
import MkButton from "@/components/MkButton.vue";
import MkFoldableSection from "@/components/MkFoldableSection.vue";
import { useRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import "swiper/scss";
import "swiper/scss/virtual";

const router = useRouter();

const tabs = ["search", "featured", "following", "owned"];
let tab = $ref(tabs[1]);
watch($$(tab), () => syncSlide(tabs.indexOf(tab)));

const props = defineProps<{
	query: string;
	type?: string;
}>();
let key = $ref("");
let tab = $ref("search");
let searchQuery = $ref("");
let searchType = $ref("nameAndDescription");
let channelPagination = $ref();
onMounted(() => {
	searchQuery = props.query ?? "";
	searchType = props.type ?? "nameAndDescription";
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
	const query = searchQuery.toString().trim();
	if (query == null || query === "") return;
	const type = searchType.toString().trim();
	channelPagination = {
		endpoint: "channels/search",
		limit: 10,
		params: {
			query: searchQuery,
			type: type,
		},
	};
	key = query + type;
}

function create() {
	router.push("/channels/new");
}

const headerActions = $computed(() => [
	{
		icon: "ph-plus ph-bold ph-lg",
		text: i18n.ts.create,
		handler: create,
	},
]);

const headerTabs = $computed(() => [
	{
		key: "search",
		title: i18n.ts.search,
		icon: "ti ti-search",
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
</script>
