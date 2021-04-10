import { MfmNode, MfmMentionNode, isMfmMention } from '../mfm/types';

/**
 * Extract mentions
 * @param nodes parseBasicの結果を入れる
 */
export function extractMentions(nodes: MfmNode[]): MfmMentionNode['props'][] {
	const mentions = new Set<MfmMentionNode>();

	for (const node of nodes) {
		if (isMfmMention(node)) mentions.add(node);
	}

	return [...mentions].map(x => x.props);
}
