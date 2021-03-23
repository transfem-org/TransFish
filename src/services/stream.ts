import * as mongo from 'mongodb';
import redis from '../db/redis';
import Xev from 'xev';
import config from '../config';
import { PackedNote } from '../models/packed-schemas';

type ID = string | mongo.ObjectID;

export type PubSubMessage<T> = {
	type: string;
	body: T | null;
}

export type NoteStreamBody = {
	/** Note id */
	id: string;
	body: unknown;
};

class Publisher {
	private ev?: Xev;

	constructor() {
		// Redisがインストールされてないときはプロセス間通信を使う
		if (redis == null) {
			this.ev = new Xev();
		}
	}

	private publish = (channel: string, type: string | null, value?: unknown): void => {
		const message: PubSubMessage<unknown> | unknown = type == null ? value : value == null ?
			{ type: type, body: null } :
			{ type: type, body: value };

		if (this.ev) {
			this.ev.emit(channel, message);
		} else {
			redis!.publish(config.host, JSON.stringify({
				channel: channel,
				message: message
			}));
		}
	}

	public publishMainStream = (userId: ID, type: string, value?: unknown): void => {
		this.publish(`mainStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}

	public publishDriveStream = (userId: ID, type: string, value?: unknown): void => {
		this.publish(`driveStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}

	public publishNoteStream = (noteId: ID, type: string, value: unknown): void => {
		this.publish(`noteStream:${noteId}`, type, {
			id: noteId,
			body: value
		} as NoteStreamBody);
	}

	public publishUserListStream = (listId: ID, type: string, value?: unknown): void => {
		this.publish(`userListStream:${listId}`, type, typeof value === 'undefined' ? null : value);
	}

	public publishMessagingStream = (userId: ID, otherpartyId: ID, type: string, value?: unknown): void => {
		this.publish(`messagingStream:${userId}-${otherpartyId}`, type, typeof value === 'undefined' ? null : value);
	}

	public publishMessagingIndexStream = (userId: ID, type: string, value?: unknown): void => {
		this.publish(`messagingIndexStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}

	public publishReversiStream = (userId: ID, type: string, value?: unknown): void => {
		this.publish(`reversiStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}

	public publishReversiGameStream = (gameId: ID, type: string, value?: unknown): void => {
		this.publish(`reversiGameStream:${gameId}`, type, typeof value === 'undefined' ? null : value);
	}

	public publishNotesStream = (note: PackedNote): void => {
		this.publish('notesStream', null, note);
	}

	public publishHotStream = (note: PackedNote): void => {
		this.publish(`hotStream`, null, note);
	}

	public publishAdminStream = (userId: ID, type: string, value?: unknown): void => {
		this.publish(`adminStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}

	public publishServerEvent = (userId: ID | null, type: string, value?: unknown): void => {
		const name = userId ? `serverEvent:${userId}` : `serverEvent`;
		this.publish(name, type, typeof value === 'undefined' ? null : value);
	}
}

const publisher = new Publisher();

export default publisher;

export const publishMainStream = publisher.publishMainStream;
export const publishDriveStream = publisher.publishDriveStream;
export const publishNoteStream = publisher.publishNoteStream;
export const publishNotesStream = publisher.publishNotesStream;
export const publishUserListStream = publisher.publishUserListStream;
export const publishHotStream = publisher.publishHotStream;
export const publishMessagingStream = publisher.publishMessagingStream;
export const publishMessagingIndexStream = publisher.publishMessagingIndexStream;
export const publishReversiStream = publisher.publishReversiStream;
export const publishReversiGameStream = publisher.publishReversiGameStream;
export const publishAdminStream = publisher.publishAdminStream;
export const publishServerEvent = publisher.publishServerEvent;
