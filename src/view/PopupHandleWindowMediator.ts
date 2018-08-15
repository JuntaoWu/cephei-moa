

module game {

    export class PopupHandleWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupHandleWindowMediator";

        private proxy: GameProxy;

        private selectedNumber: number;

        public constructor(viewComponent: any) {
            super(PopupHandleWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.popupHandleWindow.confirmButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.confirmClick, this);
            this.popupHandleWindow.btnCreateRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.createRoomClick, this);

            this.popupHandleWindow.sixButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.selectedSix, this);
            this.popupHandleWindow.sevenButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.selectedSeven, this);
            this.popupHandleWindow.eightButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.selectedEight, this);
        }

        public confirmClick() {
            this.proxy.suspendRoom();
            this.sendNotification(SceneCommand.CHANGE, Scene.Start);
        }

        public createRoomClick(event: egret.TouchEvent) {
            this.sendNotification(GameCommand.CREATE_ROOM, this.selectedNumber);
        }

        public selectedSix(event: egret.TouchEvent) {
            this.popupHandleWindow.sixButton.selected = true;
            this.popupHandleWindow.sevenButton.selected = this.popupHandleWindow.eightButton.selected = false;
            this.selectedNumber = 6;
        }

        public selectedSeven(event: egret.TouchEvent) {
            this.popupHandleWindow.sevenButton.selected = true;
            this.popupHandleWindow.sixButton.selected = this.popupHandleWindow.eightButton.selected = false;
            this.selectedNumber = 7;
        }

        public selectedEight(event: egret.TouchEvent) {
            this.popupHandleWindow.eightButton.selected = true;
            this.popupHandleWindow.sevenButton.selected = this.popupHandleWindow.sixButton.selected = false;
            this.selectedNumber = 8;
        }

        public get popupHandleWindow(): PopupHandleWindow {
            return <PopupHandleWindow><any>(this.viewComponent);
        }
    }
}