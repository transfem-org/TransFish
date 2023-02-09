<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<div style="overflow: clip;">
		<MkSpacer :content-max="600" :margin-min="20">
			<div class="_formRoot">
				<div class="_formBlock" style="text-align: center;">
					<pwa-install/>
					<MkButton primary rounded inline @click="installPwa">{{ i18n.ts._apps.pwa }}</MkButton>
				</div>
				<FormSection>
					<template #label>{{ i18n.ts._apps.crossPlatform }}</template>
					<div class="_formLinks">
						<FormLink to="https://kaiteki.app" external>
							<template #icon>
								<i class="ph-device-mobile-bold ph-xl"/>
								<i class="ph-android-logo-bold ph-lg"/>
								<span> </span>
								<i class="ph-desktop-bold ph-xl"/>
								<i class="ph-windows-logo-bold ph-lg"/>
								<i class="ph-linux-logo-bold ph-lg"/>
							</template>
							{{ i18n.ts._apps.kaiteki }}
							<template #suffix>{{ i18n.ts._apps.firstClass }}</template>
						</FormLink>
					</div>
				</FormSection>
				<FormSection>
					<template #label>{{ i18n.ts._apps.crossPlatform }}</template>
					<div class="_formLinks">
						<FormLink to="https://kaiteki.app" external>
							<template #icon>
								<i class="ph-device-mobile-bold ph-xl"/>
								<i class="ph-android-logo-bold ph-lg"/>
								<span> </span>
								<i class="ph-desktop-bold ph-xl"/>
								<i class="ph-windows-logo-bold ph-lg"/>
								<i class="ph-linux-logo-bold ph-lg"/>
							</template>
							{{ i18n.ts._apps.kaiteki }}
							<template #suffix>{{ i18n.ts._apps.firstClass }}</template>
						</FormLink>
					</div>
				</FormSection>
			</div>
		</MkSpacer>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import '@khmyznikov/pwa-install';

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

function installPwa(ev: MouseEvent) {
	const pwaInstall = document.getElementsByTagName('pwa-install')[0];
	pwaInstall.install();
}

definePageMetadata({
	title: i18n.ts._apps.apps,
	icon: null,
});
</script>
