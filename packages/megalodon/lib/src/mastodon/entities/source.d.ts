/// <reference path="field.d.ts" />
declare namespace MastodonEntity {
    type Source = {
        privacy: string | null;
        sensitive: boolean | null;
        language: string | null;
        note: string;
        fields: Array<Field>;
    };
}
