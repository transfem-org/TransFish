<template>
	<div>
		<MkStickyContainer>
			<template #header
				><MkPageHeader
					:actions="headerActions"
					:tabs="headerTabs"
					:display-back-button="true"
			/></template>
			<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
				<FormSuspense :p="init">
					<div class="_formRoot">
						<FormInput v-model="name" class="_formBlock">
							<template #label>{{
								i18n.ts.instanceName
							}}</template>
						</FormInput>

						<FormTextarea v-model="description" class="_formBlock">
							<template #label>{{
								i18n.ts.instanceDescription
							}}</template>
						</FormTextarea>

						<FormInput v-model="tosUrl" class="_formBlock">
							<template #prefix
								><i class="ph-link-simple ph-bold ph-lg"></i
							></template>
							<template #label>{{ i18n.ts.tosUrl }}</template>
						</FormInput>

						<FormSplit :min-width="300">
							<FormInput
								v-model="maintainerName"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.maintainerName
								}}</template>
							</FormInput>

							<FormInput
								v-model="maintainerEmail"
								type="email"
								class="_formBlock"
							>
								<template #prefix
									><i
										class="ph-envelope-simple-open ph-bold ph-lg"
									></i
								></template>
								<template #label>{{
									i18n.ts.maintainerEmail
								}}</template>
							</FormInput>

							<FormInput
								v-model="donationLink"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-hand-heart ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.donationLink
								}}</template>
							</FormInput>
						</FormSplit>

						<FormTextarea v-model="pinnedUsers" class="_formBlock">
							<template #label>{{
								i18n.ts.pinnedUsers
							}}</template>
							<template #caption>{{
								i18n.ts.pinnedUsersDescription
							}}</template>
						</FormTextarea>

						<FormSection>
							<FormSwitch
								v-model="enableRegistration"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.enableRegistration
								}}</template>
							</FormSwitch>

							<FormSwitch
								v-model="emailRequiredForSignup"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.emailRequiredForSignup
								}}</template>
							</FormSwitch>
						</FormSection>

						<FormSection>
							<FormSwitch
								v-model="enableRecommendedTimeline"
								class="_formBlock"
								>{{
									i18n.ts.enableRecommendedTimeline
								}}</FormSwitch
							>
							<FormTextarea
								v-model="recommendedInstances"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.recommendedInstances
								}}</template>
								<template #caption>{{
									i18n.ts.recommendedInstancesDescription
								}}</template>
							</FormTextarea>
						</FormSection>

						<FormSection>
							<FormSwitch
								v-model="enableLocalTimeline"
								class="_formBlock"
								>{{ i18n.ts.enableLocalTimeline }}</FormSwitch
							>
							<FormSwitch
								v-model="enableGlobalTimeline"
								class="_formBlock"
								>{{ i18n.ts.enableGlobalTimeline }}</FormSwitch
							>
							<FormInfo class="_formBlock">{{
								i18n.ts.disablingTimelinesInfo
							}}</FormInfo>
						</FormSection>

						<FormSection>
							<MkRadios
								v-model="defaultReaction"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.defaultReaction
								}}</template>
								<option value="⭐">
									<MkEmoji emoji="⭐" style="height: 1.7em" />
								</option>
								<option value="👍">
									<MkEmoji emoji="👍" style="height: 1.7em" />
								</option>
								<option value="❤️">
									<MkEmoji emoji="❤️" style="height: 1.7em" />
								</option>
								<option value="custom">
									<FormInput
										v-model="defaultReactionCustom"
										class="_formBlock"
										:small="true"
										:placeholder="`:custom:`"
										style="margin: 0 0 !important"
									/>
								</option>
							</MkRadios>
						</FormSection>

						<FormSection>
							<template #label>{{ i18n.ts.theme }}</template>

							<FormInput v-model="iconUrl" class="_formBlock">
								<template #prefix
									><i class="ph-link-simple ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.iconUrl
								}}</template>
							</FormInput>

							<FormInput v-model="bannerUrl" class="_formBlock">
								<template #prefix
									><i class="ph-link-simple ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.bannerUrl
								}}</template>
							</FormInput>

							<FormInput
								v-model="logoImageUrl"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-link-simple ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.logoImageUrl
								}}</template>
							</FormInput>

							<FormInput
								v-model="backgroundImageUrl"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-link-simple ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.backgroundImageUrl
								}}</template>
							</FormInput>

							<FormInput v-model="themeColor" class="_formBlock">
								<template #prefix
									><i class="ph-paconstte ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.themeColor
								}}</template>
								<template #caption>#RRGGBB</template>
							</FormInput>

							<FormTextarea
								v-model="defaultLightTheme"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.instanceDefaultLightTheme
								}}</template>
								<template #caption>{{
									i18n.ts.instanceDefaultThemeDescription
								}}</template>
							</FormTextarea>

							<FormTextarea
								v-model="defaultDarkTheme"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.instanceDefaultDarkTheme
								}}</template>
								<template #caption>{{
									i18n.ts.instanceDefaultThemeDescription
								}}</template>
							</FormTextarea>
						</FormSection>

						<FormSection>
							<template #label>{{ i18n.ts.splash }}</template>

							<FormTextarea
								v-model="customMOTD"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.customMOTD
								}}</template>
								<template #caption>{{
									i18n.ts.customMOTDDescription
								}}</template>
							</FormTextarea>

							<FormTextarea
								v-model="customSplashIcons"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.customSplashIcons
								}}</template>
								<template #caption>{{
									i18n.ts.customSplashIconsDescription
								}}</template>
							</FormTextarea>
						</FormSection>

						<FormSection>
							<template #label>{{ i18n.ts.files }}</template>

							<FormSwitch
								v-model="cacheRemoteFiles"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.cacheRemoteFiles
								}}</template>
								<template #caption>{{
									i18n.ts.cacheRemoteFilesDescription
								}}</template>
							</FormSwitch>

							<FormSplit :min-width="280">
								<FormInput
									v-model="localDriveCapacityMb"
									type="number"
									class="_formBlock"
								>
									<template #label>{{
										i18n.ts.driveCapacityPerLocalAccount
									}}</template>
									<template #suffix>MB</template>
									<template #caption>{{
										i18n.ts.inMb
									}}</template>
								</FormInput>

								<FormInput
									v-model="remoteDriveCapacityMb"
									type="number"
									:disabled="!cacheRemoteFiles"
									class="_formBlock"
								>
									<template #label>{{
										i18n.ts.driveCapacityPerRemoteAccount
									}}</template>
									<template #suffix>MB</template>
									<template #caption>{{
										i18n.ts.inMb
									}}</template>
								</FormInput>
							</FormSplit>
						</FormSection>

						<FormSection>
							<template #label>ServiceWorker</template>

							<FormSwitch
								v-model="enableServiceWorker"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.enableServiceworker
								}}</template>
								<template #caption>{{
									i18n.ts.serviceworkerInfo
								}}</template>
							</FormSwitch>

							<template v-if="enableServiceWorker">
								<FormInput
									v-model="swPublicKey"
									class="_formBlock"
								>
									<template #prefix
										><i class="ph-key ph-bold ph-lg"></i
									></template>
									<template #label>Public key</template>
								</FormInput>

								<FormInput
									v-model="swPrivateKey"
									class="_formBlock"
								>
									<template #prefix
										><i class="ph-key ph-bold ph-lg"></i
									></template>
									<template #label>Private key</template>
								</FormInput>
							</template>
						</FormSection>

						<FormSection>
							<template #label>Server Performance</template>
							<FormSwitch
								v-model="enableServerMachineStats"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.enableServerMachineStats
								}}</template>
							</FormSwitch>

							<FormSwitch
								v-model="enableIdenticonGeneration"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.enableIdenticonGeneration
								}}</template>
							</FormSwitch>
						</FormSection>

						<FormSection>
							<template #label>DeepL Translation</template>

							<FormInput
								v-model="deeplAuthKey"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-key ph-bold ph-lg"></i
								></template>
								<template #label>DeepL Auth Key</template>
							</FormInput>
							<FormSwitch v-model="deeplIsPro" class="_formBlock">
								<template #label>Pro account</template>
							</FormSwitch>
						</FormSection>

						<FormSection>
							<template #label>Libre Translate</template>

							<FormInput
								v-model="libreTranslateApiUrl"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-link ph-bold ph-lg"></i
								></template>
								<template #label
									>Libre Translate API URL</template
								>
							</FormInput>

							<FormInput
								v-model="libreTranslateApiKey"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-key ph-bold ph-lg"></i
								></template>
								<template #label
									>Libre Translate API Key</template
								>
							</FormInput>
						</FormSection>
					</div>
				</FormSuspense>
			</MkSpacer>
		</MkStickyContainer>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import FormSwitch from "@/components/form/switch.vue";
