<template>
	<div class="instance-info-container"
		:class="{ sticky }"
	>
		<header
			id="instance-info"
			v-on:scroll.passive="onScroll"
		>
			<!-- <div class="ticker" v-if="!expanded">
				<img 
					class="logo"
					:src="meta.logoImageUrl"
				/>
				<div>
					<h1>
						<MkA
							to="/" class="link"
						>{{ instanceName }}</MkA>
					</h1>
					<p>{{ meta.description || i18n.ts.introMisskey }}</p>
				</div>
				<MkButton
					primary
					rounded
					@click.stop="expanded = true"
				>{{ i18n.ts.instanceInfo }}</MkButton>
			</div> -->
			<img class="banner" :src="meta.backgroundImageUrl" />
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
				<button class="_button _acrylic menu" @click="showMenu">
					<i class="ph-dots-three-outline ph-bold ph-lg"></i>
				</button>
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
				</footer>
				<!-- <FormSection class="announcements">
					<h4>{{ i18n.ts.announcements }}</h4>
					<MkPagination
						v-slot="{ items }"
						:pagination="announcements"
						class="list"
					>
						<article
							v-for="announcement in items"
							:key="announcement.id"
							class="item _card"
						>
							<h4 class="_title">
								{{ announcement.title }}
							</h4>
							<div class="_content">
								<Mfm :text="announcement.text" />
								<img
									v-if="announcement.imageUrl"
									:src="announcement.imageUrl"
									alt="announcement image"
								/>
							</div>
						</article>
					</MkPagination>
				</FormSection> -->
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
import { openHelpMenu_ } from "@/scripts/helpMenu";
import XSigninDialog from "@/components/MkSigninDialog.vue";
import XSignupDialog from "@/components/MkSignupDialog.vue";
import MkKeyValue from "@/components/MkKeyValue.vue";
import MkMention from "@/components/MkMention.vue";

// let expanded = $ref(window.innerWidth >= 1000);

// matchMedia("(max-width: 1000px)").onchange = (mql) => {
// 	expanded = !mql.matches;
// };

defineProps<{
	sticky?: boolean;
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
function onScroll(ev) {
	if (ev.target.scrollTop == 0) {
		expanded = false;
	}
}
</script>

<style lang="scss" scoped>
.instance-info-container {
	&.sticky {
		position: sticky;
		top: 0;
		max-height: 100vh;
		overflow: hidden auto;	
		min-width: 400px;
		width: 450px;
	}
	margin-left: -1px;
	border-right: 1px solid var(--divider);
	box-shadow: 0 0 48px -24px rgba(0,0,0,0.1);
	z-index: 9000;
}
#instance-info {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: var(--accent);
	transition: transform .4s cubic-bezier(.5,0,0,1);
	.banner {
		position: sticky;
		top: 0;
		width: calc(100% + 2px);
		margin-inline: -1px;
		min-height: 250px;
		max-height: 250px;
		object-fit: cover;
		object-position: center;
		mask: linear-gradient(to bottom, black, calc(100% - 50px), transparent);
		transition: min-height .4s, max-height .4s, filter .7s;
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
		max-width: 600px;
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
		.menu {
			position: absolute;
			top: 10px;
			right: 10px;
			width: 42px;
			height: 42px;
			border-radius: 100px;
			background: var(--buttonBg)
		}
		.about {
			position: relative;
			font-size: 1.05em;
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
