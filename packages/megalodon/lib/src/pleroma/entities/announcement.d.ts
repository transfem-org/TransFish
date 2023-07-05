/// <reference path="tag.d.ts" />
/// <reference path="emoji.d.ts" />
/// <reference path="reaction.d.ts" />
declare namespace PleromaEntity {
    type Announcement = {
        id: string;
        content: string;
        starts_at: string | null;
        ends_at: string | null;
        published: boolean;
        all_day: boolean;
        published_at: string;
        updated_at: string;
        read?: boolean;
        mentions: Array<AnnouncementAccount>;
        statuses: Array<AnnouncementStatus>;
        tags: Array<Tag>;
        emojis: Array<Emoji>;
        reactions: Array<Reaction>;
    };
    type AnnouncementAccount = {
        id: string;
        username: string;
        url: string;
        acct: string;
    };
    type AnnouncementStatus = {
        id: string;
        url: string;
    };
}
