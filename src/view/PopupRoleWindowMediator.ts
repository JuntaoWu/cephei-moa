

module game {

    export class PopupRoleWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupRoleWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupRoleWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.popupRoleWindow.confirmButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.confirmClick, this);
            this.initData();
        }

        public initData(): void {
            
        }

        private confirmClick(event: egret.TouchEvent) {
            let proxy: GameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
            this.popupRoleWindow.close();
        }
        public get popupRoleWindow(): PopupRoleWindow {
            return <PopupRoleWindow><any>(this.viewComponent);
        }
    }
}