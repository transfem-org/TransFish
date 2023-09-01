<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<MkSpacer :content-max="1000">
			<transition name="fade" mode="out-in">
				<div v-if="user">
					<XFollowList :user="user" type="followers" />
				</div>
				<MkError v-else-if="error" @retry="fetchUser()" />
				<MkLoading v-else />
			</transition>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import * as Acct from "firefish-js/built/acct";
import type * as misskey from "firefish-js";
import XFollowList from "./follow-list.vue";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";

const props = withDefaults(
	defineProps<{
		acct: string;
	}>(),
	{},
);

const user = ref<null | misskey.entities.UserDetailed>(null);
const error = ref(null);

function fetchUser(): void {
	if (props.acct == null) return;
	user.value = null;
	os.api("users/show", Acct.parse(props.acct))
		.then((u) => {
			user.value = u;
		})
		.catch((err) => {
			error.value = err;
		});
}

watch(() => props.acct, fetchUser, {
	immediate: true,
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(
	computed(() =>
		user.value
			? {
					icon: "ph-user ph-bold ph-lg",
					title: user.value.name
						? `${user.value.name} (@${user.value.username})`
						: `@${user.value.username}`,
					subtitle: i18n.ts.followers,
					userName: user.value,
					avatar: user.value,
			  }
			: null,
	),
);
</script>
