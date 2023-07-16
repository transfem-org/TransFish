import * as fs from "node:fs";
import Logger from "@/services/logger.js";
import { createTemp, createTempDir } from "./create-temp.js";
import { downloadUrl } from "./download-url.js";
import { addFile } from "@/services/drive/add-file.js";
import { Users } from "@/models/index.js";
import * as tar from 'tar-stream';
import gunzip from "gunzip-maybe";

const logger = new Logger("process-masto-notes");

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
		try{
			logger.info(`Start unzip ${fn}`);
			await unzipTarGz(fn, dir);
			logger.info(`Unzip to ${dir}`);
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
		}catch(e){
			logger.error(`Error on extract masto note package: ${fn}`);
			reject(e);
		}
	});
}

function createFileDir(fn: string){
	if(!fs.existsSync(fn)){
		fs.mkdirSync(fn, {recursive: true});
		fs.rmdirSync(fn);
	}
}

function unzipTarGz(fn: string, dir: string){
	return new Promise(async (resolve, reject) => {
		const onErr = (err: any) => {
			logger.error(`pipe broken: ${err}`);
			reject();
		}
		try{
			const extract = tar.extract().on('error', onErr);
			dir = dir.endsWith("/") ? dir : dir + "/";
			const ls: string[] = [];
			extract.on('entry', function (header: any, stream: any, next: any) {
				try{
					ls.push(dir + header.name);
					createFileDir(dir + header.name);
					stream.on('error', onErr).pipe(fs.createWriteStream(dir + header.name)).on('error', onErr);
					next();
				}catch(e){
					logger.error(`create dir error:${e}`);
					reject();
				}
			});

			extract.on('finish', function () {
			  resolve(ls);
			});
			
			fs.createReadStream(fn).on('error', onErr).pipe(gunzip()).on('error', onErr).pipe(extract).on('error', onErr);
			
		}catch(e){
			logger.error(`unzipTarGz error: ${e}`);
			reject();
		}
	});
}