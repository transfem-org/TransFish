<template>
	<XKanban sticky v-if="isDesktop" />
	<main
		id="maincontent"
	>
		<RouterView />
		<footer class="powered-by">
			<MkA to="/">
				<MkInstanceTicker :instance="meta"></MkInstanceTicker>
				<small>{{ i18n.ts.poweredBy }}</small>
			</MkA>
		</footer>
	</main>
	<XCommon />
</template>

<script lang="ts" setup>
import { provide } from "vue";
import XCommon from "./_common_/common.vue";
import { i18n } from "@/i18n";
import { mainRouter } from "@/router";
import XKanban from "@/ui/visitor/kanban.vue";
import MkInstanceTicker from "@/components/MkInstanceTicker.vue";
import * as os from "@/os";
import { LiteInstanceMetadata } from "calckey-js/built/entities";
import { host } from "@/config";



provide("router", mainRouter);

const DESKTOP_THRESHOLD = 1100;
let isDesktop = $ref(window.innerWidth >= DESKTOP_THRESHOLD);
matchMedia(`(min-width: ${DESKTOP_THRESHOLD - 1}px)`).onchange = (mql) => {
	isDesktop = mql.matches;
};

const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent");

console.log(accentColor);

let meta = $ref<LiteInstanceMetadata>();

os.api("meta").then((res) => {
	meta = res;
});

</script>
<style lang="scss">
#calckey_app {
	display: flex;
	min-height: 100vh;
}
#maincontent {
	display: flex;
	flex-direction: column;
	min-width: 0;
	flex-grow: 1;
	flex-basis: 900px;
}
.powered-by {
	display: block;
	margin-top: auto;
	padding: 28px;
	text-align: center;
	border-top: 1px solid var(--divider);
	.instance-ticker {
		font-size: 1.5em;
		display: inline-flex !important;
	}
	small {
		display: block;
		margin-top: 8px;
		opacity: 0.5;
	}
}
</style>
