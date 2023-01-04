import { Client } from 'gifbox.js';
import config from '@/config/index.js';
import define from '../../define.js';

const gbClient = new Client();

export const meta = {
	tags: ['gifbox'],

	requireCredential: false,
	requireCredentialPrivateMode: false,

	errors: {
		noSuchNote: {
			message: 'Problem with GifBox.',
			code: 'GIFBOX_ERROR',
			id: 'bea9b03f-36e0-49c5-a4db-638a029f8971',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;
