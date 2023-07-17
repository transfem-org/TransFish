import { getHtml } from "@/misc/fetch.js";
import { JSDOM } from "jsdom";

export async function getRelMeLinks(url: string): Promise<string[]> {
	try {
		const html = await getHtml(url);
		const dom = new JSDOM(html);
		const relMeLinks = [
			...dom.window.document.querySelectorAll("a[rel='me']"),
		].map((a) => (a as HTMLAnchorElement).href);
		return relMeLinks;
	}
	catch {
		return [];
	}
}
