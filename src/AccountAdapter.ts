
namespace moa {

    export class AccountAdapter {

        private static userInfo: moa.UserInfo;

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
            request.open(`${moa.Constants.Endpoints.service}version/check?version=${version}`, egret.HttpMethod.GET);
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
            request.open(`${moa.Constants.Endpoints.service}users/${platform.name == "native" ? "login-native" : "login-wxgame"}?code=${wxRes.code || ""}&token=${wxRes.token || ""}`, egret.HttpMethod.POST);
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
                        moa.CommonData.logon = { ...moa.CommonData.logon, ...res.data };  //this is the unique Id.
                        console.log(`Login app server end, unionId: ${res.data && res.data.unionId}, wxgameOpenId: ${res.data && res.data.wxgameOpenId}`);
                        return resolve();
                    }
                }, this);
                // request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this);
                // request.addEventListener(egret.ProgressEvent.PROGRESS, this.onGetProgress, this);
            });
        }

        public static async loadUserInfo(): Promise<moa.UserInfo> {
            console.log(`platform.getUserInfo begin.`);

            if (this.userInfo && this.userInfo.userId) {
                return this.userInfo;
            }
            else if (moa.CommonData.logon && moa.CommonData.logon.userId) {
                this.userInfo = moa.CommonData.logon;
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
                userInfo = await platform.authorizeUserInfo().catch((error) => {
                    console.error(error);
                });
            }

            if (!userInfo) {
                console.log(`platform.getUserInfo end, userInfo is null.`);
                this.userInfo = {
                    gameRecords: {} as moa.MyStats
                };
                return this.userInfo;
            }

            console.log(`platform.getUserInfo end.`);
            this.userInfo = { ...userInfo, session_key: moa.CommonData.logon.session_key };

            await this.authorizeUserInfoViaAppServer(this.userInfo);
            moa.CommonData.logon.userId = this.userInfo.userId;
            moa.CommonData.logon.unionId = this.userInfo.unionId;
            moa.CommonData.logon.token = this.userInfo.token;

            console.log("userInfo after authorizeUserInfoViaAppServer", this.userInfo);
            return this.userInfo;
        }

        /**
         * authorizeUserInfoViaAppServer
         */
        public static async authorizeUserInfoViaAppServer(user: moa.UserInfo) {
            if (moa.CommonData.logon && moa.CommonData.logon.wxgameOpenId) {
                console.log(`load users/info via app server begin, openId: ${moa.CommonData.logon.wxgameOpenId}.`);
                this.userInfo.wxgameOpenId = moa.CommonData.logon.wxgameOpenId;

                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${moa.Constants.Endpoints.service}users/authorize-wxgame/?wxgameOpenId=${moa.CommonData.logon.wxgameOpenId}`, egret.HttpMethod.POST);
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

                        const data = res.data as moa.UserInfo;

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
        public static async loadUserGameRecords(): Promise<moa.UserInfo> {

            if (moa.CommonData.logon && moa.CommonData.logon.userId) {
                console.log(`loadUserGameRecords via app server begin, userId: ${moa.CommonData.logon.userId}.`);

                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${moa.Constants.Endpoints.service}records/?token=${moa.CommonData.logon.token}`, egret.HttpMethod.POST);
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
                            this.userInfo.gameRecords = res.data as moa.MyStats;
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

            if (moa.CommonData.logon && moa.CommonData.logon.userId) {
                console.log(`saveUserGameRecords via app server begin, userId: ${moa.CommonData.logon.userId}.`);

                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${moa.Constants.Endpoints.service}records/create/?token=${moa.CommonData.logon.token}`, egret.HttpMethod.POST);
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

    }
}
