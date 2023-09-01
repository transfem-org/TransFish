<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
		/></template>
		<MkSpacer :content-max="600" :margin-min="20">
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
					<div class="_formRoot">
						<div
							class="_formBlock fwhjspax"
							:style="{
								backgroundImage: `url(${$instance.bannerUrl})`,
							}"
						>
							<div class="content">
								<img
									ref="instanceIcon"
									:src="iconSrc"
									aria-label="none"
									class="icon"
									:class="instanceIconAnimation"
									@click="easterEgg"
								/>
								<div class="name">
									<b>{{ $instance.name || host }}</b>
								</div>
							</div>
						</div>

						<MkKeyValue class="_formBlock">
							<template #key>{{ i18n.ts.description }}</template>
							<template #value
								><div v-html="$instance.description"></div
							></template>
						</MkKeyValue>

						<FormSection>
							<MkKeyValue class="_formBlock" :copy="version">
								<template #key>Firefish</template>
								<template #value>{{ version }}</template>
							</MkKeyValue>
							<FormLink to="/about-firefish">{{
								i18n.ts.aboutFirefish
							}}</FormLink>
						</FormSection>

						<FormSection>
							<FormSplit>
								<MkKeyValue class="_formBlock">
									<template #key>{{
										i18n.ts.administrator
									}}</template>
									<template #value>{{
										$instance.maintainerName
									}}</template>
								</MkKeyValue>
								<MkKeyValue class="_formBlock">
									<template #key>{{
										i18n.ts.contact
									}}</template>
									<template #value>{{
										$instance.maintainerEmail
									}}</template>
								</MkKeyValue>
							</FormSplit>
							<FormLink
								v-if="$instance.tosUrl"
								:to="$instance.tosUrl"
								class="_formBlock"
								external
								>{{ i18n.ts.tos }}</FormLink
							>
							<FormLink
								v-if="$instance.donationLink"
								:to="$instance.donationLink"
								external
							>
								<template #icon
									><i class="ph-money ph-bold ph-lg"></i
								></template>
								{{
									i18n.t("_aboutFirefish.donateHost", {
										host: $instance.name || host,
									})
								}}
								<template #suffix>Donate</template>
							</FormLink>
						</FormSection>

						<FormSuspense :p="initStats">
							<FormSection>
								<template #label>{{
									i18n.ts.statistics
								}}</template>
								<FormSplit>
									<MkKeyValue class="_formBlock">
										<template #key>{{
											i18n.ts.users
										}}</template>
										<template #value>{{
											number(stats.originalUsersCount)
										}}</template>
									</MkKeyValue>
									<MkKeyValue class="_formBlock">
										<template #key>{{
											i18n.ts.notes
										}}</template>
										<template #value>{{
											number(stats.originalNotesCount)
										}}</template>
									</MkKeyValue>
								</FormSplit>
							</FormSection>
						</FormSuspense>

						<FormSection>
							<template #label>Well-known resources</template>
							<div class="_formLinks">
								<FormLink
									:to="`/.well-known/host-meta`"
									external
									>host-meta</FormLink
								>
								<FormLink
									:to="`/.well-known/host-meta.json`"
									external
									>host-meta.json</FormLink
								>
								<FormLink :to="`/.well-known/nodeinfo`" external
									>nodeinfo</FormLink
								>
								<FormLink :to="`/robots.txt`" external
									>robots.txt</FormLink
								>
								<FormLink :to="`/manifest.json`" external
									>manifest.json</FormLink
								>
							</div>
						</FormSection>
					</div>
				</swiper-slide>
				<swiper-slide>
					<XEmojis />
				</swiper-slide>
				<swiper-slide>
					<MkInstanceStats :chart-limit="500" :detailed="true" />
				</swiper-slide>
				<swiper-slide>
					<XFederation />
				</swiper-slide>
			</swiper>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import XEmojis from "./about.emojis.vue";
import XFederation from "./about.federation.vue";
import { host, version } from "@/config";
import FormLink from "@/components/form/link.vue";
import FormSection from "@/components/form/section.vue";
import FormSuspense from "@/components/form/suspense.vue";
import FormSplit from "@/components/form/split.vue";
import MkKeyValue from "@/components/MkKeyValue.vue";
import MkInstanceStats from "@/components/MkInstanceStats.vue";
import * as os from "@/os";
import number from "@/filters/number";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
import { iAmModerator } from "@/account";
import { instance } from "@/instance";
import { defaultStore } from "@/store";
import "swiper/scss";
import "swiper/scss/virtual";

withDefaults(
	defineProps<{
		initialTab?: string;
	}>(),
	{
		initialTab: "overview",
	},
);

const stats = ref(null);
const instanceIcon = ref<HTMLImageElement>();
let iconClicks = 0;
const iconSrc = ref(instance.iconUrl || instance.faviconUrl || "/favicon.ico");
const instanceIconAnimation = ref("");
const tabs = ["overview", "emojis", "charts"];
const tab = ref(tabs[0]);
watch(tab, () => syncSlide(tabs.indexOf(tab.value)));

if (iAmModerator) tabs.push("federation");

const initStats = () =>
	os.api("stats", {}).then((res) => {
		stats.value = res;
	});

const headerActions = computed(() => []);

const theTabs = [
	{
		key: "overview",
		title: i18n.ts.overview,
		icon: "ph-map-trifold ph-bold ph-lg",
	},
	{
		key: "emojis",
		title: i18n.ts.customEmojis,
		icon: "ph-smiley ph-bold ph-lg",
	},
	{
		key: "charts",
		title: i18n.ts.charts,
		icon: "ph-chart-bar ph-bold ph-lg",
	},
];

if (iAmModerator) {
	theTabs.push({
		key: "federation",
		title: i18n.ts.federation,
		icon: "ph-planet ph-bold ph-lg",
	});
}

const headerTabs = computed(() => theTabs);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.instanceInfo,
		icon: "ph-info ph-bold ph-lg",
	})),
);

onMounted(() => {
	if (defaultStore.state.woozyMode === true) {
		iconSrc.value = "/static-assets/woozy.png";
		instanceIcon.value.src = iconSrc.value;
	}
});

function easterEgg() {
	iconClicks++;
	if (iconClicks % 3 === 0) {
		defaultStore.state.woozyMode = !defaultStore.state.woozyMode;
		defaultStore.set("woozyMode", defaultStore.state.woozyMode);
		if (instanceIcon.value) {
			instanceIconAnimation.value = "spin";
			setTimeout(() => {
				if (iconClicks % 6 === 0) {
					iconSrc.value =
						instance.iconUrl ||
						instance.faviconUrl ||
						"/favicon.ico";
				} else {
					iconSrc.value = "/static-assets/woozy.png";
				}
				instanceIcon.value.src = iconSrc.value;
			}, 500);
		}
	}
}

watch(iconSrc, (newValue, oldValue) => {
	if (newValue !== oldValue) {
		setTimeout(() => {
			instanceIconAnimation.value = "";
		}, 500);
	}
});

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

<style lang="scss" scoped>
.fwhjspax {
	text-align: center;
	border-radius: 10px;
	overflow: clip;
	background-size: cover;
	background-position: center center;

	> .content {
		overflow: hidden;

		> .icon {
			display: block;
			margin: 16px auto 0 auto;
			height: 64px;
		}

		> .spin {
			animation: spinY 1s linear infinite;
		}

		> .name {
			display: block;
			padding: 16px;
			color: #e0def4;
			text-shadow: 0 0 8px var(--shadow);
			background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
		}
	}
}
</style>
