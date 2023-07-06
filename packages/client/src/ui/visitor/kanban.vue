<template>
	<header v-if="mini" class="mini-header">
		<img
			class="logo"
			:src="
				meta.logoImageUrl ||
				$instance.iconUrl ||
				$instance.faviconUrl ||
				'/favicon.ico'
			"
		/>
		<h1 v-if="!meta.logoImageUrl">
			<MkA to="/" class="link">{{ instanceName }}</MkA>
		</h1>
		<MkButton class="home" :to="'/'" link rounded>
			<i class="ph-house ph-bold ph-lg"></i>
			{{ i18n.ts.home }}
		</MkButton>
	</header>
	<div
		class="instance-info-container"
		v-else
		:class="{ sticky, wallpaper: meta.backgroundImageUrl }"
	>
		<header id="instance-info" v-on:scroll.passive="onScroll">
			<div class="banner" v-if="meta.bannerUrl">
				<img :src="meta.bannerUrl" />
			</div>
			<div class="content">
				<div class="header">
					<img
						class="logo"
						:src="
							$instance.iconUrl ||
							$instance.faviconUrl ||
							'/favicon.ico'
						"
					/>
					<img
						v-if="meta.logoImageUrl"
						:src="meta.logoImageUrl"
						class="logo"
					/>
					<h1 v-else>
						<MkA to="/" class="link">{{ instanceName }}</MkA>
					</h1>
				</div>
				<!-- <MkA class="_buttonIcon home" :to="'/'" v-tooltip="i18n.ts.home">
					<i class="ph-house ph-bold ph-lg"></i>
				</MkA> -->
				<button
					class="_buttonIcon menu"
					@click="showMenu"
					v-tooltip="i18n.ts.more"
				>
					<i class="ph-dots-three-outline ph-bold ph-lg"></i>
				</button>
				<div v-if="meta" class="about">
					<Mfm
						class="desc"
						:class="{ collapsed: isLong && collapsed }"
						:text="meta.description || i18n.ts.introMisskey"
						:advancedMfm="false"
					></Mfm>
					<XShowMoreButton
						v-if="isLong"
						v-model="collapsed"
					></XShowMoreButton>
				</div>

				<section>
					<div class="_formLinksGridFlex">
						<MkButton primary gradate rounded @click="signup">
							<i class="ph-sign-in ph-bold"></i>
							{{ i18n.ts.signup }}
						</MkButton>
						<MkButton rounded @click="signin">
							<i class="ph-sign-out ph-bold"></i>
							{{ i18n.ts.login }}
						</MkButton>
						<MkButton
							:link="true"
							:behavior="'browser'"
							rounded
							external
							to="https://calckey.org/join/"
						>
							<i class="ph-airplane-tilt ph-bold"></i>
							{{ i18n.ts.findOtherInstance }}
						</MkButton>
						<MkButton
							v-if="deviceKind !== 'desktop'"
							:link="true"
							:behavior="'browser'"
							rounded
							to="https://calckey.org/apps/"
						>
							<i class="ph-device-mobile ph-bold"></i>
							{{ i18n.ts.apps }}
						</MkButton>
					</div>
				</section>

				<footer>
					<p class="_caption">
						{{ i18n.ts.poweredBy }}
					</p>

					<FormSection v-if="announcement">
						<FormLink :to="'/announcements'" naked
							><template #icon
								><i
									class="ph-megaphone-simple ph-bold ph-lg _flip"
								></i></template
							>{{ announcement.title }}:
							<span style="opacity: 0.8; font-weight: 400">{{
								announcement.text
							}}</span>
						</FormLink>
					</FormSection>

					<FormSection
						v-if="meta.maintainerName || meta.maintainerEmail"
					>
						<div class="_formLinksGrid">
							<MkKeyValue
								v-if="meta.maintainerName"
								:text="meta.maintainerName"
							>
								<template #key>{{
									i18n.ts.administrator
								}}</template>
							</MkKeyValue>
							<MkKeyValue v-if="meta.maintainerEmail">
								<template #key>{{ i18n.ts.contact }}</template>
								<template #value>
									<MkMention
										:to="'mailto:' + meta.maintainerEmail"
										:icon="'envelope'"
									>
										{{ meta.maintainerEmail }}
									</MkMention>
								</template>
							</MkKeyValue>
						</div>
					</FormSection>

					<FormSection v-if="meta.tosUrl">
						<div class="_formLinksGridFlex">
							<FormLink
								v-if="meta.tosUrl"
								:to="meta.tosUrl"
								external
								><template #icon
									><i
										class="ph-scroll ph-bold ph-lg"
									></i></template
								>{{ i18n.ts.tos }}
							</FormLink>
							<!-- TODO: Blocked servers list -->
							<!-- <FormLink v-if="meta?.tosUrl" :to="meta.tosUrl"
								><template #icon
									><i
										class="ph-prohibit ph-bold ph-lg"
									></i></template
								>Blocked servers
							</FormLink> -->
						</div>
					</FormSection>
					<FormSection>
						<div class="_formLinksGridFlex">
							<FormLink wrap>
								{{ i18n.ts.timelines }}
								<template #suffix>{{
									`${i18n.ts._timelines.home},` +
									(meta.disableLocalTimeline
										? ""
										: ` ${i18n.ts._timelines.local},`) +
									(meta.disableLocalTimeline
										? ""
										: ` ${i18n.ts._timelines.social},`) +
									(meta.disableRecommendedTimeline
										? ""
										: ` ${i18n.ts._timelines.recommended},`) +
									(meta.disableGlobalTimeline
										? ""
										: ` ${i18n.ts._timelines.global}`)
								}}</template>
							</FormLink>
							<FormLink wrap>
								{{ i18n.ts.characterLimit }}
								<template #suffix>{{
									i18n.t("_cw.chars", {
										count: meta.maxNoteTextLength,
									})
								}}</template>
							</FormLink>
							<FormLink wrap>
								{{ i18n.ts.advancedSearch }}
								<template #suffix>{{
									meta.features.searchFilters
										? i18n.ts.yes
										: i18n.ts.no
								}}</template>
							</FormLink>
							<FormLink wrap>
								{{ i18n.ts.storagePerUser }}
								<template #suffix>{{
									bytes((meta.driveCapacityPerLocalUserMb * 1024 * 1024), 1)
								}}</template>
							</FormLink>
							<FormLink wrap>
								{{ i18n.ts.pushNotification }}
								<template #suffix>{{
									meta.features.serviceWorker
										? i18n.ts.yes
										: i18n.ts.no
								}}</template>
							</FormLink>

							<!-- <MkKeyValue 
								:text="`${ i18n.ts._timelines.home },` +
										(meta.disableLocalTimeline ? '' : ` ${ i18n.ts._timelines.local },`) +
										(meta.disableLocalTimeline ? '' : ` ${ i18n.ts._timelines.social },`) +
										(meta.disableRecommendedTimeline ? '' : ` ${ i18n.ts._timelines.recommended },`) +
										(meta.disableGlobalTimeline ? '' : ` ${ i18n.ts._timelines.global }`)"
							>
								<template #key>
									{{ i18n.ts.timelines }}
								</template>
							</MkKeyValue>
							<MkKeyValue :text="i18n.t('_cw.chars', { count: meta.maxNoteTextLength })">
								<template #key>
									{{ i18n.ts.characterLimit }}
								</template>
							</MkKeyValue>
							<MkKeyValue :text="meta.features.searchFilters ? i18n.ts.yes : i18n.ts.no">
								<template #key>
									{{ i18n.ts.advancedSearch }}
								</template>
							</MkKeyValue>
							<MkKeyValue :text="meta.driveCapacityPerLocalUserMb + 'MB'">
								<template #key>
									{{ i18n.ts.driveCapacityPerLocalAccount }}
								</template>
							</MkKeyValue>
							<MkKeyValue :text="meta.features.serviceWorker ? i18n.ts.yes : i18n.ts.no">
								<template #key>
									{{ i18n.ts.pushNotification }}
								</template>
							</MkKeyValue> -->
						</div>
					</FormSection>
				</footer>
			</div>
		</header>
	</div>
