<template>
	<div class="_formRoot">
		<FormSwitch
			v-model="$i.injectFeaturedNote"
			class="_formBlock"
			@update:modelValue="onChangeInjectFeaturedNote"
		>
			{{ i18n.ts.showFeaturedNotesInTimeline }}
		</FormSwitch>

		<!--
	<FormSwitch v-model="reportError" class="_formBlock">{{ i18n.ts.sendErrorReports }}<template #caption>{{ i18n.ts.sendErrorReportsDescription }}</template></FormSwitch>
	-->

		<FormLink to="/settings/account-info" class="_formBlock">{{
			i18n.ts.accountInfo
		}}</FormLink>

		<FormLink to="/registry" class="_formBlock"
			><template #icon><i class="ph-gear-six ph-bold ph-lg"></i></template
			>{{ i18n.ts.registry }}</FormLink
		>

		<FormLink to="/settings/delete-account" class="_formBlock"
			><template #icon><i class="ph-warning ph-bold ph-lg"></i></template
			>{{ i18n.ts.closeAccount }}</FormLink
		>
	</div>
</template>

<script lang="ts" setup>
import FormSwitch from "@/components/form/switch.vue";
import FormLink from "@/components/form/link.vue";
import * as os from "@/os";
import { $i } from "@/account";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

function onChangeInjectFeaturedNote(v) {
	os.api("i/update", {
		injectFeaturedNote: v,
	}).then((i) => {
		$i!.injectFeaturedNote = i.injectFeaturedNote;
	});
}

definePageMetadata({
	title: i18n.ts.other,
	icon: "ph-dots-three-outline ph-bold ph-lg",
});
</script>
