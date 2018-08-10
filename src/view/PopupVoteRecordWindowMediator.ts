

module game {

    export class PopupVoteRecordWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupVoteRecordWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupVoteRecordWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
            
            this.popupVoteRecordWindow.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.backButtonClick, this);
            this.popupVoteRecordWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.initData();
        }

        private backButtonClick(event: egret.TouchEvent) {
            this.popupVoteRecordWindow.close();
        }

        public initData(): void {
            let orderList = ["", "shunwei_one_been", "shunwei_two_been", "shunwei_three_been"];
            let voteNumList = ["", "toupiao", "toupiao2", "toupiao3"];

            [1 ,2, 3].forEach(i => {
                if (i > this.proxy.gameState.lunci) {
                    return;
                }
                //三轮游戏投票顺序
                let voteOrder = [];
                this.proxy.gameState[orderList[i]].forEach((item, index) => {
                    if (item) {
                        voteOrder.push({ voterColor: item.color.source });
                    }
                })
                this.popupVoteRecordWindow[`orderGroup${i}`].dataProvider = new eui.ArrayCollection(voteOrder);
                this.popupVoteRecordWindow[`orderGroup${i}`].itemRenderer = VoteNumRenderer;
                //三轮游戏投票结果
                let n = i * 4 - 4, voteData = [];
                let voteResult = this.proxy.gameState[`toupiaojieguo${i}`] as Array<any>;
                for (let j = 0; j < 4; j++) {
                    voteResult.forEach((item, index) => {
                        if (item.baowu == this.proxy.gameState.baowulist[n + j]) {
                            let obj = {
                                bg: index < 2 ? "bg3" : "bg2",
                                antRes: this.proxy.antiquesMap.get(item.baowu).source,
                                isReal: index > 1 ? null : (!index ? "hide" : (item.zhenjia == "真" ? "true" : "false")),
                                voteDetail: [],
                            }
                            this.proxy.gameState[voteNumList[i]].forEach((v, k) => {
                                if (v && +v.toString().substr(j * 2, 2)) {
                                    obj.voteDetail.push({ 
                                        voterColor: this.proxy.gameState.seats[k].color.source,
                                        voteNum: + v.toString().substr(j * 2, 2)
                                    });
                                }
                            })
                            voteData.push(obj);
                        }
                    }) 
                }
                this.popupVoteRecordWindow[`roundGroup${i}`].dataProvider = new eui.ArrayCollection(voteData);
                this.popupVoteRecordWindow[`roundGroup${i}`].itemRenderer = VoteAntiquesRenderer;
            }); 
        }

        public get popupVoteRecordWindow(): PopupVoteRecordWindow {
            return <PopupVoteRecordWindow><any>(this.viewComponent);
        }
    }
}