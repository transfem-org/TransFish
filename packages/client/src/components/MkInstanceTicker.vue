<template>
<div class="hpaizdrt" :style="bg">
	<img v-if="instance.faviconUrl" class="icon" :src="instance.faviconUrl" aria-hidden="true"/>
	<span class="name">{{ instance.name }}</span>
</div>
</template>

<script lang="ts" setup>
import { instanceName } from '@/config';
import { instance as Instance } from '@/instance';

const props = defineProps<{
	instance?: {
		faviconUrl?: string
		name: string
		themeColor?: string
	}
}>();

// if no instance data is given, this is for the local instance
const instance = props.instance ?? {
	faviconUrl: Instance.iconUrl || Instance.faviconUrl || '/favicon.ico',
	name: instanceName,
	themeColor: (document.querySelector('meta[name="theme-color-orig"]') as HTMLMetaElement)?.content
};

const themeColor = instance.themeColor ?? '#777777';

const bg = {
	background: `linear-gradient(90deg, ${themeColor}, ${themeColor}55)`,
};
</script>

<style lang="scss" scoped>
.hpaizdrt {
	display: flex;
	align-items: center;
	height: 1.1em;
	justify-self: flex-end;
	padding: .2em .4em;
	border-radius: 100px;
	font-size: .8em;
	text-shadow: 0 2px 2px var(--shadow);
	overflow: hidden;
	.header > .body & {
		width: max-content;
		max-width: 100%;
	}

	> .icon {
		height: 100%;
	}

	> .name {
		display: none;
		margin-left: 4px;
		font-size: 0.85em;
		vertical-align: top;
		font-weight: bold;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-shadow: -1px -1px 0 var(--bg), 1px -1px 0 var(--bg), -1px 1px 0 var(--bg), 1px 1px 0 var(--bg);
		.article > .main &, .header > .body & {
			display: unset;
		}
	}
}
</style>
