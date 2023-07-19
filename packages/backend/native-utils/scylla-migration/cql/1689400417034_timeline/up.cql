CREATE TYPE IF NOT EXISTS drive_file (
	id ascii,
	type ascii,
	created_at timestamp,
	name text,
	comment text,
	blurhash text,
	url text,
	thumbnail_url text,
	is_sensitive boolean,
	is_link boolean,
	md5 ascii,
	size int,
	width int,
	height int,
);

CREATE TYPE IF NOT EXISTS note_edit_history (
	content text,
	cw text,
	files set<frozen<drive_file>>,
	updated_at timestamp,
);

CREATE TYPE IF NOT EXISTS emoji (
	name text,
	url text,
	width int,
	height int,
);

CREATE TABLE IF NOT EXISTS note ( -- Models timeline
	created_at_date date, -- For partitioning
	created_at timestamp,
	id ascii, -- Post
	visibility ascii,
	content text,
	name text,
	cw text,
	local_only boolean,
	renote_count int,
	replies_count int,
	uri text,
	url text,
	score int,
	files set<frozen<drive_file>>,
	visible_users set<ascii>,
	mentions set<ascii>,
	emojis set<frozen<emoji>>,
	tags set<text>,
	has_poll boolean,
	thread_id ascii,
	channel_id ascii, -- Channel
	channel_name text,
	user_id ascii, -- User
	reply_id ascii, -- Reply
	renote_id ascii, -- Boost
	note_edit set<frozen<note_edit_history>>, -- Edit History
	updated_at timestamp,
	reactions map<text, int>,
	reaction_emojis map<text, frozen<emoji>>,
	PRIMARY KEY (created_at_date, created_at)
) WITH CLUSTERING ORDER BY (created_at DESC);

CREATE INDEX IF NOT EXISTS note_by_id ON note (id);
CREATE INDEX IF NOT EXISTS note_by_uri ON note (uri);
CREATE INDEX IF NOT EXISTS note_by_url ON note (url);

CREATE MATERIALIZED VIEW IF NOT EXISTS note_by_user_id AS
	SELECT * FROM note
	WHERE user_id IS NOT NULL
	AND created_at IS NOT NULL
	AND created_at_date IS NOT NULL
	PRIMARY KEY (user_id, created_at, created_at_date)
	WITH CLUSTERING ORDER BY (created_at DESC);

CREATE TABLE IF NOT EXISTS reaction (
	note_id ascii,
	created_at timestamp,
	user_id ascii,
	reaction frozen<emoji>,
	PRIMARY KEY (note_id, created_at, user_id)
);
