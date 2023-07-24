CREATE TYPE IF NOT EXISTS drive_file (
	id ascii,
	type ascii,
	createdAt timestamp,
	name text,
	comment text,
	blurhash text,
	url text,
	thumbnailUrl text,
	isSensitive boolean,
	isLink boolean,
	md5 ascii,
	size int,
	width int,
	height int,
);

CREATE TYPE IF NOT EXISTS note_edit_history (
	content text,
	cw text,
	files set<frozen<drive_file>>,
	updatedAt timestamp,
);

CREATE TYPE IF NOT EXISTS emoji (
	name text,
	url text,
	width int,
	height int,
);

CREATE TABLE IF NOT EXISTS note ( -- Models timeline
	createdAtDate date, -- For partitioning
	createdAt timestamp,
	id ascii, -- Post
	visibility ascii,
	content text,
	name text,
	cw text,
	localOnly boolean,
	renoteCount int,
	repliesCount int,
	uri text,
	url text,
	score int,
	files set<frozen<drive_file>>,
	visibleUsersId set<ascii>,
	mentions set<ascii>,
	emojis set<frozen<emoji>>,
	tags set<text>,
	hasPoll boolean,
	threadId ascii,
	channelId ascii, -- Channel
	channelName text,
	userId ascii, -- User
	replyId ascii, -- Reply
	renoteId ascii, -- Boost
	reactions map<text, int>,
	reactionEmojis map<text, frozen<emoji>>,
	noteEdit set<frozen<note_edit_history>>, -- Edit History
	updatedAt timestamp,
	PRIMARY KEY (createdAtDate, createdAt)
) WITH CLUSTERING ORDER BY (createdAt DESC);

CREATE INDEX IF NOT EXISTS note_by_id ON note (id);
CREATE INDEX IF NOT EXISTS note_by_uri ON note (uri);
CREATE INDEX IF NOT EXISTS note_by_url ON note (url);

CREATE MATERIALIZED VIEW IF NOT EXISTS note_by_user_id AS
	SELECT * FROM note
	WHERE userId IS NOT NULL
	AND createdAt IS NOT NULL
	AND createdAtDate IS NOT NULL
	PRIMARY KEY (userId, createdAt, createdAtDate)
	WITH CLUSTERING ORDER BY (createdAt DESC);

CREATE TABLE IF NOT EXISTS reaction (
	noteId ascii,
	createdAt timestamp,
	userId ascii,
	reaction frozen<emoji>,
	PRIMARY KEY (noteId, createdAt, userId)
);
