
module game {

    export class StartScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "StartScreenMediator";

        private accountProxy: AccountProxy;
        private gameProxy: GameProxy;

        public constructor(viewComponent: any) {
            super(StartScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.startScreen.btnCreateRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.createRoomClick, this);
            this.startScreen.btnJoinRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.joinRoomClick, this);
            this.startScreen.btnTanbao.addEventListener(egret.TouchEvent.TOUCH_TAP, this.gameTanbaoClick, this);
            this.startScreen.btnViewMore.addEventListener(egret.TouchEvent.TOUCH_TAP, this.viewMoreClick, this);

            this.startScreen.headGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showMyInfo, this);
            this.startScreen.btnNotice.addEventListener(egret.TouchEvent.TOUCH_TAP, this.noticeClick, this);
            this.startScreen.btnRank.addEventListener(egret.TouchEvent.TOUCH_TAP, this.rankClick, this);
            this.startScreen.btnGuide.addEventListener(egret.TouchEvent.TOUCH_TAP, this.guideClick, this);
            this.startScreen.btnSetting.addEventListener(egret.TouchEvent.TOUCH_TAP, this.settingClick, this);

            this.initData();
        }

        public async initData() {
            console.log("StartScreen initData:");
            this.accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
            this.gameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            const userInfo = await AccountAdapter.loadUserInfo();
            console.log("loadUserInfo completed.", userInfo);
            this.startScreen.nickName = userInfo.nickName;
            this.startScreen.avatarUrl = userInfo.avatarUrl;

            await this.gameProxy.initialize();

            if (platform.name == "DebugPlatform") {
                console.log("DebugPlatform");
                this.startScreen.isDebugPlatform = true;
                this.startScreen.isWxPlatform = false;
                this.startScreen.isNativePlatform = false;
            }
            else if (platform.name == "wxgame") {
                console.log("wxgame");
                this.startScreen.isDebugPlatform = false;
                this.startScreen.isWxPlatform = true;
                this.startScreen.isNativePlatform = false;
            }
            else if (platform.name == "native") {
                console.log("native");
                this.startScreen.isDebugPlatform = false;
                this.startScreen.isWxPlatform = false;
                this.startScreen.isNativePlatform = true;
            }
        }

        // public async changeOpenIdClick(event: egret.TouchEvent) {
        //     event.stopImmediatePropagation();
        //     const unionId = this.startScreen.txtOpenId.text;
        //     CommonData.logon.unionId = unionId;
        //     const userInfo = await AccountAdapter.loadUserInfo();
        //     this.startScreen.nickName = userInfo.nickName;
        //     await this.gameProxy.initialize();
        // }

        public createRoomClick(event: egret.TouchEvent) {
            platform.showBannerAd("top");
            // this.sendNotification(GameCommand.CREATE_ROOM);
            this.sendNotification(SceneCommand.SHOW_HANDLE_POPUP);
        }

        public joinRoomClick(event: egret.TouchEvent) {
            platform.showBannerAd("top");
            // this.sendNotification(SceneCommand.SHOW_JOIN_WINDOW);
            this.sendNotification(SceneCommand.SHOW_NUMBER_KEYBOARD);
        }

        public gameTanbaoClick(event: egret.TouchEvent) {
            platform.navigateToMiniProgram();
        }

        public viewMoreClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_MORE_GAME);
        }

        private noticeClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_NOTICE_WINDOW);
        }

        private rankClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_RANK_WINDOW);
        }

        private guideClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_BAR_WINDOW);
        }

        private settingClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_SETTING_WINDOW);
        }

        private showMyInfo(): void {
            if (!CommonData.logon.userId) {
                return;
            }
            this.sendNotification(SceneCommand.SHOW_USERINFO_WINDOW);
        }

        public listNotificationInterests(): Array<any> {
            return [GameProxy.INPUT_NUMBER, GameProxy.FINISH_INPUT];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
            switch (notification.getName()) {
                case GameProxy.INPUT_NUMBER:
                    this.startScreen.roomNum = data;
                    break;
                case GameProxy.FINISH_INPUT:
                    const roomName = this.startScreen.roomNum;
                    this.sendNotification(GameCommand.JOIN_ROOM, roomName);
                    this.startScreen.roomNum = "";
                    break;
            }
        }

        public get startScreen(): StartScreen {
            return <StartScreen><any>(this.viewComponent);
        }
    }
}