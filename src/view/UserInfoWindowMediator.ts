
module game {

    export class UserInfoWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "UserInfoWindowMediator";

        public constructor(viewComponent: any) {
            super(UserInfoWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.userInfoWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.userInfoWindow.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.backButtonClick, this);
            this.initData();
        }

        public async initData() {
            const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
            const gameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            const userInfo = await accountProxy.loadUserInfo();
            userInfo.gameRecords = userInfo.gameRecords || [];
            // userInfo.gameRecords = []
            // for (let i = 0; i < 20; i++) {
            //     userInfo.gameRecords.push({
            //         role: "",
            //         camp: Math.random() > 0.5 ? gameCamp.xuyuan : gameCamp.laochaofen,
            //         gameType:  Math.random() > 0.7 ? gameType.six : ( Math.random() > 0.3 ? gameType.seven : gameType.eight),
            //         isWin: Math.random() > 0.5 ? true : false,
            //     })
            // }
            let totalPlay = userInfo.gameRecords.length;
            let winPlay = userInfo.gameRecords.filter(i => i.isWin).length;
            let play6 = userInfo.gameRecords.filter(i => i.gameType == 6).length;
            let winPlay6 = userInfo.gameRecords.filter(i => i.gameType == 6 && i.isWin).length;
            let play7 = userInfo.gameRecords.filter(i => i.gameType == 7).length;
            let winPlay7 = userInfo.gameRecords.filter(i => i.gameType == 7 && i.isWin).length;
            let play8 = userInfo.gameRecords.filter(i => i.gameType == 8).length;
            let winPlay8 = userInfo.gameRecords.filter(i => i.gameType == 8 && i.isWin).length;
            let campXu = userInfo.gameRecords.filter(i => i.camp == 1).length;
            let campXuWin = userInfo.gameRecords.filter(i => i.camp == 1 && i.isWin).length;
            let campLao = userInfo.gameRecords.filter(i => i.camp == 2).length;
            let campLaoWin = userInfo.gameRecords.filter(i => i.camp == 2 && i.isWin).length;

            this.userInfoWindow.nickName = userInfo.nickName;
            this.userInfoWindow.avatarUrl = userInfo.avatarUrl;
            this.userInfoWindow.totalPlay = `共${totalPlay}局`;
            this.userInfoWindow.winPlay = winPlay;
            this.userInfoWindow.failPlay = totalPlay - winPlay;

            this.userInfoWindow.totalWinRate = `${Math.round((winPlay / (totalPlay || 1)) * 100)}%`;
            this.userInfoWindow.gameWinRate6 = `${Math.round((winPlay6 / (play6 || 1)) * 100)}%`;
            this.userInfoWindow.gameWinRate7 = `${Math.round((winPlay7 / (play7 || 1)) * 100)}%`;
            this.userInfoWindow.gameWinRate8 = `${Math.round((winPlay8 / (play8 || 1)) * 100)}%`;
            this.userInfoWindow.campXuWinRate = `${Math.round((campXuWin / (campXu || 1)) * 100)}%`;
            this.userInfoWindow.campLaoWinRate = `${Math.round((campLaoWin / (campLao || 1)) * 100)}%`;

            // this.userInfoWindow.totalPlay = `共99局`;
            // this.userInfoWindow.winPlay = 99;
            // this.userInfoWindow.failPlay = 0;

            // this.userInfoWindow.totalWinRate = `100%`;
            // this.userInfoWindow.gameWinRate6 = `100%`;
            // this.userInfoWindow.gameWinRate7 = `100%`;
            // this.userInfoWindow.gameWinRate8 = `100%`;
            // this.userInfoWindow.campXuWinRate = `100%`;
            // this.userInfoWindow.campLaoWinRate = `100%`;
        }

        private backButtonClick(event: egret.TouchEvent) {
            this.userInfoWindow.close();
        }

        public get userInfoWindow(): UserInfoWindow {
            return <UserInfoWindow><any>(this.viewComponent);
        }
    }
}