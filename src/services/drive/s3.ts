import * as S3 from 'aws-sdk/clients/s3';
import { DriveConfig } from '../../config/types';
import { httpAgent, httpsAgent } from '../../misc/fetch';

export function getS3(drive: DriveConfig) {
	if (drive.config == null) throw 'drive.config is null';
	return new S3({
		endpoint: drive.config.endPoint || undefined,
		accessKeyId: drive.config.accessKey,
		secretAccessKey: drive.config.secretKey,
		region: drive.config.region || undefined,
		sslEnabled: drive.config.useSSL,
		s3ForcePathStyle: drive.config.s3ForcePathStyle == null ? !!drive.config.endPoint : drive.config.s3ForcePathStyle,
		httpOptions: {
			agent: drive.config.useSSL ? httpsAgent : httpAgent
		}
	});
}
