<template>
<div class="fpezltsf" :class="{ warn }">
	<i v-if="warn" class="ph-warning"></i>
	<i v-else class="ph-info"></i>
	<slot></slot>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';

const props = defineProps<{
	warn?: boolean;
}>();
</script>

<style lang="scss" scoped>
.fpezltsf {
	padding: 16px;
	font-size: 90%;
	background: var(--infoBg);
	color: var(--infoFg);
	border-radius: var(--radius);

	&.warn {
		background: var(--infoWarnBg);
		color: var(--infoWarnFg);
	}

	> i {
		margin-right: 4px;
	}
}
</style>
