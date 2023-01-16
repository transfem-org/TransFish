<template>
<div class="defgtij">
	<div v-for="user in users" :key="user.id" class="users">
		<MkAvatar :user="user" class="avatar" :show-indicator="true"/>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import * as os from '@/os';

const props = defineProps<{
	userIds: string[];
}>();

const users = ref([]);

onMounted(async () => {
	users.value = await os.api('users/show', {
		userIds: props.userIds
	});
});
</script>

<style lang="scss">
.defgtij {
	padding: 12px;

	> .users {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(30px, 40px));
		grid-gap: 12px;
		place-content: center;
		padding: 12px;

		> .avatar {
			width: 100%;
			height: 100%;
			aspect-ratio: 1;
		}
	}
}
</style>
