import { defineAsyncComponent, reactive } from "vue";
import * as misskey from "calckey-js";
import { showSuspendedDialog } from "./scripts/show-suspended-dialog";
import { i18n } from "./i18n";
import { del, get, set } from "@/scripts/idb-proxy";
// #v-ifdef VITE_CAPACITOR
//...
// #v-else
import { apiUrl } from "@/config";
// #v-endif
import { waiting, api, popup, popupMenu, success, alert } from "@/os";
import { unisonReload, reloadChannel } from "@/scripts/unison-reload";

// TODO: 他のタブと永続化されたstateを同期

type Account = misskey.entities.MeDetailed;
// #v-ifdef VITE_CAPACITOR
let accountData = null;
try {
  accountData = JSON.parse(localStorage.getItem("account"));
} catch (e) {
  localStorage.removeItem("account");
  window.location.reload();
}
// #v-else
const accountData = localStorage.getItem("account");
// #v-endif
// TODO: 外部からはreadonlyに
// #v-ifdef VITE_CAPACITOR
export const $i = accountData ? reactive(accountData as Account) : null;
// #v-else
export const $i = accountData
	? reactive(JSON.parse(accountData) as Account)
	: null;
// #v-endif

export const iAmModerator = $i != null && ($i.isAdmin || $i.isModerator);
export const iAmAdmin = $i?.isAdmin;

export async function signout() {
	waiting();
	localStorage.removeItem("account");

	await removeAccount($i.id);

	const accounts = await getAccounts();
// #v-ifdef VITE_CAPACITOR
//...
// #v-else
	//#region Remove service worker registration
	try {
		if (navigator.serviceWorker.controller) {
			const registration = await navigator.serviceWorker.ready;
			const push = await registration.pushManager.getSubscription();
			if (push) {
				await fetch(`${apiUrl}/sw/unregister`, {
					method: "POST",
					body: JSON.stringify({
						i: $i.token,
						endpoint: push.endpoint,
					}),
				});
			}
		}

		if (accounts.length === 0) {
			await navigator.serviceWorker.getRegistrations().then((registrations) => {
				return Promise.all(
					registrations.map((registration) => registration.unregister()),
				);
			});
		}
	} catch (err) {}
	//#endregion
// #v-endif

	document.cookie = "igi=; path=/";

	// #v-ifdef VITE_CAPACITOR
	if (accounts.length > 0) login(accounts[0].token, accounts[0].instanceUrl);
	// #v-else
	if (accounts.length > 0) login(accounts[0].token);
	// #v-endif
	else unisonReload("/");
}

export async function getAccounts(): Promise<
	// #v-ifdef VITE_CAPACITOR
	{ id: Account["id"]; token: Account["token"]; instanceUrl: string }[]
	// #v-else
	{ id: Account["id"]; token: Account["token"] }[]
	// #v-endif
> {
	return (await get("accounts")) || [];
}

