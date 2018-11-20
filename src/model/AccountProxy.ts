

module game {

    export class AccountProxy extends puremvc.Proxy implements puremvc.IProxy {
        public static NAME: string = "AccountProxy";

        public userInfo: UserInfo;

        public constructor() {
            super(AccountProxy.NAME);
        }

		/**
		 * 获取用户信息
         * loadUserInfo
		 */
        public async loadUserInfo(): Promise<UserInfo> {
            console.log(`platform.getUserInfo begin.`);

            if (this.userInfo && this.userInfo.userId) {
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

            await this.authorizeUserInfoViaAppServer(this.userInfo);
            CommonData.logon.userId = this.userInfo.userId;
            CommonData.logon.unionId = this.userInfo.unionId;
            CommonData.logon.token = this.userInfo.token;

            return this.userInfo;
        }

        /**
         * authorizeUserInfoViaAppServer
         */
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
                console.log(`We don't have openId now, skip.`);
                return this.userInfo;
            }
            // request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this);
            // request.addEventListener(egret.ProgressEvent.PROGRESS, this.onGetProgress, this);
        }

        /**
         * loadUserGameRecords
         */
        public async loadUserGameRecords(): Promise<UserInfo> {

            if (CommonData.logon && CommonData.logon.unionId) {
                console.log(`loadUserGameRecords via app server begin, unionId: ${CommonData.logon.unionId}.`);

                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${game.Constants.Endpoints.service}records/?token=${CommonData.logon.token}`, egret.HttpMethod.POST);
                request.setRequestHeader("Content-Type", "application/json");

                request.send(JSON.stringify({
                    unionId: CommonData.logon.unionId
                }));

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

        public async loadRank(orderType: OrderType = OrderType.winRate, mode: number = 0, role: number = 0, minimumCount: number = 10): Promise<Rank[]> {
            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${game.Constants.Endpoints.service}ranks/?orderType=${orderType}&mode=${mode}&role=${role}&minimumCount=${minimumCount}`, egret.HttpMethod.GET);
            request.setRequestHeader("Content-Type", "application/json");

            request.send();

            return new Promise<Rank[]>((resolve, reject) => {
                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    console.log(`loadRanks via app server end.`);

                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                        return reject(res.message);
                    }
                    else {
                        console.log("resolve current ranks");
                        return resolve(res.data as Rank[]);
                    }
                }, this);
            });
        }

    }
}