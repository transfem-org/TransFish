import test from "ava";

import {
	convertId,
	IdConvertType,
	nativeInitIdGenerator,
	nativeCreateId,
	nativeRandomStr,
} from "../built/index.js";

test("convert to mastodon id", (t) => {
	t.is(convertId("9gf61ehcxv", IdConvertType.MastodonId), "960365976481219");
	t.is(
		convertId("9fbr9z0wbrjqyd3u", IdConvertType.MastodonId),
		"3954607381600562394",
	);
	t.is(
		convertId("9fbs680oyviiqrol9md73p8g", IdConvertType.MastodonId),
		"3494513243013053824",
	);
});

test("create cuid2 with timestamp prefix", (t) => {
	nativeInitIdGenerator(16, "");
	t.not(nativeCreateId(BigInt(Date.now())), nativeCreateId(BigInt(Date.now())));
	t.is(nativeCreateId(BigInt(Date.now())).length, 16);
});

test("create random string", (t) => {
	t.not(nativeRandomStr(16), nativeRandomStr(16));
	t.is(nativeRandomStr(24).length, 24);
});
