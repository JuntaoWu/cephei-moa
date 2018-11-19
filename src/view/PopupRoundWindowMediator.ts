

module game {

    export class PopupRoundWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupRoundWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupRoundWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.popupRoundWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            // this.initData();
        }

        public initData(): void {
            this.popupRoundWindow.roundText = `第${this.proxy.gameState.lunci}轮开始`;
            let top = this.proxy.gameState.lunci * 4;
            
            for (let i = top - 4; i < top; i++) {
                this.popupRoundWindow[`ant${i % 4 + 1}`] = this.proxy.antiquesMap.get(this.proxy.gameState.baowulist[i]).source;
            }
        }

        public get popupRoundWindow(): PopupRoundWindow {
            return <PopupRoundWindow><any>(this.viewComponent);
        }
    }
}