<template>
	<footer ref="el" class="footer" @click.stop.prevent>
		<XReactionsViewer v-if="!conversation" ref="reactionsViewer" :note="appearNote"/>
		<button v-tooltip.noDelay.bottom="i18n.ts.reply" class="button _button" @click="reply()">
			<template v-if="appearNote.reply"><i class="ph-arrow-u-up-left-bold ph-lg"></i></template>
			<template v-else><i class="ph-arrow-bend-up-left-bold ph-lg"></i></template>
			<p v-if="appearNote.repliesCount > 0" class="count">{{ appearNote.repliesCount }}</p>
		</button>
		<XRenoteButton ref="renoteButton" class="button" :note="appearNote" :count="appearNote.renoteCount"/>
		<XStarButton v-if="appearNote.myReaction == null" ref="starButton" class="button" :note="appearNote"/>
		<button v-if="appearNote.myReaction == null" ref="reactButton" v-tooltip.noDelay.bottom="i18n.ts.reaction" class="button _button" @click="react()">
			<i class="ph-smiley-bold ph-lg"></i>
		</button>
		<button v-if="appearNote.myReaction != null" ref="reactButton" class="button _button reacted" @click="undoReact(appearNote)">
			<i class="ph-minus-bold ph-lg"></i>
		</button>
		<XQuoteButton class="button" :note="appearNote"/>
		<button ref="menuButton" v-tooltip.noDelay.bottom="i18n.ts.more" class="button _button" @click="menu()">
			<i class="ph-dots-three-outline-bold ph-lg"></i>
		</button>
		<XReactionsViewer v-if="conversation" ref="reactionsViewer" :note="appearNote"/>
	</footer>
</template>

<script lang="ts" setup>
import { inject, ref } from 'vue';
import type { Ref } from 'vue';
import type * as misskey from 'calckey-js';
import XReactionsViewer from '@/components/MkReactionsViewer.vue';
import XStarButton from '@/components/MkStarButton.vue';
import XRenoteButton from '@/components/MkRenoteButton.vue';
import XQuoteButton from '@/components/MkQuoteButton.vue';
import { pleaseLogin } from '@/scripts/please-login';
import * as os from '@/os';
import { reactionPicker } from '@/scripts/reaction-picker';
import { i18n } from '@/i18n';
import { getNoteMenu } from '@/scripts/get-note-menu';
import { deepClone } from '@/scripts/clone';
import { useNoteCapture } from '@/scripts/use-note-capture';


const props = defineProps<{
	note: misskey.entities.Note;
	conversation?: misskey.entities.Note[];
}>();

let note = $ref(deepClone(props.note));

const isRenote = (
	note.renote != null &&
	note.text == null &&
	note.fileIds.length === 0 &&
	note.poll == null
);

const el = ref<HTMLElement>();
const menuButton = ref<HTMLElement>();
const starButton = ref<InstanceType<typeof XStarButton>>();
const renoteButton = ref<InstanceType<typeof XRenoteButton>>();
const reactButton = ref<HTMLElement>();
let appearNote = $computed(() => isRenote ? note.renote as misskey.entities.Note : note);
const isDeleted = ref(false);
const translation = ref(null);
const translating = ref(false);

useNoteCapture({
	rootEl: el,
	note: $$(appearNote),
	isDeletedRef: isDeleted,
});


function reply(viaKeyboard = false): void {
	pleaseLogin();
	os.post({
		reply: appearNote,
		animation: !viaKeyboard,
	}, () => {
		focus();
	});
}

function react(viaKeyboard = false): void {
	pleaseLogin();
	blur();
	reactionPicker.show(reactButton.value, reaction => {
		os.api('notes/reactions/create', {
			noteId: appearNote.id,
			reaction: reaction,
		});
	}, () => {
		focus();
	});
}

function undoReact(note): void {
	const oldReaction = note.myReaction;
	if (!oldReaction) return;
	os.api('notes/reactions/delete', {
		noteId: note.id,
	});
}

const currentClipPage = inject<Ref<misskey.entities.Clip> | null>('currentClipPage', null);


function menu(viaKeyboard = false): void {
	os.popupMenu(getNoteMenu({ note: note, translating, translation, menuButton, isDeleted, currentClipPage }), menuButton.value, {
		viaKeyboard,
	}).then(focus);
}

function focus() {
	el.value.focus();
}

function blur() {
	el.value.blur();
}


</script>


<style lang="scss" scoped>
.footer {
	display: flex;
	flex-wrap: wrap;
	pointer-events: none; // Allow clicking anything w/out pointer-events: all; to open post

	> .button {
		margin: 0;
		padding: 8px;
		opacity: 0.7;
		flex-grow: 1;
		max-width: 3.5em;
		width: max-content;
		min-width: max-content;
		pointer-events: all;
		&:first-of-type {
			margin-left: -.5em;
		}
		&:hover {
			color: var(--fgHighlighted);
		}

		> .count {
			display: inline;
			margin: 0 0 0 8px;
			opacity: 0.7;
		}

		&.reacted {
			color: var(--accent);
		}
	}
}
</style>
