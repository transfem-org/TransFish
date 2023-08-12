<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
				:to="`#${noteId}`"
		/></template>
		<MkSpacer :content-max="800" :marginMin="6">
			<div class="fcuexfpr">
				<transition
					:name="$store.state.animation ? 'fade' : ''"
					mode="out-in"
				>
					<div v-if="appearNote" class="note">
						<div v-if="showNext" class="_gap">
							<XNotes
								class="_content"
								:pagination="nextPagination"
								:no-gap="true"
							/>
						</div>

						<div class="main _gap">
							<MkButton
								v-if="!showNext && hasNext"
								class="load next"
								@click="showNext = true"
							>
								<i class="ph-caret-up ph-bold ph-lg"></i>
								{{ `${i18n.ts.loadMore} (${i18n.ts.newer})` }}
							</MkButton>
							<div class="note _gap">
								<MkRemoteCaution
									v-if="appearNote.user.host != null"
									:href="appearNote.url ?? appearNote.uri"
								/>
								<XNoteDetailed
									:key="appearNote.id"
									v-model:note="appearNote"
									class="note"
								/>
							</div>
							<MkButton
								v-if="!showPrev && hasPrev"
								class="load prev"
								@click="showPrev = true"
							>
								<i class="ph-caret-down ph-bold ph-lg"></i>
								{{ `${i18n.ts.loadMore} (${i18n.ts.older})` }}
							</MkButton>
						</div>

						<div v-if="showPrev" class="_gap">
							<XNotes
								class="_content"
								:pagination="prevPagination"
								:no-gap="true"
							/>
						</div>
					</div>
					<MkError v-else-if="error" @retry="fetch()" />
					<MkLoading v-else />
				</transition>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, defineComponent, watch, ref } from "vue";
import * as misskey from "firefish-js";
import XNoteDetailed from "@/components/MkNoteDetailed.vue";
import XNotes from "@/components/MkNotes.vue";
import MkRemoteCaution from "@/components/MkRemoteCaution.vue";
import MkButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";

const props = defineProps<{
	noteId: string;
}>();

let note = ref<null | misskey.entities.Note>();
let hasPrev = ref(false);
let hasNext = ref(false);
let showPrev = ref(false);
let showNext = ref(false);
let error = ref();
let isRenote = ref(false);
let appearNote = ref<null | misskey.entities.Note>();

const prevPagination = {
	endpoint: "users/notes" as const,
	limit: 10,
	params: computed(() =>
		appearNote.value
			? {
					userId: appearNote.value.userId,
					untilId: appearNote.value.id,
			  }
			: null,
	),
};

const nextPagination = {
	reversed: true,
	endpoint: "users/notes" as const,
	limit: 10,
	params: computed(() =>
		appearNote.value
			? {
					userId: appearNote.value.userId,
					sinceId: appearNote.value.id,
			  }
			: null,
	),
};

function fetchNote() {
	hasPrev.value = false;
	hasNext.value = false;
	showPrev.value = false;
	showNext.value = false;
	note.value = null;
	os.api("notes/show", {
		noteId: props.noteId,
	})
		.then((res) => {
			note.value = res;
			isRenote.value =
				note.value.renote != null &&
				note.value.text == null &&
				note.value.fileIds.length === 0 &&
				note.value.poll == null;
			appearNote.value = isRenote.value
				? (note.value.renote as misskey.entities.Note)
				: note.value;

			Promise.all([
				os.api("users/notes", {
					userId: note.value.userId,
					untilId: note.value.id,
					limit: 1,
				}),
				os.api("users/notes", {
					userId: note.value.userId,
					sinceId: note.value.id,
					limit: 1,
				}),
			]).then(([prev, next]) => {
				hasPrev.value = prev.length !== 0;
				hasNext.value = next.length !== 0;
			});
		})
		.catch((err) => {
			error.value = err;
		});
}

watch(() => props.noteId, fetchNote, {
	immediate: true,
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(
	computed(() =>
		appearNote.value
			? {
					title: i18n.t("noteOf", {
						user:
							appearNote.value.user.name ||
							appearNote.value.user.username,
					}),
					subtitle: new Date(
						appearNote.value.createdAt,
					).toLocaleString(),
					avatar: appearNote.value.user,
					path: `/notes/${appearNote.value.id}`,
					share: {
						title: i18n.t("noteOf", {
							user:
								appearNote.value.user.name ||
								appearNote.value.user.username,
						}),
						text: appearNote.value.text,
					},
			  }
			: null,
	),
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
	#firefish_app > :not(.wallpaper) & {
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
