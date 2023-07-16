import * as fs from "node:fs";
import Logger from "@/services/logger.js";
import { createTemp, createTempDir } from "./create-temp.js";
import { downloadUrl } from "./download-url.js";
import { addFile } from "@/services/drive/add-file.js";
import { exec } from "node:child_process";
import { Users } from "@/models/index.js";

const logger = new Logger("download-text-file");

export async function processMastoNotes(
	url: string,
	uid: string,
): Promise<any> {
	// Create temp file
	const [path, cleanup] = await createTemp();

	const [unzipPath, unzipCleanup] = await createTempDir();

	logger.info(`Temp file is ${path}`);

	try {
		// write content at URL to temp file
		await downloadUrl(url, path);
		return await processMastoFile(path, unzipPath, uid);
	} finally {
		cleanup();
		unzipCleanup();
	}
}

function processMastoFile(fn: string, dir: string, uid: string) {
	return new Promise(async (resolve, reject) => {
		const user = await Users.findOneBy({ id: uid });
		exec(
			`tar -xf ${fn} -C ${dir}`,
			async (error: any, stdout: string, stderr: string) => {
				if (error) {
					reject(error);
				}
				const outbox = JSON.parse(fs.readFileSync(`${dir}/outbox.json`));
				for (const note of outbox.orderedItems) {
					for (const attachment of note.object.attachment) {
						const url = attachment.url.replace("..", "");
						try {
							const fpath = `${dir}${url}`;
							const driveFile = await addFile({ user: user, path: fpath });
							attachment.driveFile = driveFile;
						} catch (e) {
							logger.error(`Skipped adding file to drive: ${url}`);
						}
					}
				}
				resolve(outbox);
			},
		);
	});
}
