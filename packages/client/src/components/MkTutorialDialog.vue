<template>
<XModalWindow
	ref="dialog"
	:width="800"
	:height="500"
	:scroll="false"
	@close="dialog.close()"
	@closed="$emit('closed')"
>
	<template #header>{{ i18n.ts.signup }}</template>

	<div class="_monolithic_">
		<div class="_section">
			<div class="_title"><i class="ph-info-bold ph-lg"></i> {{ i18n.ts._tutorial.title }}</div>
			<div v-if="tutorial === 0" class="_content">
				<div>{{ i18n.ts._tutorial.step1_1 }}</div>
				<div>{{ i18n.ts._tutorial.step1_2 }}</div>
			</div>
			<div v-else-if="tutorial === 1" class="_content">
				<div>{{ i18n.ts._tutorial.step2_1 }}</div>
				<div>{{ i18n.ts._tutorial.step2_2 }}</div>
				<XSettings/>
			</div>
			<div v-else-if="tutorial === 2" class="_content">
				<div>{{ i18n.ts._tutorial.step3_1 }}</div>
				<div>{{ i18n.ts._tutorial.step3_2 }}</div>
				<XFeaturedUsers/>
			</div>
			<div v-else-if="tutorial === 3" class="_content">
				<div>{{ i18n.ts._tutorial.step4_1 }}</div>
				<div>{{ i18n.ts._tutorial.step4_2 }}</div>
			</div>
			<div v-else-if="tutorial === 4" class="_content">
				<div>{{ i18n.ts._tutorial.step5_1 }}</div>
				<I18n :src="i18n.ts._tutorial.step5_2" tag="div">
					<template #featured>
						<MkA class="_link" to="/featured">{{ i18n.ts.featured }}</MkA>
					</template>
					<template #explore>
						<MkA class="_link" to="/explore">{{ i18n.ts.explore }}</MkA>
					</template>
				</I18n>
				<div>{{ i18n.ts._tutorial.step5_3 }}</div>
				<small>{{ i18n.ts._tutorial.step5_4 }}</small>
			</div>
			<div v-else-if="tutorial === 5" class="_content">
				<div>{{ i18n.ts._tutorial.step6_1 }}</div>
				<div>{{ i18n.ts._tutorial.step6_2 }}</div>
				<div>{{ i18n.ts._tutorial.step6_3 }}</div>
			</div>
			<div v-else-if="tutorial === 6" class="_content">
				<div>{{ i18n.ts._tutorial.step7_1 }}</div>
				<I18n :src="i18n.ts._tutorial.step7_2" tag="div">
					<template #help>
						<a href="https://misskey-hub.net/help.html" target="_blank" class="_link">{{ i18n.ts.help }}</a>
					</template>
				</I18n>
				<div>{{ i18n.ts._tutorial.step7_3 }}</div>
			</div>
			<div class="_footer navigation">
				<div class="step">
					<button class="arrow _button" :disabled="tutorial === 0" @click="tutorial--">
						<i class="ph-caret-left-bold ph-lg"></i>
					</button>
					<span>{{ tutorial + 1 }} / 7</span>
					<button class="arrow _button" :disabled="tutorial === 6" @click="tutorial++">
						<i class="ph-caret-right-bold ph-lg"></i>
					</button>
				</div>
				<MkButton v-if="tutorial === 6" class="ok" primary @click="close"><i class="ph-check-bold ph-lg"></i> {{ i18n.ts.gotIt }}</MkButton>
				<MkButton v-else class="ok" primary @click="tutorial++"><i class="ph-check-bold ph-lg"></i> {{ i18n.ts.next }}</MkButton>
			</div>>
		</div>
	</div>
</XModalWindow>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import XModalWindow from '@/components/MkModalWindow.vue';
import MkButton from '@/components/MkButton.vue';
import XFeaturedUsers from '@/pages/explore.users.vue';
import XSettings from '@pages/settings/profile.vue'
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';

const emit = defineEmits<{
	(ev: 'done'): void;
	(ev: 'closed'): void;
}>();

const dialog = $ref<InstanceType<typeof XModalWindow>>();

const tutorial = computed({
	get() { return defaultStore.reactiveState.tutorial.value || 0; },
	set(value) { defaultStore.set('tutorial', value); },
});

function close(res) {
	tutorial.value = -1;
	dialog.close();
}
</script>

<style lang="scss" scoped>
.tbkwesmv {
	> ._content {
		> small {
			opacity: 0.7;
		}
	}

	> .navigation {
		display: flex;
		flex-direction: row;
		align-items: baseline;

		> .step {
			> .arrow {
				padding: 4px;

				&:disabled {
					opacity: 0.5;
				}

				&:first-child {
					padding-right: 8px;
				}

				&:last-child {
					padding-left: 8px;
				}
			}

			> span {
				margin: 0 4px;
			}
		}

		> .ok {
			margin-left: auto;
		}
	}
}
</style>

