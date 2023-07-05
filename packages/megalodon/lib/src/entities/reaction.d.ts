/// <reference path="account.d.ts" />
declare namespace Entity {
    type Reaction = {
        count: number;
        me: boolean;
        name: string;
        url?: string;
        accounts?: Array<Account>;
    };
}
