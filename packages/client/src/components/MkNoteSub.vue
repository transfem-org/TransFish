<template>
<div v-size="{ max: [450] }" class="wrpstxzv" :class="{ children: depth > 1, singleStart: replies.length == 1, firstColumn: depth == 1 && conversation }">
	<div v-if="conversation && depth > 1" class="line"></div>
	<div class="main" @click="router.push(notePage(note))">
		<div class="avatar-container">
			<MkAvatar class="avatar" :user="note.user"/>
			<div v-if="(!conversation) || replies.length > 0" class="line"></div>
		</div>
		<div class="body">
			<XNoteHeader class="header" :note="note" :mini="true"/>
			<div class="body">
				<p v-if="note.cw != null" class="cw">
					<Mfm v-if="note.cw != ''" class="text" :text="note.cw" :author="note.user" :i="$i" :custom-emojis="note.emojis"/>
					<XCwButton v-model="showContent" :note="note"/>
				</p>
				<div v-show="note.cw == null || showContent" class="content" @click="router.push(notePage(note))">
					<MkSubNoteContent class="text" :note="note" :detailed="true"/>
				</div>
			</div>
			<MkNoteFooter :note="note"></MkNoteFooter>
		</div>
	</div>
	<template v-if="conversation">
		<template v-if="replies.length == 1">
			<MkNoteSub v-for="reply in replies" :key="reply.id" :note="reply" class="reply single" :conversation="conversation" :depth="depth"/>
		</template>
		<template v-else-if="depth < 5">
			<MkNoteSub v-for="reply in replies" :key="reply.id" :note="reply" class="reply" :conversation="conversation" :depth="depth + 1"/>
		</template>
		<div v-else-if="replies.length > 0" class="more">
			<div class="line"></div>
			<MkA class="text _link" :to="notePage(note)">{{ i18n.ts.continueThread }} <i class="ph-caret-double-right-bold ph-lg"></i></MkA>
		</div>
	</template>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as misskey from 'calckey-js';
import XNoteHeader from '@/components/MkNoteHeader.vue';
import MkSubNoteContent from '@/components/MkSubNoteContent.vue';
import XCwButton from '@/components/MkCwButton.vue';
import MkNoteFooter from '@/components/MkNoteFooter.vue';
import { notePage } from '@/filters/note';
import { useRouter } from '@/router';
import * as os from '@/os';
import { i18n } from '@/i18n';

const router = useRouter();

const props = withDefaults(defineProps<{
	note: misskey.entities.Note;
	conversation?: misskey.entities.Note[];

	// how many notes are in between this one and the note being viewed in detail
	depth?: number;
}>(), {
	depth: 1,
});

let showContent = $ref(false);
const replies: misskey.entities.Note[] = props.conversation?.filter(item => item.replyId === props.note.id || item.renoteId === props.note.id).reverse() ?? [];
</script>

