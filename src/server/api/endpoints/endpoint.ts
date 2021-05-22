import $, { Context, StringContext, NumberContext } from 'cafy';
import define from '../define';
import endpoints, { Param } from '../endpoints';

export const meta = {
	requireCredential: false,
	allowGet: true,

	tags: ['meta'],

	params: {
		endpoint: {
			validator: $.str,
		}
	},
};

export default define(meta, async (ps) => {
	const ep = endpoints.find(x => x.name === ps.endpoint);
	if (ep == null) return;
	return {
		params: Object.entries(ep.meta.params || {}).map(([k, v]) => genParaDesc(k, v))
	};
});

const isNumberContext = (c: Context): c is NumberContext => c.name === 'Number';
const isStringContext = (c: Context): c is StringContext => c.name === 'String';

function genParaDesc(name: string, param: Param) {
	const result = {
		name,
		type: param.validator.name === 'ID' ? 'String' : param.validator.name,
		desc: param.desc,
		deprecated: !!param.deprecated,
		default: param.default,
		required: !param.validator.isOptional,	// TODO: Object
	} as any;

	if (isNumberContext(param.validator)) {
		result.minimum = param.validator.minimum;
		result.maximum = param.validator.maximum;
	} else if (isStringContext(param.validator)) {
		if (param.validator.enum) {
			result.emun = param.validator.enum;
		} else {
			result.minimum = param.validator.minLength;
			result.maximum = param.validator.maxLength;
		}
	}

	return result;
}
