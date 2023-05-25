<template>
	<div class="ms_stats">
		<div>
			<p><i class="ph-file-search ph-bold ph-lg"></i>MeiliSearch</p>
			<p>Server Status: {{ available }}</p>
			<p>Total: {{ bytes(total_size, 2) }}</p>
			<p>Posts Indexed: {{ index_count }}</p>
		</div>
	</div>
	<br />
</template>

<script lang="ts" setup>
import {} from "vue";
import bytes from "@/filters/bytes";

const props = defineProps<{
	meta: any; // TODO
}>();

const total_size = $computed(() => props.meta.meilisearch.size);
const index_count = $computed(() => props.meta.meilisearch.indexed_count);
const available = $computed(() => props.meta.meilisearch.health);
</script>

<style lang="scss" scoped>
.ms_stats {
	padding: 16px;

	> div {
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
