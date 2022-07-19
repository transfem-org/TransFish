<template>
<div v-if="meta" class="rsqzvsbo">
	<div class="top">
		<MkFeaturedPhotos class="bg"/>
		<XTimeline class="tl"/>
		<div class="shape1"></div>
		<div class="shape2"></div>
		<img src="/client-assets/misskey.svg" class="misskey"/>
		<div class="emojis">
			<MkEmoji :normal="true" :no-style="true" emoji="⭐"/>
			<MkEmoji :normal="true" :no-style="true" emoji="❤"/>
			<MkEmoji :normal="true" :no-style="true" emoji="😆"/>
			<MkEmoji :normal="true" :no-style="true" emoji="🎉"/>
			<MkEmoji :normal="true" :no-style="true" emoji="🍮"/>
		</div>
		<div class="main">
			<img :src="$instance.iconUrl || $instance.faviconUrl || '/favicon.ico'" alt="" class="icon"/>
			<button class="_button _acrylic menu" @click="showMenu"><i class="fas fa-ellipsis-h"></i></button>
			<div class="fg">
				<h1>
					<!-- 背景色によってはロゴが見えなくなるのでとりあえず無効に -->
					<!-- <img class="logo" v-if="meta.logoImageUrl" :src="meta.logoImageUrl"><span v-else class="text">{{ instanceName }}</span> -->
					<span class="text">{{ instanceName }}</span>
				</h1>
				<div class="about">
					<!-- eslint-disable-next-line vue/no-v-html -->
					<div class="desc" v-html="meta.description || i18n.ts.headlineMisskey"></div>
				</div>
				<div class="action">
					<MkButton inline rounded gradate data-cy-signup style="margin-right: 12px;" @click="signup()">{{ i18n.ts.signup }}</MkButton>
					<MkButton inline rounded data-cy-signin @click="signin()">{{ i18n.ts.login }}</MkButton>
					<MkButton inline rounded style="margin-left: 12px;" onclick="window.location.href='/timeline'">Explore</MkButton>
				</div>
			</div>
		</div>
		<div v-if="instances" class="federation">
			<MarqueeText :duration="40">
				<MkA v-for="instance in instances" :key="instance.id" :class="$style.federationInstance" :to="`/instance-info/${instance.host}`" behavior="window">
					<!--<MkInstanceCardMini :instance="instance"/>-->
					<img v-if="instance.iconUrl" class="icon" :src="instance.iconUrl" alt=""/>
					<span class="name _monospace">{{ instance.host }}</span>
				</MkA>
			</MarqueeText>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { toUnicode } from 'punycode/';
import XTimeline from './welcome.timeline.vue';
import MarqueeText from '@/components/marquee.vue';
import XSigninDialog from '@/components/signin-dialog.vue';
import XSignupDialog from '@/components/signup-dialog.vue';
import MkButton from '@/components/ui/button.vue';
import XNote from '@/components/note.vue';
import MkFeaturedPhotos from '@/components/featured-photos.vue';
import { host, instanceName } from '@/config';
import * as os from '@/os';
import number from '@/filters/number';
import { i18n } from '@/i18n';

let meta = $ref();
let stats = $ref();
let tags = $ref();
let onlineUsersCount = $ref();
let instances = $ref();

os.api('meta', { detail: true }).then(_meta => {
	meta = _meta;
});

os.api('stats').then(_stats => {
	stats = _stats;
});

os.api('get-online-users-count').then(res => {
	onlineUsersCount = res.count;
});

os.api('hashtags/list', {
	sort: '+mentionedLocalUsers',
	limit: 8,
}).then(_tags => {
	tags = _tags;
});

os.api('federation/instances', {
	sort: '+pubSub',
	limit: 20,
}).then(_instances => {
	instances = _instances;
});

function signin() {
	os.popup(XSigninDialog, {
		autoSet: true,
	}, {}, 'closed');
}

function signup() {
	os.popup(XSignupDialog, {
		autoSet: true,
	}, {}, 'closed');
}

