<template>
	<div class="instance-info-container" :class="expanded">
		<header
			id="instance-info"
		>
			<div class="ticker" v-if="!expanded">
				<img 
					class="logo"
					:src="meta.logoImageUrl"
				/>
				<h1>
					<MkA
						to="/" class="link"
					>{{ instanceName }}</MkA>
				</h1>
			</div>
			<img class="banner" :src="meta.backgroundImageUrl" />
			<div class="content" v-if="expanded">
				<div class="header">
					<img 
						class="logo"
						:src="meta.logoImageUrl"
					/>
					<h1>
						<MkA
							to="/" class="link"
						>{{ instanceName }}</MkA>
					</h1>
				</div>
				<div v-if="meta" class="about">
					<Mfm
						class="desc"
						:class="{ collapsed: isLong && collapsed }"
						:text="meta.description || i18n.ts.introMisskey"
					></Mfm>
					<XShowMoreButton
						v-if="isLong"
						v-model="collapsed"
					></XShowMoreButton>
				</div>

				<section>
					<div class="_formLinksGrid">
						<MkButton
							primary gradate
							rounded
							@click="signup"
						>
							<i
								class="ph-sign-in ph-bold"
							></i>
							Sign Up
						</MkButton>
						<MkButton
							rounded
							@click="signin"
						>
							<i
								class="ph-sign-out ph-bold"
							></i>
							Log In
						</MkButton>
						<MkButton
							:link="true"
							:behavior="'browser'"
							rounded
							full
							to="https://calckey.org/join/"
							class="_full"
						>
							<i
								class="ph-airplane-tilt ph-bold"
							></i>
							Find another server
						</MkButton>
					</div>
				</section>

				<p class="_caption">
					Powered by Calckey, part of an interconnected network of communities in the Fediverse
				</p>

				<FormSection>
					<div class="_formLinksGrid">
						<MkKeyValue :text="meta.maintainerName">
							<template #key>{{
								i18n.ts.administrator
							}}</template>
						</MkKeyValue>
						<MkKeyValue>
							<template #key>{{
								i18n.ts.contact
							}}</template>
							<template #value>
								<MkMention :to="'mailto:' + meta.maintainerEmail" :icon="'envelope'">
									{{ meta.maintainerEmail }}
								</MkMention>
							</template>
						</MkKeyValue>
					</div>
				</FormSection>

				<FormSection>
					<div class="_formLinksGrid">
						<FormLink v-if="meta?.tosUrl" :to="meta.tosUrl"
							><template #icon
								><i
									class="ph-scroll ph-bold ph-lg"
								></i></template
							>{{ i18n.ts.tos }}
						</FormLink>
						<!-- <FormLink v-if="meta?.tosUrl" :to="meta.tosUrl"
							><template #icon
								><i
									class="ph-prohibit ph-bold ph-lg"
								></i></template
							>Blocked servers
						</FormLink> -->
					</div>
				</FormSection>

				<FormSection class="announcements">
					<h3>{{ i18n.ts.announcements }}</h3>
					<MkPagination
						v-slot="{ items }"
						:pagination="announcements"
						class="list"
					>
						<article
							v-for="announcement in items"
							:key="announcement.id"
							class="item"
						>
							<div class="title">
								{{ announcement.title }}
							</div>
							<div class="content">
								<Mfm :text="announcement.text" />
								<img
									v-if="announcement.imageUrl"
									:src="announcement.imageUrl"
									alt="announcement image"
								/>
							</div>
						</article>
					</MkPagination>
				</FormSection>
				<div v-if="poweredBy" class="powered-by">
					<b
						><MkA to="/">{{ host }}</MkA></b
					>
					<small
						>Powered by
						<a href="https://calckey.org/" target="_blank"
							>Calckey</a
						></small
					>
				</div>
			</div>
		</header>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { host, instanceName } from "@/config";
import * as os from "@/os";
import MkPagination from "@/components/MkPagination.vue";
import MkButton from "@/components/MkButton.vue";
import FormSection from "@/components/form/section.vue";
import FormLink from "@/components/form/link.vue";
import XShowMoreButton from "@/components/MkShowMoreButton.vue";
import { i18n } from "@/i18n";
import { DetailedInstanceMetadata } from "calckey-js/built/entities";
import XSigninDialog from "@/components/MkSigninDialog.vue";
import XSignupDialog from "@/components/MkSignupDialog.vue";
import MkKeyValue from "@/components/MkKeyValue.vue";
import MkMention from "@/components/MkMention.vue";

let expanded = $ref(false);

matchMedia("(max-width: 1000px)").onchange = (mql) => {
	console.log("ran");
	expanded = !mql.matches;
};

expanded = true;

defineProps<{
	poweredBy?: boolean,
}>()

const announcements = {
	endpoint: "announcements",
	limit: 10,
}
let meta = $ref<DetailedInstanceMetadata>();

let isLong = $ref(false);
let collapsed = $ref(!isLong);

os.api("meta", { detail: true }).then((res) => {
	meta = res;
	isLong = meta.description && (meta.description.length > 500);
});

function signin() {
	os.popup(
		XSigninDialog,
		{
			autoSet: true,
		},
		{},
		"closed"
	);
};

function signup() {
	os.popup(
		XSignupDialog,
		{
			autoSet: true,
		},
		{},
		"closed"
	);
};
</script>

<style lang="scss" scoped>

</style>
