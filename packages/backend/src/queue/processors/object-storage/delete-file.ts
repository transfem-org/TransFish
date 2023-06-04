import type { ObjectStorageFileJobData } from "@/queue/types.js";
import type * as Bull from "bullmq";
import { deleteObjectStorageFile } from "@/services/drive/delete-file.js";

export default async (job: Bull.Job<ObjectStorageFileJobData>) => {
	const key: string = job.data.key;

	await deleteObjectStorageFile(key);

	return "Success";
};
