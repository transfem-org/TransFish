import * as mongo from 'mongodb';

export function toISODateOrNull(input: Date | null | undefined): string | null {
	if (!(input instanceof Date)) return null;
	if (input.toString() === 'Invalid Date') return null;
	return input.toISOString();
}

export function toOidString(input: mongo.ObjectID): string {
	return `${input}`;
}

export function toOidStringOrNull(input: mongo.ObjectID | null | undefined): string | null {
	return input == null ? null : `${input}`;
}

export function forceNumber(input: number | null | undefined): number {
	return input || 0;
}

export function forceBoolean(input: boolean | null | undefined): boolean {
	return !!input;
}
