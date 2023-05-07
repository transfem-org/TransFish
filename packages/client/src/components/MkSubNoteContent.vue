<template>
	<div
		:class="{
			hasCw: !!cw,
			cwHighlight,
		}"
	>
		<p v-if="cw != null" class="cw">
			<MkA
				v-if="!detailed && appearNote.replyId"
				:to="`/notes/${appearNote.replyId}`"
				class="reply-icon"
				@click.stop
			>
				<i class="ph-arrow-bend-left-up ph-bold ph-lg"></i>
			</MkA>
			<MkA
				v-if="
					conversation &&
					appearNote.renoteId &&
					appearNote.renoteId != parentId &&
					!appearNote.replyId
				"
				:to="`/notes/${appearNote.renoteId}`"
				class="reply-icon"
				@click.stop
			>
				<i class="ph-quotes ph-bold ph-lg"></i>
			</MkA>
			<Mfm
				v-if="cw != ''"
				class="text"
				:text="cw"
				:author="appearNote.user"
				:i="$i"
				:custom-emojis="appearNote.emojis"
			/>
		</p>
		<div class="wrmlmaau">
			<div
				class="content"
				:class="{ collapsed, isLong, showContent: cw && !showContent }"
			>
				<XCwButton
					ref="cwButton"
					v-if="cw && !showContent"
					v-model="showContent"
					:note="appearNote"
					v-on:keydown="focusFooter"
				/>
				<div
					class="body"
					v-bind="{
						'aria-label': !showContent ? '' : null,
						tabindex: !showContent ? '-1' : null,
					}"
				>
					<span v-if="appearNote.deletedAt" style="opacity: 0.5"
						>({{ i18n.ts.deleted }})</span
					>
					<template v-if="!cw">
						<MkA
							v-if="!detailed && appearNote.replyId"
							:to="`/notes/${appearNote.replyId}`"
							class="reply-icon"
							@click.stop
						>
							<i class="ph-arrow-bend-left-up ph-bold ph-lg"></i>
						</MkA>
						<MkA
							v-if="
								conversation &&
								appearNote.renoteId &&
								appearNote.renoteId != parentId &&
								!appearNote.replyId
							"
							:to="`/notes/${appearNote.renoteId}`"
							class="reply-icon"
							@click.stop
						>
							<i class="ph-quotes ph-bold ph-lg"></i>
						</MkA>
					</template>
					<Mfm
						v-if="appearNote.text"
						:text="appearNote.text"
						:author="appearNote.user"
						:i="$i"
						:custom-emojis="appearNote.emojis"
					/>
					<MkA
						v-if="!detailed && appearNote.renoteId"
						class="rp"
						:to="`/notes/${appearNote.renoteId}`"
						>{{ i18n.ts.quoteAttached }}: ...</MkA
					>
					<div v-if="appearNote.files.length > 0" class="files">
						<XMediaList :media-list="appearNote.files" />
					</div>
					<XPoll
						v-if="appearNote.poll"
						:note="appearNote"
						class="poll"
					/>
					<template v-if="detailed">
						<MkUrlPreview
							v-for="url in urls"
							:key="url"
							:url="url"
							:compact="true"
							:detail="false"
							class="url-preview"
						/>
						<div
							v-if="appearNote.renote"
							class="renote"
							@click.stop="emit('push', appearNote.renote)"
						>
							<XNoteSimple :note="appearNote.renote" />
						</div>
					</template>
					<div
						v-if="cw && !showContent"
						tabindex="0"
						v-on:focus="cwButton?.focus()"
					></div>
				</div>
				<XShowMoreButton
					v-if="isLong"
					v-model="collapsed"
				></XShowMoreButton>
				<XCwButton v-if="cw" v-model="showContent" :note="appearNote" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import * as misskey from "calckey-js";
import * as mfm from "mfm-js";
import XNoteSimple from "@/components/MkNoteSimple.vue";
import XMediaList from "@/components/MkMediaList.vue";
import XPoll from "@/components/MkPoll.vue";
import MkUrlPreview from "@/components/MkUrlPreview.vue";
import XShowMoreButton from "@/components/MkShowMoreButton.vue";
import XCwButton from "@/components/MkCwButton.vue";
import { extractUrlFromMfm } from "@/scripts/extract-url-from-mfm";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";

