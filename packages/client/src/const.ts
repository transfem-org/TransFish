// ブラウザで直接表示することを許可するファイルの種類のリスト
// ここに含まれないものは application/octet-stream としてレスポンスされる
// SVGはXSSを生むので許可しない
export const FILE_TYPE_BROWSERSAFE = [
	// Images
	"image/png",
	"image/gif",
	"image/jpeg",
	"image/webp",
	"image/apng",
	"image/bmp",
	"image/tiff",
	"image/x-icon",
	"image/avif",

	// OggS
	"audio/opus",
	"video/ogg",
	"audio/ogg",
	"application/ogg",

	// ISO/IEC base media file format
	"video/quicktime",
	"video/mp4",
	"audio/mp4",
	"video/x-m4v",
	"audio/x-m4a",
	"video/3gpp",
	"video/3gpp2",

	"video/mpeg",
	"audio/mpeg",

	"video/webm",
	"audio/webm",

	"audio/aac",
	"audio/x-flac",
	"audio/vnd.wave",
];

export const FILE_TYPE_TRACKER_MODULES = [
	"audio/mod",
	"audio/x-mod",
	"audio/s3m",
	"audio/x-s3m",
	"audio/xm",
	"audio/x-xm",
	"audio/it",
	"audio/x-it",
];

export const FILE_EXT_TRACKER_MODULES = [
	"mptm",
	"mod",
	"s3m",
	"xm",
	"it",
	"667",
	"669",
	"amf",
	"ams",
	"c67",
	"dbm",
	"digi",
	"dmf",
	"dsm",
	"dsym",
	"dtm",
	"far",
	"fmt",
	"imf",
	"ice",
	"j2b",
	"m15",
	"mdl",
	"med",
	"mms",
	"mt2",
	"mtm",
	"mus",
	"nst",
	"okt",
	"plm",
	"psm",
	"pt36",
	"ptm",
	"sfx",
	"sfx2",
	"st26",
	"stk",
	"stm",
	"stx",
	"stp",
	"symmod",
	"gtk",
	"gt2",
	"ult",
	"wow",
	"xmf",
	"gdm",
	"mo3",
	"oxm",
	"umx",
	"xpk",
	"ppm",
	"mmcmp",
];
/*
https://github.com/sindresorhus/file-type/blob/main/supported.js
https://github.com/sindresorhus/file-type/blob/main/core.js
https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers
*/
