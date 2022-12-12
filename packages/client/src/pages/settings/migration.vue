<template>
<div class="_formRoot">
	<FormSection>
		<template #label>{{ i18n.ts.moveTo }}</template>
		<FormInput v-model="moveToAccount" class="_formBlock">
			<template #prefix><i class="ph-airplane-takeoff-bold ph-lg"></i></template>
			<template #label>{{ i18n.ts.moveToLabel }}</template>
		</FormInput>
		<FormButton primary danger @click="move()">{{ i18n.ts.moveAccount }}</FormButton>
		<template #caption>{{ i18n.ts.moveAccountDescription }}</template>
	</FormSection>

	<FormSection>
		<template #label>{{ i18n.ts.moveFrom }}</template>
		<FormInput v-model="accountAlias" class="_formBlock">
			<template #prefix><i class="ph-airplane-landing-bold ph-lg"></i></template>
			<template #label>{{ i18n.ts.moveFromLabel }}</template>
		</FormInput>
		<FormButton class="button" inline primary @click="save(accountAlias)"><i class="ph-floppy-disk-back-bold ph-lg"></i> {{ i18n.ts.save }}</FormButton>
		<template #caption>{{ i18n.ts.moveFromDescription }}</template>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import FormSection from '@/components/form/section.vue';
import FormInput from '@/components/form/input.vue';
import FormButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

let moveToAccount = $ref('');
let accountAlias = $ref('');

async function save(): Promise<void> {
	os.apiWithDialog('i/known-as', {
		alsoKnownAs: accountAlias,
	});
}

async function move(): Promise<void> {
	const confirm = await os.confirm({
		type: 'warning',
		text: i18n.t('migrationConfirm', { account: moveToAccount.toString() }),
	});
	if (confirm.canceled) return;
	os.api('i/move', {
		moveToAccount: moveToAccount,
	});
}

definePageMetadata({
	title: i18n.ts.security,
	icon: 'ph-lock-bold ph-lg',
});
</script>

	<style lang="scss" scoped>
	.timnmucd {
		padding: 16px;

		&:first-child {
			border-top-left-radius: 6px;
			border-top-right-radius: 6px;
		}

		&:last-child {
			border-bottom-left-radius: 6px;
			border-bottom-right-radius: 6px;
		}

		&:not(:last-child) {
			border-bottom: solid 0.5px var(--divider);
		}

		> header {
			display: flex;
			align-items: center;

			> .icon {
				width: 1em;
				margin-right: 0.75em;

				&.succ {
					color: var(--success);
				}

				&.fail {
					color: var(--error);
				}
			}
		}
	}
	</style>
