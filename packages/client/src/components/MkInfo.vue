<template>
	<div class="info" :class="{ warn, card }">
		<i v-if="warn" class="ph-warning ph-bold ph-lg"></i>
		<i v-else class="ph-bold ph-lg" :class="icon ? `ph-${icon}` : 'ph-info'"></i>
		<slot></slot>
	</div>
</template>

<script lang="ts" setup>
import {} from "vue";

defineProps<{
	icon?: string;
	warn?: boolean;
	card?: boolean;
}>();
</script>

<style lang="scss" scoped>
.info {
	padding: 16px;
	font-size: 90%;
	background: var(--infoBg);
	color: var(--infoFg);
	border-radius: var(--radius);

	&.warn {
		background: var(--infoWarnBg);
		color: var(--infoWarnFg);
	}

	&.card {
		background: var(--panel);
		color: var(--fg);
		padding: 48px;
		font-size: 1em;
		text-align: center;
		> i {
			display: block;
			font-size: 4em;
			margin: 0;
		}
		> :deep(*) {
			margin-inline: auto;
		}
		> :deep(:not(:last-child)) {
			margin-bottom: 20px;
		}
		> :deep(p) {
			max-width: 30em;
		}
	}

	> i {
		margin-right: 4px;
	}
}
</style>
