import define from '../define.js';

export const meta = {
	tags: ['meta'],

	requireCredential: false,
	requireCredentialPrivateMode: false,
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async () => {
	let patrons;
	await fetch('https://codeberg.org/thatonecalculator/calckey/raw/branch/develop/patrons.json')
		.then((response) => response.json())
		.then((data) => {
			patrons = data['patrons'];
		});

	return {
		patrons,
	};
});