</template>

<script lang="ts" setup>
import { instanceName } from "@/config";
import * as os from "@/os";
import MkButton from "@/components/MkButton.vue";
import FormSection from "@/components/form/section.vue";
import FormLink from "@/components/form/link.vue";
import XShowMoreButton from "@/components/MkShowMoreButton.vue";
import bytes from "@/filters/bytes";
import { i18n } from "@/i18n";
import { DetailedInstanceMetadata } from "calckey-js/built/entities";
import { openHelpMenu_ } from "@/scripts/helpMenu";
import XSigninDialog from "@/components/MkSigninDialog.vue";
import XSignupDialog from "@/components/MkSignupDialog.vue";
import MkKeyValue from "@/components/MkKeyValue.vue";
import MkMention from "@/components/MkMention.vue";
import { deviceKind } from "@/scripts/device-kind";

const props = defineProps<{
	sticky?: boolean;
	mini?: boolean;
}>();

let meta = $ref<DetailedInstanceMetadata>();

let isLong = $ref(false);
let collapsed = $ref(!isLong);
const accentColor = getComputedStyle(document.documentElement).getPropertyValue(
	"--accent"
);
let wallpaper = $ref();

os.api("meta", { detail: true }).then((res) => {
	meta = res;
	isLong = meta.description && meta.description.length > 500;
	wallpaper =
		meta.backgroundImageUrl && props.sticky
			? `url(${meta.backgroundImageUrl})`
			: meta.themeColor ?? accentColor;
	// wallpaper = meta.backgroundImageUrl ? null : meta.themeColor ?? accentColor;
});

