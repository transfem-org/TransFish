<template>
	<Mfm :text="user.name ?? user.username" :author="user" :plain="true" :nowrap="nowrap" :emojiUrls="user.emojis"/>
</template>
	
<script lang="ts" setup>
	import { } from 'vue';
	import * as Misskey from 'firefish-js';
	
	const props = withDefaults(defineProps<{
		user: Misskey.entities.User;
		nowrap?: boolean;
	}>(), {
		nowrap: true,
	});
</script>
