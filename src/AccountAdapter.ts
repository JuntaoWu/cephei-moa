
namespace moa {

    export class AccountAdapter {

        private static userInfo: UserInfo;
        public static preference: Preference;
        private static gameIcons: GameIcon[];
        private static imInfo: IMInfo;

        public static async checkForUpdate() {

            if (platform.name == "DebugPlatform") {
                return {
                    hasUpdate: false
                };
            }

            let version = await platform.getVersion() || 0;
            console.log(`Check version begin, current version is: ${version}`);

            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${Constants.Endpoints.service}version/check?version=${version}&timestamp=${+new Date()}`, egret.HttpMethod.GET);
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.send();

            return new Promise((resolve, reject) => {
                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                        return reject(res.message);
                    }
                    else {
                        console.log(`Check version end, lastest version is: ${res.data && res.data.version || version}`);
                        return resolve(res.data);
                    }
                }, this);
                // request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this);
                // request.addEventListener(egret.ProgressEvent.PROGRESS, this.onGetProgress, this);
            });
        }

        public static async login(option?: { token?: string, code?: string }): Promise<any> {
            let wxRes = option;
            if (!option || (!option.code && !option.token)) {
                wxRes = await platform.login();
            }

            //log the login information into backend.
            //https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
            console.log(`Login app server begin, code: ${wxRes.code}, token: ${wxRes.token}`);

            const request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${Constants.Endpoints.service}users/${platform.name == "native" ? "login-native" : "login-wxgame"}?code=${wxRes.code || ""}&token=${wxRes.token || ""}`, egret.HttpMethod.POST);
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.send();

