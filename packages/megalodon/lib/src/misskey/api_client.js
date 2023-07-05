"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var dayjs_1 = __importDefault(require("dayjs"));
var form_data_1 = __importDefault(require("form-data"));
var default_1 = require("../default");
var proxy_config_1 = __importDefault(require("../proxy_config"));
var web_socket_1 = __importDefault(require("./web_socket"));
var notification_1 = __importDefault(require("./notification"));
var notification_2 = __importDefault(require("../notification"));
var MisskeyAPI;
(function (MisskeyAPI) {
    var Converter = (function () {
        function Converter(baseUrl) {
            var _this = this;
            this.modelOfAcct = {
                id: "1",
                username: 'none',
                acct: 'none',
                display_name: 'none',
                locked: true,
                bot: true,
                discoverable: false,
                group: false,
                created_at: '1971-01-01T00:00:00.000Z',
                note: '',
                url: 'plc',
                avatar: 'plc',
                avatar_static: 'plc',
                header: 'plc',
                header_static: 'plc',
                followers_count: -1,
                following_count: 0,
                statuses_count: 0,
                last_status_at: '1971-01-01T00:00:00.000Z',
                noindex: true,
                emojis: [],
                fields: [],
                moved: null
            };
            this.escapeMFM = function (text) { return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/`/g, '&#x60;')
                .replace(/\r?\n/g, '<br>'); };
            this.emoji = function (e) {
                return {
                    shortcode: e.name,
                    static_url: e.url,
                    url: e.url,
                    visible_in_picker: true,
                    category: e.category
                };
            };
            this.field = function (f) { return ({
                name: f.name,
                value: _this.escapeMFM(f.value),
                verified_at: null
            }); };
            this.user = function (u) {
                var acct = u.username;
                var acctUrl = "https://".concat(u.host || _this.instanceHost, "/@").concat(u.username);
                if (u.host) {
                    acct = "".concat(u.username, "@").concat(u.host);
                    acctUrl = "https://".concat(u.host, "/@").concat(u.username);
                }
                return {
                    id: u.id,
                    username: u.username,
                    acct: acct,
                    display_name: u.name || u.username,
                    locked: false,
                    created_at: new Date().toISOString(),
                    followers_count: 0,
                    following_count: 0,
                    statuses_count: 0,
                    note: '',
                    url: acctUrl,
                    avatar: u.avatarUrl,
                    avatar_static: u.avatarUrl,
                    header: _this.plcUrl,
                    header_static: _this.plcUrl,
                    emojis: u.emojis.map(function (e) { return _this.emoji(e); }),
                    moved: null,
                    fields: [],
                    bot: false
                };
            };
            this.userDetail = function (u, host) {
                var _a, _b;
                var acct = u.username;
                host = host.replace('https://', '');
                var acctUrl = "https://".concat(host || u.host || _this.instanceHost, "/@").concat(u.username);
                if (u.host) {
                    acct = "".concat(u.username, "@").concat(u.host);
                    acctUrl = "https://".concat(u.host, "/@").concat(u.username);
                }
                return {
                    id: u.id,
                    username: u.username,
                    acct: acct,
                    display_name: u.name,
                    locked: u.isLocked,
                    created_at: u.createdAt,
                    followers_count: u.followersCount,
                    following_count: u.followingCount,
                    statuses_count: u.notesCount,
                    note: u.description,
                    url: acctUrl,
                    avatar: u.avatarUrl,
                    avatar_static: u.avatarUrl,
                    header: (_a = u.bannerUrl) !== null && _a !== void 0 ? _a : _this.plcUrl,
                    header_static: (_b = u.bannerUrl) !== null && _b !== void 0 ? _b : _this.plcUrl,
                    emojis: u.emojis.map(function (e) { return _this.emoji(e); }),
                    moved: null,
                    fields: u.fields.map(function (f) { return _this.field(f); }),
                    bot: u.isBot,
                };
            };
            this.userPreferences = function (u, g) {
                return {
                    "reading:expand:media": "default",
                    "reading:expand:spoilers": false,
                    "posting:default:language": u.lang,
                    "posting:default:sensitive": u.alwaysMarkNsfw,
                    "posting:default:visibility": _this.visibility(g.defaultNoteVisibility)
                };
            };
            this.visibility = function (v) {
                switch (v) {
                    case 'public':
                        return v;
                    case 'home':
                        return 'unlisted';
                    case 'followers':
                        return 'private';
                    case 'specified':
                        return 'direct';
                }
            };
            this.encodeVisibility = function (v) {
                switch (v) {
                    case 'public':
                        return v;
                    case 'unlisted':
                        return 'home';
                    case 'private':
                        return 'followers';
                    case 'direct':
                        return 'specified';
                }
            };
            this.fileType = function (s) {
                if (s === 'image/gif') {
                    return 'gifv';
                }
                if (s.includes('image')) {
                    return 'image';
                }
                if (s.includes('video')) {
                    return 'video';
                }
                if (s.includes('audio')) {
                    return 'audio';
                }
                return 'unknown';
            };
            this.file = function (f) {
                return {
                    id: f.id,
                    type: _this.fileType(f.type),
                    url: f.url,
                    remote_url: f.url,
                    preview_url: f.thumbnailUrl,
                    text_url: f.url,
                    meta: {
                        width: f.properties.width,
                        height: f.properties.height
                    },
                    description: f.comment,
                    blurhash: f.blurhash
                };
            };
            this.follower = function (f) {
                return _this.user(f.follower);
            };
            this.following = function (f) {
                return _this.user(f.followee);
            };
            this.relation = function (r) {
                return {
                    id: r.id,
                    following: r.isFollowing,
                    followed_by: r.isFollowed,
                    blocking: r.isBlocking,
                    blocked_by: r.isBlocked,
                    muting: r.isMuted,
                    muting_notifications: false,
                    requested: r.hasPendingFollowRequestFromYou,
                    domain_blocking: false,
                    showing_reblogs: true,
                    endorsed: false,
                    notifying: false
                };
            };
            this.choice = function (c) {
                return {
                    title: c.text,
                    votes_count: c.votes
                };
            };
            this.poll = function (p) {
                var now = (0, dayjs_1.default)();
                var expire = (0, dayjs_1.default)(p.expiresAt);
                var count = p.choices.reduce(function (sum, choice) { return sum + choice.votes; }, 0);
                return {
                    id: '',
                    expires_at: p.expiresAt,
                    expired: now.isAfter(expire),
                    multiple: p.multiple,
                    votes_count: count,
                    options: p.choices.map(function (c) { return _this.choice(c); }),
                    voted: p.choices.some(function (c) { return c.isVoted; })
                };
            };
            this.note = function (n, host) {
                var _a, _b;
                host = host.replace('https://', '');
                return {
                    id: n.id,
                    uri: n.uri ? n.uri : "https://".concat(host, "/notes/").concat(n.id),
                    url: n.uri ? n.uri : "https://".concat(host, "/notes/").concat(n.id),
                    account: _this.user(n.user),
                    in_reply_to_id: n.replyId,
                    in_reply_to_account_id: (_b = (_a = n.reply) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : null,
                    reblog: n.renote ? _this.note(n.renote, host) : null,
                    content: n.text ? _this.escapeMFM(n.text) : '',
                    plain_content: n.text ? n.text : null,
                    created_at: n.createdAt,
                    emojis: n.emojis.map(function (e) { return _this.emoji(e); }),
                    replies_count: n.repliesCount,
                    reblogs_count: n.renoteCount,
                    favourites_count: _this.getTotalReactions(n.reactions),
                    reblogged: false,
                    favourited: !!n.myReaction,
                    muted: false,
                    sensitive: n.files ? n.files.some(function (f) { return f.isSensitive; }) : false,
                    spoiler_text: n.cw ? n.cw : '',
                    visibility: _this.visibility(n.visibility),
                    media_attachments: n.files ? n.files.map(function (f) { return _this.file(f); }) : [],
                    mentions: [],
                    tags: [],
                    card: null,
                    poll: n.poll ? _this.poll(n.poll) : null,
                    application: null,
                    language: null,
                    pinned: null,
                    emoji_reactions: _this.mapReactions(n.reactions, n.myReaction),
                    bookmarked: false,
                    quote: n.renote && n.text ? _this.note(n.renote, host) : null
                };
            };
            this.mapReactions = function (r, myReaction) {
                return Object.keys(r).map(function (key) {
                    if (myReaction && key === myReaction) {
                        return {
                            count: r[key],
                            me: true,
                            name: key
                        };
                    }
                    return {
                        count: r[key],
                        me: false,
                        name: key
                    };
                });
            };
            this.getTotalReactions = function (r) {
                return Object.values(r).length > 0 ? Object.values(r).reduce(function (previousValue, currentValue) { return previousValue + currentValue; }) : 0;
            };
            this.reactions = function (r) {
                var e_1, _a;
                var result = [];
                var _loop_1 = function (e) {
                    var i = result.findIndex(function (res) { return res.name === e.type; });
                    if (i >= 0) {
                        result[i].count++;
                    }
                    else {
                        result.push({
                            count: 1,
                            me: false,
                            name: e.type
                        });
                    }
                };
                try {
                    for (var r_1 = __values(r), r_1_1 = r_1.next(); !r_1_1.done; r_1_1 = r_1.next()) {
                        var e = r_1_1.value;
                        _loop_1(e);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (r_1_1 && !r_1_1.done && (_a = r_1.return)) _a.call(r_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return result;
            };
            this.noteToConversation = function (n, host) {
                var accounts = [_this.user(n.user)];
                if (n.reply) {
                    accounts.push(_this.user(n.reply.user));
                }
                return {
                    id: n.id,
                    accounts: accounts,
                    last_status: _this.note(n, host),
                    unread: false
                };
            };
            this.list = function (l) { return ({
                id: l.id,
                title: l.name
            }); };
            this.encodeNotificationType = function (e) {
                switch (e) {
                    case notification_2.default.Follow:
                        return notification_1.default.Follow;
                    case notification_2.default.Mention:
                        return notification_1.default.Reply;
                    case notification_2.default.Favourite:
                    case notification_2.default.EmojiReaction:
                        return notification_1.default.Reaction;
                    case notification_2.default.Reblog:
                        return notification_1.default.Renote;
                    case notification_2.default.PollVote:
                        return notification_1.default.PollVote;
                    case notification_2.default.FollowRequest:
                        return notification_1.default.ReceiveFollowRequest;
                    default:
                        return e;
                }
            };
            this.decodeNotificationType = function (e) {
                switch (e) {
                    case notification_1.default.Follow:
                        return notification_2.default.Follow;
                    case notification_1.default.Mention:
                    case notification_1.default.Reply:
                        return notification_2.default.Mention;
                    case notification_1.default.Renote:
                    case notification_1.default.Quote:
                        return notification_2.default.Reblog;
                    case notification_1.default.Reaction:
                        return notification_2.default.EmojiReaction;
                    case notification_1.default.PollVote:
                        return notification_2.default.PollVote;
                    case notification_1.default.ReceiveFollowRequest:
                        return notification_2.default.FollowRequest;
                    case notification_1.default.FollowRequestAccepted:
                        return notification_2.default.Follow;
                    default:
                        return e;
                }
            };
            this.announcement = function (a) { return ({
                id: a.id,
                content: "<h1>".concat(_this.escapeMFM(a.title), "</h1>").concat(_this.escapeMFM(a.text)),
                starts_at: null,
                ends_at: null,
                published: true,
                all_day: false,
                published_at: a.createdAt,
                updated_at: a.updatedAt,
                read: a.isRead,
                mentions: [],
                statuses: [],
                tags: [],
                emojis: [],
                reactions: [],
            }); };
            this.notification = function (n, host) {
                var notification = {
                    id: n.id,
                    account: n.user ? _this.user(n.user) : _this.modelOfAcct,
                    created_at: n.createdAt,
                    type: _this.decodeNotificationType(n.type)
                };
                if (n.note) {
                    notification = Object.assign(notification, {
                        status: _this.note(n.note, host)
                    });
                }
                if (n.reaction) {
                    notification = Object.assign(notification, {
                        emoji: n.reaction
                    });
                }
                return notification;
            };
            this.stats = function (s) {
                return {
                    user_count: s.usersCount,
                    status_count: s.notesCount,
                    domain_count: s.instances
                };
            };
            this.meta = function (m, s) {
                var wss = m.uri.replace(/^https:\/\//, 'wss://');
                return {
                    uri: m.uri,
                    title: m.name,
                    description: m.description,
                    email: m.maintainerEmail,
                    version: m.version,
                    thumbnail: m.bannerUrl,
                    urls: {
                        streaming_api: "".concat(wss, "/streaming")
                    },
                    stats: _this.stats(s),
                    languages: m.langs,
                    contact_account: null,
                    max_toot_chars: m.maxNoteTextLength,
                    registrations: !m.disableRegistration
                };
            };
            this.hashtag = function (h) {
                return {
                    name: h.tag,
                    url: h.tag,
                    history: null,
                    following: false
                };
            };
            this.baseUrl = baseUrl;
            this.instanceHost = baseUrl.substring(baseUrl.indexOf('//') + 2);
            this.plcUrl = "".concat(baseUrl, "/static-assets/transparent.png");
            this.modelOfAcct.url = this.plcUrl;
            this.modelOfAcct.avatar = this.plcUrl;
            this.modelOfAcct.avatar_static = this.plcUrl;
            this.modelOfAcct.header = this.plcUrl;
            this.modelOfAcct.header_static = this.plcUrl;
        }
        return Converter;
    }());
    MisskeyAPI.Converter = Converter;
    MisskeyAPI.DEFAULT_SCOPE = [
        'read:account',
        'write:account',
        'read:blocks',
        'write:blocks',
        'read:drive',
        'write:drive',
        'read:favorites',
        'write:favorites',
        'read:following',
        'write:following',
        'read:mutes',
        'write:mutes',
        'write:notes',
        'read:notifications',
        'write:notifications',
        'read:reactions',
        'write:reactions',
        'write:votes'
    ];
    var Client = (function () {
        function Client(baseUrl, accessToken, userAgent, proxyConfig, converter) {
            if (userAgent === void 0) { userAgent = default_1.DEFAULT_UA; }
            if (proxyConfig === void 0) { proxyConfig = false; }
            this.proxyConfig = false;
            this.accessToken = accessToken;
            this.baseUrl = baseUrl;
            this.userAgent = userAgent;
            this.proxyConfig = proxyConfig;
            this.abortController = new AbortController();
            this.converter = converter;
            axios_1.default.defaults.signal = this.abortController.signal;
        }
        Client.prototype.post = function (path, params, headers) {
            if (params === void 0) { params = {}; }
            if (headers === void 0) { headers = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var options, bodyParams;
                return __generator(this, function (_a) {
                    options = {
                        headers: headers,
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    };
                    if (this.proxyConfig) {
                        options = Object.assign(options, {
                            httpAgent: (0, proxy_config_1.default)(this.proxyConfig),
                            httpsAgent: (0, proxy_config_1.default)(this.proxyConfig)
                        });
                    }
                    bodyParams = params;
                    if (this.accessToken) {
                        if (params instanceof form_data_1.default) {
                            bodyParams.append('i', this.accessToken);
                        }
                        else {
                            bodyParams = Object.assign(params, {
                                i: this.accessToken
                            });
                        }
                    }
                    console.log("sending request to ".concat(this.baseUrl).concat(path, " with params:"));
                    console.log(JSON.stringify(bodyParams, null, 2));
                    return [2, axios_1.default.post(this.baseUrl + path, bodyParams, options).then(function (resp) {
                            var res = {
                                data: resp.data,
                                status: resp.status,
                                statusText: resp.statusText,
                                headers: resp.headers
                            };
                            return res;
                        })];
                });
            });
        };
        Client.prototype.cancel = function () {
            return this.abortController.abort();
        };
        Client.prototype.socket = function (channel, listId) {
            if (!this.accessToken) {
                throw new Error('accessToken is required');
            }
            var url = "".concat(this.baseUrl, "/streaming");
            var streaming = new web_socket_1.default(url, channel, this.accessToken, listId, this.userAgent, this.proxyConfig, this.converter);
            process.nextTick(function () {
                streaming.start();
            });
            return streaming;
        };
        return Client;
    }());
    MisskeyAPI.Client = Client;
})(MisskeyAPI || (MisskeyAPI = {}));
exports.default = MisskeyAPI;
