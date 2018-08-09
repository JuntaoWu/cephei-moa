

module game {

    export class PopupVoteRecordWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupVoteRecordWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupVoteRecordWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.popupVoteRecordWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.initData();
        }

        public initData(): void {
            //三轮游戏投票结果
            [1 ,2, 3].forEach(i => {
                let voteResult = this.proxy.gameState[`toupiaojieguo${i}`] as Array<any>;
                this.popupVoteRecordWindow[`round${i}`] = {ant1: null, ant2: null, ant3: null, ant4: null};
                voteResult.forEach((item, index) => {
                    let obj = {
                        antRes: this.proxy.antiquesMap.get(item.baowu).source,
                        isReal: index != 1 ? null : (item.zhenjia == "真" ? "true" : "false")
                    }
                    this.popupVoteRecordWindow[`round${i}`][`ant${index + 1}`] = obj;
                })  
            }); 
        }

        public get popupVoteRecordWindow(): PopupVoteRecordWindow {
            return <PopupVoteRecordWindow><any>(this.viewComponent);
        }
    }
}