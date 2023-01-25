<template>
<div class="hpaizdrt" :style="bg">
	<img class="icon" :src="getInstanceIcon(instance)" aria-hidden="true"/>
	<span class="name">{{ instance.name }}</span>
</div>
</template>

<script lang="ts" setup>
import { instanceName } from '@/config';
import { instance as Instance } from '@/instance';
import { getProxiedImageUrlNullable } from '@/scripts/media-proxy';

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
	background: `linear-gradient(90deg, ${themeColor}, ${themeColor}11)`,
};

function getInstanceIcon(instance): string {
	return getProxiedImageUrlNullable(instance.iconUrl, 'preview') ?? getProxiedImageUrlNullable(instance.faviconUrl, 'preview') ?? '/client-assets/dummy.png';
}
</script>

<style lang="scss" scoped>
.hpaizdrt {
	$height: 1.1rem;

	height: $height;
	justify-self: flex-end;
	padding: .1em .7em;
	border-radius: 100px;
	font-size: .8em;
	text-shadow: 0 2px 2px var(--shadow);
	overflow: hidden;

	> .icon {
		height: 100%;
		border-radius: 0.3rem;
	}

	> .name {
		margin-left: 4px;
		line-height: $height;
		font-size: 0.9em;
		vertical-align: top;
		font-weight: bold;
		text-overflow: clip;
		text-shadow: -1px -1px 0 var(--bg), 1px -1px 0 var(--bg), -1px 1px 0 var(--bg), 1px 1px 0 var(--bg);
	}
}
</style>
