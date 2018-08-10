
module game {

    export class StartScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "StartScreenMediator";

        private gameProxy: GameProxy;

        public constructor(viewComponent: any) {
            super(StartScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.startScreen.txtOpenId.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.TouchEvent) => {
                event.stopImmediatePropagation();
            }, this);
            this.startScreen.btnChangeOpenId.addEventListener(egret.TouchEvent.TOUCH_TAP, this.changeOpenIdClick, this);

            this.startScreen.btnCreateRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.createRoomClick, this);
            this.startScreen.btnJoinRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.joinRoomClick, this);

            this.startScreen.headGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showMyInfo, this);
            this.startScreen.btnNotice.addEventListener(egret.TouchEvent.TOUCH_TAP, this.noticeClick, this);
            this.startScreen.btnRank.addEventListener(egret.TouchEvent.TOUCH_TAP, this.rankClick, this);
            this.startScreen.btnGuide.addEventListener(egret.TouchEvent.TOUCH_TAP, this.guideClick, this);
            this.startScreen.btnSetting.addEventListener(egret.TouchEvent.TOUCH_TAP, this.settingClick, this);

            this.initData();
        }

        public async initData() {
            console.log("StartScreen initData:");
            const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
            this.gameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            if (platform.name == "DebugPlatform") {
                this.startScreen.isDebugPlatform = true;
                this.startScreen.isWxPlatform = false;
            }
            else if (platform.name == "WxPlatform") {
                const userInfo = await accountProxy.loadUserInfo();
                this.startScreen.nickName = userInfo.nickName;
                this.startScreen.avatarUrl = userInfo.avatarUrl;
                this.startScreen.isDebugPlatform = false;
                this.startScreen.isWxPlatform = true;
                await this.gameProxy.initialize();
            }
        }

        public async changeOpenIdClick(event: egret.TouchEvent) {
            event.stopImmediatePropagation();
            const openId = this.startScreen.txtOpenId.text;
            CommonData.logon.openId = openId;
            await this.gameProxy.initialize();
        }

        public createRoomClick(event: egret.TouchEvent) {
            // this.sendNotification(GameCommand.CREATE_ROOM);
            this.sendNotification(SceneCommand.SHOW_HANDLE_POPUP);
        }

        public joinRoomClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_JOIN_WINDOW);
            this.sendNotification(SceneCommand.SHOW_NUMBER_KEYBOARD);
        }

        private noticeClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_NOTICE_WINDOW);
        }

        private rankClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_RANK_WINDOW);
        }

        private guideClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_GUIDE_WINDOW);
        }

        private settingClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_SETTING_WINDOW);
        }

        private showMyInfo(): void {
            this.sendNotification(SceneCommand.SHOW_USERINFO_WINDOW);
        }

        public listNotificationInterests(): Array<any> {
            return [];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
        }

        public get startScreen(): StartScreen {
            return <StartScreen><any>(this.viewComponent);
        }
    }
}