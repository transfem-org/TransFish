import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { Buffer, constants as BufferConstants } from "node:buffer";
import type Koa from "koa";
import send from "koa-send";
import rename from "rename";
import { serverLogger } from "../index.js";
import { contentDisposition } from "@/misc/content-disposition.js";
import { DriveFiles } from "@/models/index.js";
import { InternalStorage } from "@/services/drive/internal-storage.js";
import { createTemp } from "@/misc/create-temp.js";
import { downloadUrl } from "@/misc/download-url.js";
import { detectType } from "@/misc/get-file-info.js";
import { convertToWebp } from "@/services/drive/image-processor.js";
import { GenerateVideoThumbnail } from "@/services/drive/generate-video-thumbnail.js";
import { StatusError } from "@/misc/fetch.js";
import { FILE_TYPE_BROWSERSAFE } from "@/const.js";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const assets = `${_dirname}/../../server/file/assets/`;

const byteRangeSpecRegex = /^bytes=(.+)$/;
const byteRangeRegex = /(\d*)-(\d*)/;
const bigintZero = BigInt(0);
const bigintOne = BigInt(1);
const bigintMaxLength = BigInt(BufferConstants.MAX_LENGTH);

const commonReadableHandlerGenerator =
	(ctx: Koa.Context) => (e: Error): void => {
		serverLogger.error(e);
		ctx.status = 500;
		ctx.set("Cache-Control", "max-age=300");
	};

const extractRanges = (ctx: Koa.Context, size: BigInt) => {
	const ranges: { start: any; end: any; length: number; }[] = [];
	const range = ctx.headers["range"];

	if (!range) return ranges;

	const rangeSpecMatch = range.match(byteRangeSpecRegex);
	if (!rangeSpecMatch) return [];

	const rangeSpecs = rangeSpecMatch[1].split(",");
	for (let i = 0; i < rangeSpecs.length; i = i + 1) {
		const byteRange = rangeSpecs[i].match(byteRangeRegex);
		if (!byteRange) return [];

		let start = null;
		let end = null;

		if (byteRange[1]) {
			start = BigInt(byteRange[1]);
		}

		if (byteRange[2]) {
			end = BigInt(byteRange[2]);
		}

		if (start === null && end === null) {
			/* some invalid range like bytes=- */
			return [];
		}

		if (start === null) {
			/* end-of-file range like -500 */
			start = size - end;
			end = size - bigintOne;
			if (start < bigintZero) return []; /* range larger than file, return */
		}

		if (end === null) {
			/* range like 0- */
			end = size - bigintOne;
		}

		if (start > end || end >= size) {
			/* return empty range to issue regular 200 */
			return [];
		}
		const length = end - start + bigintOne;

		if (length > bigintMaxLength) return [];

		ranges.push({
			start: start,
			end: end,
			length: Number(length),
		});
	}

	return ranges;
};

const boundaryCharacters =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const createBoundary = (len: number) => {
	const chars = [];
	for (let i = 0; i < len; i = i + 1) {
		chars[i] = boundaryCharacters.charAt(
			Math.floor(Math.random() * boundaryCharacters.length),
		);
	}
	return chars.join("");
};

