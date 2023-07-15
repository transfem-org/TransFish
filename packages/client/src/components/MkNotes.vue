<template>
	<MkPagination ref="pagingComponent" :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img
					src="/static-assets/badges/info.png"
					class="_ghost"
					alt="Info"
				/>
				<div>{{ i18n.ts.noNotes }}</div>
			</div>
		</template>

		<template #default="{ items: notes }">
			<div class="giivymft" :class="{ noGap }" ref="tlEl">
				<XList
					ref="notes"
					v-slot="{ item: note }"
					:items="notes"
					:direction="pagination.reversed ? 'up' : 'down'"
					:reversed="pagination.reversed"
					:no-gap="noGap"
					:ad="true"
					class="notes"
				>
					<XNote
						:key="note._featuredId_ || note._prId_ || note.id"
						class="qtqtichx"
						:note="note"
					/>
				</XList>
			</div>
		</template>
	</MkPagination>
</template>

<script lang="ts" setup>
import { ref, onActivated, onDeactivated, nextTick } from "vue";
import type { Paging } from "@/components/MkPagination.vue";
import XNote from "@/components/MkNote.vue";
import XList from "@/components/MkDateSeparatedList.vue";
import MkPagination from "@/components/MkPagination.vue";
import { i18n } from "@/i18n";
import { getScrollPosition, scroll } from "@/scripts/scroll";

const tlEl = ref<HTMLElement>();

const props = defineProps<{
	pagination: Paging;
	noGap?: boolean;
}>();

const pagingComponent = ref<InstanceType<typeof MkPagination>>();

function scrollTop() {
	scroll(tlEl.value, { top: 0, behavior: "smooth" });
}

defineExpose({
	pagingComponent,
	scrollTop,
});

let scrollContainer = $ref(tlEl.value);
let scrollPos = $ref(0);

onDeactivated(() => {
	scrollPos =  getScrollPosition( scrollContainer );
})
onActivated(() => {
	nextTick(() => {
		scroll(scrollContainer, { top: scrollPos, behavior: "instant" });
	})
})
</script>

<style lang="scss" scoped>
.giivymft {
	&.noGap {
		> .notes {
			background: var(--panel) !important;
			border-radius: var(--radius);
		}
	}
	&:not(.noGap) {
		> .notes {
			.qtqtichx {
				background: var(--panel);
				border-radius: var(--radius);
			}
		}
	}
}
</style>
