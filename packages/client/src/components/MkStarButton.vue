<template>
<button class="skdfgljsdkf _button" @click="star()">
	<i class="fas fa-star"></i>
</button>
</template>

<script lang="ts" setup>
import type { Note } from 'misskey-js/built/entities';
import { pleaseLogin } from '@/scripts/please-login';
import * as os from '@/os';

const props = defineProps<{
	note: Note;
}>();

function star(): void {
	pleaseLogin();
	os.api('notes/reactions/create', {
		noteId: props.note.id,
		reaction: '⭐',
	});
}
</script>

<style lang="scss" scoped>
.skdfgljsdkf {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
}
</style>
