

module game {

    export class PopupFangWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupFangWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupFangWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
            
            this.popupFangWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.initData();
        }

        public initData(): void {
            let seat = this.proxy.gameState.seats[this.popupFangWindow.seatNum];
            this.popupFangWindow.seat = {
                color: seat.color.source,
                url: seat.avatarUrl,
                name: seat.name,
            };
            let role = this.proxy.rolesMap.get((this.proxy.gameState.role.findIndex(i => i && i.actorNr == seat.actorNr)).toString());
            this.popupFangWindow.message = `是${role.camp}`;
        }

        public get popupFangWindow(): PopupFangWindow {
            return <PopupFangWindow><any>(this.viewComponent);
        }
    }
}