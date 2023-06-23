import data from "unicode-emoji-json/data-by-group.json";
import emojiComponents from "unicode-emoji-json/data-emoji-components.json";
import keywordSet from "emojilib";
import { defaultStore } from "@/store";

export const unicodeEmojiCategories = [
	"emotion",
	"people",
	"animals_and_nature",
	"food_and_drink",
	"activity",
	"travel_and_places",
	"objects",
	"symbols",
	"flags",
] as const;

export const categoryMapping = {
	"Smileys & Emotion": "emotion",
	"People & Body": "people",
	"Animals & Nature": "animals_and_nature",
	"Food & Drink": "food_and_drink",
	"Activities": "activity",
	"Travel & Places": "travel_and_places",
	"Objects": "objects",
	"Symbols": "symbols",
	"Flags": "flags",
} as const;

function addSkinTone(emoji: string) {
	const skinTone = defaultStore.state.reactionPickerSkinTone;
	if (skinTone === 1) return emoji;
	if (skinTone === 2) return emoji + emojiComponents.light_skin_tone;
	if (skinTone === 3) return emoji + emojiComponents.medium_light_skin_tone;
	if (skinTone === 4) return emoji + emojiComponents.medium_skin_tone;
	if (skinTone === 5) return emoji + emojiComponents.medium_dark_skin_tone;
	if (skinTone === 6) return emoji + emojiComponents.dark_skin_tone;
	return emoji;
}

const unicodeFifteenEmojis = [
	'🫨', '🩷', '🩵', '🩶',
	'🫷', '🫸', '🫎', '🫏',
	'🪽', '🐦‍⬛', '🪿', '🪼',
	'🪻', '🫚', '🫛', '🪭',
	'🪮', '🪇', '🪈', '🪯',
	'🛜'
]

const newData = {};

Object.keys(data).forEach((originalCategory) => {
	const newCategory = categoryMapping[originalCategory];
	if (newCategory) {
		newData[newCategory] = newData[newCategory] || [];
		Object.keys(data[originalCategory]).forEach((emojiIndex) => {
			const emojiObj = { ...data[originalCategory][emojiIndex] };
			if (unicodeFifteenEmojis.includes(emojiObj.emoji)) {
				return;
			}
			if (emojiObj.skin_tone_support) {
				emojiObj.emoji = addSkinTone(emojiObj.emoji);
			}
			emojiObj.category = newCategory;
			emojiObj.keywords = keywordSet[emojiObj.emoji];
			newData[newCategory].push(emojiObj);
		});
	}
});

export type UnicodeEmojiDef = {
	emoji: string;
	category: typeof unicodeEmojiCategories[number];
	slug: string;
	keywords?: string[];
};

export const emojilist: UnicodeEmojiDef[] = Object.keys(newData).reduce((acc, category) => {
	const categoryItems = newData[category].map((item) => {
		return {
			emoji: item.emoji,
			slug: item.slug,
			category: item.category,
			keywords: item.keywords || [],
		};
	});
	return acc.concat(categoryItems);
}, []);


export function getNicelyLabeledCategory(internalName) {
	return Object.keys(categoryMapping).find(
		(key) => categoryMapping[key] === internalName
	) || internalName;
}
