/// <reference path="attachment.d.ts" />
/// <reference path="status_params.d.ts" />
declare namespace PleromaEntity {
    type ScheduledStatus = {
        id: string;
        scheduled_at: string;
        params: StatusParams;
        media_attachments: Array<Attachment>;
    };
}
