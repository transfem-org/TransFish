<template>
	<MkStickyContainer>
		<div class="fcuexfpr">
			<div v-if="appearNote" class="note">
				<div class="main _gap">
					<div class="note _gap">
						<XNoteDetailed
							:key="appearNote.id"
							v-model:note="appearNote"
							class="note"
						/>
					</div>
				</div>
			</div>
			<MkError v-else-if="error" @retry="fetchNote()" />
			<MkLoading v-else />
		</div>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from "vue";
import * as misskey from "calckey-js";
import XNoteDetailed from "@/components/MkNoteDetailed.vue";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";

const props = defineProps<{
	noteId: string;
}>();

let note = $ref<null | misskey.entities.Note>();
let error = $ref();
let isRenote = $ref(false);
let appearNote = $ref<null | misskey.entities.Note>();

function fetchNote() {
	note = null;
	os.api("notes/show", {
		noteId: props.noteId,
	})
		.then((res) => {
			note = res;
			isRenote =
				note.renote != null &&
				note.text == null &&
				note.fileIds.length === 0 &&
				note.poll == null;
			appearNote = isRenote
				? (note.renote as misskey.entities.Note)
				: note;

			Promise.all([
				os.api("users/notes", {
					userId: note.userId,
					untilId: note.id,
					limit: 1,
				}),
				os.api("users/notes", {
					userId: note.userId,
					sinceId: note.id,
					limit: 1,
				}),
			]);
		})
		.catch((err) => {
			error = err;
		});
}

watch(() => props.noteId, fetchNote, {
	immediate: true,
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(
	computed(() =>
		appearNote
			? {
					title: i18n.t("noteOf", {
						user: appearNote.user.name || appearNote.user.username,
					}),
					subtitle: new Date(appearNote.createdAt).toLocaleString(),
					avatar: appearNote.user,
					path: `/notes/${appearNote.id}`,
					share: {
						title: i18n.t("noteOf", {
							user:
								appearNote.user.name ||
								appearNote.user.username,
						}),
						text: appearNote.text,
					},
			  }
			: null
	)
);
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.125s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.fcuexfpr {
	#calckey_app > :not(.wallpaper) & {
		background: var(--bg);
	}

	> .note {
		> .main {
			> .load {
				min-width: 0;
				margin: 0 auto;
				border-radius: 999px;

				&.next {
					margin-bottom: var(--margin);
				}

				&.prev {
					margin-top: var(--margin);
				}
			}

			> .note {
				> .note {
					border-radius: var(--radius);
					background: var(--panel);
				}
			}
		}
	}
}
</style>
