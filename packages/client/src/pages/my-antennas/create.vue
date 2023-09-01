<template>
	<MkSpacer :content-max="700">
		<div class="geegznzt">
			<XAntenna :antenna="draft" @created="onAntennaCreated" />
		</div>
	</MkSpacer>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import XAntenna from "./editor.vue";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { useRouter } from "@/router";

const router = useRouter();

const draft = ref({
	name: "",
	src: "all",
	userListId: null,
	userGroupId: null,
	users: [],
	instances: [],
	keywords: [],
	excludeKeywords: [],
	withReplies: false,
	caseSensitive: false,
	withFile: false,
	notify: false,
});

function onAntennaCreated() {
	router.push("/my/antennas");
}

definePageMetadata({
	title: i18n.ts.manageAntennas,
	icon: "ph-flying-saucer ph-bold ph-lg",
});
</script>
