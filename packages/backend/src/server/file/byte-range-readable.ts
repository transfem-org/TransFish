import { Readable, ReadableOptions } from "node:stream";
import { Buffer, constants as BufferConstants } from "node:buffer";
import * as fs from "node:fs";

interface ByteRange {
	start: bigint;
	end: bigint;
	size: bigint;
}

const BOUNDARY_CHARS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const BYTERANGE_SPEC_REGEX = /^bytes=(.+)$/;
const BYTERANGE_REGEX = /(\d*)-(\d*)/;

const BIGINT_0 = BigInt(0);
const BIGINT_1 = BigInt(1);
const BOUNDARY_SIZE = 40;

function extractRanges(
	fileSize: bigint,
	maxByteRanges: number,
	rangeHeaderValue: string,
): ByteRange[] {
	const ranges: ByteRange[] = [];

	if (!rangeHeaderValue) return ranges;

	const rangeSpecMatch = rangeHeaderValue.match(BYTERANGE_SPEC_REGEX);
	if (!rangeSpecMatch) return [];

	const rangeSpecs = rangeSpecMatch[1].split(",");
	for (let i = 0; i < rangeSpecs.length; i = i + 1) {
		const byteRange = rangeSpecs[i].match(BYTERANGE_REGEX);
		if (!byteRange) return [];

		let start: bigint;
		let end: bigint;
		let size: bigint;

		if (byteRange[1]) {
			start = BigInt(byteRange[1]);
		}

		if (byteRange[2]) {
			end = BigInt(byteRange[2]);
		}

		if (start === undefined && end === undefined) {
			/* some invalid range like bytes=- */
			return [];
		}

		if (start === undefined) {
			/* end-of-file range like -500 */
			start = fileSize - end;
			end = fileSize - BIGINT_1;
			if (start < BIGINT_0) return []; /* range larger than file, return */
		}

		if (end === undefined) {
			/* range like 0- */
			end = fileSize - BIGINT_1;
		}

		if (start > end || end >= fileSize) {
			/* return empty range to issue regular 200 */
			return [];
		}
		size = end - start + BIGINT_1;

		if (1 > maxByteRanges - ranges.length) return [];

		ranges.push({
			start: start,
			end: end,
			size: size,
		});
	}

	return ranges;
}

function createBoundary(len: number): string {
	let chars = [];
	for (let i = 0; i < len; i = i + 1) {
		chars[i] = BOUNDARY_CHARS.charAt(
			Math.floor(Math.random() * BOUNDARY_CHARS.length),
		);
	}
	return chars.join("");
}

class ByteRangeReadable extends Readable {
	size: bigint; /* the total size in bytes */
	boundary: string; /* boundary marker to use in multipart headers */

	private fd: number;
	private ranges: ByteRange[];
	private index: number; /* index within ranges */
	private position: bigint;
	private end: bigint;
	private contentType: string;
	private fileSize: bigint;
	private headers: Buffer[];
	private trailer: Buffer;

	static parseByteRanges(
		fileSize: bigint,
		maxByteRanges: number,
		rangeHeaderValue?: string,
	): ByteRange[] {
		return extractRanges(fileSize, maxByteRanges, rangeHeaderValue);
	}

	private createPartHeader(range: ByteRange): Buffer {
		return Buffer.from(
			[
				"",
				`--${this.boundary}`,
				`Content-Type: ${this.contentType}`,
				`Content-Range: bytes ${range.start}-${range.end}/${this.fileSize}`,
				"",
				"",
			].join("\r\n"),
		);
	}

	constructor(
		fd: number,
		fileSize: bigint,
		ranges: ByteRange[],
		contentType: string,
		opts?: ReadableOptions,
	) {
		super(opts);

		if (ranges.length === 0) {
			throw Error("this requires at least 1 byte range");
		}

		this.fd = fd;
		this.ranges = ranges;
		this.fileSize = fileSize;
		this.contentType = contentType;

		this.position = BIGINT_1;
		this.end = BIGINT_0;
		this.index = -1;
		this.headers = [];

		this.size = BIGINT_0;

		if (this.ranges.length === 1) {
			this.size = this.ranges[0].size;
		} else {
			this.boundary = createBoundary(BOUNDARY_SIZE);
			this.ranges.forEach((r) => {
				const header = this.createPartHeader(r);
				this.headers.push(header);

				this.size += BigInt(header.length) + r.size;
			});
			this.trailer = Buffer.from(`\r\n--${this.boundary}--\r\n`);
			this.size += BigInt(this.trailer.length);
		}
	}

	_read(n) {
		if (this.index == this.ranges.length) {
			this.push(null);
			return;
		}

		if (this.position > this.end) {
			/* move ahead to the next index */
			this.index++;

			if (this.index === this.ranges.length) {
				if (this.trailer) {
					this.push(this.trailer);
					return;
				}
				this.push(null);
				return;
			}

			this.position = this.ranges[this.index].start;
			this.end = this.ranges[this.index].end;

			if (this.ranges.length > 1) {
				this.push(this.headers[this.index]);
				return;
			}
		}

		const max = this.end - this.position + BIGINT_1;

		if (n > max) n = Number(max);
		const buf = Buffer.alloc(n);

		fs.read(this.fd, buf, 0, n, this.position, (err, bytesRead) => {
			if (err) {
				this.destroy(err);
				return;
			}
			if (bytesRead == 0) {
				/* something seems to have gone wrong? */
				this.push(null);
				return;
			}

			if (bytesRead > n) bytesRead = n;

			this.position += BigInt(bytesRead);
			this.push(buf.slice(0, bytesRead));
		});
	}
}

export { ByteRange, ByteRangeReadable };
