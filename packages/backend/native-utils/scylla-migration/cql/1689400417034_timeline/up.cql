CREATE TYPE IF NOT EXISTS drive_file (
	"id" ascii,
	"type" ascii,
	"createdAt" timestamp,
	"name" text,
	"comment" text,
	"blurhash" text,
	"url" text,
	"thumbnailUrl" text,
	"isSensitive" boolean,
	"isLink" boolean,
	"md5" ascii,
	"size" int
);

CREATE TYPE IF NOT EXISTS note_edit_history (
	"content" text,
	"cw" text,
	"files" set<frozen<drive_file>>,
	"updatedAt" timestamp,
);

CREATE TYPE IF NOT EXISTS emoji (
	"name" text,
	"url" text,
	"width" int,
	"height" int,
);

CREATE TABLE IF NOT EXISTS note ( -- Models timeline
	"createdAtDate" date, -- For partitioning
	"createdAt" timestamp,
	"id" ascii, -- Post
	"visibility" ascii,
	"content" text,
	"name" text,
	"cw" text,
	"localOnly" boolean,
	"renoteCount" int,
	"repliesCount" int,
	"uri" text,
	"url" text,
	"score" int,
	"files" set<frozen<drive_file>>,
	"visibleUserIds" set<ascii>,
	"mentions" set<ascii>,
	"emojis" set<text>,
	"tags" set<text>,
	"hasPoll" boolean,
	"threadId" ascii,
	"channelId" ascii, -- Channel
	"userId" ascii, -- User
	"userHost" text,
	"replyId" ascii, -- Reply
	"replyUserId" ascii,
	"replyUserHost" text,
	"renoteId" ascii, -- Boost
	"renoteUserId" ascii,
	"renoteUserHost" text,
	"reactions" map<text, int>, -- Reactions
	"noteEdit" set<frozen<note_edit_history>>, -- Edit History
	"updatedAt" timestamp,
	PRIMARY KEY ("createdAtDate", "createdAt", "id")
) WITH CLUSTERING ORDER BY ("createdAt" DESC);

CREATE INDEX IF NOT EXISTS note_by_id ON note (id);
CREATE INDEX IF NOT EXISTS note_by_uri ON note (uri);
CREATE INDEX IF NOT EXISTS note_by_url ON note (url);

CREATE MATERIALIZED VIEW IF NOT EXISTS note_by_userid AS
	SELECT * FROM note
	WHERE "userId" IS NOT NULL
	AND "createdAt" IS NOT NULL
	AND "createdAtDate" IS NOT NULL
	AND "id" IS NOT NULL
	PRIMARY KEY ("userId", "createdAt", "createdAtDate", "id")
	WITH CLUSTERING ORDER BY ("createdAt" DESC);

CREATE TABLE IF NOT EXISTS reaction (
	"id" text,
	"noteId" ascii,
	"userId" ascii,
	"reaction" text,
	"emoji" frozen<emoji>,
	"createdAt" timestamp,
	PRIMARY KEY ("noteId", "userId")
);

CREATE INDEX IF NOT EXISTS reaction_by_id ON reaction (id);

CREATE MATERIALIZED VIEW IF NOT EXISTS reaction_by_userid AS
	SELECT * FROM reaction
	WHERE "userId" IS NOT NULL
	AND "createdAt" IS NOT NULL
	AND "noteId" IS NOT NULL
	PRIMARY KEY ("userId", "createdAt", "noteId")
	WITH CLUSTERING ORDER BY ("createdAt" DESC);
