<template>
	<MkLoading v-if="!loaded" />
	<transition :name="$store.state.animation ? 'zoom' : ''" appear>
		<div v-show="loaded" class="mjndxjch">
			<img
				src="/static-assets/badges/error.png"
				class="_ghost"
				alt="Error"
			/>
			<p>
				<b
					><i class="ph-warning ph-bold ph-lg"></i>
					{{ i18n.ts.pageLoadError }}</b
				>
			</p>
			<p v-if="meta && version === meta.version">
				{{ i18n.ts.pageLoadErrorDescription }}
			</p>
			<p v-else-if="serverIsDead">{{ i18n.ts.serverIsDead }}</p>
			<template v-else>
				<p>{{ i18n.ts.newVersionOfClientAvailable }}</p>
				<p>{{ i18n.ts.youShouldUpgradeClient }}</p>
				<MkButton class="button primary" @click="reload">{{
					i18n.ts.reload
				}}</MkButton>
			</template>
			<p>
				<MkA to="/docs/general/troubleshooting" class="_link">{{
					i18n.ts.troubleshooting
				}}</MkA>
			</p>
			<p v-if="error" class="error">ERROR: {{ error }}</p>
		</div>
	</transition>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import type * as misskey from "firefish-js";
import MkButton from "@/components/MkButton.vue";
import { version } from "@/config";
import * as os from "@/os";
import { unisonReload } from "@/scripts/unison-reload";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

const props = withDefaults(
	defineProps<{
		error?: Error;
	}>(),
	{},
);

const loaded = ref(false);
const serverIsDead = ref(false);
const meta = ref<misskey.entities.LiteInstanceMetadata | null>(null);

os.api("meta", {
	detail: false,
}).then(
	(res) => {
		loaded.value = true;
		serverIsDead.value = false;
		meta.value = res;
		localStorage.setItem("v", res.version);
	},
	() => {
		loaded.value = true;
		serverIsDead.value = true;
	},
);

function reload() {
	unisonReload();
}

definePageMetadata({
	title: i18n.ts.error,
	icon: "ph-warning ph-bold ph-lg",
});
</script>

<style lang="scss" scoped>
.mjndxjch {
	padding: 32px;
	text-align: center;

	> p {
		margin: 0 0 12px 0;
	}

	> .button {
		margin: 8px auto;
	}

	> img {
		vertical-align: bottom;
		height: 128px;
		margin-bottom: 24px;
		border-radius: 16px;
	}

	> .error {
		opacity: 0.7;
	}
}
</style>
