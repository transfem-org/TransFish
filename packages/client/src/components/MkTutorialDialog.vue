<template>
<XModalWindow
	ref="dialog"
	:width="800"
	:height="600"
	:scroll="true"
	@close="dialog.close()"
	@closed="$emit('closed')"
>
	<template #header>{{ i18n.ts.signup }}</template>

	<div class="_monolithic_">
		<div class="_section">
			<div class="tbkwesmv">
				<div class="_footer navigation">
					<div class="step">
						<button class="arrow _button" :disabled="tutorial === 0" @click="tutorial--">
							<i class="ph-caret-left-bold ph-lg"></i>
						</button>
						<span>{{ tutorial + 1 }} / 6</span>
						<button class="arrow _button" :disabled="tutorial === 5" @click="tutorial++">
							<i class="ph-caret-right-bold ph-lg"></i>
						</button>
					</div>
					<MkButton v-if="tutorial === 5" class="ok" primary @click="close"><i class="ph-check-bold ph-lg"></i> {{ i18n.ts.gotIt }}</MkButton>
					<MkButton v-else class="ok" primary @click="tutorial++"><i class="ph-check-bold ph-lg"></i> {{ i18n.ts.next }}</MkButton>
				</div>
				<h2 class="_title title"><i class="ph-info-bold ph-lg"></i> {{ i18n.ts._tutorial.title }}</h2>
				<br/>
				<div v-if="tutorial === 0" class="_content">
					<h3>{{ i18n.ts._tutorial.step1_1 }}</h3>
					<div>{{ i18n.ts._tutorial.step1_2 }}</div>
				</div>
				<div v-else-if="tutorial === 1" class="_content">
					<h3>{{ i18n.ts._tutorial.step2_1 }}</h3>
					<div>{{ i18n.ts._tutorial.step2_2 }}</div>
					<XSettings/>
				</div>
				<div v-else-if="tutorial === 2" class="_content">
					<h3>{{ i18n.ts._tutorial.step3_1 }}</h3>
					<div>{{ i18n.ts._tutorial.step3_2 }}</div>
					<XFeaturedUsers/>
				</div>
				<div v-else-if="tutorial === 3" class="_content">
					<h3>{{ i18n.ts._tutorial.step4_1 }}</h3>
					<I18n :src="i18n.ts._tutorial.step4_2" tag="div">
						<template #introduction>
							<MkA class="_link" to="/tags/introduction">#introduction</MkA>
						</template>
					</I18n>
					<br/>
					<XPostForm class="post-form _block"/>
				</div>
				<div v-else-if="tutorial === 4" class="_content">
					<h3>{{ i18n.ts._tutorial.step5_1 }}</h3>
					<I18n :src="i18n.ts._tutorial.step5_2" tag="div">
						<template #timelines>
							<span>{{ timelines.length }}</span>
						</template>
					</I18n>
					<I18n :src="i18n.ts._tutorial.step5_3" tag="div">
						<template #icon>
							<i class="ph-house-bold ph-lg"/>
						</template>
					</I18n>
					<I18n v-if="timelines.includes('local')" :src="i18n.ts._tutorial.step5_4" tag="div">
						<template #icon>
							<i class="ph-users-bold ph-lg"/>
						</template>
					</I18n>
					<I18n v-if="timelines.includes('recommended')" :src="i18n.ts._tutorial.step5_5" tag="div">
						<template #icon>
							<i class="ph-thumbs-up-bold ph-lg"/>
						</template>
					</I18n>
					<I18n v-if="timelines.includes('social')" :src="i18n.ts._tutorial.step5_6" tag="div">
						<template #icon>
							<i class="ph-handshake-bold ph-lg"/>
						</template>
					</I18n>
					<I18n v-if="timelines.includes('global')" :src="i18n.ts._tutorial.step5_7" tag="div">
						<template #icon>
							<i class="ph-planet-bold ph-lg"/>
						</template>
					</I18n>
				</div>
				<div v-else-if="tutorial === 5" class="_content">
					<h3>{{ i18n.ts._tutorial.step6_1 }}</h3>
					<div>{{ i18n.ts._tutorial.step6_2 }}</div>
					<div>{{ i18n.ts._tutorial.step6_3 }}</div>
					<div>{{ i18n.ts._tutorial.step6_4 }}</div>
				</div>
			</div>
		</div>
	</div>
</XModalWindow>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import XSettings from '@/pages/settings/profile.vue';
import XModalWindow from '@/components/MkModalWindow.vue';
import MkButton from '@/components/MkButton.vue';
import XFeaturedUsers from '@/pages/explore.users.vue';
import XPostForm from '@/components/MkPostForm.vue';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import { $i } from '@/account';
import { instance } from '@/instance';

const isLocalTimelineAvailable =
	!instance.disableLocalTimeline ||
	($i != null && ($i.isModerator || $i.isAdmin));
const isRecommendedTimelineAvailable =
	!instance.disableRecommendedTimeline ||
	($i != null && ($i.isModerator || $i.isAdmin));
const isGlobalTimelineAvailable =
	!instance.disableGlobalTimeline ||
	($i != null && ($i.isModerator || $i.isAdmin));

let timelines = ['home'];

if (isLocalTimelineAvailable) {
	timelines.push('local');
}
if (isRecommendedTimelineAvailable) {
	timelines.push('recommended');
}
if (isLocalTimelineAvailable) {
	timelines.push('social');
}
if (isGlobalTimelineAvailable) {
	timelines.push('global');
}

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

