const twemojiRegex = require('twemoji-parser/dist/lib/regex').default;

export const emojiRegex = new RegExp(`(${twemojiRegex.source})`);

export const emojiRegexWithCustom = new RegExp(`(${emojiRegex.source}|:[0-9A-Za-z_]+:)`, 'g');

// Ninja catなどTwemojiを迂回させたいもの
export const vendorEmojiRegex = /(\uD83D\uDC31\u200D(?:\uD83D\uDC64|\uD83D\uDE80|\uD83D\uDC53|\uD83D\uDCBB|\uD83D\uDC09|\uD83C\uDFCD))/;

// ローカル定義Twemoji
export const localEmojiRegex = /(\uD83D\uDE36\u200D\uD83C\uDF2B\uFE0F|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDE35\u200D\uD83D\uDCAB|\u2764\uFE0F\u200D\uD83D\uDD25|\u2764\uFE0F\u200D\uD83E\uDE79)/;
