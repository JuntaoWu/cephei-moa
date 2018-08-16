

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
            
            this.popupVoteResultWindow.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
                if (this.lunci == 3) {
                    this.sendNotification(GameProxy.AUTH_EDN);
                }
            }, this);
        }

        private lunci: number;

        public initData(): void {
            let voteNumList = ["", "toupiao", "toupiao2", "toupiao3"];
            let n = this.proxy.gameState.lunci * 4 - 4,
                voteNum = this.proxy.gameState[voteNumList[this.proxy.gameState.lunci]];
            this.lunci = this.proxy.gameState.lunci;
            
            this.popupVoteResultWindow.round = `round${this.proxy.gameState.lunci}`;
            let voteResult = this.proxy.gameState[`toupiaojieguo${this.proxy.gameState.lunci}`] as Array<any>;
            let voteData = [];
            for (let i = 0; i < 4; i++) {
                voteResult.forEach((item, index) => {
                    if (item.baowu == this.proxy.gameState.baowulist[n + i]) {
                        let obj = {
                            bg: index < 2 ? "bg3" : "bg2",
                            antRes: this.proxy.antiquesMap.get(item.baowu).source,
                            isReal: index > 1 ? null : (!index ? "hide" : (item.zhenjia == "真" ? "true" : "false")),
                            voteDetail: [],
                        }
                        voteNum.forEach((v, j) => {
                            if (v && +v.toString().substr(i * 2, 2)) {
                                obj.voteDetail.push({ 
                                    voterColor: this.proxy.gameState.seats[j].color.source,
                                    voteNum: + v.toString().substr(i * 2, 2)
                                });
                            }
                        });
                        voteData.push(obj);
                    }
                }) 
            }
            this.popupVoteResultWindow.voteGroup.dataProvider = new eui.ArrayCollection(voteData);
            this.popupVoteResultWindow.voteGroup.itemRenderer = VoteAntiquesRenderer;  
        }

        public get popupVoteResultWindow(): PopupVoteResultWindow {
            return <PopupVoteResultWindow><any>(this.viewComponent);
        }
    }
}