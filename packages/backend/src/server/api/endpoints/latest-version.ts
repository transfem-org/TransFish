import define from "../define.js";

export const meta = {
	tags: ["meta"],

	requireCredential: false,
	requireCredentialPrivateMode: true,
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async () => {
	let tag_name;
	await fetch("https://git.joinfirefish.org/api/v4/projects/7/releases")
		.then((response) => response.json())
		.then((data) => {
			tag_name = data[0].tag_name;
		});

	return {
		tag_name,
	};
});
