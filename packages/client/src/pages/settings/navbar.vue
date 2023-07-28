<template>
	<div class="_formRoot">
		<FormSlot>
			<VueDraggable v-model="items" animation="150" delay="50">
				<div
					v-for="(element, index) in items"
					:key="index"
					class="item"
				>
					<i class="itemHandle ph-list ph-bold ph-lg"></i>
					<i
						:class="
							navbarItemDef[element]?.icon ??
							'ph-arrows-out-line-vertical ph-bold ph-lg'
						"
					></i>
					<span class="itemText">{{
						i18n.ts[navbarItemDef[element]?.title] ??
						i18n.ts.divider
					}}</span>
					<button
						class="_button itemRemove"
						@click="removeItem(index)"
					>
						<i class="ph-x ph-bold ph-lg"></i>
					</button>
				</div>
			</VueDraggable>
			<FormSection>
				<div style="display: flex; gap: var(--margin); flex-wrap: wrap">
					<FormButton primary @click="addItem">
						<i class="ph-plus ph-bold ph-lg"></i>
						{{ i18n.ts.addItem }}
					</FormButton>
					<FormButton @click="reloadAsk">
						<i class="ph-floppy-disk-back ph-bold ph-lg"></i>
						{{ i18n.ts.apply }}
					</FormButton>
				</div>
			</FormSection>
		</FormSlot>

		<FormRadios v-model="menuDisplay" class="_formBlock">
			<template #label>{{ i18n.ts.display }}</template>
			<option value="sideFull">
				{{ i18n.ts._menuDisplay.sideFull }}
			</option>
			<option value="sideIcon">
				{{ i18n.ts._menuDisplay.sideIcon }}
			</option>
			<!-- <option value="top">{{ i18n.ts._menuDisplay.top }}</option> -->
			<!-- <MkRadio v-model="menuDisplay" value="hide" disabled>{{ i18n.ts._menuDisplay.hide }}</MkRadio>-->
			<!-- TODO: サイドバーを完全に隠せるようにすると、別途ハンバーガーボタンのようなものをUIに表示する必要があり面倒 -->
		</FormRadios>

		<FormButton danger class="_formBlock" @click="reset()"
			><i class="ph-arrow-clockwise ph-bold ph-lg"></i>
			{{ i18n.ts.default }}</FormButton
		>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import FormSlot from "@/components/form/slot.vue";
import FormRadios from "@/components/form/radios.vue";
import FormButton from "@/components/MkButton.vue";
import FormSection from "@/components/form/section.vue";
import * as os from "@/os";
import { navbarItemDef } from "@/navbar";
import { defaultStore } from "@/store";
import { unisonReload } from "@/scripts/unison-reload";
import { i18n } from "@/i18n";
import { VueDraggable } from "vue-draggable-plus";
import { definePageMetadata } from "@/scripts/page-metadata";

const items = ref(defaultStore.state.menu);

const menuDisplay = computed(defaultStore.makeGetterSetter("menuDisplay"));

async function reloadAsk() {
	const { canceled } = await os.confirm({
		type: "info",
		text: i18n.ts.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
}

async function addItem() {
	const menu = Object.keys(navbarItemDef).filter(
		(k) => !defaultStore.state.menu.includes(k),
	);
	const { canceled, result: item } = await os.select({
		title: i18n.ts.addItem,
		items: [
			...menu.map((k) => ({
				value: k,
				text: i18n.ts[navbarItemDef[k].title],
			})),
			{
				value: "-",
				text: i18n.ts.divider,
			},
		],
	});
	if (canceled) return;
	items.value = [...items.value, item];
}

async function removeItem(index) {
	items.value = items.value.filter((_, i) => i !== index);
}

async function save() {
	defaultStore.set("menu", items.value);
}

function reset() {
	defaultStore.reset("menu");
	items.value = defaultStore.state.menu;
}

watch(items, async () => {
	await save();
});

watch(menuDisplay, async () => {
	await reloadAsk();
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.navbar,
	icon: "ph-list-bullets ph-bold ph-lg",
});
</script>

<style lang="scss" scoped>
.item {
	position: relative;
	display: block;
	line-height: 2.85rem;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	border-radius: var(--radius);
	margin-bottom: 0.5rem;
	color: var(--navFg);
	background-color: var(--panel);

	> .itemIcon {
		position: relative;
	}

	> .itemText {
		position: relative;
		font-size: 0.9em;
		margin-left: 1rem;
	}

	> .itemRemove {
		position: absolute;
		z-index: 10000;
		width: 32px;
		height: 32px;
		color: var(--error);
		top: 4px;
		right: 8px;
		opacity: 0.8;
	}

	> .itemHandle {
		cursor: move;
		width: 32px;
		height: 32px;
		margin: 0 1rem;
		opacity: 0.5;
	}
}
</style>
