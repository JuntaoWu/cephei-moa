

module game {

    export class JoinWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "JoinWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(JoinWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.joinWindow.closeButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.confirmClick, this); 

            console.log("JoinWindow initData:");
            this.initData();
        }

        public confirmClick() {
            const roomName = this.joinWindow.txtRoomName.text;
            this.sendNotification(GameCommand.JOIN_ROOM, roomName);
        }

        public async initData() {
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
        }

        public listNotificationInterests(): Array<any> {
            return [];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
        }

        public get joinWindow(): JoinWindow {
            return <JoinWindow><any>(this.viewComponent);
        }
    }
}