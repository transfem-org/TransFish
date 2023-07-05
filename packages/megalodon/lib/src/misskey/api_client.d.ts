import { ProxyConfig } from '../proxy_config';
import Response from '../response';
import MisskeyEntity from './entity';
import MegalodonEntity from '../entity';
import WebSocket from './web_socket';
import NotificationType from '../notification';
declare namespace MisskeyAPI {
    namespace Entity {
        type App = MisskeyEntity.App;
        type Announcement = MisskeyEntity.Announcement;
        type Blocking = MisskeyEntity.Blocking;
        type Choice = MisskeyEntity.Choice;
        type CreatedNote = MisskeyEntity.CreatedNote;
        type Emoji = MisskeyEntity.Emoji;
        type Favorite = MisskeyEntity.Favorite;
        type Field = MisskeyEntity.Field;
        type File = MisskeyEntity.File;
        type Follower = MisskeyEntity.Follower;
        type Following = MisskeyEntity.Following;
        type FollowRequest = MisskeyEntity.FollowRequest;
        type Hashtag = MisskeyEntity.Hashtag;
        type List = MisskeyEntity.List;
        type Meta = MisskeyEntity.Meta;
        type Mute = MisskeyEntity.Mute;
        type Note = MisskeyEntity.Note;
        type Notification = MisskeyEntity.Notification;
        type Poll = MisskeyEntity.Poll;
        type Reaction = MisskeyEntity.Reaction;
        type Relation = MisskeyEntity.Relation;
        type User = MisskeyEntity.User;
        type UserDetail = MisskeyEntity.UserDetail;
        type UserDetailMe = MisskeyEntity.UserDetailMe;
        type GetAll = MisskeyEntity.GetAll;
        type UserKey = MisskeyEntity.UserKey;
        type Session = MisskeyEntity.Session;
        type Stats = MisskeyEntity.Stats;
        type APIEmoji = {
            emojis: Emoji[];
        };
    }
    class Converter {
        private baseUrl;
        private instanceHost;
        private plcUrl;
        private modelOfAcct;
        constructor(baseUrl: string);
        escapeMFM: (text: string) => string;
        emoji: (e: Entity.Emoji) => MegalodonEntity.Emoji;
        field: (f: Entity.Field) => MegalodonEntity.Field;
        user: (u: Entity.User) => MegalodonEntity.Account;
        userDetail: (u: Entity.UserDetail, host: string) => MegalodonEntity.Account;
        userPreferences: (u: MisskeyAPI.Entity.UserDetailMe, g: MisskeyAPI.Entity.GetAll) => MegalodonEntity.Preferences;
        visibility: (v: 'public' | 'home' | 'followers' | 'specified') => 'public' | 'unlisted' | 'private' | 'direct';
        encodeVisibility: (v: 'public' | 'unlisted' | 'private' | 'direct') => 'public' | 'home' | 'followers' | 'specified';
        fileType: (s: string) => 'unknown' | 'image' | 'gifv' | 'video' | 'audio';
        file: (f: Entity.File) => MegalodonEntity.Attachment;
        follower: (f: Entity.Follower) => MegalodonEntity.Account;
        following: (f: Entity.Following) => MegalodonEntity.Account;
        relation: (r: Entity.Relation) => MegalodonEntity.Relationship;
        choice: (c: Entity.Choice) => MegalodonEntity.PollOption;
        poll: (p: Entity.Poll) => MegalodonEntity.Poll;
        note: (n: Entity.Note, host: string) => MegalodonEntity.Status;
        mapReactions: (r: {
            [key: string]: number;
        }, myReaction?: string) => Array<MegalodonEntity.Reaction>;
        getTotalReactions: (r: {
            [key: string]: number;
        }) => number;
        reactions: (r: Array<Entity.Reaction>) => Array<MegalodonEntity.Reaction>;
        noteToConversation: (n: Entity.Note, host: string) => MegalodonEntity.Conversation;
        list: (l: Entity.List) => MegalodonEntity.List;
        encodeNotificationType: (e: MegalodonEntity.NotificationType) => MisskeyEntity.NotificationType;
        decodeNotificationType: (e: MisskeyEntity.NotificationType) => MegalodonEntity.NotificationType;
        announcement: (a: Entity.Announcement) => MegalodonEntity.Announcement;
        notification: (n: Entity.Notification, host: string) => MegalodonEntity.Notification;
        stats: (s: Entity.Stats) => MegalodonEntity.Stats;
        meta: (m: Entity.Meta, s: Entity.Stats) => MegalodonEntity.Instance;
        hashtag: (h: Entity.Hashtag) => MegalodonEntity.Tag;
    }
    const DEFAULT_SCOPE: string[];
    interface Interface {
        post<T = any>(path: string, params?: any, headers?: {
            [key: string]: string;
        }): Promise<Response<T>>;
        cancel(): void;
        socket(channel: 'user' | 'localTimeline' | 'hybridTimeline' | 'globalTimeline' | 'conversation' | 'list', listId?: string): WebSocket;
    }
    class Client implements Interface {
        private accessToken;
        private baseUrl;
        private userAgent;
        private abortController;
        private proxyConfig;
        private converter;
        constructor(baseUrl: string, accessToken: string | null, userAgent: string | undefined, proxyConfig: false | ProxyConfig | undefined, converter: Converter);
        post<T>(path: string, params?: any, headers?: {
            [key: string]: string;
        }): Promise<Response<T>>;
        cancel(): void;
        socket(channel: 'user' | 'localTimeline' | 'hybridTimeline' | 'globalTimeline' | 'conversation' | 'list', listId?: string): WebSocket;
    }
}
export default MisskeyAPI;
