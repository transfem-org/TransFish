<template>
	<MkSpacer :content-max="1000">
		<div ref="rootEl" class="edbbcaef">
			<MkFolder class="item">
				<template #header>Stats</template>
				<XStats />
			</MkFolder>

			<MkFolder class="item">
				<template #header>Active users</template>
				<XActiveUsers />
			</MkFolder>

			<MkFolder class="item">
				<template #header>Heatmap</template>
				<XHeatmap />
			</MkFolder>

			<MkFolder class="item">
				<template #header>Moderators</template>
				<XModerators />
			</MkFolder>

			<MkFolder class="item">
				<template #header>Federation</template>
				<XFederation />
			</MkFolder>

			<MkFolder class="item">
				<template #header>Instances</template>
				<XInstances />
			</MkFolder>

			<MkFolder class="item">
				<template #header>Fediverse Requests</template>
				<XApRequests />
			</MkFolder>

			<MkFolder class="item">
				<template #header>New users</template>
				<XUsers />
			</MkFolder>

			<MkFolder class="item">
				<template #header>Deliver queue</template>
				<XQueue domain="deliver" />
			</MkFolder>

			<MkFolder class="item">
				<template #header>Inbox queue</template>
				<XQueue domain="inbox" />
			</MkFolder>

			<!-- <MkFolder class="item">
				<template #header>Server metrics</template>
				<XMetrics domain="inbox" />
			</MkFolder> -->
		</div>
	</MkSpacer>
</template>

<script lang="ts" setup>
import {
	markRaw,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	shallowRef,
} from "vue";
import XFederation from "./overview.federation.vue";
import XInstances from "./overview.instances.vue";
import XQueue from "./overview.queue.vue";
import XApRequests from "./overview.ap-requests.vue";
import XUsers from "./overview.users.vue";
import XActiveUsers from "./overview.active-users.vue";
import XStats from "./overview.stats.vue";
import XModerators from "./overview.moderators.vue";
import XHeatmap from "./overview.heatmap.vue";
// import XMetrics from "./overview.metrics.vue";
import * as os from "@/os";
import { stream } from "@/stream";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import MkFolder from "@/components/MkFolder.vue";

const rootEl = shallowRef<HTMLElement>();
const serverInfo = ref<any>(null);
const topSubInstancesForPie = ref<any>(null);
const topPubInstancesForPie = ref<any>(null);
const federationPubActive = ref<number | null>(null);
const federationPubActiveDiff = ref<number | null>(null);
const federationSubActive = ref<number | null>(null);
const federationSubActiveDiff = ref<number | null>(null);
const newUsers = ref(null);
const activeInstances = shallowRef(null);
const queueStatsConnection = markRaw(stream.useChannel("queueStats"));

onMounted(async () => {
	/*
	const magicGrid = new MagicGrid({
		container: rootEl,
		static: true,
		animate: true,
	});

	magicGrid.listen();
	*/

	os.apiGet("charts/federation", { limit: 2, span: "day" }).then((chart) => {
		federationPubActive.value = chart.pubActive[0];
		federationPubActiveDiff.value = chart.pubActive[0] - chart.pubActive[1];
		federationSubActive.value = chart.subActive[0];
		federationSubActiveDiff.value = chart.subActive[0] - chart.subActive[1];
	});

	os.apiGet("federation/stats", { limit: 10 }).then((res) => {
		topSubInstancesForPie.value = res.topSubInstances
			.map((x) => ({
				name: x.host,
				color: x.themeColor,
				value: x.followersCount,
				onClick: () => {
					os.pageWindow(`/instance-info/${x.host}`);
				},
			}))
			.concat([
				{
					name: "(other)",
					color: "#80808080",
					value: res.otherFollowersCount,
				},
			]);
		topPubInstancesForPie.value = res.topPubInstances
			.map((x) => ({
				name: x.host,
				color: x.themeColor,
				value: x.followingCount,
				onClick: () => {
					os.pageWindow(`/instance-info/${x.host}`);
				},
			}))
			.concat([
				{
					name: "(other)",
					color: "#80808080",
					value: res.otherFollowingCount,
				},
			]);
	});

	os.api("admin/server-info").then((serverInfoResponse) => {
		serverInfo.value = serverInfoResponse;
	});

	os.api("admin/show-users", {
		limit: 5,
		sort: "+createdAt",
	}).then((res) => {
		newUsers.value = res;
	});

	os.api("federation/instances", {
		sort: "+latestRequestReceivedAt",
		limit: 25,
	}).then((res) => {
		activeInstances.value = res;
	});

	nextTick(() => {
		queueStatsConnection.send("requestLog", {
			id: Math.random().toString().slice(2, 10),
			length: 100,
		});
	});
});

onBeforeUnmount(() => {
	queueStatsConnection.dispose();
});

definePageMetadata({
	title: i18n.ts.dashboard,
	icon: "ph-gauge ph-bold ph-lg",
});
</script>

<style lang="scss" scoped>
.edbbcaef {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	grid-gap: 16px;
}
</style>
