<template>
	<form
		class="eppvobhk _monolithic_"
		:class="{ signing, totpLogin }"
		@submit.prevent="onSubmit"
	>
		<div class="auth _section _formRoot">
			<div
				v-show="withAvatar"
				class="avatar"
				:style="{
					backgroundImage: user ? `url('${user.avatarUrl}')` : null,
					marginBottom: message ? '1.5em' : null,
				}"
			></div>
			<MkInfo v-if="message">
				{{ message }}
			</MkInfo>
			<div v-if="!totpLogin" class="normal-signin">
				<MkInput
					v-model="username"
					class="_formBlock"
					:placeholder="i18n.ts.username"
					type="text"
					pattern="^[a-zA-Z0-9_]+$"
					:spellcheck="false"
					autofocus
					required
					data-cy-signin-username
					@update:modelValue="onUsernameChange"
				>
					<template #prefix>@</template>
					<template #suffix>@{{ host }}</template>
				</MkInput>
				<MkInput
					v-if="!user || (user && !user.usePasswordLessLogin)"
					v-model="password"
					class="_formBlock"
					:placeholder="i18n.ts.password"
					type="password"
					:with-password-toggle="true"
					autocomplete="current-password"
					required
					data-cy-signin-password
				>
					<template #prefix
						><i class="ph-lock ph-bold ph-lg"></i
					></template>
					<template #caption
						><button
							class="_textButton"
							type="button"
							@click="resetPassword"
						>
							{{ i18n.ts.forgotPassword }}
						</button></template
					>
				</MkInput>
				<MkButton
					class="_formBlock"
					type="submit"
					primary
					:disabled="signing"
					style="margin: 1rem auto"
					>{{ signing ? i18n.ts.loggingIn : i18n.ts.login }}</MkButton
				>
			</div>
			<div
				v-if="totpLogin"
				class="2fa-signin"
				:class="{ securityKeys: user && user.securityKeys }"
			>
				<div
					v-if="user && user.securityKeys"
					class="twofa-group tap-group"
				>
					<p>{{ i18n.ts.tapSecurityKey }}</p>
					<MkButton v-if="!queryingKey" @click="queryKey">
						{{ i18n.ts.retry }}
					</MkButton>
				</div>
				<div v-if="user && user.securityKeys" class="or-hr">
					<p class="or-msg">{{ i18n.ts.or }}</p>
				</div>
				<div class="twofa-group totp-group">
					<p style="margin-bottom: 0">
						{{ i18n.ts.twoStepAuthentication }}
					</p>
					<MkInput
						v-if="user && user.usePasswordLessLogin"
						v-model="password"
						type="password"
						:with-password-toggle="true"
						autocomplete="current-password"
						required
					>
						<template #label>{{ i18n.ts.password }}</template>
						<template #prefix
							><i class="ph-lock ph-bold ph-lg"></i
						></template>
					</MkInput>
					<MkInput
						v-model="token"
						type="text"
						autocomplete="one-time-code"
						pattern="^[0-9]{6}$"
						:spellcheck="false"
						required
					>
						<template #label>{{ i18n.ts._2fa.token }}</template>
						<template #prefix
							><i class="ph-poker-chip ph-bold ph-lg"></i
						></template>
					</MkInput>
					<MkButton
						type="submit"
						:disabled="signing"
						primary
						style="margin: 1rem auto auto"
						>{{
							signing ? i18n.ts.loggingIn : i18n.ts.login
						}}</MkButton
					>
				</div>
			</div>
		</div>
		<div class="social _section">
			<a
				v-if="meta && meta.enableTwitterIntegration"
				class="_borderButton _gap"
				:href="`${apiUrl}/signin/twitter`"
				><i
					class="ph-twitter-logo ph-bold ph-lg"
					style="margin-right: 4px"
				></i
				>{{ i18n.t("signinWith", { x: "Twitter" }) }}</a
			>
			<a
				v-if="meta && meta.enableGithubIntegration"
				class="_borderButton _gap"
				:href="`${apiUrl}/signin/github`"
				><i
					class="ph-github-logo ph-bold ph-lg"
					style="margin-right: 4px"
				></i
				>{{ i18n.t("signinWith", { x: "GitHub" }) }}</a
			>
			<a
				v-if="meta && meta.enableDiscordIntegration"
				class="_borderButton _gap"
				:href="`${apiUrl}/signin/discord`"
				><i
					class="ph-discord-logo ph-bold ph-lg"
					style="margin-right: 4px"
				></i
				>{{ i18n.t("signinWith", { x: "Discord" }) }}</a
			>
		</div>
	</form>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from "vue";
import { toUnicode } from "punycode/";
import MkButton from "@/components/MkButton.vue";
import MkInput from "@/components/form/input.vue";
import MkInfo from "@/components/MkInfo.vue";
import { apiUrl, host as configHost } from "@/config";
import { byteify, hexify } from "@/scripts/2fa";
import * as os from "@/os";
import { login } from "@/account";
import { instance } from "@/instance";
import { i18n } from "@/i18n";

