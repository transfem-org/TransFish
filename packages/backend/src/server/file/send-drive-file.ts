import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
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
import { ByteRangeReadable } from "./byte-range-readable.js";
import { FILE_TYPE_BROWSERSAFE } from "@/const.js";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const assets = `${_dirname}/../../server/file/assets/`;

const MAX_BYTE_RANGES = 10;

const commonReadableHandlerGenerator =
	(ctx: Koa.Context) => (e: Error): void => {
		serverLogger.error(e);
		ctx.status = 500;
		ctx.set("Cache-Control", "max-age=300");
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

	// We can let Koa evaluate conditionals by setting
	// the status to 200, along with the lastModified
	// and etag properties, then checking ctx.fresh.
	// Additionally, Range is ignored if a conditional GET would
	// result in a 304 response, so we can return early here.

	ctx.status = 200;
	ctx.etag = file.md5;
	ctx.lastModified = file.createdAt;

	// When doing a conditional request, we MUST return a "Cache-Control" header
	// if a normal 200 response would have included.
	ctx.set("Cache-Control", "max-age=31536000, immutable");

	if (ctx.fresh) {
		ctx.status = 304;
		return;
	}

	ctx.set("Content-Disposition", contentDisposition("inline", filename));
	ctx.set("Content-Type", contentType);

	const ranges = ByteRangeReadable.parseByteRanges(
		BigInt(file.size),
		MAX_BYTE_RANGES,
		ctx.headers["range"],
	);
	const readable =
		ranges.length === 0
			? fileHandle.createReadStream()
			: new ByteRangeReadable(
					fileHandle.fd,
					BigInt(file.size),
					ranges,
					contentType,
			  );
	readable.on("error", commonReadableHandlerGenerator(ctx));
	ctx.body = readable;

	if (ranges.length === 0) {
		ctx.set("Accept-Ranges", "bytes");
	} else {
		ctx.status = 206;
		readable.on("close", async () => {
			await fileHandle.close();
		});

		if (ranges.length === 1) {
			ctx.set(
				"Content-Range",
				`bytes ${ranges[0].start}-${ranges[0].end}/${file.size}`,
			);
		} else {
			ctx.set(
				"Content-Type",
				`multipart/byteranges; boundary=${readable.boundary}`,
			);
		}
	}
}
