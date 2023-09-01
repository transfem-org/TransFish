<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
		/></template>
		<div>
			<MkSpacer :content-max="800">
				<swiper
					:round-lengths="true"
					:touch-angle="25"
					:threshold="10"
					:centered-slides="true"
					:modules="[Virtual]"
					:space-between="20"
					:virtual="true"
					:allow-touch-move="
						defaultStore.state.swipeOnMobile &&
						(deviceKind !== 'desktop' ||
							defaultStore.state.swipeOnDesktop)
					"
					@swiper="setSwiperRef"
					@slide-change="onSlideChange"
				>
					<swiper-slide>
						<div class="_content yweeujhr dms">
							<MkButton
								v-if="!isMobile"
								primary
								class="start"
								@click="startUser"
								><i class="ph-plus ph-bold ph-lg"></i>
								{{ i18n.ts.startMessaging }}</MkButton
							>
							<MkPagination
								v-slot="{ items }"
								:pagination="dmsPagination"
							>
								<MkChatPreview
									v-for="message in items"
									:key="message.id"
									class="yweeujhr message _block"
									:message="message"
								/>
							</MkPagination>
						</div>
					</swiper-slide>
					<swiper-slide>
						<div class="_content yweeujhr groups">
							<div v-if="!isMobile" class="groupsbuttons">
								<MkButton
									primary
									class="start"
									:link="true"
									to="/my/groups"
									><i
										class="ph-user-circle-gear ph-bold ph-lg"
									></i>
									{{ i18n.ts.manageGroups }}</MkButton
								>
								<MkButton
									primary
									class="start"
									@click="startGroup"
									><i class="ph-plus ph-bold ph-lg"></i>
									{{ i18n.ts.startMessaging }}</MkButton
								>
							</div>
							<MkPagination
								v-slot="{ items }"
								:pagination="groupsPagination"
							>
								<MkChatPreview
									v-for="message in items"
									:key="message.id"
									class="yweeujhr message _block"
									:message="message"
								/>
							</MkPagination>
						</div>
					</swiper-slide>
				</swiper>
			</MkSpacer>
		</div>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, markRaw, onMounted, onUnmounted, ref, watch } from "vue";
import * as Acct from "firefish-js/built/acct";
import { Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import MkButton from "@/components/MkButton.vue";
import MkChatPreview from "@/components/MkChatPreview.vue";
import MkPagination from "@/components/MkPagination.vue";
import * as os from "@/os";
import { stream } from "@/stream";
import { useRouter } from "@/router";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { $i } from "@/account";
import { deviceKind } from "@/scripts/device-kind";
import { defaultStore } from "@/store";
import "swiper/scss";
import "swiper/scss/virtual";

const router = useRouter();

const messages = ref([]);
const connection = ref(null);

const tabs = ["dms", "groups"];
const tab = ref(tabs[0]);
watch(tab, () => syncSlide(tabs.indexOf(tab.value)));

const MOBILE_THRESHOLD = 500;
const isMobile = ref(
	deviceKind === "smartphone" || window.innerWidth <= MOBILE_THRESHOLD,
);
window.addEventListener("resize", () => {
	isMobile.value =
		deviceKind === "smartphone" || window.innerWidth <= MOBILE_THRESHOLD;
});

async function readAllMessagingMessages() {
	await os.apiWithDialog("i/read-all-messaging-messages");
}

const headerActions = computed(() => [
	{
		icon: "ph-check ph-bold ph-lg",
		text: i18n.ts.markAllAsRead,
		handler: readAllMessagingMessages,
	},
]);

const headerTabs = computed(() => [
	{
		key: "dms",
		title: i18n.ts._messaging.dms,
		icon: "ph-user ph-bold ph-lg",
	},
	{
		key: "groups",
		title: i18n.ts._messaging.groups,
		icon: "ph-users-three ph-bold ph-lg",
	},
]);

definePageMetadata({
	title: i18n.ts.messaging,
	icon: "ph-chats-teardrop ph-bold ph-lg",
});

const dmsPagination = {
	endpoint: "messaging/history" as const,
	limit: 15,
	params: {
		group: false,
	},
};
const groupsPagination = {
	endpoint: "messaging/history" as const,
	limit: 5,
	params: {
		group: true,
	},
};

function onMessage(message): void {
	if (message.recipientId) {
		messages.value = messages.value.filter(
			(m) =>
				!(
					(m.recipientId === message.recipientId &&
						m.userId === message.userId) ||
					(m.recipientId === message.userId &&
						m.userId === message.recipientId)
				),
		);

		messages.value.unshift(message);
	} else if (message.groupId) {
		messages.value = messages.value.filter(
			(m) => m.groupId !== message.groupId,
		);
		messages.value.unshift(message);
	}
}

function onRead(ids): void {
	for (const id of ids) {
		const found = messages.value.find((m) => m.id === id);
		if (found) {
			if (found.recipientId) {
				found.isRead = true;
			} else if (found.groupId) {
				found.reads.push($i.id);
			}
		}
	}
}

async function startUser(): void {
	os.selectUser().then((user) => {
		router.push(`/my/messaging/${Acct.toString(user)}`);
	});
}

async function startGroup(): void {
	const groups1 = await os.api("users/groups/owned");
	const groups2 = await os.api("users/groups/joined");
	if (groups1.length === 0 && groups2.length === 0) {
		os.alert({
			type: "warning",
			title: i18n.ts.youHaveNoGroups,
			text: i18n.ts.joinOrCreateGroup,
		});
		return;
	}
	const { canceled, result: group } = await os.select({
		title: i18n.ts.group,
		items: groups1.concat(groups2).map((group) => ({
			value: group,
			text: group.name,
		})),
	});
	if (canceled) return;
	router.push(`/my/messaging/group/${group.id}`);
}

let swiperRef = null;

function setSwiperRef(swiper) {
	swiperRef = swiper;
	syncSlide(tabs.indexOf(tab.value));
}

function onSlideChange() {
	tab.value = tabs[swiperRef.activeIndex];
}

function syncSlide(index) {
	swiperRef.slideTo(index);
}

onMounted(() => {
	syncSlide(tabs.indexOf(swiperRef.activeIndex));

	connection.value = markRaw(stream.useChannel("messagingIndex"));

	connection.value.on("message", onMessage);
	connection.value.on("read", onRead);

	os.api("messaging/history", { group: false, limit: 5 }).then(
		(userMessages) => {
			os.api("messaging/history", { group: true, limit: 5 }).then(
				(groupMessages) => {
					const _messages = userMessages.concat(groupMessages);
					_messages.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() -
							new Date(a.createdAt).getTime(),
					);
					messages.value = _messages;
				},
			);
		},
	);
});

onUnmounted(() => {
	if (connection.value) connection.value.dispose();
});
</script>

<style lang="scss" scoped>
.yweeujhr {
	> .start {
		margin: 0 auto var(--margin) auto;
	}

	> .groupsbuttons {
		max-width: 100%;
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}
}
</style>
