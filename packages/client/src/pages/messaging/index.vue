<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="800">
		<swiper
			:modules="[Virtual]"
			:space-between="20"
			:virtual="true"
			:allow-touch-move="!(deviceKind === 'desktop' && !defaultStore.state.swipeOnDesktop)"
			@swiper="setSwiperRef"
			@slide-change="onSlideChange"
		>
			<swiper-slide>
				<div class="_content yweeujhr dms">
					<MkButton primary class="start" @click="startUser"><i class="fas fa-plus"></i> {{ i18n.ts.startMessaging }}</MkButton>
					<MkPagination v-slot="{items}" :pagination="dmsPagination">
						<MkChatPreview v-for="message in items" :key="message.id" class="_gap" :message="message"/>
					</MkPagination>
					<div v-if="messages.length == 0" class="_fullinfo">
						<img src="/static-assets/badges/info.png" class="_ghost" alt="Info"/>
						<div>{{ i18n.ts.noHistory }}</div>
					</div>
				</div>
			</swiper-slide>
			<swiper-slide>
				<div class="_content yweeujhr groups">
					<MkPagination v-slot="{items}" :pagination="groupsPagination">
						<MkButton primary @click="startGroup"><i class="fas fa-plus"></i> {{ i18n.ts.startMessaging }}</MkButton>
						<MkButton primary class="start" :to="`/my/groups`"><i class="fas fa-plus"></i> {{ i18n.ts.manageGroups }}</MkButton>
						<MkChatPreview v-for="message in items" :key="message.id" class="_gap" :message="message"/>
					</MkPagination>
				</div>
			</swiper-slide>
		</swiper>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, defineComponent, inject, markRaw, onMounted, onUnmounted, watch } from 'vue';
import * as Acct from 'misskey-js/built/acct';
import MkButton from '@/components/MkButton.vue';
import { Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import MkChatPreview from '@/components/MkChatPreview.vue';
import MkPagination from '@/components/MkPagination.vue';
import * as os from '@/os';
import { stream } from '@/stream';
import { useRouter } from '@/router';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import { $i } from '@/account';
import { deviceKind } from '@/scripts/device-kind';
import { defaultStore } from '@/store';
import 'swiper/scss';
import 'swiper/scss/virtual';

const router = useRouter();

let messages = $ref([]);
let connection = $ref(null);

const dmsPagination = {
	endpoint: 'messaging/history' as const,
	limit: 15,
	params: {
		group: false,
	},
};
const groupsPagination = {
	endpoint: 'messaging/history' as const,
	limit: 5,
	params: {
		group: true,
	},
};

const tabs = ['dms', 'groups'];
let tab = $ref(tabs[0]);
watch($$(tab), () => (syncSlide(tabs.indexOf(tab))));

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [{
	key: 'dms',
	title: i18n.ts._messaging.dms,
	icon: 'fas fa-user',
}, {
	key: 'groups',
	title: i18n.ts._messaging.groups,
	icon: 'fas fa-users',
}]);

definePageMetadata({
	title: i18n.ts.messaging,
	icon: 'fas fa-comments',
});

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

function onMessage(message) {
	if (message.recipientId) {
		messages = messages.filter(m => !(
			(m.recipientId === message.recipientId && m.userId === message.userId) ||
				(m.recipientId === message.userId && m.userId === message.recipientId)));

		messages.unshift(message);
	} else if (message.groupId) {
		messages = messages.filter(m => m.groupId !== message.groupId);
		messages.unshift(message);
	}
}

function onRead(ids) {
	for (const id of ids) {
		const found = messages.find(m => m.id === id);
		if (found) {
			if (found.recipientId) {
				found.isRead = true;
			} else if (found.groupId) {
				found.reads.push($i.id);
			}
		}
	}
}

async function startUser() {
	os.selectUser().then(user => {
		router.push(`/my/messaging/${Acct.toString(user)}`);
	});
}

async function startGroup() {
	const groups1 = await os.api('users/groups/owned');
	const groups2 = await os.api('users/groups/joined');
	if (groups1.length === 0 && groups2.length === 0) {
		os.alert({
			type: 'warning',
			title: i18n.ts.youHaveNoGroups,
			text: i18n.ts.joinOrCreateGroup,
		});
		return;
	}
	const { canceled, result: group } = await os.select({
		title: i18n.ts.group,
		items: groups1.concat(groups2).map(group => ({
			value: group, text: group.name,
		})),
	});
	if (canceled) return;
	router.push(`/my/messaging/group/${group.id}`);
}

onMounted(() => {
	connection = markRaw(stream.useChannel('messagingIndex'));

	connection.on('message', onMessage);
	connection.on('read', onRead);

	os.api('messaging/history', { group: false, limit: 5 }).then(userMessages => {
		os.api('messaging/history', { group: true, limit: 5 }).then(groupMessages => {
			const _messages = userMessages.concat(groupMessages);
			_messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			messages = _messages;
			fetching = false;
		});
	});
});

onUnmounted(() => {
	if (connection) connection.dispose();
});

</script>

	<style lang="scss" scoped>
	.yweeujhr {

		> .start {
			margin: 0 auto var(--margin) auto;
		}

		> .history {
			> .message {
				display: block;
				text-decoration: none;
				margin-bottom: var(--margin);

				* {
					pointer-events: none;
					user-select: none;
				}

				&:hover {
					.avatar {
						filter: saturate(200%);
					}
				}

				&:active {
				}

				&.isRead,
				&.isMe {
					opacity: 0.8;
				}

				&:not(.isMe):not(.isRead) {
					> div {
						background-image: url("/client-assets/unread.svg");
						background-repeat: no-repeat;
						background-position: 0 center;
					}
				}

				&:after {
					content: "";
					display: block;
					clear: both;
				}

				> div {
					padding: 20px 30px;

					&:after {
						content: "";
						display: block;
						clear: both;
					}

					> header {
						display: flex;
						align-items: center;
						margin-bottom: 2px;
						white-space: nowrap;
						overflow: hidden;

						> .name {
							margin: 0;
							padding: 0;
							overflow: hidden;
							text-overflow: ellipsis;
							font-size: 1em;
							font-weight: bold;
							transition: all 0.1s ease;
						}

						> .username {
							margin: 0 8px;
						}

						> .time {
							margin: 0 0 0 auto;
						}
					}

					> .avatar {
						float: left;
						width: 54px;
						height: 54px;
						margin: 0 16px 0 0;
						border-radius: 8px;
						transition: all 0.1s ease;
					}

					> .body {

						> .text {
							display: block;
							margin: 0 0 0 0;
							padding: 0;
							overflow: hidden;
							overflow-wrap: break-word;
							font-size: 1.1em;
							color: var(--faceText);

							.me {
								opacity: 0.7;
							}
						}

						> .image {
							display: block;
							max-width: 100%;
							max-height: 512px;
						}
					}
				}
			}
		}

		&.max-width_400px {
			> .history {
				> .message {
					&:not(.isMe):not(.isRead) {
						> div {
							background-image: none;
							border-left: solid 4px #3aa2dc;
						}
					}

					> div {
						padding: 16px;
						font-size: 0.9em;

						> .avatar {
							margin: 0 12px 0 0;
						}
					}
				}
			}
		}
	}
	</style>
