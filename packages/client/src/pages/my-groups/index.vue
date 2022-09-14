<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="1000">
		<swiper
			:modules="[Virtual]"
			:space-between="20"
			:virtual="true"
			@swiper="setSwiperRef"
			@slide-change="onSlideChange"
		>
			<swiper-slide class="_content">
				<MkButton primary style="margin: 0 auto var(--margin) auto;" @click="create"><i class="fas fa-plus"></i> {{ i18n.ts.createGroup }}</MkButton>
				<MkPagination v-slot="{items}" ref="owned" :pagination="ownedPagination">
					<div v-for="group in items" :key="group.id" class="_card">
						<div class="_title"><MkA :to="`/my/groups/${ group.id }`" class="_link">{{ group.name }}</MkA></div>
						<div class="_content">
							<MkAvatars :user-ids="group.userIds"/>
						</div>
					</div>
				</MkPagination>
			</swiper-slide>
			<swiper-slide class="_content">
				<MkPagination v-slot="{items}" ref="joined" :pagination="joinedPagination">
					<div v-for="group in items" :key="group.id" class="_card">
						<div class="_title">{{ group.name }}</div>
						<div class="_content">
							<MkAvatars :user-ids="group.userIds"/>
						</div>
						<div class="_footer">
							<MkButton danger @click="leave(group)">{{ i18n.ts.leaveGroup }}</MkButton>
						</div>
					</div>
				</MkPagination>
			</swiper-slide>
			<swiper-slide class="_content">
				<MkPagination v-slot="{items}" ref="invitations" :pagination="invitationPagination">
					<div v-for="invitation in items" :key="invitation.id" class="_card">
						<div class="_title">{{ invitation.group.name }}</div>
						<div class="_content">
							<MkAvatars :user-ids="invitation.group.userIds"/>
						</div>
						<div class="_footer">
							<MkButton primary inline @click="acceptInvite(invitation)"><i class="fas fa-check"></i> {{ i18n.ts.accept }}</MkButton>
							<MkButton primary inline @click="rejectInvite(invitation)"><i class="fas fa-ban"></i> {{ i18n.ts.reject }}</MkButton>
						</div>
					</div>
				</MkPagination>
			</swiper-slide>
		</swiper>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import MkPagination from '@/components/MkPagination.vue';
import MkButton from '@/components/MkButton.vue';
import MkAvatars from '@/components/MkAvatars.vue';
import * as os from '@/os';
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from '@/i18n';
import MkStickyContainer from '@/components/global/MkStickyContainer.vue';

const tabs = ['owned', 'joined', 'invites'];
let tab = $ref('owned');
const owned = ref('owned');
const joined = ref('joined');
const invitations = ref('invitations');

const ownedPagination = {
	endpoint: 'users/groups/owned' as const,
	limit: 12,
};

const joinedPagination = {
	endpoint: 'users/groups/joined' as const,
	limit: 12,
};

const invitationPagination = {
	endpoint: 'i/user-group-invites' as const,
	limit: 12,
};

const headerActions = $computed(() => [
	{
		icon: 'fas fa-plus',
		text: i18n.ts.createGroup,
		handler: create,
	},
]);

const headerTabs = $computed(() => [{
	key: 'owned',
	icon: 'fas fa-crown',
	title: i18n.ts.ownedGroups,
}, {
	key: 'joined',
	icon: 'fas fa-hand',
	title: i18n.ts.joinedGroups,
}, {
	key: 'invites',
	icon: 'fas fa-envelope-open-text',
	title: i18n.ts.invites,
}]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.groups,
		icon: "fas fa-users",
	})),
);

async function create() {
	const { canceled, result: name } = await os.inputText({
		title: i18n.ts.groupName,
	});
	if (canceled) return;
	await os.api('users/groups/create', { name: name });
	owned.value.reload();
	os.success();
}

function acceptInvite(invitation) {
	os.api('users/groups/invitations/accept', {
		invitationId: invitation.id,
	}).then(() => {
		os.success();
		invitations.value.reload();
		joined.value.reload();
	});
}

function rejectInvite(invitation) {
	os.api('users/groups/invitations/reject', {
		invitationId: invitation.id,
	}).then(() => {
		invitations.value.reload();
	});
}

async function leave(group) {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.t('leaveGroupConfirm', { name: group.name }),
	});
	if (canceled) return;
	os.apiWithDialog('users/groups/leave', {
		groupId: group.id,
	}).then(() => {
		joined.value.reload();
	});
}

let swiperRef = null;

function setSwiperRef(swiper) {
	swiperRef = swiper;
	syncSlide(tabs.indexOf(tab));
}

function onSlideChange() {
	tab = tabs[swiperRef.activeIndex];
}

function syncSlide(index) {
	swiperRef.slideTo(index);
}
</script>

<style lang="scss" scoped>
._card {
	margin-bottom: 1rem;
	._title {
		font-size: 1.2rem;
		font-weight: bold;
	}
	._content {
		margin: 1rem 0;
	}
	._footer {
		display: flex;
		justify-content: flex-end;
	}
}
</style>
