<template>
	<MkStickyContainer>
		<template #header>
			<MkTab v-model="include" :class="$style.tab">
				<option :value="null">{{ i18n.ts.filterEverything }}</option>
				<option value="posts">{{ i18n.ts.filterNotes }}</option>
				<option value="replies">{{ i18n.ts.filterReplies }}</option>
				<option value="boosts">{{ i18n.ts.filterBoosts }}</option>
				<option value="files">{{ i18n.ts.filterFiles }}</option>
			</MkTab>
		</template>
		<XNotes :no-gap="true" :pagination="pagination" />
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import * as misskey from "calckey-js";
import XNotes from "@/components/MkNotes.vue";
import MkTab from "@/components/MkTab.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";

const props = defineProps<{
	user: misskey.entities.UserDetailed;
}>();

const include = ref<string | null>(null);

const pagination = {
	endpoint: "users/notes" as const,
	limit: 10,
	params: computed(() => ({
		userId: props.user.id,
		includeReplies: include.value === "replies" || include.value === null,
		withFiles: include.value === "files",
		includeRenotes: include.value === "boosts" || include.value === null,
		withRenotes: include.value === "boosts",
	})),
};
</script>

<style lang="scss" module>
.tab {
	margin: calc(var(--margin) / 2) 0;
	padding: calc(var(--margin) / 2) 0;
	background: var(--bg);
}
</style>
