<template>
	<div v-if="$i && fetching" class="">
		<MkLoading />
	</div>
	<div v-else-if="$i">
		<XForm
			v-if="state == 'waiting'"
			ref="form"
			class="form"
			:session="session"
			@denied="state = 'denied'"
			@accepted="accepted"
		/>
		<div v-if="state == 'denied'" class="denied">
			<h1>{{ i18n.ts._auth.denied }}</h1>
		</div>
		<div v-if="state == 'accepted'" class="accepted">
			<h1>
				{{
					session.app.isAuthorized
						? i18n.t("already-authorized")
						: i18n.ts.allowed
				}}
			</h1>
			<p v-if="session.app.callbackUrl && !auth_code">
				{{ i18n.ts._auth.callback }}<MkEllipsis />
			</p>
			<MkKeyValue
				v-if="session.app.callbackUrl && auth_code"
				:copy="auth_code"
			>
				<template #key>{{ i18n.ts._auth.copyAsk }}</template>
				<template #value>{{ auth_code }}</template>
			</MkKeyValue>
			<p v-if="!session.app.callbackUrl">
				{{ i18n.ts._auth.pleaseGoBack }}
			</p>
		</div>
		<div v-if="state == 'fetch-session-error'" class="error">
			<p>{{ i18n.ts.somethingHappened }}</p>
		</div>
	</div>
	<div v-else class="signin">
		<MkSignin @login="onLogin" />
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import XForm from "./auth.form.vue";
import MkSignin from "@/components/MkSignin.vue";
import MkKeyValue from "@/components/MkKeyValue.vue";
import * as os from "@/os";
import { $i, login } from "@/account";
import { i18n } from "@/i18n";

const props = defineProps<{
	token: string;
}>();
const state = ref("");
const session = ref();
const fetching = ref(true);
const auth_code = ref("");

onMounted(() => {
	if (!$i) return;

	os.api("auth/session/show", { token: props.token })
		.then((sess: any) => {
			session.value = sess;
			fetching.value = false;

			if (session.value.app.isAuthorized) {
				os.api("auth/accept", { token: session.value.token }).then(
					() => {
						accepted();
					},
				);
			} else {
				state.value = "waiting";
			}
		})
		.catch((error) => {
			state.value = "fetch-session-error";
			fetching.value = false;
		});
});

const getUrlParams = () =>
	window.location.search
		.substring(1)
		.split("&")
		.reduce((result, query) => {
			const [k, v] = query.split("=");
			result[k] = decodeURI(v);
			return result;
		}, {});

const accepted = () => {
	state.value = "accepted";
	const isMastodon = !!getUrlParams().mastodon;
	if (session.value.app.callbackUrl && isMastodon) {
		const redirectUri = decodeURIComponent(getUrlParams().redirect_uri);
		if (!session.value.app.callbackUrl.split("\n").includes(redirectUri)) {
			state.value = "fetch-session-error";
			fetching.value = false;
			throw new Error("Callback URI doesn't match registered app");
		}
		const callbackUrl = new URL(redirectUri);
		callbackUrl.searchParams.append("code", session.value.token);
		if (getUrlParams().state)
			callbackUrl.searchParams.append("state", getUrlParams().state);
		location.href = callbackUrl.toString();
	} else if (session.value.app.callbackUrl) {
		const url = new URL(session.value.app.callbackUrl);
		if (
			["javascript:", "file:", "data:", "mailto:", "tel:"].includes(
				url.protocol,
			)
		) {
			throw new Error("Invalid URL");
		}
		if (session.value.app.callbackUrl === "urn:ietf:wg:oauth:2.0:oob") {
			auth_code.value = session.value.token;
		} else {
			location.href = `${session.value.app.callbackUrl}?token=${
				session.value.token
			}&code=${session.value.token}&state=${getUrlParams().state || ""}`;
		}
	}
};

const onLogin = (res) => {
	login(res.i);
};
</script>
