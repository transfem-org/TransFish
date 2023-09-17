import { ColdDeviceStorage } from "@/store";

export function vibrate(pattern: VibratePattern) {
	if (!ColdDeviceStorage.get("vibrate") || !window.navigator.vibrate) return;
	window.navigator.vibrate(pattern);
}
