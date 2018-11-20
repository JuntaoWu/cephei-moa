

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
            // this.initData();
        }

        private shareClick() {
            platform.shareAppMessage();
        }

        private confirmClick() {
            this.proxy.leaveRoom();
            this.sendNotification(SceneCommand.CHANGE, Scene.Start);
            this.resultWindow.close();
        }

        public initData(): void {
            let selfId = this.proxy.gameState.role.findIndex(r => this.proxy.isActorLocal(r));
            let selfCamp = this.proxy.rolesMap.get(selfId.toString()).camp;
            if (selfCamp == gameCamp.xuyuan) {
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
            let voteNumList = ["", "toupiao", "toupiao2", "toupiao3"];
            [1, 2, 3].forEach(i => {
                let n = i * 4 - 4, voteData = [];
                let voteResult = this.proxy.gameState[`toupiaojieguo${i}`] as Array<any>;
                for (let j = 0; j < 4; j++) {
                    voteResult.forEach((item, index) => {
                        if (item.baowu == this.proxy.gameState.baowulist[n + j]) {
                            let obj = {
                                bg: index < 2 ? "bg3" : "bg2",
                                antRes: this.proxy.antiquesMap.get(item.baowu).source,
                                isReal: item.zhenjia == "真" ? "true" : "false",
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
                this.resultWindow[`roundGroup${i}`].dataProvider = new eui.ArrayCollection(voteData);
                this.resultWindow[`roundGroup${i}`].itemRenderer = VoteAntiquesRenderer;
            });


            this.resultWindow.showFindPeople = true;
            this.resultWindow.totalScoreGroup.y = 2320;
            if (this.proxy.gameState.lunci == 3) {
                this.resultWindow.showFindPeople = false;
                this.resultWindow.totalScoreGroup.y = 1510;
            }

            this.resultWindow.roleXu = null;
            this.resultWindow.roleFang = null;
            this.resultWindow.roleLao = null;
            this.resultWindow.voteLao = null;
            this.resultWindow.voteYao = null;
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
                if (seatLao && votedLao) {
                    this.resultWindow.voteLao = {
                        voterColor: seatLao.color.source,
                        voterUrl: seatLao.avatarUrl,
                        votedColor: votedLao.color.source,
                        votedName: this.proxy.rolesMap.get((this.proxy.gameState.role.findIndex(i => i && i.actorNr == votedLao.actorNr)).toString()).name,
                        votedUrl: votedLao.avatarUrl,
                    }
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

            try {
                //许愿阵营投人结果
                console.log("轮次", this.proxy.gameState.lunci);
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
            } catch (error) {
                console.error(error);
            }

        }

        public get resultWindow(): ResultWindow {
            return <ResultWindow><any>(this.viewComponent);
        }
    }
}