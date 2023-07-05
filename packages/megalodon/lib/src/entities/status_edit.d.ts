/// <reference path="account.d.ts" />
/// <reference path="application.d.ts" />
/// <reference path="mention.d.ts" />
/// <reference path="tag.d.ts" />
/// <reference path="attachment.d.ts" />
/// <reference path="emoji.d.ts" />
/// <reference path="card.d.ts" />
/// <reference path="poll.d.ts" />
/// <reference path="reaction.d.ts" />
declare namespace Entity {
    type StatusEdit = {
        account: Account;
        content: string;
        plain_content: string | null;
        created_at: string;
        emojis: Emoji[];
        sensitive: boolean;
        spoiler_text: string;
        media_attachments: Array<Attachment>;
        poll: Poll | null;
    };
}