import FormInput from "@/components/form/input.vue";
import FormTextarea from "@/components/form/textarea.vue";
import FormInfo from "@/components/MkInfo.vue";
import FormSection from "@/components/form/section.vue";
import FormSplit from "@/components/form/split.vue";
import FormSuspense from "@/components/form/suspense.vue";
import MkRadios from "@/components/form/radios.vue";
import * as os from "@/os";
import { fetchInstance } from "@/instance";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

const name = ref<string | null>(null);
const description = ref<string | null>(null);
const tosUrl = ref<string | null>(null);
const maintainerName = ref<string | null>(null);
const maintainerEmail = ref<string | null>(null);
const donationLink = ref<string | null>(null);
const iconUrl = ref<string | null>(null);
const bannerUrl = ref<string | null>(null);
const logoImageUrl = ref<string | null>(null);
const backgroundImageUrl = ref<string | null>(null);
const themeColor: any = ref(null);
const defaultLightTheme: any = ref(null);
const defaultDarkTheme: any = ref(null);
const enableLocalTimeline = ref(false);
const enableGlobalTimeline = ref(false);
const enableRecommendedTimeline = ref(false);
const pinnedUsers = ref("");
const customMOTD = ref("");
const recommendedInstances = ref("");
const customSplashIcons = ref("");
const cacheRemoteFiles = ref(false);
const localDriveCapacityMb = ref(0);
const remoteDriveCapacityMb = ref(0);
const enableRegistration = ref(false);
const emailRequiredForSignup = ref(false);
const enableServiceWorker = ref(false);
const swPublicKey = ref(null);
const swPrivateKey = ref(null);
const deeplAuthKey = ref("");
const deeplIsPro = ref(false);
const libreTranslateApiUrl = ref("");
const libreTranslateApiKey = ref("");
const defaultReaction = ref("");
const defaultReactionCustom = ref("");
const enableServerMachineStats = ref(false);
const enableIdenticonGeneration = ref(false);

