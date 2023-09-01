<template>
	<div>
		<XDrive ref="drive" @cd="(x) => (folder = x)" />
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import XDrive from "@/components/MkDrive.vue";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

const folder = ref(null);

definePageMetadata(
	computed(() => ({
		title: folder.value ? folder.value.name : i18n.ts.drive,
		icon: "ph-cloud ph-bold ph-lg",
		hideHeader: true,
	})),
);
</script>
