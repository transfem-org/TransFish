import type * as misskey from "firefish-js";
import type { ComputedRef, Ref } from "vue";
import { inject, isRef, onActivated, onMounted, provide, ref } from "vue";

export const setPageMetadata = Symbol("setPageMetadata");
export const pageMetadataProvider = Symbol("pageMetadataProvider");

export interface PageMetadata {
	title: string;
	subtitle?: string;
	icon?: string | null;
	avatar?: misskey.entities.User | null;
	userName?: misskey.entities.User | null;
	bg?: string;
}

export function definePageMetadata(
	metadata:
		| PageMetadata
		| null
		| Ref<PageMetadata | null>
		| ComputedRef<PageMetadata | null>,
): void {
	const _metadata = isRef(metadata) ? metadata : ref(metadata);

	provide(pageMetadataProvider, _metadata);

	const set = inject(setPageMetadata) as any;
	if (set) {
		set(_metadata);

		onMounted(() => {
			set(_metadata);
		});

		onActivated(() => {
			set(_metadata);
		});
	}
}

export function provideMetadataReceiver(
	callback: (info: ComputedRef<PageMetadata>) => void,
): void {
	provide(setPageMetadata, callback);
}

export function injectPageMetadata(): PageMetadata | undefined {
	return inject(pageMetadataProvider);
}