function showMenu(ev) {
	os.popupMenu([{
		text: i18n.ts.instanceInfo,
		icon: 'fas fa-info-circle',
		action: () => {
			os.pageWindow('/about');
		},
	}, {
		text: i18n.ts.aboutMisskey,
		icon: 'fas fa-info-circle',
		action: () => {
			os.pageWindow('/about-misskey');
		},
	}, null, {
		text: i18n.ts.help,
		icon: 'fas fa-question-circle',
		action: () => {
			window.open('https://misskey-hub.net/help.md', '_blank');
		},
	}], ev.currentTarget ?? ev.target);
}
</script>

<style lang="scss" scoped>
.rsqzvsbo {
	> .top {
		display: flex;
		text-align: center;
		min-height: 100vh;
		box-sizing: border-box;
		padding: 16px;

		> .bg {
			position: absolute;
			top: 0;
			right: 0;
			width: 80%; // 100%からshapeの幅を引いている
			height: 100%;
		}

		> .tl {
			position: absolute;
			top: 0;
			bottom: 0;
			right: 64px;
			margin: auto;
			width: 500px;
			height: calc(100% - 128px);
			overflow: hidden;
			-webkit-mask-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 128px, rgba(0,0,0,1) calc(100% - 128px), rgba(0,0,0,0) 100%);
			mask-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 128px, rgba(0,0,0,1) calc(100% - 128px), rgba(0,0,0,0) 100%);

			@media (max-width: 1200px) {
				display: none;
			}
		}

		> .shape1 {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: var(--accent);
			clip-path: polygon(100% 0%, 0% 0% , 0% 66.00%, 1% 65.96%, 2% 65.84%, 3% 65.63%, 4% 65.35%, 5% 64.99%, 6% 64.55%, 7% 64.04%, 8% 63.46%, 9% 62.81%, 10% 62.09%, 11% 61.31%, 12% 60.47%, 13% 59.58%, 14% 58.64%, 15% 57.66%, 16% 56.64%, 17% 55.58%, 18% 54.50%, 19% 53.39%, 20% 52.27%, 21% 51.13%, 22% 49.99%, 23% 48.85%, 24% 47.71%, 25% 46.59%, 26% 45.48%, 27% 44.40%, 28% 43.34%, 29% 42.32%, 30% 41.34%, 31% 40.40%, 32% 39.51%, 33% 38.68%, 34% 37.90%, 35% 37.18%, 36% 36.53%, 37% 35.95%, 38% 35.44%, 39% 35.00%, 40% 34.64%, 41% 34.36%, 42% 34.16%, 43% 34.04%, 44% 34.00%, 45% 34.04%, 46% 34.17%, 47% 34.37%, 48% 34.65%, 49% 35.02%, 50% 35.46%, 51% 35.97%, 52% 36.55%, 53% 37.21%, 54% 37.92%, 55% 38.70%, 56% 39.54%, 57% 40.43%, 58% 41.37%, 59% 42.36%, 60% 43.38%, 61% 44.43%, 62% 45.52%, 63% 46.63%, 64% 47.75%, 65% 48.89%, 66% 50.03%, 67% 51.17%, 68% 52.31%, 69% 53.43%, 70% 54.54%, 71% 55.62%, 72% 56.68%, 73% 57.70%, 74% 58.68%, 75% 59.62%, 76% 60.50%, 77% 61.34%, 78% 62.12%, 79% 62.83%, 80% 63.48%, 81% 64.06%, 82% 64.57%, 83% 65.00%, 84% 65.36%, 85% 65.64%, 86% 65.84%, 87% 65.96%, 88% 66.00%, 89% 65.96%, 90% 65.83%, 91% 65.63%, 92% 65.34%, 93% 64.98%, 94% 64.54%, 95% 64.02%, 96% 63.44%, 97% 62.78%, 98% 62.06%, 99% 61.28%, 100% 60.44%);
		}
		> .shape2 {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: var(--accent);
			clip-path: polygon(100% 0%, 0% 0% , 0% 78.50%, 1% 78.45%, 2% 78.30%, 3% 78.04%, 4% 77.69%, 5% 77.24%, 6% 76.69%, 7% 76.05%, 8% 75.32%, 9% 74.51%, 10% 73.61%, 11% 72.64%, 12% 71.59%, 13% 70.48%, 14% 69.31%, 15% 68.08%, 16% 66.80%, 17% 65.48%, 18% 64.12%, 19% 62.74%, 20% 61.33%, 21% 59.91%, 22% 58.49%, 23% 57.06%, 24% 55.64%, 25% 54.23%, 26% 52.85%, 27% 51.50%, 28% 50.18%, 29% 48.90%, 30% 47.67%, 31% 46.50%, 32% 45.39%, 33% 44.34%, 34% 43.37%, 35% 42.48%, 36% 41.66%, 37% 40.94%, 38% 40.30%, 39% 39.75%, 40% 39.30%, 41% 38.95%, 42% 38.70%, 43% 38.55%, 44% 38.50%, 45% 38.55%, 46% 38.71%, 47% 38.96%, 48% 39.32%, 49% 39.77%, 50% 40.32%, 51% 40.96%, 52% 41.69%, 53% 42.51%, 54% 43.41%, 55% 44.38%, 56% 45.43%, 57% 46.54%, 58% 47.72%, 59% 48.94%, 60% 50.22%, 61% 51.54%, 62% 52.90%, 63% 54.28%, 64% 55.69%, 65% 57.11%, 66% 58.54%, 67% 59.97%, 68% 61.38%, 69% 62.79%, 70% 64.17%, 71% 65.53%, 72% 66.85%, 73% 68.12%, 74% 69.35%, 75% 70.52%, 76% 71.63%, 77% 72.67%, 78% 73.64%, 79% 74.54%, 80% 75.35%, 81% 76.08%, 82% 76.71%, 83% 77.26%, 84% 77.70%, 85% 78.05%, 86% 78.30%, 87% 78.45%, 88% 78.50%, 89% 78.45%, 90% 78.29%, 91% 78.03%, 92% 77.67%, 93% 77.22%, 94% 76.67%, 95% 76.03%, 96% 75.30%, 97% 74.48%, 98% 73.58%, 99% 72.60%, 100% 71.55%);
			opacity: 0.5;
		}

		> .misskey {
			position: absolute;
			top: 42px;
			left: 42px;
			width: 140px;

			@media (max-width: 450px) {
				width: 130px;
			}
		}

		> .emojis {
			position: absolute;
			bottom: 32px;
			left: 115px;
			transform: scale(1.5);

			> * {
				margin-right: 8px;
			}

			@media (max-width: 1200px) {
				display: none;
			}
		}

		> .main {
			position: relative;
			width: min(480px, 100%);
			margin: auto auto auto 128px;
			background: var(--panel);
			border-radius: var(--radius);
			box-shadow: 0 12px 32px rgb(0 0 0 / 25%);

			@media (max-width: 1200px) {
				margin: auto;
			}

			> .icon {
				width: 85px;
				margin-top: -47px;
				border-radius: 100%;
				vertical-align: bottom;
			}

			> .menu {
				position: absolute;
				top: 16px;
				right: 16px;
				width: 32px;
				height: 32px;
				border-radius: 8px;
				font-size: 18px;
			}

			> .fg {
				position: relative;
				z-index: 1;

				> h1 {
					display: block;
					margin: 0;
					padding: 16px 32px 24px 32px;
					font-size: 1.4em;

					> .logo {
						vertical-align: bottom;
						max-height: 120px;
						max-width: min(100%, 300px);
					}
				}

				> .about {
					padding: 0 32px;
				}

				> .action {
					padding: 32px;

					> * {
						line-height: 28px;
					}
				}
			}
		}

		> .federation {
			position: absolute;
			bottom: 16px;
			left: 0;
			right: 0;
			margin: auto;
			background: var(--acrylicPanel);
			-webkit-backdrop-filter: var(--blur, blur(15px));
			backdrop-filter: var(--blur, blur(15px));
			border-radius: 999px;
			overflow: clip;
			width: 35%;
			left: 50%;
			padding: 8px 0;

			@media (max-width: 900px) {
				display: none;
			}
		}
	}
}
</style>

<style lang="scss" module>
.federationInstance {
	display: inline-flex;
	align-items: center;
	vertical-align: bottom;
	padding: 6px 12px 6px 6px;
	margin: 0 10px 0 0;
	background: var(--panel);
	border-radius: 999px;

	> :global(.icon) {
		display: inline-block;
		width: 20px;
		height: 20px;
		margin-right: 5px;
		border-radius: 999px;
	}
}
</style>