const signing = ref(false);
const user = ref(null);
const username = ref("");
const password = ref("");
const token = ref("");
const host = ref(toUnicode(configHost));
const totpLogin = ref(false);
const challengeData = ref(null);
const queryingKey = ref(false);
const hCaptchaResponse = ref(null);
const reCaptchaResponse = ref(null);

const meta = computed(() => instance);

const emit = defineEmits<{
	(ev: "login", v: any): void;
}>();

const props = defineProps({
	withAvatar: {
		type: Boolean,
		required: false,
		default: true,
	},
	autoSet: {
		type: Boolean,
		required: false,
		default: false,
	},
	message: {
		type: String,
		required: false,
		default: "",
	},
});

function onUsernameChange() {
	os.api("users/show", {
		username: username.value,
	}).then(
		(userResponse) => {
			user.value = userResponse;
		},
		() => {
			user.value = null;
		},
	);
}

function onLogin(res) {
	if (props.autoSet) {
		return login(res.i);
	}
}

function queryKey() {
	queryingKey.value = true;
	return navigator.credentials
		.get({
			publicKey: {
				challenge: byteify(challengeData.value.challenge, "base64"),
				allowCredentials: challengeData.value.securityKeys.map(
					(key) => ({
						id: byteify(key.id, "hex"),
						type: "public-key",
						transports: ["usb", "nfc", "ble", "internal"],
					}),
				),
				timeout: 60 * 1000,
			},
		})
		.catch(() => {
			queryingKey.value = false;
			return Promise.reject(null);
		})
		.then((credential) => {
			queryingKey.value = false;
			signing.value = true;
			return os.api("signin", {
				username: username.value,
				password: password.value,
				signature: hexify(credential.response.signature),
				authenticatorData: hexify(
					credential.response.authenticatorData,
				),
				clientDataJSON: hexify(credential.response.clientDataJSON),
				credentialId: credential.id,
				challengeId: challengeData.value.challengeId,
				"hcaptcha-response": hCaptchaResponse.value,
				"g-recaptcha-response": reCaptchaResponse.value,
			});
		})
		.then((res) => {
			emit("login", res);
			return onLogin(res);
		})
		.catch((err) => {
			if (err === null) return;
			os.alert({
				type: "error",
				text: i18n.ts.signinFailed,
			});
			signing.value = false;
		});
}

function onSubmit() {
	signing.value = true;
	console.log("submit");
	if (!totpLogin.value && user.value && user.value.twoFactorEnabled) {
		if (window.PublicKeyCredential && user.value.securityKeys) {
			os.api("signin", {
				username: username.value,
				password: password.value,
				"hcaptcha-response": hCaptchaResponse.value,
				"g-recaptcha-response": reCaptchaResponse.value,
			})
				.then((res) => {
					totpLogin.value = true;
					signing.value = false;
					challengeData.value = res;
					return queryKey();
				})
				.catch(loginFailed);
		} else {
			totpLogin.value = true;
			signing.value = false;
		}
	} else {
		os.api("signin", {
			username: username.value,
			password: password.value,
			"hcaptcha-response": hCaptchaResponse.value,
			"g-recaptcha-response": reCaptchaResponse.value,
			token:
				user.value && user.value.twoFactorEnabled
					? token.value
					: undefined,
		})
			.then((res) => {
				emit("login", res);
				onLogin(res);
			})
			.catch(loginFailed);
	}
}

function loginFailed(err) {
	switch (err.id) {
		case "6cc579cc-885d-43d8-95c2-b8c7fc963280": {
			os.alert({
				type: "error",
				title: i18n.ts.loginFailed,
				text: i18n.ts.noSuchUser,
			});
			break;
		}
		case "932c904e-9460-45b7-9ce6-7ed33be7eb2c": {
			os.alert({
				type: "error",
				title: i18n.ts.loginFailed,
				text: i18n.ts.incorrectPassword,
			});
			break;
		}
		case "e03a5f46-d309-4865-9b69-56282d94e1eb": {
			showSuspendedDialog();
			break;
		}
		case "22d05606-fbcf-421a-a2db-b32610dcfd1b": {
			os.alert({
				type: "error",
				title: i18n.ts.loginFailed,
				text: i18n.ts.rateLimitExceeded,
			});
			break;
		}
		default: {
			console.log(err);
			os.alert({
				type: "error",
				title: i18n.ts.loginFailed,
				text: JSON.stringify(err),
			});
		}
	}

	challengeData.value = null;
	totpLogin.value = false;
	signing.value = false;
}

function resetPassword() {
	os.popup(
		defineAsyncComponent(() => import("@/components/MkForgotPassword.vue")),
		{},
		{},
		"closed",
	);
}

function showSuspendedDialog() {
	os.alert({
		type: "error",
		title: i18n.ts.yourAccountSuspendedTitle,
		text: i18n.ts.yourAccountSuspendedDescription,
	});
}
</script>

<style lang="scss" scoped>
.eppvobhk {
	> .auth {
		> .avatar {
			margin: 0 auto 0 auto;
			width: 64px;
			height: 64px;
			background: var(--accentedBg);
			background-position: center;
			background-size: cover;
			border-radius: 100%;
			transition: background-image 0.2s ease-in;
		}
	}
}
</style>
