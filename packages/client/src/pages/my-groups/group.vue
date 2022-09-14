<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>
	<div class="mk-group-page">
		<div class="_section">
			<div class="_content" style="display: flex; gap: var(--margin); flex-wrap: wrap;">
				<MkButton inline @click="invite()">{{ $ts.invite }}</MkButton>
				<MkButton inline @click="renameGroup()">{{ $ts.rename }}</MkButton>
				<MkButton inline @click="transfer()">{{ $ts.transfer }}</MkButton>
				<MkButton inline @click="deleteGroup()">{{ $ts.delete }}</MkButton>
			</div>
		</div>
		<div class="_section members _gap">
			<div class="_content">
				<div class="users">
					<div v-for="user in users" :key="user.id" class="user _panel">
						<MkAvatar :user="user" class="avatar" :show-indicator="true"/>
						<div class="body">
							<MkUserName :user="user" class="name"/>
							<MkAcct :user="user" class="acct"/>
						</div>
						<div class="action">
							<button class="_button" @click="removeUser(user)"><i class="fas fa-times"></i></button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import MkButton from '@/components/MkButton.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';
import * as os from '@/os';

const props = defineProps<{
	groupId: {
			type: string,
			required: true,
		},
}>();

watch(() => props.groupId, () => {
	fetch();
});

function fetch() {
	os.api('users/groups/show', {
		groupId: this.groupId
	}).then(group => {
		this.group = group;
		os.api('users/show', {
			userIds: this.group.userIds
		}).then(users => {
			this.users = users;
		});
	});
}

function invite() {
	os.selectUser().then(user => {
		os.apiWithDialog('users/groups/invite', {
			groupId: this.group.id,
			userId: user.id
		});
	});
}

function removeUser(user) {
	os.api('users/groups/pull', {
		groupId: this.group.id,
		userId: user.id
	}).then(() => {
		this.users = this.users.filter(x => x.id !== user.id);
	});
}

async function renameGroup() {
	const { canceled, result: name } = await os.inputText({
		title: this.$ts.groupName,
		default: this.group.name
	});
	if (canceled) return;

	await os.api('users/groups/update', {
		groupId: this.group.id,
		name: name
	});

	this.group.name = name;
}

function transfer() {
	os.selectUser().then(user => {
		os.apiWithDialog('users/groups/transfer', {
			groupId: this.group.id,
			userId: user.id
		});
	});
}

async function deleteGroup() {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: this.$t('removeAreYouSure', { x: this.group.name }),
	});
	if (canceled) return;

	await os.apiWithDialog('users/groups/delete', {
		groupId: this.group.id
	});
	this.$router.push('/my/groups');
}

definePageMetadata(computed(() => ({
	title: i18n.ts.members,
	icon: 'fas fa-users',
})));

</script>

<style lang="scss" scoped>
	.mk-group-page {
		> ._section {
			> ._content {
				padding-top: 1rem;
				justify-content: center;
			}
		}
		> .members {
			> ._content {
				> .users {
					> .user {
						display: flex;
						align-items: center;
						padding: 16px;

						> .avatar {
							width: 50px;
							height: 50px;
						}

						> .body {
							flex: 1;
							padding: 8px;

							> .name {
								display: block;
								font-weight: bold;
							}

							> .acct {
								opacity: 0.5;
							}
						}
					}
				}
			}
		}
	}
	</style>
