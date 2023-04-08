import { markRaw } from "vue";
import { I18n } from "@/scripts/i18n";

const locale = JSON.parse(localStorage.getItem("locale"));
const loader = new I18n(locale);
export const i18n = markRaw(loader);

// このファイルに書きたくないけどここに書かないと何故かVeturが認識しない
declare module "@vue/runtime-core" {
	interface ComponentCustomProperties {
		$t: typeof i18n["t"];
		$ts: typeof i18n["locale"];
	}
}
