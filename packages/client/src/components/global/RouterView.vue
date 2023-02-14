<template>
<KeepAlive :max="defaultStore.state.numberOfPageCache">
	<Suspense>
		<component/>

		<template #fallback>
			<MkLoading/>
		</template>
	</Suspense>
</KeepAlive>
</template>

<script lang="ts" setup>
import { inject, nextTick, onBeforeUnmount, onMounted, onUnmounted, provide, watch } from 'vue';
import { defaultStore } from '@/store';

import VueRouter from "vue-router"

const props = defineProps<{
	router?: VueRouter.Router;
}>();

const router = props.router ?? inject('router');

if (router == null) {
	throw new Error('no router provided');
}

const currentDepth = inject('routerCurrentDepth', 0);
provide('routerCurrentDepth', currentDepth + 1);
</script>