<style lang="scss" scoped>
.wrpstxzv {
	padding: 16px 32px;
	content-visibility: auto;
	&.children {
		padding: 10px 0 0 var(--indent);
		padding-left: var(--indent) !important;
		font-size: 1em;
		cursor: auto;

		&.max-width_450px {
			padding: 10px 0 0 8px;
		}
	}

	> .main {
		display: flex;

		> .avatar-container {
			margin-right: 8px;
			> .avatar {
				flex-shrink: 0;
				display: block;
				width: 38px;
				height: 38px;
				border-radius: 8px;
			}
		}

		> .body {
			flex: 1;
			min-width: 0;
			cursor: pointer;
			overflow: clip;
			@media (pointer: coarse) {
				cursor: default;
			}
			
			> .header {
				margin-bottom: 2px;
				cursor: auto;
			}

			> .body {
				> .cw {
					cursor: default;
					display: block;
					margin: 0;
					padding: 0;
					overflow-wrap: break-word;

					> .text {
						margin-right: 8px;
					}
				}

				> .content {
					> .text {
						margin: 0;
						padding: 0;
					}
				}
			}
		}
	}

	&.reply {
		--avatarSize: 38px;
		.avatar-container {
			margin-right: 8px !important;
		}
		:deep(.footer) {
			font-size: .9em;
		}
	}
	> .reply, > .more {
		margin-top: 10px;
		&.single {
			padding: 0 !important;
			> .line {
				display: none;
			}
		}
	}

	> .more {
		display: flex;
		padding-block: 10px;
		font-weight: 600;
		> .line {
			flex-grow: 0 !important;
			margin-top: -10px !important;
			margin-bottom: 10px !important;
			margin-right: 10px !important;
			&::before {
				border-left-style: dashed !important;
				border-bottom-left-radius: 100px !important;
			}
		}
		i {
			font-size: 1em !important;
			vertical-align: middle !important;
		}
	}

	&.reply, &.reply-to, &.reply-to-more {
		> .main:hover, > .main:focus-within {
			:deep(.footer .button) {
				opacity: 1;
			}
		}
	}

	&.reply-to, &.reply-to-more {
		padding-bottom: 0;
		&:first-child {
			padding-top: 30px;
		}
		.line::before {
			margin-bottom: -16px;
		}
	}
	
	// Reply Lines
	&.reply, &.reply-to, &.reply-to-more {
		--indent: calc(var(--avatarSize) - 5px);
		> .main {
			> .avatar-container {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-right: 14px;
				width: var(--avatarSize);
				> .avatar {
					width: var(--avatarSize);
					height: var(--avatarSize);
					margin: 0;
				}
			}
		}
		.line {
			position: relative;
			width: var(--avatarSize);
			display: flex;
			flex-grow: 1;
			margin-bottom: -10px;
			&::before {
				content: "";
				position: absolute;
				border-left: 2px solid var(--X13);
				margin-left: calc((var(--avatarSize) / 2) - 1px);
				width: calc(var(--indent) / 2);
				inset-block: 0;
				min-height: 8px;
			}
		}
	}
	&.reply-to, &.reply-to-more {
		> .main > .avatar-container > .line {
			margin-bottom: 0px !important;
		}
	}
	&.single, &.singleStart {
		> .main > .avatar-container > .line {
			margin-bottom: -10px !important;
		}
	}
	.reply.children:not(:last-child) { // Line that goes through multiple replies
		position: relative;
		> .line {
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
		}
	}
	// Reply line connectors
	.reply.children:not(.single) {
		position: relative;
		> .line {
			position: absolute;
			left: 0;
			top: 0;
			&::after {
				content: "";
				position: absolute;
				border-left: 2px solid var(--X13);
				border-bottom: 2px solid var(--X13);
				margin-left: calc((var(--avatarSize) / 2) - 1px);
				width: calc(var(--indent) / 2);
				height: calc((var(--avatarSize) / 2));
				border-bottom-left-radius: calc(var(--indent) / 2);
				top: 8px;
			}
		}
		&:not(:last-child) > .line::after {
			mask: linear-gradient(to right, transparent 2px, black 2px);
			-webkit-mask: linear-gradient(to right, transparent 2px, black 2px);
		}
	}

	&.max-width_450px {
		&.reply-to, &.reply-to-more {
			padding: 14px 16px;
			padding-top: 14px !important;
			padding-bottom: 0 !important;
			margin-bottom: 0 !important;
		}
		> .main > .avatar-container {
			margin-right: 10px;
		}
	}
	@media (max-width: 450px) {
		padding: 14px 16px;
	}
	@media (max-width: 500px) {
		&.reply {
			--avatarSize: 24px;
			--indent: calc(var(--avatarSize) - 4px);
		}
		&.firstColumn {
			> .main, > .line, > .children:not(.single) > .line {
				--avatarSize: 35px;
				--indent: 35px;
			}
			> .children:not(.single) {
				padding-left: 28px !important;
			}
		}
	}
}
</style>
