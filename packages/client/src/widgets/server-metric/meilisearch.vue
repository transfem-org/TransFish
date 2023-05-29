<template>
	<div class="verusivbr">
		<XPie
			v-tooltip="i18n.ts.meiliIndexCount"
			class="pie"
			:value="progress"
		/>
		<div>
			<p><i class="ph-file-search ph-bold ph-lg"></i>MeiliSearch</p>
			<p>{{ i18n.ts._widgets.meiliStatus }}: {{ available }}</p>
			<p>{{ i18n.ts._widgets.meiliSize }}: {{ bytes(total_size, 2) }}</p>
			<p>{{ i18n.ts._widgets.meiliIndexCount }}: {{ index_count }}</p>
		</div>
	</div>
	<br />
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from "vue";
import bytes from "@/filters/bytes";
import XPie from "./pie.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";

const props = defineProps<{
	connection: any;
	meta: any;
}>();

let progress: number = $ref(0);
let serverStats = $ref(null);
let total_size: number = $ref(0);
let index_count: number = $ref(0);
let available: string = $ref("unavailable");

function onStats(stats) {
	total_size = stats.meilisearch.size;
	index_count = stats.meilisearch.indexed_count;
	available = stats.meilisearch.health;
	progress = index_count / serverStats.notesCount;
}

onMounted(() => {
	os.api("stats", {}).then((res) => {
		serverStats = res;
	});
	props.connection.on("stats", onStats);
});

onBeforeUnmount(() => {
	props.connection.off("stats", onStats);
});
</script>

<style lang="scss" scoped>
.verusivbr {
	display: flex;
	padding: 16px;

	> .pie {
		height: 82px;
		flex-shrink: 0;
		margin-right: 16px;
	}

	> div {
		flex: 1;

		> p {
			margin: 0;
			font-size: 0.8em;

			&:first-child {
				font-weight: bold;
				margin-bottom: 4px;

				> i {
					margin-right: 4px;
				}
			}
		}
	}
}
</style>
