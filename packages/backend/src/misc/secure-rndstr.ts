import { nativeRandomStr } from "native-utils/built";

export function secureRndstr(length = 32, _ = true): string {
	return nativeRandomStr(length);
}
