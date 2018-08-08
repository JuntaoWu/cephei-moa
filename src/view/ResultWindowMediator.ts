

module game {

    export class ResultWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "ResultWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(ResultWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.resultWindow.shareButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.shareClick, this);
            this.resultWindow.confirmButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.confirmClick, this);
            this.resultWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.initData();
        }

        private shareClick() {

        }

        private confirmClick() {
            this.proxy.leaveRoom();
            this.sendNotification(SceneCommand.CHANGE, Scene.Start);
            this.resultWindow.close();
        }

        public initData(): void {
            let roleId = this.proxy.gameState.role.findIndex(js => js && js.actorNr == this.proxy.loadBalancingClient.myActor().actorNr);
            let role = this.proxy.rolesMap.get(roleId.toString());
            if　(role.camp == gameCamp.xuyuan) {
                this.resultWindow.campRes = "share_team_xu";
                if (this.proxy.gameState.defen < 6) {
                    this.resultWindow.winRes = "lose";
                    this.resultWindow.borderRes = "border_red";
                    this.resultWindow.winResult = "result2";
                }
                else {
                    this.resultWindow.winRes = "victory";
                    this.resultWindow.borderRes = "border_black";
                    this.resultWindow.winResult = "result1";
                }
            }
            else {
                this.resultWindow.campRes = "share_team_lao";
                if (this.proxy.gameState.defen < 6) {
                    this.resultWindow.winRes = "victory";
                    this.resultWindow.borderRes = "border_black";
                    this.resultWindow.winResult = "result3";
                }
                else {
                    this.resultWindow.winRes = "lose";
                    this.resultWindow.borderRes = "border_red";
                    this.resultWindow.winResult = "result4";
                }
            }
            this.resultWindow.totalScore = this.proxy.gameState.defen;
            this.resultWindow.findPeopleScore = this.proxy.gameState.findPeopleScore;
            this.resultWindow.findAntiqueScore = this.resultWindow.totalScore - this.resultWindow.findPeopleScore;
            //三轮游戏投票结果
            [1 ,2, 3].forEach(i => {
                let voteResult = this.proxy.gameState[`toupiaojieguo${i}`] as Array<any>;
                this.resultWindow[`round${i}`] = {ant1: null, ant2: null, ant3: null, ant4: null};
                voteResult.forEach((item, index) => {
                    let obj = {
                        antRes: this.proxy.antiquesMap.get(item.baowu).source,
                        isReal: item.zhenjia == "真" ? "true" : "false"
                    }
                    this.resultWindow[`round${i}`][`ant${index + 1}`] = obj;
                })  
            });
            //许愿
            let seatXu = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == RoleId.XuYuan);
            this.resultWindow.roleXu = {
                color: seatXu && seatXu.color.source,
                url: seatXu && seatXu.avatarUrl,
            }
            //方震
            let seatFang = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == RoleId.FangZheng);
            this.resultWindow.roleFang = {
                color: seatFang && seatFang.color.source,
                url: seatFang && seatFang.avatarUrl,
            }
            //老朝奉
            let seatLao = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == RoleId.LaoChaoFen);
            this.resultWindow.roleLao = {
                color: seatLao && seatLao.color.source,
                url: seatLao && seatLao.avatarUrl,
            }
            //老朝奉投人
            let voteLao = this.proxy.gameState.touren[RoleId.LaoChaoFen];
            if (seatLao && voteLao) {
                this.resultWindow.voteLao = {
                    voterColor: seatLao.color.source,
                    voterUrl: seatLao.avatarUrl,
                    votedColor: voteLao.color.source,
                    votedName: this.proxy.rolesMap.get(voteLao.actorNr.toString()).name,
                    votedUrl: voteLao.avatarUrl,
                }
            }
            //药不然投人
            let seatYao = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == RoleId.YaoBuRan);
            let voteYao = this.proxy.gameState.touren[RoleId.YaoBuRan];
            if (seatYao && voteYao) {
                this.resultWindow.voteYao = {
                    voterColor: seatYao.color.source,
                    voterUrl: seatYao.avatarUrl,
                    votedColor: voteYao.color.source,
                    votedName: this.proxy.rolesMap.get(voteYao.actorNr.toString()).name,
                    votedUrl: voteYao.avatarUrl,
                }
            }
            //许愿阵营投人结果
            let campXuVotes = [];
            this.proxy.gameState.touren.forEach((item, index) => {
                if (index < 6 && item) {
                    let roleSeat = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == index);
                    campXuVotes.push({
                        voterColor: roleSeat.color.source,
                        voterName: this.proxy.rolesMap.get(index.toString()).name,
                        voterUrl: roleSeat.avatarUrl,
                        votedColor: item.color.source,
                        votedName: this.proxy.rolesMap.get(item.actorNr.toString()).name,
                        votedUrl: item.avatarUrl,
                    })
                }
            })
            this.resultWindow.voteGroup.dataProvider = new eui.ArrayCollection(campXuVotes);
            this.resultWindow.voteGroup.itemRenderer = VoteRenderer;
        }

        public get resultWindow(): ResultWindow {
            return <ResultWindow><any>(this.viewComponent);
        }
    }
}