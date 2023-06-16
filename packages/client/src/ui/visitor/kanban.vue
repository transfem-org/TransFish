<template>
	<header v-if="mini" class="mini-header">
		<img 
			class="logo"
			:src="meta.logoImageUrl"
		/>
		<h1>
			<MkA
				to="/" class="link"
			>{{ instanceName }}</MkA>
		</h1>
		<MkButton
			class="home"
			:to="'/'"
			link
			rounded
		>
			<i class="ph-house ph-bold ph-lg"></i>
			{{ i18n.ts.home }}
		</MkButton>
	</header>
	<div class="instance-info-container"
		v-else
		:class="{ sticky }"
	>
		<header
			id="instance-info"
			v-on:scroll.passive="onScroll"
		>
			<div class="banner">
				<img :src="meta.backgroundImageUrl" />
			</div>
			<div class="content">
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
				<!-- <MkA class="_buttonIcon home" :to="'/'" v-tooltip="i18n.ts.home">
					<i class="ph-house ph-bold ph-lg"></i>
				</MkA> -->
				<button class="_buttonIcon menu" @click="showMenu" v-tooltip="i18n.ts.more">
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
						<MkButton
							primary gradate
							rounded
							@click="signup"
						>
							<i
								class="ph-sign-in ph-bold"
							></i>
							{{ i18n.ts.signup }}
						</MkButton>
						<MkButton
							rounded
							@click="signin"
						>
							<i
								class="ph-sign-out ph-bold"
							></i>
							{{ i18n.ts.login }}
						</MkButton>
						<MkButton
							:link="true"
							:behavior="'browser'"
							rounded
							to="https://calckey.org/join/"
						>
							<i
								class="ph-airplane-tilt ph-bold"
							></i>
							{{ i18n.ts.findAnotherInstance }}
						</MkButton>
						<MkButton
							v-if="!sticky"
							:link="true"
							:behavior="'browser'"
							rounded
							to="https://calckey.org/apps/"
						>
							<i
								class="ph-device-mobile ph-bold"
							></i>
							{{ i18n.ts.apps }}
						</MkButton>
					</div>
				</section>

				<footer>
					<p class="_caption">
						{{ i18n.ts.poweredBy }}
					</p>

					<FormSection v-if="announcement">
						<FormLink :to="'/announcements'"
							naked
							><template #icon
								><i
									class="ph-megaphone-simple ph-bold ph-lg _flip"
								></i></template
							>{{ announcement.title }}:
							<span style="opacity: 0.8; font-weight: 400;">{{ announcement.text }}</span>
						</FormLink>
					</FormSection>
	
					<FormSection v-if="meta.maintainerName || meta.maintainerEmail">
						<div class="_formLinksGrid">
							<MkKeyValue v-if="meta.maintainerName" :text="meta.maintainerName">
								<template #key>{{
									i18n.ts.administrator
								}}</template>
							</MkKeyValue>
							<MkKeyValue v-if="meta.maintainerEmail">
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
	
					<FormSection v-if="meta.tosUrl">
						<div class="_formLinksGrid">
							<FormLink v-if="meta.tosUrl" :to="meta.tosUrl"
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
					<!-- <FormSection>
						<div class="_formLinksGridFlex">
							<FormLink>
								{{ i18n.ts.timelines }}
								<template #suffix>
									{{
										`${ i18n.ts._timelines.home },` +
										meta.disableLocalTimeline ? null : `${ i18n.ts._timelines.local },` +
										meta.disableLocalTimeline ? null : `${ i18n.ts._timelines.social },` +
										meta.disableRecommendedTimeline ? null : `${ i18n.ts._timelines.recommended },` +
										meta.disableGlobalTimeline ? null : `${ i18n.ts._timelines.global }`
									}}
								</template>
							</FormLink>
							<FormLink>
								{{ i18n.ts.driveCapacityPerLocalAccount }}
								<template #suffix>
									{{ meta.driveCapacityPerLocalUserMb }}MB
								</template>
							</FormLink>
							<FormLink>
								{{ i18n.ts.characterLimit }}
								<template #suffix>
									{{ i18n.t("_cw.chars", { count: meta.maxNoteTextLength }) }}
								</template>
							</FormLink>
						</div>
					</FormSection> -->
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
import { i18n } from "@/i18n";
import { DetailedInstanceMetadata } from "calckey-js/built/entities";
import { openHelpMenu_ } from "@/scripts/helpMenu";
import XSigninDialog from "@/components/MkSigninDialog.vue";
import XSignupDialog from "@/components/MkSignupDialog.vue";
import MkKeyValue from "@/components/MkKeyValue.vue";
import MkMention from "@/components/MkMention.vue";

defineProps<{
	sticky?: boolean;
	mini?: boolean;
}>();

let meta = $ref<DetailedInstanceMetadata>();

let isLong = $ref(false);
let collapsed = $ref(!isLong);

os.api("meta", { detail: true }).then((res) => {
	meta = res;
	isLong = meta.description && (meta.description.length > 500);
});

let announcement = $ref();
os.api("announcements", {
	limit: 1
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
function showMenu(ev) {
	openHelpMenu_(ev);
}
</script>

<style lang="scss" scoped>
.mini-header {
	padding: 0 12px;
	background: var(--panel);
	display: flex;
	align-items: center;
	gap: 1em;
	height: 60px;
	img {
		height: 40px;
		min-width: 40px;
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
	}
	margin-left: -1px;
	box-shadow: 0 0 48px -24px rgba(0,0,0,0.1);
	z-index: 9000;
}
#instance-info {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: var(--accent);
	height: max-content;
	min-height: 100%;
	transition: transform .4s cubic-bezier(.5,0,0,1);
	.banner {
		position: sticky;
		top: 0;
		width: calc(100% + 2px);
		margin-inline: -1px;
		padding-top: 56.25%;
		mask: linear-gradient(to bottom, black, calc(100% - 50px), transparent);
		transition: min-height .4s, max-height .4s, filter .7s;
		img {
			position: absolute;
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: center;
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
		margin-top: calc(0px - var(--radius));
		padding: 0 var(--margin);
		text-align: center;
		flex-grow: 1;
		// max-width: 600px;
		margin-inline: auto;
		width: 100%;
		box-sizing: border-box;
		
		> .header {
			position: relative;
			margin-top: -50px;
			&::before {
				content: "";
				position: absolute;
				inset: -5px calc(0px - var(--margin));
				bottom: -100px;
				backdrop-filter: blur(60px);
				filter: brightness(1.2);
				pointer-events: none;
				z-index: -1;
				clip-path: inset(55px 0 0 0 round var(--radius));
				mask: linear-gradient(transparent 55px, #000 50px, transparent);
				-webkit-mask: linear-gradient(transparent 55px, #000 50px, transparent);
			}
			> .logo {
				height: 90px;
				min-width: 90px;
				max-width: 100%;
				border-radius: var(--radius);
				margin-top: -5px;
				transition: transform .4s cubic-bezier(0.5,0,0,1);
			}
			> h1 {
				margin-block: .7em;
				font-size: 1.5em;
				color: var(--fgHighlighted)
			}
		}
		.menu, .home {
			position: absolute;
			top: 10px;
			right: 10px;
			width: 42px;
			height: 42px;
			border-radius: 100px;
			background: var(--buttonBg)
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
	grid-template-columns: repeat(2,minmax(150px,1fr));
	text-align: initial;
}
</style>