            return new Promise((resolve, reject) => {
                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    const req = event.currentTarget as egret.HttpRequest;
                    const res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                        return reject(res.message);
                    }
                    else {
                        CommonData.logon = { ...CommonData.logon, ...res.data };  //this is the unique Id.
                        console.log(`Login app server end, unionId: ${res.data && res.data.unionId}, wxgameOpenId: ${res.data && res.data.wxgameOpenId}`);
                        return resolve();
                    }
                }, this);
                // request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this);
                // request.addEventListener(egret.ProgressEvent.PROGRESS, this.onGetProgress, this);
            });
        }

        public static async loadUserInfo(): Promise<UserInfo> {
            console.log(`platform.getUserInfo begin.`);

            if (this.userInfo && this.userInfo.userId) {
                return this.userInfo;
            }
            else if (CommonData.logon && CommonData.logon.userId) {
                this.userInfo = CommonData.logon;
                if (platform.name == "native") {
                    platform.setSecurityStorageAsync(this.userInfo.anonymous ? "anonymoustoken" : "token", this.userInfo.token);
                }
                else if (platform.name == "DebugPlatform") {
                    platform.setStorage(this.userInfo.anonymous ? "anonymoustoken" : "token", this.userInfo.token);
                }
                return this.userInfo;
            }

            let userInfo = await platform.getUserInfo().catch((error) => {
                console.error(error);
            });

            if (!userInfo) {
                console.log("platform.getUserInfo failed now await authorizeUserInfo actively.");
                userInfo = await platform.authorizeUserInfo(Constants.authorizeButtonImageUrl).catch((error) => {
                    console.error(error);
                });
            }

            if (!userInfo) {
                console.log(`platform.getUserInfo end, userInfo is null.`);
                this.userInfo = {
                    gameRecords: {} as MyStats
                };
                return this.userInfo;
            }

            console.log(`platform.getUserInfo end.`);
            this.userInfo = { ...userInfo, session_key: CommonData.logon.session_key };

            await this.authorizeUserInfoViaAppServer(this.userInfo);
            CommonData.logon.userId = this.userInfo.userId;
            CommonData.logon.unionId = this.userInfo.unionId;
            CommonData.logon.token = this.userInfo.token;

            console.log("userInfo after authorizeUserInfoViaAppServer", this.userInfo);
            return this.userInfo;
        }

        /**
         * authorizeUserInfoViaAppServer
         */
        public static async authorizeUserInfoViaAppServer(user: UserInfo) {
            if (CommonData.logon && CommonData.logon.wxgameOpenId) {
                console.log(`load users/info via app server begin, openId: ${CommonData.logon.wxgameOpenId}.`);
                this.userInfo.wxgameOpenId = CommonData.logon.wxgameOpenId;

                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${Constants.Endpoints.service}users/authorize-wxgame/?wxgameOpenId=${CommonData.logon.wxgameOpenId}`, egret.HttpMethod.POST);
                request.setRequestHeader("Content-Type", "application/json");
                request.send(JSON.stringify(this.userInfo));

                return new Promise((resolve, reject) => {
                    request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                        console.log(`load users/info via app server end.`);

                        let req = <egret.HttpRequest>(event.currentTarget);
                        let res = JSON.parse(req.response);
                        if (res.error) {
                            console.error(res.message);
                            return reject(res.message);
                        }

                        const data = res.data as UserInfo;

                        this.userInfo.userId = data.userId;
                        this.userInfo.unionId = data.unionId;
                        this.userInfo.nativeOpenId = data.nativeOpenId;
                        this.userInfo.wxgameOpenId = data.wxgameOpenId;
                        this.userInfo.token = data.token;

                        platform.setStorage("token", data.token);

                        return resolve(this.userInfo);
                    }, this);
                });
            }
            else {
                console.log(`We don't have wxgameOpenId now, skip.`);
                return this.userInfo;
            }
            // request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this);
            // request.addEventListener(egret.ProgressEvent.PROGRESS, this.onGetProgress, this);
        }

        /**
         * loadUserGameRecords
         */
        public static async loadUserGameRecords(): Promise<UserInfo> {

            if (CommonData.logon && CommonData.logon.userId) {
                console.log(`loadUserGameRecords via app server begin, userId: ${CommonData.logon.userId}.`);

                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${Constants.Endpoints.service}records/?token=${CommonData.logon.token}&timestamp=${+new Date()}`, egret.HttpMethod.GET);
                request.setRequestHeader("Content-Type", "application/json");

                request.send();

                return new Promise((resolve, reject) => {
                    request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                        console.log(`loadUserGameRecords via app server end.`);

                        let req = <egret.HttpRequest>(event.currentTarget);
                        let res = JSON.parse(req.response);
                        if (res.error) {
                            console.error(res.message);
                            return reject(res.message);
                        }
                        else {
                            console.log("update current userInfo object");
                            this.userInfo.gameRecords = res.data as MyStats;
                            return resolve(this.userInfo);
                        }
                    }, this);
                });
            }
            else {
                console.log(`We don't have unionId now, skip.`);
                return this.userInfo;
            }
        }

        /**
         * saveUserGameRecords
         */
        public static saveUserGameRecords(records) {

            if (CommonData.logon && CommonData.logon.userId) {
                console.log(`saveUserGameRecords via app server begin, userId: ${CommonData.logon.userId}.`);

                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${Constants.Endpoints.service}records/create/?token=${CommonData.logon.token}`, egret.HttpMethod.POST);
                request.setRequestHeader("Content-Type", "application/json");

                request.send(JSON.stringify(records));

                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    console.log(`saveUserGameRecords via app server end.`);

                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                    }
                    else {

                    }
                }, this);
            }
            else {
                console.log(`We don't have openId now, skip.`);
            }
        }

        /** loadPreference */
        public static async loadPreference(): Promise<Preference> {

            if (AccountAdapter.preference) {
                return AccountAdapter.preference;
            }

            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${Constants.Endpoints.service}preferences/${platform.name}?timestamp=${+new Date()}`, egret.HttpMethod.GET);
            request.setRequestHeader("Content-Type", "application/json");

            request.send();

            return new Promise((resolve, reject) => {
                request.addEventListener(egret.Event.COMPLETE, async (event: egret.Event) => {
                    console.log(`loadPreference via app server end.`);

                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                        return reject(res.message);
                    }
                    else {
                        AccountAdapter.preference = res.data;
                        const personalPreference: Preference = await platform.getSecurityStorageAsync("preference");

                        if (personalPreference) {
                            AccountAdapter.preference.showGuide = personalPreference.showGuide !== undefined ? personalPreference.showGuide : AccountAdapter.preference.showGuide;
                            AccountAdapter.preference.showClub = personalPreference.showClub !== undefined ? personalPreference.showClub : AccountAdapter.preference.showClub;
                            AccountAdapter.preference.showMore = personalPreference.showMore !== undefined ? personalPreference.showMore : AccountAdapter.preference.showMore;
                            AccountAdapter.preference.showWeChatLogin = personalPreference.showWeChatLogin !== undefined ? personalPreference.showWeChatLogin : AccountAdapter.preference.showWeChatLogin;
                            AccountAdapter.preference.enabledIM = personalPreference.enabledIM !== undefined ? personalPreference.enabledIM : AccountAdapter.preference.enabledIM;
                        }

                        return resolve(AccountAdapter.preference);
                    }
                }, this);
            });
        }

        /** loadGameIcons */
        public static async loadGameIcons(): Promise<GameIcon[]> {

            if (AccountAdapter.gameIcons) {
                return AccountAdapter.gameIcons;
            }

            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${Constants.Endpoints.service}gameIcons/?timestamp=${+new Date()}`, egret.HttpMethod.GET);
            request.setRequestHeader("Content-Type", "application/json");

            request.send();

            return new Promise<GameIcon[]>((resolve, reject) => {
                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    console.log(`loadGameIcons via app server end.`);

                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                        return reject(res.message);
                    }
                    else {
                        AccountAdapter.gameIcons = res.data;
                        return resolve(AccountAdapter.gameIcons);
                    }
                }, this);
            });
        }

        public static async loadIMInfo(): Promise<IMInfo> {
            if (AccountAdapter.imInfo) {
                return AccountAdapter.imInfo;
            }

            if (this.userInfo && this.userInfo.imAccId && this.userInfo.imToken) {
                AccountAdapter.imInfo = {
                    account: this.userInfo.imAccId,
                    token: this.userInfo.imToken,
                };
                return AccountAdapter.imInfo;
            }

            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${Constants.Endpoints.service}im/load?token=${this.userInfo.token}&timestamp=${+new Date()}`, egret.HttpMethod.GET);
            request.setRequestHeader("Content-Type", "application/json");

            request.send();

            return new Promise<IMInfo>((resolve, reject) => {
                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    console.log(`loadIMInfo via app server end.`);

                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error || !res.data) {
                        console.error(res.message);
                        return reject(res.message);
                    }
                    else {
                        AccountAdapter.imInfo = {
                            account: res.data.imAccId,
                            token: res.data.imToken,
                        };
                        return resolve(AccountAdapter.imInfo);
                    }
                }, this);
            });
        }
    }
}
