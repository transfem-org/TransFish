<template>
	<MkSpacer :content-max="800">
		<MkTab v-model="tab" style="margin-bottom: var(--margin);">
			<option value="hot">{{ i18n.ts._timelines.hot }}</option>
			<option v-if="isRecommendedTimelineAvailable" value="recommended">{{ i18n.ts._timelines.recommended }}</option>
			<option v-if="isGlobalTimelineAvailable" value="global">{{ i18n.ts._timelines.global }}</option>
		</MkTab>
		<XNotes v-if="tab === 'hot'" :pagination="hotPagination"/>
		<XTimeline
			v-else-if="tab === 'recommended'"
			ref="tl"
			class="tl"
			src="recommended"
			:sound="true"
		/>
		<XTimeline
			v-else-if="tab === 'global'"
			ref="tl"
			class="tl"
			src="global"
			:sound="true"
		/>
	</MkSpacer>
</template>

<script lang="ts" setup>
import XNotes from '@/components/MkNotes.vue';
import XTimeline from '@/components/MkTimeline.vue';
import MkTab from '@/components/MkTab.vue';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import { $i } from '@/account';

const hotPagination = {
	endpoint: 'notes/featured' as const,
	limit: 20,
	params: {
		origin: 'combined',
	}
}

const tab = $computed({
	get: () => defaultStore.reactiveState.discoverTl.value.src,
	set: (x) => saveSrc(x),
});

function saveSrc(
	newSrc: 'hot' | 'recommended' | 'global',
): void {
	defaultStore.set('discoverTl', {
		...defaultStore.state.discoverTl,
		src: newSrc
	})
}

const isRecommendedTimelineAvailable = !instance.disableRecommendedTimeline;
const isGlobalTimelineAvailable =
	!instance.disableGlobalTimeline ||
	($i != null && ($i.isModerator || $i.isAdmin));
</script>