const props = defineProps<{
	note: misskey.entities.Note;
	parentId?;
	conversation?;
	detailed?: boolean;
	detailedView?: boolean;
}>();

const emit = defineEmits<{
	(ev: "push", v): void;
	(ev: "focusfooter"): void;
}>();

const note = props.note;

const isRenote =
	note.renote != null &&
	note.text == null &&
	note.fileIds.length === 0 &&
	note.poll == null;

let appearNote = $computed(() =>
	isRenote ? (note.renote as misskey.entities.Note) : note
);
let cw = $computed(() => appearNote.cw || note.cw);
const cwHighlight = defaultStore.state.highlightCw;

const cwButton = ref<HTMLElement>();
const isLong =
	!props.detailedView &&
	!cw &&
	appearNote.text != null &&
	(appearNote.text.split("\n").length > 9 || appearNote.text.length > 500);
const collapsed = $ref(!cw && isLong);

const urls = appearNote.text
	? extractUrlFromMfm(mfm.parse(appearNote.text)).slice(0, 5)
	: null;

let showContent = $ref(false);

function focusFooter(ev) {
	if (ev.key == "Tab" && !ev.getModifierState("Shift")) {
		emit("focusfooter");
	}
}
</script>

<style lang="scss" scoped>
.reply-icon {
	display: inline-block;
	border-radius: 6px;
	padding: 0.2em 0.2em;
	margin-right: 0.2em;
	color: var(--accent);
	transition: background 0.2s;
	&:hover,
	&:focus {
		background: var(--buttonHoverBg);
	}
}
.cw {
	cursor: default;
	display: block;
	margin: 0;
	padding: 0;
	margin-bottom: 10px;
	overflow-wrap: break-word;
	> .text {
		margin-right: 8px;
		padding-inline-start: 0.25em;
	}
}
.cwHighlight.hasCw {
	outline: 1px dotted var(--cwFg);
	border-radius: 5px;
	> .wrmlmaau {
		padding-inline-start: 0.25em;
	}
	> .cw {
		background-color: var(--cwFg);
		color: var(--cwBg);
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
		> .reply-icon {
			color: var(--cwBg);
		}
	}
}
.wrmlmaau {
	.content {
		overflow-wrap: break-word;
		> .body {
			transition: filter 0.1s;
			> .rp {
				margin-left: 4px;
				font-style: oblique;
				color: var(--renote);
			}
			.reply-icon {
				display: inline-block;
				border-radius: 6px;
				padding: 0.2em 0.2em;
				margin-right: 0.2em;
				color: var(--accent);
				transition: background 0.2s;
				&:hover,
				&:focus {
					background: var(--buttonHoverBg);
				}
			}
			> .files {
				margin-top: 0.4em;
				margin-bottom: 0.4em;
			}
			> .url-preview {
				margin-top: 8px;
			}
			> .poll {
				font-size: 80%;
			}
			> .renote {
				padding-top: 8px;
				> * {
					padding: 16px;
					border: solid 1px var(--renote);
					border-radius: 8px;
					transition: background 0.2s;
					&:hover,
					&:focus-within {
						background-color: var(--panelHighlight);
					}
				}
			}
		}
		&.collapsed,
		&.showContent {
			position: relative;
			max-height: calc(9em + 50px);
			> .body {
				max-height: inherit;
				mask: linear-gradient(black calc(100% - 64px), transparent);
				-webkit-mask: linear-gradient(
					black calc(100% - 64px),
					transparent
				);
				padding-inline: 50px;
				margin-inline: -50px;
				margin-top: -50px;
				padding-top: 50px;
				overflow: hidden;
				user-select: none;
				-webkit-user-select: none;
				-moz-user-select: none;
			}
			&.collapsed > .body {
				box-sizing: border-box;
			}
			&.showContent {
				> .body {
					min-height: 2em;
					max-height: 5em;
					filter: blur(4px);
					:deep(span) {
						animation: none !important;
						transform: none !important;
					}
					:deep(img) {
						filter: blur(12px);
					}
				}
				:deep(.fade) {
					inset: 0;
					top: 40px;
				}
			}
		}
	}
}
</style>
