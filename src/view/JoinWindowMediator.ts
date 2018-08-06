

module game {

    export class JoinWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "JoinWindowMediator";

        private proxy: GameProxy;
        private numStr: string = "";

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
            return [GameProxy.INPUT_NUMBER, GameProxy.DELETE_NUMBER, GameProxy.CANCEL_INPUT, GameProxy.FINISH_INPUT];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
            switch (notification.getName()) {
                case GameProxy.INPUT_NUMBER:
                    this.numStr += data;
                    this.joinWindow.txtRoomName.text = this.numStr;
                    break;
                case GameProxy.DELETE_NUMBER:
                    this.numStr = this.numStr.substr(0, this.numStr.length - 1);
                    this.joinWindow.txtRoomName.text = this.numStr;
                    break;
                case GameProxy.CANCEL_INPUT:
                    this.numStr = "";
                    this.joinWindow.txtRoomName.text = this.numStr;
                    this.confirmClick();
                    this.joinWindow.close();
                    break;
                case GameProxy.FINISH_INPUT:
                    this.numStr = "";
                    // this.joinWindow.txtRoomName.text = this.numStr;
                    this.confirmClick();
                    this.joinWindow.close();
                    break;
            }
        }

        public get joinWindow(): JoinWindow {
            return <JoinWindow><any>(this.viewComponent);
        }
    }
}