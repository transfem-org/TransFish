import * as parse5 from 'parse5';
import treeAdapter = require('parse5/lib/tree-adapters/default');
import { URL } from 'url';
import { urlRegexFull } from './utils';

export function fromHtml(html: string, hashtagNames?: string[]): string | null {
	if (html == null) return null;

	const dom = parse5.parseFragment(html);

	let text = '';

	let compensatableNL = 0;

	const pushCompensatableNL = (n: number) => {
		text += '\n'.repeat(n);
		compensatableNL = n;
	}

	const resolveCompensatableNL = (n?: number) => {
		const d = (n || 0) - compensatableNL;
		if (d > 0) text += '\n'.repeat(d);
		compensatableNL = 0;
	}

	for (const n of dom.childNodes) {
		analyze(n);
	}

	return text.trim();

	function appendChildren(childNodes: parse5.ChildNode[]): void {
		if (childNodes) {
			for (const n of childNodes) {
				analyze(n);
			}
		}
	}

	function analyze(node: parse5.Node) {
		if (treeAdapter.isTextNode(node)) {
			resolveCompensatableNL();
			text += node.value;
			return;
		}

		// Skip comment or document type node
		if (!treeAdapter.isElementNode(node)) return;

		switch (node.nodeName) {
			case 'br':
				resolveCompensatableNL(1);
				break;

			case 'a': {
				resolveCompensatableNL();
				const txt = getText(node);
				const rel = node.attrs.find(x => x.name == 'rel');
				const href = node.attrs.find(x => x.name == 'href');

				// ハッシュタグ
				if (hashtagNames && href && hashtagNames.map(x => x.toLowerCase()).includes(txt.toLowerCase())) {
					text += txt;
				// メンション
				} else if (txt.startsWith('@') && !(rel && rel.value.match(/^me /))) {
					const part = txt.split('@');

					if (part.length == 2 && href) {
						//#region ホスト名部分が省略されているので復元する
						const acct = `${txt}@${(new URL(href.value)).hostname}`;
						text += acct;
						//#endregion
					} else if (part.length == 3) {
						text += txt;
					}
				// その他
				} else {
					const isPlainSafe = (input: string): boolean => {
						if (input.match(/[()]/)) return false;
						if (input.match(/[.,]$/)) return false;
						if (input.match(urlRegexFull)) return true;
						return false;
					};

					const generateLink = () => {
						// hrefもtextもない
						if (!href && !txt) {
							return '';
						}

						// hrefがない
						if (!href) {
							return txt;
						}

						// ラベル不要＆安全にベタ書き出来るURL
						if ((!txt || txt === href.value) && isPlainSafe(href.value)) {
							return href.value;
						}

						let encoded: string | null = null;
						try {
							encoded = href.value.match(/^https?:[/][/]/)
								? new URL(href.value).href
									.replace(/[()]/g, c => '%' + c.charCodeAt(0).toString(16))
									.replace(/[.,]$/, c => '%' + c.charCodeAt(0).toString(16))
								: null;
						} catch { }

						if (encoded) {
							return `[${txt.replace('[', '［').replace(']', '］')}](${encoded})`;
						} else {
							return txt;
						}
					};

					text += generateLink();
				}
				break;
			}

			case 'h1':
			{
				resolveCompensatableNL();
				text += '【';
				appendChildren(node.childNodes);
				text += '】\n';
				break;
			}

			case 'b':
			case 'strong':
			{
				resolveCompensatableNL();
				text += '**';
				appendChildren(node.childNodes);
				text += '**';
				break;
			}

			case 'small':
			{
				resolveCompensatableNL();
				text += '<small>';
				appendChildren(node.childNodes);
				text += '</small>';
				break;
			}

			case 's':
			case 'del':
			{
				resolveCompensatableNL();
				text += '~~';
				appendChildren(node.childNodes);
				text += '~~';
				break;
			}

			case 'i':
			case 'em':
			{
				resolveCompensatableNL();
				text += '<i>';
				appendChildren(node.childNodes);
				text += '</i>';
				break;
			}

			// block code (<pre><code>)
			case 'pre': {
				resolveCompensatableNL();
				if (node.childNodes.length === 1 && node.childNodes[0].nodeName === 'code') {
					text += '```\n';
					text += getText(node.childNodes[0]);
					text += '\n```\n';
				} else {
					appendChildren(node.childNodes);
				}
				break;
			}

			// inline code (<code>)
			case 'code': {
				resolveCompensatableNL();
				text += '`';
				appendChildren(node.childNodes);
				text += '`';
				break;
			}

			case 'blockquote': {
				resolveCompensatableNL();
				const t = getText(node);
				if (t) {
					text += '> ';
					text += t.split('\n').join(`\n> `);
				}
				break;
			}

			case 'p':
			case 'h2':
			case 'h3':
			case 'h4':
			case 'h5':
			case 'h6':
			{
				resolveCompensatableNL(2);
				appendChildren(node.childNodes);
				pushCompensatableNL(2);
				break;
			}

			case 'div':
			case 'header':
			case 'footer':
			case 'article':
			case 'li':
			case 'dt':
			case 'dd':
			{
				resolveCompensatableNL(1);
				appendChildren(node.childNodes);
				pushCompensatableNL(1);
				break;
			}

			default:
				resolveCompensatableNL();
				appendChildren(node.childNodes);
				break;
		}
	}
}

function getText(node: parse5.Node): string {
	if (treeAdapter.isTextNode(node)) return node.value;
	if (!treeAdapter.isElementNode(node)) return '';
	if (node.nodeName === 'br') return '\n';

	if (node.childNodes) {
		return node.childNodes.map(n => getText(n)).join('');
	}

	return '';
}