let announcement = $ref();
os.api("announcements", {
	limit: 1,
}).then((res) => {
	announcement = res[0];
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
}

function signup() {
	os.popup(
		XSignupDialog,
		{
			autoSet: true,
		},
		{},
		"closed"
	);
}
function showMenu(ev) {
	openHelpMenu_(ev);
}
</script>

<style lang="scss" scoped>
.mini-header {
	padding: 0 12px;
	display: flex;
	align-items: center;
	gap: 1em;
	height: 60px;
	img {
		height: 40px;
		min-width: 40px;
		object-fit: contain;
	}
	h1 {
		margin: 0;
		font-size: 1.2em;
		width: 0;
		flex-grow: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	:deep(._button) {
		margin-left: auto;
	}
}
.instance-info-container {
	margin-top: -55px;
	&.sticky {
		position: sticky;
		top: 0;
		max-height: 100vh;
		overflow: hidden auto;
		min-width: 400px;
		width: 470px;
		border-right: 1px solid var(--divider);
		.content {
			max-width: 450px;
		}
		&.wallpaper {
			width: 500px;
		}
	}
	margin-left: -1px;
	box-shadow: 0 0 48px -24px rgba(0, 0, 0, 0.1);
	z-index: 9000;
}
#instance-info {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: v-bind("wallpaper");
	background-position: center;
	background-size: cover;
	background-attachment: fixed;
	height: max-content;
	min-height: 100%;
	transition: transform 0.4s cubic-bezier(0.5, 0, 0, 1);
	.banner {
		position: sticky;
		top: 0;
		width: calc(100% + 2px);
		margin-inline: -1px;
		padding-top: min(56.25%, 70vh);
		margin-bottom: calc(-120px - var(--radius));
		mask: linear-gradient(to bottom, black, calc(100% - 50px), transparent);
		-webkit-mask: linear-gradient(
			to bottom,
			black,
			calc(100% - 50px),
			transparent
		);
		transition: min-height 0.4s, max-height 0.4s, filter 0.7s;
		img {
			position: absolute;
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: center;
			inset: 0;
		}
		& ~ .content > .header {
			&::before {
				opacity: 1 !important;
			}
			> .logo {
				margin-top: -10px !important;
			}
		}
	}
	> .content {
		--margin: 32px;
		--radius: 16px;
		display: flow-root;
		position: relative;
		z-index: 2;
		background: var(--bg);
		border-radius: var(--radius) var(--radius) 0 0;
		padding: 0 var(--margin);
		padding-bottom: var(--margin);
		text-align: center;
		flex-grow: 1;
		margin-top: 80px;
		// max-width: 600px;
		margin-inline: auto;
		width: 100%;
		box-sizing: border-box;
		// &.wallpaper {
		// 	flex-grow: 0;
		// 	border-radius: var(--radius);
		// }
		@media (max-width: 1100px) {
			&:first-child {
				margin-top: 140px;
			}
		}
		> .header {
			position: relative;
			margin-top: -30px;
			&::before {
				content: "";
				position: absolute;
				inset: -25px calc(0px - var(--margin));
				bottom: -100px;
				backdrop-filter: blur(60px);
				filter: brightness(1.2);
				pointer-events: none;
				z-index: -1;
				opacity: 0.5;
				clip-path: inset(55px 0 0 0 round var(--radius));
				mask: linear-gradient(transparent 55px, #000 50px, transparent);
				-webkit-mask: llinear-gradient(
					transparent 55px,
					#000 50px,
					transparent
				);
			}
			> .logo {
				height: 80px;
				min-width: 80px;
				max-width: 100%;
				border-radius: 6px;
				margin-top: -5px;
				transition: transform 0.4s cubic-bezier(0.5, 0, 0, 1);
				&:last-child {
					display: block;
					margin-inline: auto;
					margin-block: 0.5em 1em !important;
				}
			}
			> h1 {
				margin-block: 0.7em;
				font-size: 1.5em;
				color: var(--fgHighlighted);
			}
		}
		.menu,
		.home {
			position: absolute;
			top: 10px;
			right: 10px;
			width: 42px;
			height: 42px;
			border-radius: 100px;
			background: var(--buttonBg);
		}
		.home {
			right: unset;
			left: 10px;
		}
		.about {
			position: relative;
			.desc {
				display: block;
			}
			.collapsed {
				position: relative;
				max-height: calc(9em + 50px);
				mask: linear-gradient(black calc(100% - 64px), transparent);
				-webkit-mask: linear-gradient(
					black calc(100% - 64px),
					transparent
				);
			}
		}
		.announcements {
			text-align: initial;
		}
		> :not(.header) {
			max-width: 600px;
			margin-inline: auto;
		}
	}
}
section {
	margin-top: 2em;
}
._formLinksGrid {
	grid-template-columns: repeat(2, minmax(150px, 1fr));
	text-align: initial;
}
._formLinksGridFlex {
	text-align: initial;
}
</style>
