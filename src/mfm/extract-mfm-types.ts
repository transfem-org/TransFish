import { MfmNode } from '../mfm/types';

export function extractMfmTypes(nodes: MfmNode[]): string[] {
	const types = new Set<string>();

	function scan(nodes: MfmNode[]) {
		for (const node of nodes) {
			types.add(node.type);
			scan(node.children);
		}
	}

	scan(nodes);

	return [...types];
}
