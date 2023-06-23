import data from "unicode-emoji-json/data-by-group.json";
import components from "unicode-emoji-json/data-emoji-components.json";
import keywordSet from "emojilib";

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

const skinToneModifiers = [
	"light_skin_tone",
	"medium_light_skin_tone",
	"medium_skin_tone",
	"medium_dark_skin_tone",
	"dark_skin_tone",
];

const newData = {};

Object.keys(data).forEach((originalCategory) => {
	const newCategory = categoryMapping[originalCategory];
	if (newCategory) {
		newData[newCategory] = newData[newCategory] || [];
		Object.keys(data[originalCategory]).forEach((emojiIndex) => {
			const emojiObj = { ...data[originalCategory][emojiIndex] };
			emojiObj.keywords = keywordSet[emojiObj.emoji];
			newData[newCategory].push(emojiObj);

			if (emojiObj.skin_tone_support) {
				skinToneModifiers.forEach((modifier) => {
					const modifiedEmojiObj = { ...emojiObj };
					modifiedEmojiObj.emoji += components[modifier];
					modifiedEmojiObj.skin_tone = modifier;
					newData[newCategory].push(modifiedEmojiObj);
				});
			}
		});
	}
});

export type UnicodeEmojiDef = {
	emoji: string;
	category: typeof unicodeEmojiCategories[number];
	skin_tone_support: boolean;
	name: string;
	slug: string;
	emoji_version: string;
	skin_tone?: string;
	keywords?: string[];
};

export const emojilist = newData as UnicodeEmojiDef[];

const storeName = "emojiList";

function openDatabase() {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const openRequest = indexedDB.open("emojiDatabase", 1);

		openRequest.onupgradeneeded = () => {
			const db = openRequest.result;
			if (!db.objectStoreNames.contains(storeName)) {
				db.createObjectStore(storeName);
			}
		};
		openRequest.onsuccess = () => {
			resolve(openRequest.result);
		};
		openRequest.onerror = () => {
			reject(openRequest.error);
		};
	});
}

function storeData(db: IDBDatabase, data) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, "readwrite");
		const store = transaction.objectStore(storeName);
		store.put(data, "emojiListKey");

		transaction.oncomplete = resolve;
		transaction.onerror = reject;
	});
}

function getData(db: IDBDatabase): Promise<UnicodeEmojiDef[]> {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, "readonly");
		const store = transaction.objectStore(storeName);
		const getRequest = store.get("emojiListKey");

		getRequest.onsuccess = () => resolve(getRequest.result);
		getRequest.onerror = reject;
	});
}

export async function getEmojiData(): Promise<UnicodeEmojiDef[]> {
	try {
		const db = await openDatabase();
		const cachedData = await getData(db);

		if (cachedData) {
			return cachedData;
		} else {
			await storeData(db, emojilist);
			console.log("Emoji data stored in IndexedDB");
			return emojilist;
		}
	} catch (err) {
		console.error("Error accessing IndexedDB:", err);
		return emojilist;
	}
}

export function getNicelyLabeledCategory(internalName) {
	return Object.keys(categoryMapping).find(
		(key) => categoryMapping[key] === internalName
	) || internalName;
}
