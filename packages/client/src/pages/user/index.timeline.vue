<template>
	<MkStickyContainer>
		<template #header>
			<MkTab v-model="include" :class="$style.tab">
				<!-- TODO: Localize these values -->
				<!-- {{ i18n.ts.notes }} -->
				<option value="posts">Posts</option>
				<!-- {{ i18n.ts.notesAndReplies }} -->
				<option :value="null">Replies</option>
				<!-- None -->
				<option value="boosts">Boosts</option>
				<!-- {{ i18n.ts.withFiles }} -->
				<option value="files">Files</option>
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
		includeReplies: include.value === null,
		withFiles: include.value === "files",
		includeRenotes: include.value === "boosts",
		renotesOnly: include.value === "boosts",
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
