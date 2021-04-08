import { MfmNode, MfmEmojiNode } from '../mfm/prelude';
import { unique, concat } from '../prelude/array';

export default function(nodes: MfmNode[]): string[] {
	const emojiNodes = nodes.filter(x => x.type === 'emoji') as MfmEmojiNode[];
	const emojiNodes2 = concat(nodes.filter(x => x.type === 'link').map(x => x.children.filter(x => x.type === 'emoji'))) as MfmEmojiNode[];

	const emojis = emojiNodes.concat(emojiNodes2).filter(x => x.props.name && x.props.name.length <= 2048).map(x => x.props.name);
	return unique(emojis) as string[];
}
