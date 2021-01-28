export function normalizeTag(tag: string | null | undefined): string | null | undefined {
	if (tag == null) return tag;
	return tag.normalize('NFKC').toLowerCase();
}
