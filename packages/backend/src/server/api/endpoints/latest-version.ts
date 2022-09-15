import define from '../define.js';

export const meta = {
	tags: ['meta'],

	requireCredential: false,
	requireCredentialPrivateMode: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async () => {
	let tag_name;
	await fetch('https://codeberg.org/api/v1/repos/thatonecalculator/calckey/releases?draft=false&pre-release=false&page=1&limit=1')
		.then((response) => response.json())
		.then((data) => {
			console.log(data[0]);
			console.log(data[0].tag_name);
			tag_name = data[0].tag_name;
		});

	return {
		tag_name,
	};
});
