import { defineAsyncComponent } from "vue";
import { $i } from "@/account";
import { i18n } from "@/i18n";
import { popup } from "@/os";
import { vibrate } from "@/scripts/vibrate";

export function pleaseLogin(path?: string) {
	if ($i) return;
	vibrate(100);

	popup(
		defineAsyncComponent(() => import("@/components/MkSigninDialog.vue")),
		{
			autoSet: true,
			message: i18n.ts.signinRequired,
		},
		{
			cancelled: () => {
				if (path) {
					window.location.href = path;
				}
			},
		},
		"closed",
	);

	if (!path) throw new Error("Sign-in required.");
}
