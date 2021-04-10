import { MfmNode, MfmHashtagNode } from '../mfm/types';
import { unique } from '../prelude/array';

export function extractHashtags(nodes: MfmNode[]): string[] {
	const hashtagNodes = nodes.filter(x => x.type === 'hashtag') as MfmHashtagNode[];
	const hashtags = hashtagNodes.map(x => x.props.hashtag);
	return unique(hashtags);
}
