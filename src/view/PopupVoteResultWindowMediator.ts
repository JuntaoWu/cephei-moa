

module game {

    export class PopupVoteResultWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupVoteResultWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupVoteResultWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.popupVoteResultWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.initData();
        }

        public initData(): void {
            this.popupVoteResultWindow.round = `round${this.proxy.gameState.lunci}`;
            let voteResult = this.proxy.gameState[`toupiaojieguo${this.proxy.gameState.lunci}`] as Array<any>;

            voteResult.forEach((item, index) => {
                let obj = {
                    antRes: this.proxy.antiquesMap.get(item.baowu).source,
                    isReal: index != 1 ? null : (item.zhenjia == "真" ? "true" : "false")
                }
                this.popupVoteResultWindow[`ant${index + 1}`] = obj;
            })      
        }

        public get popupVoteResultWindow(): PopupVoteResultWindow {
            return <PopupVoteResultWindow><any>(this.viewComponent);
        }
    }
}