async function init() {
	const meta = await os.api("admin/meta");
	if (!meta) throw new Error("No meta");
	name.value = meta.name;
	description.value = meta.description;
	tosUrl.value = meta.tosUrl;
	iconUrl.value = meta.iconUrl;
	bannerUrl.value = meta.bannerUrl;
	logoImageUrl.value = meta.logoImageUrl;
	backgroundImageUrl.value = meta.backgroundImageUrl;
	themeColor.value = meta.themeColor;
	defaultLightTheme.value = meta.defaultLightTheme;
	defaultDarkTheme.value = meta.defaultDarkTheme;
	maintainerName.value = meta.maintainerName;
	maintainerEmail.value = meta.maintainerEmail;
	donationLink.value = meta.donationLink;
	enableLocalTimeline.value = !meta.disableLocalTimeline;
	enableGlobalTimeline.value = !meta.disableGlobalTimeline;
	enableRecommendedTimeline.value = !meta.disableRecommendedTimeline;
	pinnedUsers.value = meta.pinnedUsers.join("\n");
	customMOTD.value = meta.customMOTD.join("\n");
	customSplashIcons.value = meta.customSplashIcons.join("\n");
	recommendedInstances.value = meta.recommendedInstances.join("\n");
	cacheRemoteFiles.value = meta.cacheRemoteFiles;
	localDriveCapacityMb.value = meta.driveCapacityPerLocalUserMb;
	remoteDriveCapacityMb.value = meta.driveCapacityPerRemoteUserMb;
	enableRegistration.value = !meta.disableRegistration;
	emailRequiredForSignup.value = meta.emailRequiredForSignup;
	enableServiceWorker.value = meta.enableServiceWorker;
	swPublicKey.value = meta.swPublickey;
	swPrivateKey.value = meta.swPrivateKey;
	deeplAuthKey.value = meta.deeplAuthKey;
	deeplIsPro.value = meta.deeplIsPro;
	libreTranslateApiUrl.value = meta.libreTranslateApiUrl;
	libreTranslateApiKey.value = meta.libreTranslateApiKey;
	defaultReaction.value = ["⭐", "👍", "❤️"].includes(meta.defaultReaction)
		? meta.defaultReaction
		: "custom";
	defaultReactionCustom.value = ["⭐", "👍", "❤️"].includes(
		meta.defaultReaction,
	)
		? ""
		: meta.defaultReaction;
	enableServerMachineStats.value = meta.enableServerMachineStats;
	enableIdenticonGeneration.value = meta.enableIdenticonGeneration;
}

