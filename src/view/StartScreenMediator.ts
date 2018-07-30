
module game {

    export class StartScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "StartScreenMediator";

        public constructor(viewComponent: any) {
            super(StartScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.startScreen.btnCreateRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.createRoomClick, this);
            this.startScreen.btnJoinRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.joinRoomClick, this);

            console.log("StartScreen initData:");
            this.initData();
        }

        public async initData() {

        }

        public createRoomClick(event: egret.TouchEvent) {
            this.sendNotification(GameCommand.CREATE_ROOM);
        }

        public joinRoomClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_JOIN_WINDOW);
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