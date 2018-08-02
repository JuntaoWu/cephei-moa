

module game {

    export class AccountProxy extends puremvc.Proxy implements puremvc.IProxy {
        public static NAME: string = "AccountProxy";

        public userInfo: any;

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
                if (this.userInfo && this.userInfo.openId) {
                    resolve(this.userInfo);
                }
                else {
                    console.log(`platform.getUserInfo begin.`);
                    //todo: Check if loadUserInfo async via url is available.
                    platform.getUserInfo().then((user: UserInfo) => {
                        this.userInfo = user;
                        console.log(`platform.getUserInfo end.`);

                        if (CommonData.logon && CommonData.logon.openId) {
                            console.log(`load users/info via app server begin, openId: ${CommonData.logon.openId}.`);
                            this.userInfo.openId = CommonData.logon.openId;
                            resolve(this.userInfo);
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

    }
}