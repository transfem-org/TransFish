export function nyaize(text: string): string {
	return text
		// ja-JP
		.replace(/な/g, 'にゃ').replace(/ナ/g, 'ニャ').replace(/ﾅ/g, 'ﾆｬ')
}