export default async function (ctx: Koa.Context) {
	const key = ctx.params.key;

	// Fetch drive file
	const file = await DriveFiles.createQueryBuilder("file")
		.where("file.accessKey = :accessKey", { accessKey: key })
		.orWhere("file.thumbnailAccessKey = :thumbnailAccessKey", {
			thumbnailAccessKey: key,
		})
		.orWhere("file.webpublicAccessKey = :webpublicAccessKey", {
			webpublicAccessKey: key,
		})
		.getOne();

	if (file == null) {
		ctx.status = 404;
		ctx.set("Cache-Control", "max-age=86400");
		await send(ctx as any, "/dummy.png", { root: assets });
		return;
	}

	const isThumbnail = file.thumbnailAccessKey === key;
	const isWebpublic = file.webpublicAccessKey === key;

	if (!file.storedInternal) {
		if (file.isLink && file.uri) {
			// 期限切れリモートファイル
			const [path, cleanup] = await createTemp();

			try {
				await downloadUrl(file.uri, path);

				const { mime, ext } = await detectType(path);

				const convertFile = async () => {
					if (isThumbnail) {
						if (
							[
								"image/jpeg",
								"image/webp",
								"image/png",
								"image/svg+xml",
								"image/avif",
							].includes(mime)
						) {
							return await convertToWebp(path, 996, 560);
						} else if (mime.startsWith("video/")) {
							return await GenerateVideoThumbnail(path);
						}
					}

					if (isWebpublic) {
						if (["image/svg+xml"].includes(mime)) {
							return await convertToWebp(path, 2048, 2048, 100);
						}
					}

					return {
						data: fs.readFileSync(path),
						ext,
						type: mime,
					};
				};

				const image = await convertFile();
				ctx.body = image.data;
				ctx.set(
					"Content-Type",
					FILE_TYPE_BROWSERSAFE.includes(image.type)
						? image.type
						: "application/octet-stream",
				);
				ctx.set("Cache-Control", "max-age=31536000, immutable");
			} catch (e) {
				serverLogger.error(`${e}`);

				if (e instanceof StatusError && e.isClientError) {
					ctx.status = e.statusCode;
					ctx.set("Cache-Control", "max-age=86400");
				} else {
					ctx.status = 500;
					ctx.set("Cache-Control", "max-age=300");
				}
			} finally {
				cleanup();
			}
			return;
		}

		ctx.status = 204;
		ctx.set("Cache-Control", "max-age=86400");
		return;
	}

	let contentType;
	let filename;
	let fileHandle;

	if (isThumbnail || isWebpublic) {
		const { mime, ext } = await detectType(InternalStorage.resolvePath(key));
		(contentType = FILE_TYPE_BROWSERSAFE.includes(mime)
			? mime
			: "application/octet-stream"),
			(filename = rename(file.name, {
				suffix: isThumbnail ? "-thumb" : "-web",
				extname: ext ? `.${ext}` : undefined,
			}).toString());

		fileHandle = await InternalStorage.open(key, "r");
	} else {
		(contentType = FILE_TYPE_BROWSERSAFE.includes(file.type)
			? file.type
			: "application/octet-stream"),
			(filename = file.name);
		fileHandle = await InternalStorage.open(file.accessKey!, "r");
	}

	const fileStats = await fileHandle.stat({ bigint: true });

	const ranges = extractRanges(ctx, fileStats.size);

	ctx.set("Cache-Control", "max-age=31536000, immutable");
	ctx.set("Content-Disposition", contentDisposition("inline", filename));
	ctx.lastModified = fileStats.mtime;

	if (ranges.length === 0) {
		const readable = fileHandle.createReadStream();
		readable.on("error", commonReadableHandlerGenerator(ctx));

		ctx.body = readable;
		ctx.length = fileStats.size;
		ctx.set("Content-Type", contentType);
		ctx.set("Accept-Ranges", "bytes");
	} else if (ranges.length === 1) {
		const buf = Buffer.alloc(ranges[0].length);
		await fileHandle.read(buf, { position: Number(ranges[0].start) });
		fileHandle.close();

		ctx.body = buf;
		ctx.length = ranges[0].length;
		ctx.status = 206;
		ctx.set("Content-Type", contentType);
		ctx.set(
			"Content-Range",
			`bytes ${ranges[0].start}-${ranges[0].end}/${fileStats.size}`,
		);
	} else {
		const boundary = createBoundary(20);
		let buffers = [];
		let buf;

		for (let i = 0; i < ranges.length; i = i + 1) {
			buffers.push(
				Buffer.from(
					[
						"",
						`--${boundary}`,
						`Content-Type: ${contentType}`,
						`Content-Range: bytes ${ranges[i].start}-${ranges[i].end}/${fileStats.size}`,
						"\r\n",
					].join("\r\n"),
				),
			);
			buf = Buffer.alloc(ranges[i].length);
			await fileHandle.read(buf, { position: Number(ranges[i].start) });
			buffers.push(buf);
		}
		buffers.push(Buffer.from(`\r\n--${boundary}--\r\n`));
		fileHandle.close();

		ctx.body = Buffer.concat(buffers);
		ctx.length = ctx.body.length;
		ctx.status = 206;
		ctx.set("Content-Type", `multipart/byteranges; boundary=${boundary}`);
	}
}
