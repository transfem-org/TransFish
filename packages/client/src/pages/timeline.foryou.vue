<template>
	<MkSpacer :content-max="800">
		<MkStickyContainer>
			<template #header style="margin: 10px; top: 62px">
				<MkTab v-model="tab" style="margin-bottom: var(--margin)">
					<option v-if="isLocalTimelineAvailable" value="social">
						{{ i18n.ts._timelines.social }}
					</option>
					<option value="home">{{ i18n.ts._timelines.home }}</option>
					<option value="local" v-if="isLocalTimelineAvailable">
						{{ i18n.ts._timelines.local }}
					</option>
				</MkTab>
				<XTimeline
					v-if="tab === 'social'"
					ref="tl"
					class="tl"
					src="social"
					:sound="true"
				/>
				<XTimeline
					v-else-if="tab === 'home'"
					ref="tl"
					class="tl"
					src="home"
					:sound="true"
				/>
				<XTimeline
					v-else-if="tab === 'local'"
					ref="tl"
					class="tl"
					src="local"
					:sound="true"
				/>
			</template>
		</MkStickyContainer>
	</MkSpacer>
</template>

<script lang="ts" setup>
import XTimeline from "@/components/MkTimeline.vue";
import MkTab from "@/components/MkTab.vue";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import { instance } from "@/instance";
import { $i } from "@/account";

const tab = $computed({
	get: () => defaultStore.reactiveState.forYouTl.value.src,
	set: (x) => saveSrc(x),
});

function saveSrc(newSrc: "home" | "local" | "social"): void {
	defaultStore.set("forYouTl", {
		...defaultStore.state.forYouTl,
		src: newSrc,
	});
}

const isLocalTimelineAvailable =
	!instance.disableLocalTimeline ||
	($i != null && ($i.isModerator || $i.isAdmin));
</script>
