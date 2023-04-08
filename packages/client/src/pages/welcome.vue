<template>
<!-- #v-ifdef VITE_CAPACITOR -->
<XEntrance />
<!-- #v-else -->
<div v-if="meta">
	<XSetup v-if="meta.requireSetup"/>
	<XEntrance v-else/>
</div>
<!-- #v-endif -->
</template>

<script lang="ts" setup>
import XEntrance from './welcome.entrance.a.vue';
// #v-ifdef VITE_CAPACITOR
//...
// #v-else
import { computed } from 'vue';
import XSetup from './welcome.setup.vue';
import { instanceName } from '@/config';
import * as os from '@/os';
import { definePageMetadata } from '@/scripts/page-metadata';

let meta = $ref(null);

os.api("meta", { detail: true }).then((res) => {
	meta = res;
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(computed(() => ({
	title: instanceName,
	icon: null,
})));
// #v-endif
</script>
