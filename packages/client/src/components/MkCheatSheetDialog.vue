<template>
<XModalWindow
	ref="dialog"
	:width="600"
	@close="dialog?.close()"
	@closed="$emit('closed')"
>
	<template #header>{{ i18n.ts._tutorial.title }}</template>

	<div class="_monolithic_">
		<div class="_section">
			<XCheatSheet/>
		</div>
	</div>
</XModalWindow>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import XCheatSheet from '@/pages/mfm-cheat-sheet.vue';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import { $i } from '@/account';
import { instance } from '@/instance';

const isLocalTimelineAvailable =
	!instance.disableLocalTimeline ||
	($i != null && ($i.isModerator || $i.isAdmin));
const isRecommendedTimelineAvailable =
	!instance.disableRecommendedTimeline ||
	($i != null && ($i.isModerator || $i.isAdmin));
const isGlobalTimelineAvailable =
	!instance.disableGlobalTimeline ||
	($i != null && ($i.isModerator || $i.isAdmin));

let timelines = ['home'];

if (isLocalTimelineAvailable) {
	timelines.push('local');
}
if (isRecommendedTimelineAvailable) {
	timelines.push('recommended');
}
if (isLocalTimelineAvailable) {
	timelines.push('social');
}
if (isGlobalTimelineAvailable) {
	timelines.push('global');
}

const emit = defineEmits<{
	(ev: 'done'): void;
	(ev: 'closed'): void;
}>();

const dialog = $ref<InstanceType<typeof XModalWindow>>();

const tutorial = computed({
	get() { return defaultStore.reactiveState.tutorial.value || 0; },
	set(value) { defaultStore.set('tutorial', value); },
});

function close(res) {
	tutorial.value = -1;
	dialog.close();
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

</style>

