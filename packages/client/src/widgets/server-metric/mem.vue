<template>
	<div class="zlxnikvl">
		<XPie class="pie" :value="usage" />
		<div>
			<p><i class="ph-microchip ph-bold ph-lg"></i>RAM</p>
			<p>Total: {{ bytes(total, 1) }}</p>
			<p>Used: {{ bytes(used, 1) }}</p>
			<p>Free: {{ bytes(free, 1) }}</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import XPie from "./pie.vue";
import bytes from "@/filters/bytes";

const props = defineProps<{
	connection: any;
	meta: any;
}>();

const usage: number = ref(0);
const total: number = ref(0);
const used: number = ref(0);
const free: number = ref(0);

function onStats(stats) {
	usage.value = stats.mem.active / stats.mem.total;
	total.value = stats.mem.total;
	used.value = stats.mem.active;
	free.value = total.value - used.value;
}

onMounted(() => {
	props.connection.on("stats", onStats);
});

onBeforeUnmount(() => {
	props.connection.off("stats", onStats);
});
</script>

<style lang="scss" scoped>
.zlxnikvl {
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
