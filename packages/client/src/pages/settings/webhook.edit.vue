<template>
	<div class="_formRoot">
		<FormInput v-model="name" class="_formBlock">
			<template #label>Name</template>
		</FormInput>

		<FormInput v-model="url" type="url" class="_formBlock">
			<template #label>URL</template>
		</FormInput>

		<FormInput v-model="secret" class="_formBlock">
			<template #prefix><i class="ph-lock ph-bold ph-lg"></i></template>
			<template #label>Secret</template>
		</FormInput>

		<FormSection>
			<template #label>Events</template>

			<FormSwitch v-model="event_follow" class="_formBlock"
				>Follow</FormSwitch
			>
			<FormSwitch v-model="event_followed" class="_formBlock"
				>Followed</FormSwitch
			>
			<FormSwitch v-model="event_note" class="_formBlock"
				>Note</FormSwitch
			>
			<FormSwitch v-model="event_reply" class="_formBlock"
				>Reply</FormSwitch
			>
			<FormSwitch v-model="event_renote" class="_formBlock"
				>Renote</FormSwitch
			>
			<FormSwitch v-model="event_reaction" class="_formBlock"
				>Reaction</FormSwitch
			>
			<FormSwitch v-model="event_mention" class="_formBlock"
				>Mention</FormSwitch
			>
		</FormSection>

		<FormSwitch v-model="active" class="_formBlock">Active</FormSwitch>

		<div
			class="_formBlock"
			style="display: flex; gap: var(--margin); flex-wrap: wrap"
		>
			<FormButton primary inline @click="save"
				><i class="ph-check ph-bold ph-lg"></i>
				{{ i18n.ts.save }}</FormButton
			>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import FormInput from "@/components/form/input.vue";
import FormSection from "@/components/form/section.vue";
import FormSwitch from "@/components/form/switch.vue";
import FormButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

const props = defineProps<{
	webhookId: string;
}>();

const webhook = await os.api("i/webhooks/show", {
	webhookId: props.webhookId,
});

const name = ref(webhook.name);
const url = ref(webhook.url);
const secret = ref(webhook.secret);
const active = ref(webhook.active);

const event_follow = ref(webhook.on.includes("follow"));
const event_followed = ref(webhook.on.includes("followed"));
const event_note = ref(webhook.on.includes("note"));
const event_reply = ref(webhook.on.includes("reply"));
const event_renote = ref(webhook.on.includes("renote"));
const event_reaction = ref(webhook.on.includes("reaction"));
const event_mention = ref(webhook.on.includes("mention"));

async function save(): Promise<void> {
	const events = [];
	if (event_follow.value) events.push("follow");
	if (event_followed.value) events.push("followed");
	if (event_note.value) events.push("note");
	if (event_reply.value) events.push("reply");
	if (event_renote.value) events.push("renote");
	if (event_reaction.value) events.push("reaction");
	if (event_mention.value) events.push("mention");

	os.apiWithDialog("i/webhooks/update", {
		name: name.value,
		url: url.value,
		secret: secret.value,
		on: events,
		active: active.value,
	});
}

definePageMetadata({
	title: "Edit webhook",
	icon: "ph-webhooks-logo ph-bold ph-lg",
});
</script>
