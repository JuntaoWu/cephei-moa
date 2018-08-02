
module game {

    export class StartScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "StartScreenMediator";

        public constructor(viewComponent: any) {
            super(StartScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.startScreen.btnCreateRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.createRoomClick, this);
            this.startScreen.btnJoinRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.joinRoomClick, this);

            this.startScreen.headGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showMyInfo, this);
            this.startScreen.btnNotice.addEventListener(egret.TouchEvent.TOUCH_TAP, this.noticeClick, this);
            this.startScreen.btnRank.addEventListener(egret.TouchEvent.TOUCH_TAP, this.rankClick, this);
            this.startScreen.btnGuide.addEventListener(egret.TouchEvent.TOUCH_TAP, this.guideClick, this);
            this.startScreen.btnSetting.addEventListener(egret.TouchEvent.TOUCH_TAP, this.settingClick, this);

            console.log("StartScreen initData:");
            this.initData();
        }

        public async initData() {
            const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
            accountProxy.loadUserInfo().then(userInfo => {
                this.startScreen.nickName = userInfo.nickName;
                this.startScreen.avatarUrl = userInfo.avatarUrl;
            });
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