function save() {
	if (defaultReaction.value === "custom") {
		defaultReaction.value = defaultReactionCustom.value;
	}
	os.apiWithDialog("admin/update-meta", {
		name: name.value,
		description: description.value,
		tosUrl: tosUrl.value,
		iconUrl: iconUrl.value,
		bannerUrl: bannerUrl.value,
		logoImageUrl: logoImageUrl.value,
		backgroundImageUrl: backgroundImageUrl.value,
		themeColor: themeColor.value === "" ? null : themeColor.value,
		defaultLightTheme:
			defaultLightTheme.value === "" ? null : defaultLightTheme.value,
		defaultDarkTheme:
			defaultDarkTheme.value === "" ? null : defaultDarkTheme.value,
		maintainerName: maintainerName.value,
		maintainerEmail: maintainerEmail.value,
		donationLink: donationLink.value,
		disableLocalTimeline: !enableLocalTimeline.value,
		disableGlobalTimeline: !enableGlobalTimeline.value,
		disableRecommendedTimeline: !enableRecommendedTimeline.value,
		pinnedUsers: pinnedUsers.value.split("\n"),
		customMOTD: customMOTD.value.split("\n"),
		customSplashIcons: customSplashIcons.value.split("\n"),
		recommendedInstances: recommendedInstances.value.split("\n"),
		cacheRemoteFiles: cacheRemoteFiles.value,
		localDriveCapacityMb: localDriveCapacityMb.value,
		remoteDriveCapacityMb: remoteDriveCapacityMb.value,
		disableRegistration: !enableRegistration.value,
		emailRequiredForSignup: emailRequiredForSignup.value,
		enableServiceWorker: enableServiceWorker.value,
		swPublicKey: swPublicKey.value,
		swPrivateKey: swPrivateKey.value,
		deeplAuthKey: deeplAuthKey.value,
		deeplIsPro: deeplIsPro.value,
		libreTranslateApiUrl: libreTranslateApiUrl.value,
		libreTranslateApiKey: libreTranslateApiKey.value,
		defaultReaction: defaultReaction.value,
		enableServerMachineStats: enableServerMachineStats.value,
		enableIdenticonGeneration: enableIdenticonGeneration.value,
	}).then(() => {
		fetchInstance();
	});
}

const headerActions = computed(() => [
	{
		asFullButton: true,
		icon: "ph-check ph-bold ph-lg",
		text: i18n.ts.save,
		handler: save,
	},
]);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.general,
	icon: "ph-gear-six ph-bold ph-lg",
});
</script>