// #v-ifdef VITE_CAPACITOR
export async function addAccount(id: Account["id"], token: Account["token"], instanceUrl: string) {
// #v-else
export async function addAccount(id: Account["id"], token: Account["token"]) {
// #v-endif
	const accounts = await getAccounts();
	if (!accounts.some((x) => x.id === id)) {
		// #v-ifdef VITE_CAPACITOR
		await set("accounts", accounts.concat([{ id, token, instanceUrl }]));
		// #v-else
		await set("accounts", accounts.concat([{ id, token }]));
		// #v-endif
	}
}

export async function removeAccount(id: Account["id"]) {
	const accounts = await getAccounts();
	accounts.splice(
		accounts.findIndex((x) => x.id === id),
		1,
	);

	if (accounts.length > 0) await set("accounts", accounts);
	else await del("accounts");
}
// #v-ifdef VITE_CAPACITOR
function fetchAccount(
  token: string,
  instanceUrl: string
): Promise<Account & { instanceUrl: string }> {
  return new misskey.api.APIClient({ origin: instanceUrl, credential: token })
    .request("i")
    .then((res) => {
      return { ...(res as Account), token, instanceUrl };
    })
    .catch((res) => {
      if (res.error.id === "a8c724b3-6e9c-4b46-b1a8-bc3ed6258370") {
        showSuspendedDialog().then(() => {
          signout();
        });
      } else {
        alert({
          type: "error",
          title: i18n.ts.failedToFetchAccountInformation,
          text: JSON.stringify(res.error),
        });
      }
      return Promise.reject(res);
    });
}
// #v-else
function fetchAccount(token: string): Promise<Account> {
	return new Promise((done, fail) => {
		// Fetch user
		fetch(`${apiUrl}/i`, {
			method: "POST",
			body: JSON.stringify({
				i: token,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) {
					if (res.error.id === "a8c724b3-6e9c-4b46-b1a8-bc3ed6258370") {
						showSuspendedDialog().then(() => {
							signout();
						});
					} else {
						alert({
							type: "error",
							title: i18n.ts.failedToFetchAccountInformation,
							text: JSON.stringify(res.error),
						});
					}
				} else {
					res.token = token;
					done(res);
				}
			})
			.catch(fail);
	});
}
// #v-endif
export function updateAccount(accountData: Object) {
	for (const [key, value] of Object.entries(accountData)) {
		$i[key] = value;
	}
	localStorage.setItem("account", JSON.stringify($i));
}

export function refreshAccount() {
	// #v-ifdef VITE_CAPACITOR
	return fetchAccount($i.token, $i.instanceUrl).then(updateAccount);
	// #v-else
	return fetchAccount($i.token).then(updateAccount);
	// #v-endif
}

// #v-ifdef VITE_CAPACITOR
export async function login(token: Account["token"], instanceUrl: string, redirect?: string) {
// #v-else
export async function login(token: Account["token"], redirect?: string) {
// #v-endif
	waiting();
	// #v-ifdef VITE_CAPACITOR
	if (_DEV_) console.log("logging as token ", token, instanceUrl);
  const me = await fetchAccount(token, instanceUrl);
	// #v-else
	if (_DEV_) console.log("logging as token ", token);
	const me = await fetchAccount(token);
	// #v-endif
	localStorage.setItem("account", JSON.stringify(me));
	// #v-ifdef VITE_CAPACITOR
	localStorage.setItem(
	    "instance",
	    JSON.stringify(
	      await new misskey.api.APIClient({
	        origin: instanceUrl,
	        credential: token,
	      }).request("meta")
	    )
	  );
	// #v-endif
	document.cookie = `token=${token}; path=/; max-age=31536000`; // bull dashboardの認証とかで使う
	// #v-ifdef VITE_CAPACITOR
	await addAccount(me.id, token, instanceUrl);
	// #v-else
	await addAccount(me.id, token);
	// #v-endif

	if (redirect) {
		// 他のタブは再読み込みするだけ
		reloadChannel.postMessage(null);
		// このページはredirectで指定された先に移動
		location.href = redirect;
		return;
	}

	unisonReload();
}

export async function openAccountMenu(
	opts: {
		includeCurrentAccount?: boolean;
		withExtraOperation: boolean;
		active?: misskey.entities.UserDetailed["id"];
		onChoose?: (account: misskey.entities.UserDetailed) => void;
	},
	ev: MouseEvent,
) {
	function showSigninDialog() {
		popup(
			defineAsyncComponent(() => import("@/components/MkSigninDialog.vue")),
			{},
			{
				done: (res) => {
					// #v-ifdef VITE_CAPACITOR
					addAccount(res.id, res.i, res.instanceUrl);
					// #v-else
					addAccount(res.id, res.i);
					// #v-endif
					success();
				},
			},
			"closed",
		);
	}

	function createAccount() {
		popup(
			defineAsyncComponent(() => import("@/components/MkSignupDialog.vue")),
			{},
			{
				done: (res) => {
					// #v-ifdef VITE_CAPACITOR
					addAccount(res.id, res.i, res.instanceUrl);
          switchAccountWithToken(res.i, res.instanceUrl);
					// #v-else
					addAccount(res.id, res.i);
					switchAccountWithToken(res.i);
					// #v-endif
				},
			},
			"closed",
		);
	}

	async function switchAccount(account: misskey.entities.UserDetailed) {
		const storedAccounts = await getAccounts();
		// #v-ifdef VITE_CAPACITOR
		const acc = storedAccounts.find((x) => x.id === account.id);
    localStorage.removeItem("lastEmojisFetchedAt");
    switchAccountWithToken(acc.token, acc.instanceUrl);
		// #v-else
		const token = storedAccounts.find((x) => x.id === account.id).token;
		switchAccountWithToken(token);
		// #v-endif
	}

	// #v-ifdef VITE_CAPACITOR
	function switchAccountWithToken(token: string, instanceUrl: string) {
	  login(token, instanceUrl);
  // #v-else
	function switchAccountWithToken(token: string) {
		login(token);
	// #v-endif
	}

	const storedAccounts = await getAccounts().then((accounts) =>
		accounts.filter((x) => x.id !== $i.id),
	);
	const accountsPromise = api("users/show", {
		userIds: storedAccounts.map((x) => x.id),
	});

	function createItem(account: misskey.entities.UserDetailed) {
		return {
			type: "user",
			user: account,
			active: opts.active != null ? opts.active === account.id : false,
			action: () => {
				if (opts.onChoose) {
					opts.onChoose(account);
				} else {
					switchAccount(account);
				}
			},
		};
	}

	const accountItemPromises = storedAccounts.map(
		(a) =>
			new Promise((res) => {
				// #v-ifdef VITE_CAPACITOR
				const client = new misskey.api.APIClient({
					 origin: a.instanceUrl,
					  credential: a.token,
				});
				client
          .request("users/show", {
            userIds: [a.id],
          })
          .then((accounts) => {
            const account = accounts.find((x) => x.id === a.id);
            if (account == null) return res(null);

            client.request("meta").then((meta) => {
              res(createItem({ ...account, host: meta.name }));
            });
          });
				// #v-else
				accountsPromise.then((accounts) => {
					const account = accounts.find((x) => x.id === a.id);
					if (account == null) return res(null);
					res(createItem(account));
				});
				// #v-endif
			}),
	);

	if (opts.withExtraOperation) {
		popupMenu(
			[
				...[
					{
						type: "link",
						text: i18n.ts.profile,
						to: `/@${$i.username}`,
						avatar: $i,
					},
					null,
					...(opts.includeCurrentAccount ? [createItem($i)] : []),
					...accountItemPromises,
					{
						type: "parent",
						icon: "ph-plus ph-bold ph-lg",
						text: i18n.ts.addAccount,
						children: [
							{
								text: i18n.ts.existingAccount,
								action: () => {
									showSigninDialog();
								},
							},
							// #v-ifdef VITE_CAPACITOR
							//...
							// #v-else
							{
								text: i18n.ts.createAccount,
								action: () => {
									createAccount();
								},
							},
							// #v-endif
						],
					},
					{
						type: "link",
						icon: "ph-users ph-bold ph-lg",
						text: i18n.ts.manageAccounts,
						to: "/settings/accounts",
					},
					{
						type: "button",
						icon: "ph-sign-out ph-bold ph-lg",
						text: i18n.ts.logout,
						action: () => {
							signout();
						},
					},
				],
			],
			ev.currentTarget ?? ev.target,
			{
				align: "left",
			},
		);
	} else {
		popupMenu(
			[
				...(opts.includeCurrentAccount ? [createItem($i)] : []),
				...accountItemPromises,
			],
			ev.currentTarget ?? ev.target,
			{
				align: "left",
			},
		);
	}
}
