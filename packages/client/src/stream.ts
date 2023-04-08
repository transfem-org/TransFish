import * as Misskey from "calckey-js";
import { markRaw } from "vue";
import { $i } from "@/account";
import { url } from "@/config";

export const stream = markRaw(
	new Misskey.Stream(
		// #v-ifdef VITE_CAPACITOR
		$i ? $i.instanceUrl : "localhost",
		// #v-else
		url,
		// #v-endif
		$i
			? {
					token: $i.token,
			  }
			: null,
	),
);
