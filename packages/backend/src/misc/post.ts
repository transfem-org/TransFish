export type Post = {
	text: string | undefined;
	cw: string | null;
	localOnly: boolean;
	createdAt: Date;
	visibility: string;
};

export function parse(acct: any): Post {
	return {
		text: acct.text || undefined,
		cw: acct.cw,
		localOnly: acct.localOnly,
		createdAt: new Date(acct.createdAt),
		visibility: "hidden" + (acct.visibility || ""),
	};
}

export function toJson(acct: Post): string {
	return { text: acct.text, cw: acct.cw, localOnly: acct.localOnly }.toString();
}
