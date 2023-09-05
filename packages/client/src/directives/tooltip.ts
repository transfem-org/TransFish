// TODO: useTooltip関数使うようにしたい
// ただディレクティブ内でonUnmountedなどのcomposition api使えるのか不明

import type { Directive } from "vue";
import { defineAsyncComponent, ref } from "vue";
import { isTouchUsing } from "@/scripts/touch";
import { alert, popup } from "@/os";
import { mainRouter } from "@/router";

const start = isTouchUsing ? "touchstart" : "mouseover";
const end = isTouchUsing ? "touchend" : "mouseleave";

export default {
	mounted(el: HTMLElement, binding, vn) {
		const delay = binding.modifiers.noDelay ? 0 : 100;

		const self = ((el as any)._tooltipDirective_ = {} as any);

		self.text = binding.value as string;
		self._close = null;
		self.showTimer = null;
		self.hideTimer = null;
		self.checkTimer = null;

		if (!binding.modifiers.noLabel) {
			if (!document.body.contains(el)) return;
			if (self.text == null) return;
			el.setAttribute("aria-label", self.text);
		}

		self.close = () => {
			if (self._close) {
				window.clearInterval(self.checkTimer);
				self._close();
				self._close = null;
			}
		};

		if (binding.arg === "dialog") {
			el.addEventListener("click", (ev) => {
				ev.preventDefault();
				ev.stopPropagation();
				alert({
					type: "info",
					text: binding.value,
				});
				return false;
			});
		}

		self.show = () => {
			if (!document.body.contains(el)) return;
			if (self._close) return;
			if (self.text == null) return;

			const showing = ref(true);
			popup(
				defineAsyncComponent(() => import("@/components/MkTooltip.vue")),
				{
					showing,
					text: self.text,
					asMfm: binding.modifiers.mfm,
					direction: binding.modifiers.left
						? "left"
						: binding.modifiers.right
						? "right"
						: binding.modifiers.top
						? "top"
						: binding.modifiers.bottom
						? "bottom"
						: "top",
					targetElement: el,
				},
				{},
				"closed",
			);

			self._close = () => {
				showing.value = false;
			};
		};

		el.addEventListener("selectstart", (ev) => {
			ev.preventDefault();
		});

		function showTooltip() {
			window.clearTimeout(self.showTimer);
			window.clearTimeout(self.hideTimer);
			self.showTimer = window.setTimeout(self.show, delay);
		}
		function hideTooltip() {
			window.clearTimeout(self.showTimer);
			window.clearTimeout(self.hideTimer);
			self.hideTimer = window.setTimeout(self.close, delay);
		}

		el.addEventListener(start, showTooltip, { passive: true });
		el.addEventListener("focusin", showTooltip, { passive: true });

		el.addEventListener(end, hideTooltip, { passive: true });
		el.addEventListener("focusout", hideTooltip, { passive: true });

		mainRouter.on("change", hideTooltip);

		el.addEventListener("click", () => {
			window.clearTimeout(self.showTimer);
			self.close();
		});
	},

	updated(el, binding) {
		const self = el._tooltipDirective_;
		self.text = binding.value as string;
	},

	unmounted(el, binding, vn) {
		const self = el._tooltipDirective_;
		window.clearInterval(self.checkTimer);
		self.close();
	},
} as Directive;
