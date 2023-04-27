<template>
	<div>
		{{ i18n.ts.processing }}
	</div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

const props = defineProps<{
	code: string;
}>();

onMounted(async () => {
	await os.alert({
		type: "info",
		text: i18n.t("clickToFinishEmailVerification", { ok: i18n.ts.gotIt }),
	});
	await os.apiWithDialog("verify-email", {
		code: props.code,
	});
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: "Verify email",
	icon: "ph-user ph-bold ph-lg",
});
</script>
