
module game {

    export class UserInfoWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "UserInfoWindowMediator";

        public constructor(viewComponent: any) {
            super(UserInfoWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.userInfoWindow.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.backButtonClick, this);
            this.initData();
        }

        public async initData() {
            const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
            const gameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            const userInfo = await accountProxy.loadUserInfo();
            userInfo.gameRecords = []
            for (let i = 0; i < 20; i++) {
                userInfo.gameRecords.push({
                    role: "",
                    camp: Math.random() > 0.5 ? gameCamp.xuyuan : gameCamp.laochaofen,
                    gameType:  Math.random() > 0.7 ? gameType.six : ( Math.random() > 0.3 ? gameType.seven : gameType.eight),
                    isWin: Math.random() > 0.5 ? true : false,
                })
            }
            let totalPlay = userInfo.gameRecords.length;
            let winPlay = userInfo.gameRecords.filter(i => i.isWin).length;
            let play6 = userInfo.gameRecords.filter(i => i.gameType == gameType.six).length;
            let winPlay6 = userInfo.gameRecords.filter(i => i.gameType == gameType.six && i.isWin).length;
            let play7 = userInfo.gameRecords.filter(i => i.gameType == gameType.seven).length;
            let winPlay7 = userInfo.gameRecords.filter(i => i.gameType == gameType.seven && i.isWin).length;
            let play8 = userInfo.gameRecords.filter(i => i.gameType == gameType.eight).length;
            let winPlay8 = userInfo.gameRecords.filter(i => i.gameType == gameType.eight && i.isWin).length;
            let campXu = userInfo.gameRecords.filter(i => i.camp == gameCamp.xuyuan).length;
            let campXuWin = userInfo.gameRecords.filter(i => i.camp == gameCamp.xuyuan && i.isWin).length;
            let campLao = userInfo.gameRecords.filter(i => i.camp == gameCamp.laochaofen).length;
            let campLaoWin = userInfo.gameRecords.filter(i => i.camp == gameCamp.laochaofen && i.isWin).length;

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
        }

        private backButtonClick(event: egret.TouchEvent) {
            this.userInfoWindow.close();
        }

        public get userInfoWindow(): UserInfoWindow {
            return <UserInfoWindow><any>(this.viewComponent);
        }
    }
}