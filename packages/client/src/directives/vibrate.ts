import type { Directive } from "vue";
import { vibrate } from "../scripts/vibrate";

export default {
	mounted(el, binding) {
		const pattern = (binding.value as VibratePattern) ?? 20;
		el.addEventListener("mousedown", () => {
			vibrate(pattern);
		});
	},
} as Directive;
