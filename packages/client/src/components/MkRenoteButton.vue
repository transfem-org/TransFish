<template>
	<button
		v-if="canRenote"
		ref="buttonRef"
		v-tooltip.noDelay.bottom="i18n.ts.renote"
		class="button _button canRenote"
		:class="{ renoted: hasRenotedBefore }"
		@click.stop="renote(false, $event)"
	>
		<i class="ph-repeat ph-bold ph-lg"></i>
		<p v-if="count > 0 && !detailedView" class="count">{{ count }}</p>
	</button>
	<button
		v-else
		v-tooltip.noDelay.bottom="i18n.ts.disabled"
		class="eddddedb _button"
		disabled="true"
	>
		<i class="ph-repeat ph-bold ph-lg"></i>
	</button>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import type * as misskey from "firefish-js";
import Ripple from "@/components/MkRipple.vue";
import XDetails from "@/components/MkUsersTooltip.vue";
import { pleaseLogin } from "@/scripts/please-login";
import * as os from "@/os";
import { $i } from "@/account";
import { useTooltip } from "@/scripts/use-tooltip";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import type { MenuItem } from "@/types/menu";
import { vibrate } from "@/scripts/vibrate";

const props = defineProps<{
	note: misskey.entities.Note;
	count: number;
	detailedView?;
}>();

const buttonRef = ref<HTMLElement>();

const canRenote = computed(
	() =>
		["public", "home"].includes(props.note.visibility) ||
		props.note.userId === $i.id,
);

useTooltip(buttonRef, async (showing) => {
	const renotes = await os.api("notes/renotes", {
		noteId: props.note.id,
		limit: 11,
	});

	const users = renotes.map((x) => x.user);

	if (users.length < 1) return;

	os.popup(
		XDetails,
		{
			showing,
			users,
			count: props.count,
			targetElement: buttonRef.value,
		},
		{},
		"closed",
	);
});

const hasRenotedBefore = ref(false);
os.api("notes/renotes", {
	noteId: props.note.id,
	userId: $i.id,
	limit: 1,
}).then((res) => {
	hasRenotedBefore.value = res.length > 0;
});

const renote = (viaKeyboard = false, ev?: MouseEvent) => {
	pleaseLogin();

	const buttonActions: Array<MenuItem> = [];

	if (props.note.visibility === "public") {
		buttonActions.push({
			text: i18n.ts.renote,
			icon: "ph-repeat ph-bold ph-lg",
			danger: false,
			action: () => {
				os.api("notes/create", {
					renoteId: props.note.id,
					visibility: "public",
				});
				hasRenotedBefore.value = true;
				const el =
					ev &&
					((ev.currentTarget ?? ev.target) as
						| HTMLElement
						| null
						| undefined);
				if (el) {
					const rect = el.getBoundingClientRect();
					const x = rect.left + el.offsetWidth / 2;
					const y = rect.top + el.offsetHeight / 2;
					os.popup(Ripple, { x, y }, {}, "end");
				}
			},
		});
	}

	if (["public", "home"].includes(props.note.visibility)) {
		buttonActions.push({
			text: `${i18n.ts.renote} (${i18n.ts._visibility.home})`,
			icon: "ph-house ph-bold ph-lg",
			danger: false,
			action: () => {
				os.api("notes/create", {
					renoteId: props.note.id,
					visibility: "home",
				});
				hasRenotedBefore.value = true;
				const el =
					ev &&
					((ev.currentTarget ?? ev.target) as
						| HTMLElement
						| null
						| undefined);
				if (el) {
					const rect = el.getBoundingClientRect();
					const x = rect.left + el.offsetWidth / 2;
					const y = rect.top + el.offsetHeight / 2;
					os.popup(Ripple, { x, y }, {}, "end");
				}
			},
		});
	}

	if (props.note.visibility === "specified") {
		buttonActions.push({
			text: `${i18n.ts.renote} (${i18n.ts.recipient})`,
			icon: "ph-envelope-simple-open ph-bold ph-lg",
			danger: false,
			action: () => {
				os.api("notes/create", {
					renoteId: props.note.id,
					visibility: "specified",
					visibleUserIds: props.note.visibleUserIds,
				});
				hasRenotedBefore.value = true;
				const el =
					ev &&
					((ev.currentTarget ?? ev.target) as
						| HTMLElement
						| null
						| undefined);
				if (el) {
					const rect = el.getBoundingClientRect();
					const x = rect.left + el.offsetWidth / 2;
					const y = rect.top + el.offsetHeight / 2;
					os.popup(Ripple, { x, y }, {}, "end");
				}
			},
		});
	} else {
		buttonActions.push({
			text: `${i18n.ts.renote} (${i18n.ts._visibility.followers})`,
			icon: "ph-lock ph-bold ph-lg",
			danger: false,
			action: () => {
				os.api("notes/create", {
					renoteId: props.note.id,
					visibility: "followers",
				});
				hasRenotedBefore.value = true;
				const el =
					ev &&
					((ev.currentTarget ?? ev.target) as
						| HTMLElement
						| null
						| undefined);
				if (el) {
					const rect = el.getBoundingClientRect();
					const x = rect.left + el.offsetWidth / 2;
					const y = rect.top + el.offsetHeight / 2;
					os.popup(Ripple, { x, y }, {}, "end");
				}
			},
		});
	}

	if (canRenote.value) {
		buttonActions.push({
			text: `${i18n.ts.renote} (${i18n.ts.local})`,
			icon: "ph-users ph-bold ph-lg",
			danger: false,
			action: () => {
				vibrate([30, 30, 60]);
				os.api(
					"notes/create",
					props.note.visibility === "specified"
						? {
								renoteId: props.note.id,
								visibility: props.note.visibility,
								visibleUserIds: props.note.visibleUserIds,
								localOnly: true,
						  }
						: {
								renoteId: props.note.id,
								visibility: props.note.visibility,
								localOnly: true,
						  },
				);
				hasRenotedBefore.value = true;
				const el =
					ev &&
					((ev.currentTarget ?? ev.target) as
						| HTMLElement
						| null
						| undefined);
				if (el) {
					const rect = el.getBoundingClientRect();
					const x = rect.left + el.offsetWidth / 2;
					const y = rect.top + el.offsetHeight / 2;
					os.popup(Ripple, { x, y }, {}, "end");
				}
			},
		});
	}

	if (!defaultStore.state.seperateRenoteQuote) {
		buttonActions.push({
			text: i18n.ts.quote,
			icon: "ph-quotes ph-bold ph-lg",
			danger: false,
			action: () => {
				os.post({
					renote: props.note,
				});
			},
		});
	}

	if (hasRenotedBefore.value) {
		buttonActions.push({
			text: i18n.ts.unrenote,
			icon: "ph-trash ph-bold ph-lg",
			danger: true,
			action: () => {
				os.api("notes/unrenote", {
					noteId: props.note.id,
				});
				hasRenotedBefore.value = false;
			},
		});
	}

	buttonActions[0].textStyle = "font-weight: bold";

	os.popupMenu(buttonActions, buttonRef.value, { viaKeyboard });
};
</script>

<style lang="scss" scoped>
.button {
	&:not(.canRenote) {
		cursor: default;
	}
	&.renoted {
		color: var(--accent) !important;
		opacity: 1 !important;
		font-weight: 700;
	}
}
</style>
