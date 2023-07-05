"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var form_data_1 = __importDefault(require("form-data"));
var async_lock_1 = __importDefault(require("async-lock"));
var api_client_1 = __importDefault(require("./misskey/api_client"));
var default_1 = require("./default");
var oauth_1 = __importDefault(require("./oauth"));
var megalodon_1 = require("./megalodon");
var node_fs_1 = __importDefault(require("node:fs"));
var Misskey = (function () {
    function Misskey(baseUrl, accessToken, userAgent, proxyConfig) {
        if (accessToken === void 0) { accessToken = null; }
        if (userAgent === void 0) { userAgent = default_1.DEFAULT_UA; }
        if (proxyConfig === void 0) { proxyConfig = false; }
        var token = '';
        if (accessToken) {
            token = accessToken;
        }
        var agent = default_1.DEFAULT_UA;
        if (userAgent) {
            agent = userAgent;
        }
        this.converter = new api_client_1.default.Converter(baseUrl);
        this.client = new api_client_1.default.Client(baseUrl, token, agent, proxyConfig, this.converter);
        this.baseUrl = baseUrl;
        this.proxyConfig = proxyConfig;
    }
    Misskey.prototype.baseUrlToHost = function (baseUrl) {
        return baseUrl.replace('https://', '');
    };
    Misskey.prototype.cancel = function () {
        return this.client.cancel();
    };
    Misskey.prototype.registerApp = function (client_name, options) {
        if (options === void 0) { options = {
            scopes: api_client_1.default.DEFAULT_SCOPE,
            redirect_uris: this.baseUrl
        }; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.createApp(client_name, options).then(function (appData) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2, this.generateAuthUrlAndToken(appData.client_secret).then(function (session) {
                                    appData.url = session.url;
                                    appData.session_token = session.token;
                                    return appData;
                                })];
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.createApp = function (client_name, options) {
        if (options === void 0) { options = {
            scopes: api_client_1.default.DEFAULT_SCOPE,
            redirect_uris: this.baseUrl
        }; }
        return __awaiter(this, void 0, void 0, function () {
            var redirect_uris, scopes, params;
            return __generator(this, function (_a) {
                redirect_uris = options.redirect_uris || this.baseUrl;
                scopes = options.scopes || api_client_1.default.DEFAULT_SCOPE;
                params = {
                    name: client_name,
                    description: '',
                    permission: scopes,
                    callbackUrl: redirect_uris
                };
                return [2, this.client.post('/api/app/create', params).then(function (res) {
                        var appData = {
                            id: res.data.id,
                            name: res.data.name,
                            website: null,
                            redirect_uri: res.data.callbackUrl,
                            client_id: '',
                            client_secret: res.data.secret
                        };
                        return oauth_1.default.AppData.from(appData);
                    })];
            });
        });
    };
    Misskey.prototype.generateAuthUrlAndToken = function (clientSecret) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/auth/session/generate', {
                        appSecret: clientSecret
                    })
                        .then(function (res) { return res.data; })];
            });
        });
    };
    Misskey.prototype.verifyAppCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.fetchAccessToken = function (_client_id, client_secret, session_token, _redirect_uri) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/auth/session/userkey', {
                        appSecret: client_secret,
                        token: session_token
                    })
                        .then(function (res) {
                        var token = new oauth_1.default.TokenData(res.data.accessToken, 'misskey', '', 0, null, null);
                        return token;
                    })];
            });
        });
    };
    Misskey.prototype.refreshToken = function (_client_id, _client_secret, _refresh_token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.revokeToken = function (_client_id, _client_secret, _token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.registerAccount = function (_username, _email, _password, _agreement, _locale, _reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.verifyAccountCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client.post('/api/i').then(function (res) {
                        return Object.assign(res, {
                            data: _this.converter.userDetail(res.data, _this.baseUrlToHost(_this.baseUrl))
                        });
                    })];
            });
        });
    };
    Misskey.prototype.updateCredentials = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {};
                if (options) {
                    if (options.bot !== undefined) {
                        params = Object.assign(params, {
                            isBot: options.bot
                        });
                    }
                    if (options.display_name) {
                        params = Object.assign(params, {
                            name: options.display_name
                        });
                    }
                    if (options.note) {
                        params = Object.assign(params, {
                            description: options.note
                        });
                    }
                    if (options.locked !== undefined) {
                        params = Object.assign(params, {
                            isLocked: options.locked
                        });
                    }
                    if (options.source) {
                        if (options.source.language) {
                            params = Object.assign(params, {
                                lang: options.source.language
                            });
                        }
                        if (options.source.sensitive) {
                            params = Object.assign(params, {
                                alwaysMarkNsfw: options.source.sensitive
                            });
                        }
                    }
                }
                return [2, this.client.post('/api/i', params).then(function (res) {
                        return Object.assign(res, {
                            data: _this.converter.userDetail(res.data, _this.baseUrlToHost(_this.baseUrl))
                        });
                    })];
            });
        });
    };
    Misskey.prototype.getAccount = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/users/show', {
                        userId: id
                    })
                        .then(function (res) {
                        return Object.assign(res, {
                            data: _this.converter.userDetail(res.data, _this.baseUrlToHost(_this.baseUrl))
                        });
                    })];
            });
        });
    };
    Misskey.prototype.getAccountByName = function (user, host) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/users/show', {
                        username: user,
                        host: host !== null && host !== void 0 ? host : null
                    })
                        .then(function (res) {
                        return Object.assign(res, {
                            data: _this.converter.userDetail(res.data, _this.baseUrlToHost(_this.baseUrl))
                        });
                    })];
            });
        });
    };
    Misskey.prototype.getAccountStatuses = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCache, params;
            var _this = this;
            return __generator(this, function (_a) {
                accountCache = this.getFreshAccountCache();
                if (options === null || options === void 0 ? void 0 : options.pinned) {
                    return [2, this.client
                            .post('/api/users/show', {
                            userId: id
                        })
                            .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            var _b;
                            var _this = this;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        if (!res.data.pinnedNotes) return [3, 2];
                                        _a = [__assign({}, res)];
                                        _b = {};
                                        return [4, Promise.all(res.data.pinnedNotes.map(function (n) { return _this.noteWithMentions(n, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                    case 1: return [2, __assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)]))];
                                    case 2: return [2, __assign(__assign({}, res), { data: [] })];
                                }
                            });
                        }); })];
                }
                params = {
                    userId: id
                };
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 20
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.since_id) {
                        params = Object.assign(params, {
                            sinceId: options.since_id
                        });
                    }
                    if (options.exclude_replies) {
                        params = Object.assign(params, {
                            includeReplies: false
                        });
                    }
                    if (options.exclude_reblogs) {
                        params = Object.assign(params, {
                            includeMyRenotes: false
                        });
                    }
                    if (options.only_media) {
                        params = Object.assign(params, {
                            withFiles: options.only_media
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 20
                    });
                }
                return [2, this.client.post('/api/users/notes', params).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var statuses;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, Promise.all(res.data.map(function (note) { return _this.noteWithMentions(note, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                case 1:
                                    statuses = _a.sent();
                                    return [2, Object.assign(res, {
                                            data: statuses
                                        })];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.getAccountFavourites = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCache, params;
            var _this = this;
            return __generator(this, function (_a) {
                accountCache = this.getFreshAccountCache();
                params = {
                    userId: id
                };
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.since_id) {
                        params = Object.assign(params, {
                            sinceId: options.since_id
                        });
                    }
                }
                return [2, this.client.post('/api/users/reactions', params).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, _b, _c;
                        var _d;
                        var _this = this;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    _b = (_a = Object).assign;
                                    _c = [res];
                                    _d = {};
                                    return [4, Promise.all(res.data.map(function (fav) { return _this.noteWithMentions(fav.note, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                case 1: return [2, _b.apply(_a, _c.concat([(_d.data = _e.sent(),
                                            _d)]))];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.subscribeAccount = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.unsubscribeAccount = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getAccountFollowers = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {
                    userId: id
                };
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 40
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 40
                    });
                }
                return [2, this.client.post('/api/users/followers', params).then(function (res) {
                        return Object.assign(res, {
                            data: res.data.map(function (f) { return _this.converter.follower(f); })
                        });
                    })];
            });
        });
    };
    Misskey.prototype.getAccountFollowing = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {
                    userId: id
                };
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                }
                return [2, this.client.post('/api/users/following', params).then(function (res) {
                        return Object.assign(res, {
                            data: res.data.map(function (f) { return _this.converter.following(f); })
                        });
                    })];
            });
        });
    };
    Misskey.prototype.getAccountLists = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getIdentityProof = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.followAccount = function (id, _options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/following/create', {
                            userId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/users/relation', {
                                userId: id
                            })
                                .then(function (res) {
                                return Object.assign(res, {
                                    data: _this.converter.relation(res.data)
                                });
                            })];
                }
            });
        });
    };
    Misskey.prototype.unfollowAccount = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/following/delete', {
                            userId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/users/relation', {
                                userId: id
                            })
                                .then(function (res) {
                                return Object.assign(res, {
                                    data: _this.converter.relation(res.data)
                                });
                            })];
                }
            });
        });
    };
    Misskey.prototype.blockAccount = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/blocking/create', {
                            userId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/users/relation', {
                                userId: id
                            })
                                .then(function (res) {
                                return Object.assign(res, {
                                    data: _this.converter.relation(res.data)
                                });
                            })];
                }
            });
        });
    };
    Misskey.prototype.unblockAccount = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/blocking/delete', {
                            userId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/users/relation', {
                                userId: id
                            })
                                .then(function (res) {
                                return Object.assign(res, {
                                    data: _this.converter.relation(res.data)
                                });
                            })];
                }
            });
        });
    };
    Misskey.prototype.muteAccount = function (id, _notifications) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/mute/create', {
                            userId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/users/relation', {
                                userId: id
                            })
                                .then(function (res) {
                                return Object.assign(res, {
                                    data: _this.converter.relation(res.data)
                                });
                            })];
                }
            });
        });
    };
    Misskey.prototype.unmuteAccount = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/mute/delete', {
                            userId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/users/relation', {
                                userId: id
                            })
                                .then(function (res) {
                                return Object.assign(res, {
                                    data: _this.converter.relation(res.data)
                                });
                            })];
                }
            });
        });
    };
    Misskey.prototype.pinAccount = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.unpinAccount = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getRelationship = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/users/relation', {
                        userId: id
                    })
                        .then(function (res) {
                        return Object.assign(res, {
                            data: _this.converter.relation(res.data)
                        });
                    })];
            });
        });
    };
    Misskey.prototype.getRelationships = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, Promise.all(ids.map(function (id) { return _this.getRelationship(id); })).then(function (results) { return (__assign(__assign({}, results[0]), { data: results.map(function (r) { return r.data; }) })); })];
            });
        });
    };
    Misskey.prototype.searchAccount = function (q, options) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {
                    query: q,
                    detail: true
                };
                if (options) {
                    if (options.resolve !== undefined) {
                        params = Object.assign(params, {
                            localOnly: options.resolve
                        });
                    }
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 40
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 40
                    });
                }
                return [2, this.client.post('/api/users/search', params).then(function (res) {
                        return Object.assign(res, {
                            data: res.data.map(function (u) { return _this.converter.userDetail(u, _this.baseUrlToHost(_this.baseUrl)); })
                        });
                    })];
            });
        });
    };
    Misskey.prototype.getBookmarks = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCache, params;
            var _this = this;
            return __generator(this, function (_a) {
                accountCache = this.getFreshAccountCache();
                params = {};
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 40
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.min_id) {
                        params = Object.assign(params, {
                            sinceId: options.min_id
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 40
                    });
                }
                return [2, this.client.post('/api/i/favorites', params).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, _b, _c;
                        var _d;
                        var _this = this;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    _b = (_a = Object).assign;
                                    _c = [res];
                                    _d = {};
                                    return [4, Promise.all(res.data.map(function (s) { return _this.noteWithMentions(s.note, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                case 1: return [2, _b.apply(_a, _c.concat([(_d.data = _e.sent(),
                                            _d)]))];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.getFavourites = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var userId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/i').then(function (res) { return res.data.id; })];
                    case 1:
                        userId = _a.sent();
                        return [2, this.getAccountFavourites(userId, options)];
                }
            });
        });
    };
    Misskey.prototype.getMutes = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {};
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 40
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.min_id) {
                        params = Object.assign(params, {
                            sinceId: options.min_id
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 40
                    });
                }
                return [2, this.client.post('/api/mute/list', params).then(function (res) {
                        return Object.assign(res, {
                            data: res.data.map(function (mute) { return _this.converter.userDetail(mute.mutee, _this.baseUrlToHost(_this.baseUrl)); })
                        });
                    })];
            });
        });
    };
    Misskey.prototype.getBlocks = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {};
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 40
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.min_id) {
                        params = Object.assign(params, {
                            sinceId: options.min_id
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 40
                    });
                }
                return [2, this.client.post('/api/blocking/list', params).then(function (res) {
                        return Object.assign(res, {
                            data: res.data.map(function (blocking) { return _this.converter.userDetail(blocking.blockee, _this.baseUrlToHost(_this.baseUrl)); })
                        });
                    })];
            });
        });
    };
    Misskey.prototype.getDomainBlocks = function (_options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.blockDomain = function (_domain) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.unblockDomain = function (_domain) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getFilters = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getFilter = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.createFilter = function (_phrase, _context, _options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.updateFilter = function (_id, _phrase, _context, _options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.deleteFilter = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.report = function (account_id, comment, _options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/users/report-abuse', {
                        userId: account_id,
                        comment: comment
                    })
                        .then(function (res) {
                        return Object.assign(res, {
                            data: {
                                id: '',
                                action_taken: '',
                                comment: comment,
                                account_id: account_id,
                                status_ids: []
                            }
                        });
                    })];
            });
        });
    };
    Misskey.prototype.getFollowRequests = function (_limit) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client.post('/api/following/requests/list').then(function (res) {
                        return Object.assign(res, {
                            data: res.data.map(function (r) { return _this.converter.user(r.follower); })
                        });
                    })];
            });
        });
    };
    Misskey.prototype.acceptFollowRequest = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/following/requests/accept', {
                            userId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/users/relation', {
                                userId: id
                            })
                                .then(function (res) {
                                return Object.assign(res, {
                                    data: _this.converter.relation(res.data)
                                });
                            })];
                }
            });
        });
    };
    Misskey.prototype.rejectFollowRequest = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/following/requests/reject', {
                            userId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/users/relation', {
                                userId: id
                            })
                                .then(function (res) {
                                return Object.assign(res, {
                                    data: _this.converter.relation(res.data)
                                });
                            })];
                }
            });
        });
    };
    Misskey.prototype.getEndorsements = function (_options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getFeaturedTags = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.getAccountFeaturedTags()];
            });
        });
    };
    Misskey.prototype.getAccountFeaturedTags = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tags, res;
            return __generator(this, function (_a) {
                tags = [];
                res = {
                    headers: undefined,
                    statusText: "",
                    status: 200,
                    data: tags
                };
                return [2, new Promise(function (resolve) { return resolve(res); })];
            });
        });
    };
    Misskey.prototype.createFeaturedTag = function (_name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.deleteFeaturedTag = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getSuggestedTags = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getPreferences = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client.post('/api/i').then(function (res) {
                        return Object.assign(res, {
                            data: _this.converter.userPreferences(res.data, { defaultNoteVisibility: "followers", tutorial: -1 })
                        });
                    })];
            });
        });
    };
    Misskey.prototype.getSuggestions = function (limit) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {};
                if (limit) {
                    params = Object.assign(params, {
                        limit: limit
                    });
                }
                return [2, this.client
                        .post('/api/users/recommendation', params)
                        .then(function (res) { return (__assign(__assign({}, res), { data: res.data.map(function (u) { return _this.converter.userDetail(u, _this.baseUrlToHost(_this.baseUrl)); }) })); })];
            });
        });
    };
    Misskey.prototype.getFollowedTags = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tags, res;
            return __generator(this, function (_a) {
                tags = [];
                res = {
                    headers: undefined,
                    statusText: "",
                    status: 200,
                    data: tags
                };
                return [2, new Promise(function (resolve) { return resolve(res); })];
            });
        });
    };
    Misskey.prototype.getTag = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.followTag = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.unfollowTag = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.postStatus = function (status, options) {
        return __awaiter(this, void 0, void 0, function () {
            var params, pollParam;
            var _this = this;
            return __generator(this, function (_a) {
                params = {
                    text: status
                };
                if (options) {
                    if (options.media_ids) {
                        params = Object.assign(params, {
                            fileIds: options.media_ids
                        });
                    }
                    if (options.poll) {
                        pollParam = {
                            choices: options.poll.options,
                            expiresAt: null,
                            expiredAfter: options.poll.expires_in
                        };
                        if (options.poll.multiple !== undefined) {
                            pollParam = Object.assign(pollParam, {
                                multiple: options.poll.multiple
                            });
                        }
                        params = Object.assign(params, {
                            poll: pollParam
                        });
                    }
                    if (options.in_reply_to_id) {
                        params = Object.assign(params, {
                            replyId: options.in_reply_to_id
                        });
                    }
                    if (options.sensitive) {
                        params = Object.assign(params, {
                            cw: ''
                        });
                    }
                    if (options.spoiler_text) {
                        params = Object.assign(params, {
                            cw: options.spoiler_text
                        });
                    }
                    if (options.visibility) {
                        params = Object.assign(params, {
                            visibility: this.converter.encodeVisibility(options.visibility)
                        });
                    }
                    if (options.quote_id) {
                        params = Object.assign(params, {
                            renoteId: options.quote_id
                        });
                    }
                }
                return [2, this.client
                        .post('/api/notes/create', params)
                        .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, res)];
                                    _b = {};
                                    return [4, this.noteWithMentions(res.data.createdNote, this.baseUrlToHost(this.baseUrl), this.getFreshAccountCache())];
                                case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.getStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/notes/show', {
                        noteId: id
                    })
                        .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, res)];
                                    _b = {};
                                    return [4, this.noteWithMentions(res.data, this.baseUrlToHost(this.baseUrl), this.getFreshAccountCache())];
                                case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.getFreshAccountCache = function () {
        return {
            locks: new async_lock_1.default(),
            accounts: []
        };
    };
    Misskey.prototype.noteWithMentions = function (n, host, cache) {
        return __awaiter(this, void 0, void 0, function () {
            var status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.converter.note(n, host)];
                    case 1:
                        status = _a.sent();
                        return [2, status.mentions.length === 0 ? this.addMentionsToStatus(status, cache) : status];
                }
            });
        });
    };
    Misskey.prototype.addMentionsToStatus = function (status, cache) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, m;
            var e_1, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = status;
                        return [4, this.getMentions(status.plain_content, cache)];
                    case 1:
                        _a.mentions = (_e.sent()).filter(function (p) { return p != null; });
                        try {
                            for (_b = __values(status.mentions.filter(function (value, index, array) { return array.indexOf(value) === index; })), _c = _b.next(); !_c.done; _c = _b.next()) {
                                m = _c.value;
                                status.content = status.content.replace("@".concat(m.acct), "<a href=\"".concat(m.url, "\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@").concat(m.acct, "</a>"));
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        return [2, status];
                }
            });
        });
    };
    Misskey.prototype.getMentions = function (text, cache) {
        return __awaiter(this, void 0, void 0, function () {
            var mentions, mentionMatch, mentionMatch_1, mentionMatch_1_1, m, account, e_2_1;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mentions = [];
                        mentionMatch = text.matchAll(/(?<=^|\s)@(?<user>.*?)(?:@(?<host>.*?)|)(?=\s|$)/g);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        mentionMatch_1 = __values(mentionMatch), mentionMatch_1_1 = mentionMatch_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!mentionMatch_1_1.done) return [3, 5];
                        m = mentionMatch_1_1.value;
                        if (m.groups == null)
                            return [3, 4];
                        return [4, this.getAccountByNameCached(m.groups.user, m.groups.host, cache)];
                    case 3:
                        account = _b.sent();
                        if (account == null)
                            return [3, 4];
                        mentions.push({
                            id: account.id,
                            url: account.url,
                            username: account.username,
                            acct: account.acct
                        });
                        _b.label = 4;
                    case 4:
                        mentionMatch_1_1 = mentionMatch_1.next();
                        return [3, 2];
                    case 5: return [3, 8];
                    case 6:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3, 8];
                    case 7:
                        try {
                            if (mentionMatch_1_1 && !mentionMatch_1_1.done && (_a = mentionMatch_1.return)) _a.call(mentionMatch_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7];
                    case 8: return [2, mentions];
                }
            });
        });
    };
    Misskey.prototype.getAccountByNameCached = function (user, host, cache) {
        return __awaiter(this, void 0, void 0, function () {
            var acctToFind;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        acctToFind = host == null ? user : "".concat(user, "@").concat(host);
                        return [4, cache.locks.acquire(acctToFind, function () { return __awaiter(_this, void 0, void 0, function () {
                                var cacheHit, account, _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            cacheHit = cache.accounts.find(function (p) { return p.acct === acctToFind; });
                                            if (!(cacheHit !== null && cacheHit !== void 0)) return [3, 1];
                                            _a = cacheHit;
                                            return [3, 3];
                                        case 1: return [4, this.getAccountByName(user, host !== null && host !== void 0 ? host : null)];
                                        case 2:
                                            _a = (_b.sent()).data;
                                            _b.label = 3;
                                        case 3:
                                            account = _a;
                                            if (!account) {
                                                return [2, null];
                                            }
                                            if (cacheHit == null) {
                                                cache.accounts.push(account);
                                            }
                                            return [2, account];
                                    }
                                });
                            }); })];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    Misskey.prototype.editStatus = function (_id, _options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.deleteStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.client.post('/api/notes/delete', {
                        noteId: id
                    })];
            });
        });
    };
    Misskey.prototype.getStatusContext = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {
                    noteId: id
                };
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit,
                            depth: 12
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 30,
                            depth: 12
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.since_id) {
                        params = Object.assign(params, {
                            sinceId: options.since_id
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 30,
                        depth: 12
                    });
                }
                return [2, this.client.post('/api/notes/children', params).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var accountCache, conversation, parents, context, _a;
                        var _b;
                        var _this = this;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    accountCache = this.getFreshAccountCache();
                                    return [4, this.client.post('/api/notes/conversation', params)];
                                case 1:
                                    conversation = _c.sent();
                                    return [4, Promise.all(conversation.data.map(function (n) { return _this.noteWithMentions(n, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                case 2:
                                    parents = _c.sent();
                                    _b = {
                                        ancestors: parents.reverse()
                                    };
                                    _a = this.dfs;
                                    return [4, Promise.all(res.data.map(function (n) { return _this.noteWithMentions(n, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                case 3:
                                    context = (_b.descendants = _a.apply(this, [_c.sent()]),
                                        _b);
                                    return [2, __assign(__assign({}, res), { data: context })];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.dfs = function (graph) {
        if (graph.length <= 1) {
            return graph;
        }
        graph = graph.sort(function (a, b) {
            if (a.id < b.id)
                return -1;
            if (a.id > b.id)
                return 1;
            return 0;
        });
        var initialPostId = graph[0].in_reply_to_id;
        var stack = graph.filter(function (reply) { return reply.in_reply_to_id === initialPostId; }).reverse();
        var visited = new Set();
        var result = [];
        var _loop_1 = function () {
            var e_3, _a;
            var currentPost = stack.pop();
            if (currentPost === undefined)
                return { value: result };
            if (!visited.has(currentPost)) {
                visited.add(currentPost);
                result.push(currentPost);
                try {
                    for (var _b = (e_3 = void 0, __values(graph.filter(function (reply) { return reply.in_reply_to_id === currentPost.id; }).reverse())), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var reply = _c.value;
                        stack.push(reply);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        };
        while (stack.length) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return result;
    };
    Misskey.prototype.getStatusHistory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var history, res;
            return __generator(this, function (_a) {
                history = [];
                res = {
                    headers: undefined,
                    statusText: "",
                    status: 200,
                    data: history
                };
                return [2, new Promise(function (resolve) { return resolve(res); })];
            });
        });
    };
    Misskey.prototype.getStatusRebloggedBy = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/notes/renotes', {
                        noteId: id
                    })
                        .then(function (res) { return (__assign(__assign({}, res), { data: res.data.map(function (n) { return _this.converter.user(n.user); }) })); })];
            });
        });
    };
    Misskey.prototype.getStatusFavouritedBy = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.favouriteStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.createEmojiReaction;
                        _b = [id];
                        return [4, this.getDefaultFavoriteEmoji()];
                    case 1: return [2, _a.apply(this, _b.concat([_c.sent()]))];
                }
            });
        });
    };
    Misskey.prototype.getDefaultFavoriteEmoji = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client
                            .post('/api/i/registry/get-unsecure', {
                            key: 'reactions',
                            scope: ['client', 'base'],
                        })
                            .then(function (res) { var _a; return (_a = res.data[0]) !== null && _a !== void 0 ? _a : '⭐'; })];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    Misskey.prototype.unfavouriteStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.deleteEmojiReaction(id, '')];
            });
        });
    };
    Misskey.prototype.reblogStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/notes/create', {
                        renoteId: id
                    })
                        .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, res)];
                                    _b = {};
                                    return [4, this.noteWithMentions(res.data.createdNote, this.baseUrlToHost(this.baseUrl), this.getFreshAccountCache())];
                                case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.unreblogStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/notes/unrenote', {
                            noteId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/notes/show', {
                                noteId: id
                            })
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                var _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _a = [__assign({}, res)];
                                            _b = {};
                                            return [4, this.noteWithMentions(res.data, this.baseUrlToHost(this.baseUrl), this.getFreshAccountCache())];
                                        case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    Misskey.prototype.bookmarkStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/notes/favorites/create', {
                            noteId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/notes/show', {
                                noteId: id
                            })
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                var _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _a = [__assign({}, res)];
                                            _b = {};
                                            return [4, this.noteWithMentions(res.data, this.baseUrlToHost(this.baseUrl), this.getFreshAccountCache())];
                                        case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    Misskey.prototype.unbookmarkStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/notes/favorites/delete', {
                            noteId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/notes/show', {
                                noteId: id
                            })
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                var _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _a = [__assign({}, res)];
                                            _b = {};
                                            return [4, this.noteWithMentions(res.data, this.baseUrlToHost(this.baseUrl), this.getFreshAccountCache())];
                                        case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    Misskey.prototype.muteStatus = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.unmuteStatus = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.pinStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/i/pin', {
                            noteId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/notes/show', {
                                noteId: id
                            })
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                var _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _a = [__assign({}, res)];
                                            _b = {};
                                            return [4, this.noteWithMentions(res.data, this.baseUrlToHost(this.baseUrl), this.getFreshAccountCache())];
                                        case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    Misskey.prototype.unpinStatus = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/i/unpin', {
                            noteId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/notes/show', {
                                noteId: id
                            })
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                var _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _a = [__assign({}, res)];
                                            _b = {};
                                            return [4, this.noteWithMentions(res.data, this.baseUrlToHost(this.baseUrl), this.getFreshAccountCache())];
                                        case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    Misskey.prototype.uploadMedia = function (file, _options) {
        return __awaiter(this, void 0, void 0, function () {
            var formData, headers;
            var _this = this;
            return __generator(this, function (_a) {
                formData = new form_data_1.default();
                formData.append('file', node_fs_1.default.createReadStream(file.path), {
                    contentType: file.mimetype,
                    filename: file.originalname,
                });
                headers = {};
                if (typeof formData.getHeaders === 'function') {
                    headers = formData.getHeaders();
                }
                return [2, this.client
                        .post('/api/drive/files/create', formData, headers)
                        .then(function (res) { return (__assign(__assign({}, res), { data: _this.converter.file(res.data) })); })];
            });
        });
    };
    Misskey.prototype.getMedia = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/drive/files/show', { fileId: id })];
                    case 1:
                        res = _a.sent();
                        return [2, __assign(__assign({}, res), { data: this.converter.file(res.data) })];
                }
            });
        });
    };
    Misskey.prototype.updateMedia = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {
                    fileId: id
                };
                if (options) {
                    if (options.is_sensitive !== undefined) {
                        params = Object.assign(params, {
                            isSensitive: options.is_sensitive
                        });
                    }
                }
                return [2, this.client
                        .post('/api/drive/files/update', params)
                        .then(function (res) { return (__assign(__assign({}, res), { data: _this.converter.file(res.data) })); })];
            });
        });
    };
    Misskey.prototype.getPoll = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.votePoll = function (_id, choices, status_id) {
        return __awaiter(this, void 0, void 0, function () {
            var params, res;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!status_id) {
                            return [2, new Promise(function (_, reject) {
                                    var err = new megalodon_1.ArgumentError('status_id is required');
                                    reject(err);
                                })];
                        }
                        params = {
                            noteId: status_id,
                            choice: choices[0]
                        };
                        return [4, this.client.post('/api/notes/polls/vote', params)];
                    case 1:
                        _a.sent();
                        return [4, this.client
                                .post('/api/notes/show', {
                                noteId: status_id
                            })
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var note;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, this.noteWithMentions(res.data, this.baseUrlToHost(this.baseUrl), this.getFreshAccountCache())];
                                        case 1:
                                            note = _a.sent();
                                            return [2, __assign(__assign({}, res), { data: note.poll })];
                                    }
                                });
                            }); })];
                    case 2:
                        res = _a.sent();
                        if (!res.data) {
                            return [2, new Promise(function (_, reject) {
                                    var err = new megalodon_1.UnexpectedError('poll does not exist');
                                    reject(err);
                                })];
                        }
                        return [2, __assign(__assign({}, res), { data: res.data })];
                }
            });
        });
    };
    Misskey.prototype.getScheduledStatuses = function (_options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getScheduledStatus = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.scheduleStatus = function (_id, _scheduled_at) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.cancelScheduledStatus = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getPublicTimeline = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCache, params;
            var _this = this;
            return __generator(this, function (_a) {
                accountCache = this.getFreshAccountCache();
                params = {};
                if (options) {
                    if (options.only_media !== undefined) {
                        params = Object.assign(params, {
                            withFiles: options.only_media
                        });
                    }
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 20
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.since_id) {
                        params = Object.assign(params, {
                            sinceId: options.since_id
                        });
                    }
                    if (options.min_id) {
                        params = Object.assign(params, {
                            sinceId: options.min_id
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 20
                    });
                }
                return [2, this.client
                        .post('/api/notes/global-timeline', params)
                        .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        var _this = this;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, res)];
                                    _b = {};
                                    return [4, Promise.all(res.data.map(function (n) { return _this.noteWithMentions(n, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.getLocalTimeline = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCache, params;
            var _this = this;
            return __generator(this, function (_a) {
                accountCache = this.getFreshAccountCache();
                params = {};
                if (options) {
                    if (options.only_media !== undefined) {
                        params = Object.assign(params, {
                            withFiles: options.only_media
                        });
                    }
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 20
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.since_id) {
                        params = Object.assign(params, {
                            sinceId: options.since_id
                        });
                    }
                    if (options.min_id) {
                        params = Object.assign(params, {
                            sinceId: options.min_id
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 20
                    });
                }
                return [2, this.client
                        .post('/api/notes/local-timeline', params)
                        .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        var _this = this;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, res)];
                                    _b = {};
                                    return [4, Promise.all(res.data.map(function (n) { return _this.noteWithMentions(n, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.getTagTimeline = function (hashtag, options) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCache, params;
            var _this = this;
            return __generator(this, function (_a) {
                accountCache = this.getFreshAccountCache();
                params = {
                    tag: hashtag
                };
                if (options) {
                    if (options.only_media !== undefined) {
                        params = Object.assign(params, {
                            withFiles: options.only_media
                        });
                    }
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 20
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.since_id) {
                        params = Object.assign(params, {
                            sinceId: options.since_id
                        });
                    }
                    if (options.min_id) {
                        params = Object.assign(params, {
                            sinceId: options.min_id
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 20
                    });
                }
                return [2, this.client
                        .post('/api/notes/search-by-tag', params)
                        .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        var _this = this;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, res)];
                                    _b = {};
                                    return [4, Promise.all(res.data.map(function (n) { return _this.noteWithMentions(n, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.getHomeTimeline = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCache, params;
            var _this = this;
            return __generator(this, function (_a) {
                accountCache = this.getFreshAccountCache();
                params = {
                    withFiles: false
                };
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 20
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.since_id) {
                        params = Object.assign(params, {
                            sinceId: options.since_id
                        });
                    }
                    if (options.min_id) {
                        params = Object.assign(params, {
                            sinceId: options.min_id
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 20
                    });
                }
                return [2, this.client
                        .post('/api/notes/timeline', params)
                        .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        var _this = this;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, res)];
                                    _b = {};
                                    return [4, Promise.all(res.data.map(function (n) { return _this.noteWithMentions(n, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.getListTimeline = function (list_id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCache, params;
            var _this = this;
            return __generator(this, function (_a) {
                accountCache = this.getFreshAccountCache();
                params = {
                    listId: list_id,
                    withFiles: false
                };
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 20
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.since_id) {
                        params = Object.assign(params, {
                            sinceId: options.since_id
                        });
                    }
                    if (options.min_id) {
                        params = Object.assign(params, {
                            sinceId: options.min_id
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 20
                    });
                }
                return [2, this.client
                        .post('/api/notes/user-list-timeline', params)
                        .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        var _this = this;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, res)];
                                    _b = {};
                                    return [4, Promise.all(res.data.map(function (n) { return _this.noteWithMentions(n, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                            }
                        });
                    }); })];
            });
        });
    };
    Misskey.prototype.getConversationTimeline = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {
                    visibility: 'specified'
                };
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 20
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.since_id) {
                        params = Object.assign(params, {
                            sinceId: options.since_id
                        });
                    }
                    if (options.min_id) {
                        params = Object.assign(params, {
                            sinceId: options.min_id
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 20
                    });
                }
                return [2, this.client
                        .post('/api/notes/mentions', params)
                        .then(function (res) { return (__assign(__assign({}, res), { data: res.data.map(function (n) { return _this.converter.noteToConversation(n, _this.baseUrlToHost(_this.baseUrl)); }) })); })];
            });
        });
    };
    Misskey.prototype.deleteConversation = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.readConversation = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getLists = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/users/lists/list')
                        .then(function (res) { return (__assign(__assign({}, res), { data: res.data.map(function (l) { return _this.converter.list(l); }) })); })];
            });
        });
    };
    Misskey.prototype.getList = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/users/lists/show', {
                        listId: id
                    })
                        .then(function (res) { return (__assign(__assign({}, res), { data: _this.converter.list(res.data) })); })];
            });
        });
    };
    Misskey.prototype.createList = function (title) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/users/lists/create', {
                        name: title
                    })
                        .then(function (res) { return (__assign(__assign({}, res), { data: _this.converter.list(res.data) })); })];
            });
        });
    };
    Misskey.prototype.updateList = function (id, title) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/users/lists/update', {
                        listId: id,
                        name: title
                    })
                        .then(function (res) { return (__assign(__assign({}, res), { data: _this.converter.list(res.data) })); })];
            });
        });
    };
    Misskey.prototype.deleteList = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.client.post('/api/users/lists/delete', {
                        listId: id
                    })];
            });
        });
    };
    Misskey.prototype.getAccountsInList = function (id, _options) {
        return __awaiter(this, void 0, void 0, function () {
            var res, promise, accounts;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/users/lists/show', {
                            listId: id
                        })];
                    case 1:
                        res = _a.sent();
                        promise = res.data.userIds.map(function (userId) { return _this.getAccount(userId); });
                        return [4, Promise.all(promise)];
                    case 2:
                        accounts = _a.sent();
                        return [2, __assign(__assign({}, res), { data: accounts.map(function (r) { return r.data; }) })];
                }
            });
        });
    };
    Misskey.prototype.addAccountsToList = function (id, account_ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.client.post('/api/users/lists/push', {
                        listId: id,
                        userId: account_ids[0]
                    })];
            });
        });
    };
    Misskey.prototype.deleteAccountsFromList = function (id, account_ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.client.post('/api/users/lists/pull', {
                        listId: id,
                        userId: account_ids[0]
                    })];
            });
        });
    };
    Misskey.prototype.getMarkers = function (_timeline) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.saveMarkers = function (_options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getNotifications = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {};
                if (options) {
                    if (options.limit) {
                        params = Object.assign(params, {
                            limit: options.limit
                        });
                    }
                    else {
                        params = Object.assign(params, {
                            limit: 20
                        });
                    }
                    if (options.max_id) {
                        params = Object.assign(params, {
                            untilId: options.max_id
                        });
                    }
                    if (options.since_id) {
                        params = Object.assign(params, {
                            sinceId: options.since_id
                        });
                    }
                    if (options.min_id) {
                        params = Object.assign(params, {
                            sinceId: options.min_id
                        });
                    }
                    if (options.exclude_type) {
                        params = Object.assign(params, {
                            excludeType: options.exclude_type.map(function (e) { return _this.converter.encodeNotificationType(e); })
                        });
                    }
                }
                else {
                    params = Object.assign(params, {
                        limit: 20
                    });
                }
                return [2, this.client
                        .post('/api/i/notifications', params)
                        .then(function (res) { return (__assign(__assign({}, res), { data: res.data.map(function (n) { return _this.converter.notification(n, _this.baseUrlToHost(_this.baseUrl)); }) })); })];
            });
        });
    };
    Misskey.prototype.getNotification = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.dismissNotifications = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.client.post('/api/notifications/mark-all-as-read')];
            });
        });
    };
    Misskey.prototype.dismissNotification = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.readNotifications = function (_options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('mastodon does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.subscribePushNotification = function (_subscription, _data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getPushSubscription = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.updatePushSubscription = function (_data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.deletePushSubscription = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.search = function (q, type, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var accountCache, _c, params, match, lookupQuery, result, _d, params, params;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        accountCache = this.getFreshAccountCache();
                        _c = type;
                        switch (_c) {
                            case 'accounts': return [3, 1];
                            case 'statuses': return [3, 7];
                            case 'hashtags': return [3, 8];
                        }
                        return [3, 9];
                    case 1:
                        params = {
                            query: q
                        };
                        if (options) {
                            if (options.limit) {
                                params = Object.assign(params, {
                                    limit: options.limit
                                });
                            }
                            else {
                                params = Object.assign(params, {
                                    limit: 20
                                });
                            }
                            if (options.offset) {
                                params = Object.assign(params, {
                                    offset: options.offset
                                });
                            }
                            if (options.resolve) {
                                params = Object.assign(params, {
                                    localOnly: options.resolve
                                });
                            }
                        }
                        else {
                            params = Object.assign(params, {
                                limit: 20
                            });
                        }
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 5, , 6]);
                        match = q.match(/^@(?<user>.*?)(?:@(?<host>.*?)|)$/);
                        if (!match) return [3, 4];
                        lookupQuery = {
                            username: (_a = match.groups) === null || _a === void 0 ? void 0 : _a.user,
                            host: (_b = match.groups) === null || _b === void 0 ? void 0 : _b.host
                        };
                        return [4, this.client.post('/api/users/show', lookupQuery).then(function (res) { return (__assign(__assign({}, res), { data: {
                                    accounts: [_this.converter.userDetail(res.data, _this.baseUrlToHost(_this.baseUrl))],
                                    statuses: [],
                                    hashtags: []
                                } })); })];
                    case 3:
                        result = _e.sent();
                        if (result.status !== 200) {
                            result.status = 200;
                            result.statusText = "OK";
                            result.data = {
                                accounts: [],
                                statuses: [],
                                hashtags: []
                            };
                        }
                        return [2, result];
                    case 4: return [3, 6];
                    case 5:
                        _d = _e.sent();
                        return [3, 6];
                    case 6: return [2, this.client.post('/api/users/search', params).then(function (res) { return (__assign(__assign({}, res), { data: {
                                accounts: res.data.map(function (u) { return _this.converter.userDetail(u, _this.baseUrlToHost(_this.baseUrl)); }),
                                statuses: [],
                                hashtags: []
                            } })); })];
                    case 7:
                        {
                            params = {
                                query: q
                            };
                            if (options) {
                                if (options.limit) {
                                    params = Object.assign(params, {
                                        limit: options.limit
                                    });
                                }
                                if (options.offset) {
                                    params = Object.assign(params, {
                                        offset: options.offset
                                    });
                                }
                                if (options.max_id) {
                                    params = Object.assign(params, {
                                        untilId: options.max_id
                                    });
                                }
                                if (options.min_id) {
                                    params = Object.assign(params, {
                                        sinceId: options.min_id
                                    });
                                }
                                if (options.account_id) {
                                    params = Object.assign(params, {
                                        userId: options.account_id
                                    });
                                }
                            }
                            return [2, this.client.post('/api/notes/search', params).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                    var _a;
                                    var _b, _c;
                                    var _this = this;
                                    return __generator(this, function (_d) {
                                        switch (_d.label) {
                                            case 0:
                                                _a = [__assign({}, res)];
                                                _b = {};
                                                _c = {
                                                    accounts: []
                                                };
                                                return [4, Promise.all(res.data.map(function (n) { return _this.noteWithMentions(n, _this.baseUrlToHost(_this.baseUrl), accountCache); }))];
                                            case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = (_c.statuses = _d.sent(),
                                                        _c.hashtags = [],
                                                        _c), _b)])))];
                                        }
                                    });
                                }); })];
                        }
                        _e.label = 8;
                    case 8:
                        {
                            params = {
                                query: q
                            };
                            if (options) {
                                if (options.limit) {
                                    params = Object.assign(params, {
                                        limit: options.limit
                                    });
                                }
                                if (options.offset) {
                                    params = Object.assign(params, {
                                        offset: options.offset
                                    });
                                }
                            }
                            return [2, this.client.post('/api/hashtags/search', params).then(function (res) { return (__assign(__assign({}, res), { data: {
                                        accounts: [],
                                        statuses: [],
                                        hashtags: res.data.map(function (h) { return ({ name: h, url: h, history: null, following: false }); })
                                    } })); })];
                        }
                        _e.label = 9;
                    case 9: return [2];
                }
            });
        });
    };
    Misskey.prototype.getInstance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var meta;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/meta').then(function (res) { return res.data; })];
                    case 1:
                        meta = _a.sent();
                        return [2, this.client
                                .post('/api/stats')
                                .then(function (res) { return (__assign(__assign({}, res), { data: _this.converter.meta(meta, res.data) })); })];
                }
            });
        });
    };
    Misskey.prototype.getInstancePeers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getInstanceActivity = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getInstanceTrends = function (_limit) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/hashtags/trend')
                        .then(function (res) { return (__assign(__assign({}, res), { data: res.data.map(function (h) { return _this.converter.hashtag(h); }) })); })];
            });
        });
    };
    Misskey.prototype.getInstanceDirectory = function (_options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.getInstanceCustomEmojis = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/meta')
                        .then(function (res) { return (__assign(__assign({}, res), { data: res.data.emojis.map(function (e) { return _this.converter.emoji(e); }) })); })];
            });
        });
    };
    Misskey.prototype.getInstanceAnnouncements = function (with_dismissed) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {};
                if (with_dismissed) {
                    params = Object.assign(params, {
                        withUnreads: with_dismissed
                    });
                }
                return [2, this.client.post('/api/announcements', params).then(function (res) { return (__assign(__assign({}, res), { data: res.data.map(function (t) { return _this.converter.announcement(t); }) })); })];
            });
        });
    };
    Misskey.prototype.dismissInstanceAnnouncement = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.client.post('/api/i/read-announcement', { announcementId: id })];
            });
        });
    };
    Misskey.prototype.createEmojiReaction = function (id, emoji) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/notes/reactions/create', {
                            noteId: id,
                            reaction: emoji
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/notes/show', {
                                noteId: id
                            })
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                var _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _a = [__assign({}, res)];
                                            _b = {};
                                            return [4, this.noteWithMentions(res.data, this.baseUrlToHost(this.baseUrl), this.getFreshAccountCache())];
                                        case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    Misskey.prototype.deleteEmojiReaction = function (id, _emoji) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.client.post('/api/notes/reactions/delete', {
                            noteId: id
                        })];
                    case 1:
                        _a.sent();
                        return [2, this.client
                                .post('/api/notes/show', {
                                noteId: id
                            })
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                var _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _a = [__assign({}, res)];
                                            _b = {};
                                            return [4, this.noteWithMentions(res.data, this.baseUrlToHost(this.baseUrl), this.getFreshAccountCache())];
                                        case 1: return [2, (__assign.apply(void 0, _a.concat([(_b.data = _c.sent(), _b)])))];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    Misskey.prototype.getEmojiReactions = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.client
                        .post('/api/notes/reactions', {
                        noteId: id
                    })
                        .then(function (res) { return (__assign(__assign({}, res), { data: _this.converter.reactions(res.data) })); })];
            });
        });
    };
    Misskey.prototype.getEmojiReaction = function (_id, _emoji) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (_, reject) {
                        var err = new megalodon_1.NoImplementedError('misskey does not support');
                        reject(err);
                    })];
            });
        });
    };
    Misskey.prototype.userSocket = function () {
        return this.client.socket('user');
    };
    Misskey.prototype.publicSocket = function () {
        return this.client.socket('globalTimeline');
    };
    Misskey.prototype.localSocket = function () {
        return this.client.socket('localTimeline');
    };
    Misskey.prototype.tagSocket = function (_tag) {
        throw new megalodon_1.NoImplementedError('TODO: implement');
    };
    Misskey.prototype.listSocket = function (list_id) {
        return this.client.socket('list', list_id);
    };
    Misskey.prototype.directSocket = function () {
        return this.client.socket('conversation');
    };
    return Misskey;
}());
exports.default = Misskey;
