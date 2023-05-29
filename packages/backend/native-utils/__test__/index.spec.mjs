import test from "ava";

import { convertId, IdConvertType } from "../built/index.js";

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
