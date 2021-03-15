export function parseDate(input: unknown): Date | null {
	if (typeof input !== 'string') return null;
	const date = new Date(input);
	if (date.toString() === 'Invalid Date') return null;
	return date;
}

export function parseDateWithLimit(input: unknown, positiveMs: number): Date | null {
	const date = parseDate(input);
	if (date == null) return null;
	if (date.getTime() - Date.now() > positiveMs) return null;
	return date;
}
