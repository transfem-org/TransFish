<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader
				v-model:tab="src"
				:actions="headerActions"
				:tabs="headerTabs"
				:display-my-avatar="true"
			/>
		</template>
		<MkSpacer :content-max="800">
			<div ref="rootEl" v-hotkey.global="keymap" class="cmuxhskf">
				<XPostForm
					v-if="defaultStore.reactiveState.showFixedPostForm.value"
					class="post-form _block"
					fixed
				/>

				<div v-if="queue > 0" class="new">
					<button class="_buttonPrimary" @click="top()">
						{{ i18n.ts.newNoteRecived }}
					</button>
				</div>
				<!-- <div v-if="!isMobile" class="tl _block">
					<XTimeline
						ref="tl"
						:key="src"
						class="tl"
						:src="src"
						:sound="true"
						@queue="queueUpdated"
					/>
				</div> *v-else on next div* -->
				<div class="tl _block">
					<swiper
						:modules="[Virtual]"
						:space-between="20"
						:virtual="true"
						:allow-touch-move="
							!(
								deviceKind === 'desktop' &&
								!defaultStore.state.swipeOnDesktop
							)
						"
						@swiper="setSwiperRef"
						@slide-change="onSlideChange"
					>
						<swiper-slide>
							<XForYou />
						</swiper-slide>
						<swiper-slide>
							<XDiscover />
						</swiper-slide>
					</swiper>
				</div>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { Virtual } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import XTutorial from "@/components/MkTutorialDialog.vue";
import XPostForm from "@/components/MkPostForm.vue";
import XForYou from "./timeline.foryou.vue";
import XDiscover from "./timeline.discover.vue";
import { scroll } from "@/scripts/scroll";
import * as os from "@/os";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
import "swiper/scss";
import "swiper/scss/virtual";

if (defaultStore.reactiveState.tutorial.value !== -1) {
	os.popup(XTutorial, {}, {}, "closed");
}

let timelines = ["forYou", "discover"];

const MOBILE_THRESHOLD = 500;

// デスクトップでウィンドウを狭くしたときモバイルUIが表示されて欲しいことはあるので deviceKind === 'desktop' の判定は行わない
const isMobile = ref(
	deviceKind === "smartphone" || window.innerWidth <= MOBILE_THRESHOLD
);
window.addEventListener("resize", () => {
	isMobile.value =
		deviceKind === "smartphone" || window.innerWidth <= MOBILE_THRESHOLD;
});

const rootEl = $ref<HTMLElement>();

let queue = $ref(0);
const src = $computed({
	get: () => defaultStore.reactiveState.tl.value.src,
	set: (x) => {
		saveSrc(x);
		syncSlide(timelines.indexOf(x));
	},
});

function top(): void {
	scroll(rootEl!, { top: 0 });
}

async function chooseList(ev: MouseEvent): Promise<void> {
	const lists = await os.api("users/lists/list");
	const items = [
		{
			type: "link" as const,
			text: i18n.ts.manageLists,
			icon: "ph-faders-horizontal ph-bold ph-lg",
			to: "/my/lists",
		},
	].concat(
		lists.map((list) => ({
			type: "link" as const,
			text: list.name,
			icon: "",
			to: `/timeline/list/${list.id}`,
		}))
	);
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseAntenna(ev: MouseEvent): Promise<void> {
	const antennas = await os.api("antennas/list");
	const items = [
		{
			type: "link" as const,
			indicate: false,
			text: i18n.ts.manageAntennas,
			icon: "ph-faders-horizontal ph-bold ph-lg",
			to: "/my/antennas",
		},
	].concat(
		antennas.map((antenna) => ({
			type: "link" as const,
			text: antenna.name,
			icon: "",
			indicate: antenna.hasUnreadNote,
			to: `/timeline/antenna/${antenna.id}`,
		}))
	);
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

function saveSrc(newSrc: "forYou" | "discover"): void {
	defaultStore.set("tl", {
		...defaultStore.state.tl,
		src: newSrc,
	});
}

function saveDiscoverSrc(newSrc: "hot" | "recommended" | "global"): void {
	defaultStore.set("discoverTl", {
		...defaultStore.state.discoverTl,
		src: newSrc,
	});
}

const headerActions = $computed(() => [
	{
		icon: "ph-list-bullets ph-bold ph-lg",
		title: i18n.ts.lists,
		text: i18n.ts.lists,
		iconOnly: true,
		handler: chooseList,
	},
	{
		icon: "ph-flying-saucer ph-bold ph-lg",
		title: i18n.ts.antennas,
		text: i18n.ts.antennas,
		iconOnly: true,
		handler: chooseAntenna,
	} /* **TODO: fix timetravel** {
		icon: 'ph-calendar-blank ph-bold ph-lg',
		title: i18n.ts.jumpToSpecifiedDate,
		iconOnly: true,
		handler: timetravel,
	}*/,
]);

const headerTabs = $computed(() => [
	{
		key: "forYou",
		title: i18n.ts._timelines.forYou,
		icon: "ph-house ph-bold ph-lg",
	},
	{
		key: "discover",
		title: i18n.ts._timelines.discover,
		icon: "ph-planet ph-bold ph-lg",
	},
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.timeline,
		icon:
			src === "discover"
				? "ph-planet ph-bold ph-lg"
				: "ph-house ph-bold ph-lg",
	}))
);

let swiperRef: any = null;

function setSwiperRef(swiper) {
	swiperRef = swiper;
	syncSlide(timelines.indexOf(src));
}

function onSlideChange() {
	saveSrc(timelines[swiperRef.activeIndex]);
}

function syncSlide(index) {
	swiperRef.slideTo(index);
}

onMounted(() => {
	syncSlide(
		timelines.indexOf(defaultStore.state.tl?.src || swiperRef.activeIndex)
	);
});
</script>

<style lang="scss" scoped>
.cmuxhskf {
	--swiper-theme-color: var(--accent);

	> .new {
		position: sticky;
		top: calc(var(--stickyTop, 0px) + 16px);
		z-index: 1000;
		width: 100%;
		pointer-events: none;

		> button {
			display: block;
			margin: var(--margin) auto 0 auto;
			padding: 8px 16px;
			border-radius: 32px;
			pointer-events: all;
		}
	}

	> .post-form {
		border-radius: var(--radius);
	}

	> .tl {
		background: var(--bg);
		border-radius: var(--radius);
		overflow: clip;
	}
}
</style>
