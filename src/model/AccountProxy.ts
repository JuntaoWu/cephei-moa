

module game {

    export class AccountProxy extends puremvc.Proxy implements puremvc.IProxy {
        public static NAME: string = "AccountProxy";

        public userInfo: UserInfo;

        /**
         * 获取用户信息完毕
         */
        public static LOAD_USER_INFO_COMPLETED: string = "userinfo_loaded";

        public constructor() {
            super(AccountProxy.NAME);
        }

		/**
		 * 获取用户信息
		 */
        public async loadUserInfo(): Promise<UserInfo> {
            console.log(`platform.getUserInfo begin.`);

            if (this.userInfo && this.userInfo.unionId) {
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
                    gameRecords: {} as MyStats
                };
                return this.userInfo;
            }

            console.log(`platform.getUserInfo end.`);
            this.userInfo = { ...userInfo, session_key: CommonData.logon.session_key };
            return this.authorizeUserInfoViaAppServer(this.userInfo);
        }

        public async authorizeUserInfoViaAppServer(user: UserInfo) {
            if (CommonData.logon && CommonData.logon.wxgameOpenId) {
                console.log(`load users/info via app server begin, openId: ${CommonData.logon.wxgameOpenId}.`);
                this.userInfo.wxgameOpenId = CommonData.logon.wxgameOpenId;

                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${game.Constants.Endpoints.service}users/authorize-wxgame/?wxgameOpenId=${CommonData.logon.wxgameOpenId}`, egret.HttpMethod.POST);
                request.setRequestHeader("Content-Type", "application/json");
                request.send(JSON.stringify(this.userInfo));

                return new Promise((resolve, reject) => {
                    request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                        console.log(`load users/info via app server end.`);

                        let req = <egret.HttpRequest>(event.currentTarget);
                        let res = JSON.parse(req.response);
                        if (res.error) {
                            console.error(res.message);
                            reject(res.message);
                        }
                        //todo: Invalid code

                        //this.userInfo.gameRecords = res.data as MyStats;

                        const data = res.data as UserInfo;

                        this.userInfo.unionId = data.unionId;
                        this.userInfo.nativeOpenId = data.nativeOpenId;
                        this.userInfo.wxgameOpenId = data.wxgameOpenId;

                        platform.setStorage("token", data.token);

                        resolve(this.userInfo);
                    }, this);
                });
            }
            else {
                console.log(`We don't have openId now, skip.`);
                return this.userInfo;
            }
            // request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this);
            // request.addEventListener(egret.ProgressEvent.PROGRESS, this.onGetProgress, this);
        }

        /**
         * 
         */
        public saveUserGameRecords(record) {

            if (CommonData.logon && CommonData.logon.wxgameOpenId) {
                console.log(`saveUserGameRecords via app server begin, openId: ${CommonData.logon.wxgameOpenId}.`);

                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${game.Constants.Endpoints.service}records/create/?openId=${CommonData.logon.wxgameOpenId}`, egret.HttpMethod.POST);
                request.setRequestHeader("Content-Type", "application/json");

                request.send(JSON.stringify({
                    ...record,
                    openId: CommonData.logon.wxgameOpenId
                }));

                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    console.log(`saveUserGameRecords via app server end.`);

                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                    }
                    else {
                        console.log("update current userInfo object");
                        this.userInfo.gameRecords = res.data as MyStats;
                    }
                }, this);
            }
            else {
                console.log(`We don't have openId now, skip.`);
            }
        }

    }
}