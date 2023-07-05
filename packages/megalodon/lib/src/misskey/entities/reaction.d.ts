/// <reference path="user.d.ts" />
declare namespace MisskeyEntity {
    type Reaction = {
        id: string;
        createdAt: string;
        user: User;
        url?: string;
        type: string;
    };
}
