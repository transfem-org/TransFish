<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<div
			ref="rootEl"
			v-hotkey.global="keymap"
			v-size="{ min: [800] }"
			class="tqmomfks"
		>
			<div class="tl _block">
				<XTimeline
					ref="tlEl"
					:key="antennaId"
					class="tl"
					src="antenna"
					:antenna="antennaId"
					:sound="true"
				/>
			</div>
		</div>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import XTimeline from "@/components/MkTimeline.vue";
import * as os from "@/os";
import { useRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";

const router = useRouter();

const props = defineProps<{
	antennaId: string;
}>();

const antenna = ref(null);
const rootEl = ref<HTMLElement>();
const tlEl = ref<InstanceType<typeof XTimeline>>();
const keymap = computed(() => ({
	t: focus,
}));

function settings() {
	router.push(`/my/antennas/${props.antennaId}`);
}

// async function doMarkRead() {
// 	const ret = await os.api("antennas/mark-read", {
// 		antennaId: props.antennaId,
// 	});
//
// 	if (ret) {
// 		return true;
// 	}
//
//	throw new Error("Failed to mark all as read");
// }

function focus() {
	tlEl.value.focus();
}

watch(
	() => props.antennaId,
	async () => {
		antenna.value = await os.api("antennas/show", {
			antennaId: props.antennaId,
		});
	},
	{ immediate: true },
);

const headerActions = computed(() =>
	antenna.value
		? [
				{
					icon: "ph-gear-six ph-bold ph-lg",
					text: i18n.ts.settings,
					handler: settings,
				},
		  ]
		: [],
);

const headerTabs = computed(() => []);

definePageMetadata(
	computed(() =>
		antenna.value
			? {
					title: antenna.value.name,
					icon: "ph-flying-saucer ph-bold ph-lg",
			  }
			: null,
	),
);
</script>

<style lang="scss" scoped>
.tqmomfks {
	padding: var(--margin);

	> .tl {
		background: none;
		border-radius: var(--radius);
	}

	&.min-width_800px {
		max-width: 800px;
		margin: 0 auto;
	}
}
</style>
