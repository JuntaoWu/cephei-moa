

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
            let selfId = this.proxy.gameState.role.findIndex(r => this.proxy.isActorLocal(r));
            let selfCamp = this.proxy.rolesMap.get(selfId.toString()).camp;
            if　(selfCamp == gameCamp.xuyuan) {
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
            if (this.proxy.gameState.role[RoleId.XuYuan]) {
                let seatXu = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == this.proxy.gameState.role[RoleId.XuYuan].actorNr);
                this.resultWindow.roleXu = {
                    color: seatXu && seatXu.color.source,
                    url: seatXu && seatXu.avatarUrl,
                }
            }
            //方震
            if (this.proxy.gameState.role[RoleId.FangZheng]) {
                let seatFang = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == this.proxy.gameState.role[RoleId.FangZheng].actorNr);
                this.resultWindow.roleFang = {
                    color: seatFang && seatFang.color.source,
                    url: seatFang && seatFang.avatarUrl,
                }
            }
            //老朝奉
            if (this.proxy.gameState.role[RoleId.LaoChaoFen]) {
                let seatLao = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == this.proxy.gameState.role[RoleId.LaoChaoFen].actorNr);
                this.resultWindow.roleLao = {
                    color: seatLao && seatLao.color.source,
                    url: seatLao && seatLao.avatarUrl,
                }
                //老朝奉投人
                let votedLao = this.proxy.gameState.touren[RoleId.LaoChaoFen];
                this.resultWindow.voteLao = {
                    voterColor: seatLao.color.source,
                    voterUrl: seatLao.avatarUrl,
                    votedColor: votedLao.color.source,
                    votedName: this.proxy.rolesMap.get((this.proxy.gameState.role.findIndex(i => i && i.actorNr == votedLao.actorNr)).toString()).name,
                    votedUrl: votedLao.avatarUrl,
                }
            }
            //药不然投人
            if (this.proxy.gameState.role[RoleId.YaoBuRan]) {
                let seatYao = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == this.proxy.gameState.role[RoleId.YaoBuRan].actorNr);
                let votedYao = this.proxy.gameState.touren[RoleId.YaoBuRan];
                if (seatYao && votedYao) {
                    this.resultWindow.voteYao = {
                        voterColor: seatYao.color.source,
                        voterUrl: seatYao.avatarUrl,
                        votedColor: votedYao.color.source,
                        votedName: this.proxy.rolesMap.get((this.proxy.gameState.role.findIndex(i => i && i.actorNr == votedYao.actorNr)).toString()).name,
                        votedUrl: votedYao.avatarUrl,
                    }
                }
            }
            //许愿阵营投人结果
            let campXuVotes = [];
            this.proxy.gameState.touren.forEach((item, index) => {
                if (index < 6 && item) {
                    let voterSeat = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == this.proxy.gameState.role[index].actorNr);
                    campXuVotes.push({
                        voterColor: voterSeat.color.source,
                        voterName: this.proxy.rolesMap.get((this.proxy.gameState.role.findIndex(i => i && i.actorNr == voterSeat.actorNr)).toString()).name,
                        voterUrl: voterSeat.avatarUrl,
                        votedColor: item.color.source,
                        votedName: this.proxy.rolesMap.get((this.proxy.gameState.role.findIndex(i => i && i.actorNr == item.actorNr)).toString()).name,
                        votedUrl: item.avatarUrl,
                    })
                }
            })
            this.resultWindow.voteGroup.dataProvider = new eui.ArrayCollection(campXuVotes);
            this.resultWindow.voteGroup.itemRenderer = VotePeopleRenderer;

            this.resultWindow.showFindPeople = true;
            this.resultWindow.totalScoreGroup.y = 2200;
            if (this.proxy.gameState.lunci == 3) {
                this.resultWindow.showFindPeople = false;
                this.resultWindow.totalScoreGroup.y = 1450;
            }
        }

        public get resultWindow(): ResultWindow {
            return <ResultWindow><any>(this.viewComponent);
        }
    }
}