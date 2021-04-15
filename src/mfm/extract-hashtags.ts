import { MfmNode, isMfmHashtag } from '../mfm/types';
import { isHashtag } from './utils';

/**
 * Extract hashtags
 * @param nodes parseBasicの結果を入れる
 */
export function extractHashtags(nodes: MfmNode[]): string[] {
	const hashtags = new Set<string>();

	for (const node of nodes) {
		if (isMfmHashtag(node) && isHashtag(node.props.hashtag)) hashtags.add(node.props.hashtag);
	}

	return [...hashtags];
}
