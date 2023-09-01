<template>
	<MkTextarea :model-value="text" readonly></MkTextarea>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import MkTextarea from "../form/textarea.vue";
import type { TextBlock } from "@/scripts/hpml/block";
import type { Hpml } from "@/scripts/hpml/evaluator";

const props = defineProps<{
	block: TextBlock;
	hpml: Hpml;
}>();

const text = ref("");

watch(
	props.hpml.vars,
	() => {
		text.value = props.hpml.interpolate(props.block.text) as string;
	},
	{
		deep: true,
		immediate: true,
	},
);
</script>
