

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
        public loadUserInfo(): Promise<UserInfo> {

            return new Promise((resolve, reject) => {
                if (this.userInfo && this.userInfo.unionId) {
                    resolve(this.userInfo);
                }
                else {
                    console.log(`platform.getUserInfo begin.`);
                    //todo: Check if loadUserInfo async via url is available.
                    platform.getUserInfo().then((user: UserInfo) => {
                        this.userInfo = user;
                        console.log(`platform.getUserInfo end.`);

                        if (CommonData.logon && CommonData.logon.wxgameOpenId) {
                            console.log(`load users/info via app server begin, openId: ${CommonData.logon.wxgameOpenId}.`);
                            this.userInfo.wxgameOpenId = CommonData.logon.wxgameOpenId;

                            var request = new egret.HttpRequest();
                            request.responseType = egret.HttpResponseType.TEXT;
                            request.open(`${game.Constants.Endpoints.service}records/?openId=${CommonData.logon.wxgameOpenId}`, egret.HttpMethod.POST);
                            request.setRequestHeader("Content-Type", "application/json");
                            request.send(JSON.stringify({
                                userInfo: user
                            }));
                            request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                                console.log(`load users/info via app server end.`);

                                let req = <egret.HttpRequest>(event.currentTarget);
                                let res = JSON.parse(req.response);
                                if (res.error) {
                                    console.error(res.message);
                                    reject(res.message);
                                }
                                //todo: Invalid code

                                this.userInfo.gameRecords = res.data as MyStats;

                                resolve(this.userInfo);
                            }, this);
                        }
                        else {
                            console.log(`We don't have openId now, skip.`);
                            resolve(this.userInfo);
                        }
                        // request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this);
                        // request.addEventListener(egret.ProgressEvent.PROGRESS, this.onGetProgress, this);
                    });
                }
            });
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