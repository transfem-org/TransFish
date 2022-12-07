<template>
<div class="_block msjugskdqo">
	<i class="ph-airplane-takeoff-bold ph-lg" style="margin-right: 8px;"/>
	{{ i18n.ts.accountMoved }}
	<MkMention :class="$style.link" class="link" :username="acct" :host="host"/>
</div>
</template>

<script lang="ts" setup>
import MkMention from './MkMention.vue';
import { i18n } from '@/i18n';

defineProps<{
	acct: string;
	host: string;
}>();
</script>

<style lang="scss" module>
.msjugskdqo {
	font-size: 0.8em;
	padding: 16px;
	background: var(--infoBg);
	color: var(--infoFg);

	> .link {
		margin-left: 4px;
		color: var(--accent);
	}
}
</style>
