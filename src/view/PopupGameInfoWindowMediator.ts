

module game {

    export class PopupGameInfoWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupGameInfoWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupGameInfoWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.popupGameInfoWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.initData();
        }

        public async initData() {
            let selfId = this.proxy.gameState.role.findIndex(r => this.proxy.isActorLocal(r));
            this.popupGameInfoWindow.role = this.proxy.rolesMap.get(selfId.toString());
            let selfSeat = this.proxy.gameState.seats.find(i => i && i.actorNr == this.proxy.gameState.role[selfId].actorNr);
            this.popupGameInfoWindow.nickName = selfSeat.name;
            this.popupGameInfoWindow.avatarUrl = selfSeat.avatarUrl;
            this.popupGameInfoWindow.selfColor = selfSeat.color.source;

            this.popupGameInfoWindow.teammate = null;
            if (selfId == RoleId.LaoChaoFen && this.proxy.gameState.role[RoleId.YaoBuRan]) {
                let seatYao = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == this.proxy.gameState.role[RoleId.YaoBuRan].actorNr);
                this.popupGameInfoWindow.teammate = {
                    avatarUrl: seatYao.avatarUrl,
                    color: seatYao.color.source,
                    nickName: seatYao.name,
                    name: "药不然",
                }
            }
            else if (selfId == RoleId.YaoBuRan && this.proxy.gameState.role[RoleId.LaoChaoFen]) {
                let seatLao = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == this.proxy.gameState.role[RoleId.LaoChaoFen].actorNr);
                this.popupGameInfoWindow.teammate = {
                    avatarUrl: seatLao.avatarUrl,
                    color: seatLao.color.source,
                    nickName: seatLao.name,
                    name: "老朝奉",
                }
            }

            this.popupGameInfoWindow.firstRound = {
                fang: null, //方震
                r1: null,
                r2: null,
                text: ""
            }
            this.popupGameInfoWindow.secondRound = {
                fang: null, //方震
                r1: null,
                r2: null,
                text: ""
            }
            this.popupGameInfoWindow.thirdRound = {
                fang: null, //方震
                r1: null,
                r2: null,
                text: ""
            }

            let playerInfor = this.proxy.getPlayerInfo();
            let i = this.proxy.gameState.role.findIndex(r => this.proxy.isActorLocal(r));
            if (!playerInfor) {
                return;
            }
            if (i == RoleId.FangZheng) {
                if (playerInfor.touxi1) {
                    this.proxy.getPlayerInfo
                    this.popupGameInfoWindow.firstRound.text = GameInfo.attacked;
                }
                else if (playerInfor.onebaowu) {
                    let seeSeat = this.proxy.gameState.seats[playerInfor.onebaowu];
                    this.popupGameInfoWindow.firstRound.fang = {
                        actorUrl: seeSeat.avatarUrl,
                        color: seeSeat.color.source,
                        name: seeSeat.name,
                        result: playerInfor.onezhenjia
                    }
                }
                else if (playerInfor.skipskill1) {
                    this.popupGameInfoWindow.firstRound.skillText = GameInfo.skipSkill;
                }
                if (playerInfor.touxi2) {
                    this.popupGameInfoWindow.secondRound.text = GameInfo.attacked
                }
                else if (playerInfor.twobaowu) {
                    let seeSeat = this.proxy.gameState.seats[playerInfor.twobaowu];
                    this.popupGameInfoWindow.secondRound.fang = {
                        actorUrl: seeSeat.avatarUrl,
                        color: seeSeat.color.source,
                        name: seeSeat.name,
                        result: playerInfor.twozhenjia
                    }
                }
                else if (playerInfor.skipskill2) {
                    this.popupGameInfoWindow.secondRound.skillText = GameInfo.skipSkill;
                }
                if (playerInfor.touxi3) {
                    this.popupGameInfoWindow.thirdRound.text = GameInfo.attacked
                }
                else if (playerInfor.threebaowu) {
                    let seeSeat = this.proxy.gameState.seats[playerInfor.threebaowu];
                    this.popupGameInfoWindow.thirdRound.fang = {
                        actorUrl: seeSeat.avatarUrl,
                        color: seeSeat.color.source,
                        name: seeSeat.name,
                        result: playerInfor.threezhenjia
                    }
                }
                else if (playerInfor.skipskill3) {
                    this.popupGameInfoWindow.thirdRound.skillText = GameInfo.skipSkill;
                }
            }
            else if (i == RoleId.YaoBuRan) {
                if (playerInfor.onebaowu) {
                    let antiques = this.proxy.antiquesMap.get(playerInfor.onebaowu);
                    this.popupGameInfoWindow.firstRound.r1 = {
                        source: antiques.source,
                        resultRes: playerInfor.onezhenjia == "真" ? "true" : "false"
                    }
                }
                if (this.proxy.gameState.oneybrskill) {
                    let seat = this.proxy.gameState.seats[this.proxy.gameState.oneybrskill];
                    this.popupGameInfoWindow.firstRound.skillText = GameInfo.attack;
                    this.popupGameInfoWindow.firstRound.yaoSkill = {
                        color: seat.color.source,
                        url: seat.avatarUrl,
                        name: seat.name,
                    };
                }
                else if (playerInfor.skipskill1) {
                    this.popupGameInfoWindow.firstRound.skillText = GameInfo.skipSkill;
                }

                if (playerInfor.twobaowu) {
                    let antiques = this.proxy.antiquesMap.get(playerInfor.twobaowu);
                    this.popupGameInfoWindow.secondRound.r1 = {
                        source: antiques.source,
                        resultRes: playerInfor.twozhenjia == "真" ? "true" : "false"
                    }
                }
                if (this.proxy.gameState.twoybrskill) {
                    let seat = this.proxy.gameState.seats[this.proxy.gameState.twoybrskill];
                    this.popupGameInfoWindow.secondRound.skillText = GameInfo.attack;
                    this.popupGameInfoWindow.secondRound.yaoSkill = {
                        color: seat.color.source,
                        url: seat.avatarUrl,
                        name: seat.name,
                    };
                }
                else if (playerInfor.skipskill2) {
                    this.popupGameInfoWindow.secondRound.skillText = GameInfo.skipSkill;
                }

                if (playerInfor.threebaowu) {
                    let antiques = this.proxy.antiquesMap.get(playerInfor.threebaowu);
                    this.popupGameInfoWindow.thirdRound.r1 = {
                        source: antiques.source,
                        resultRes: playerInfor.threezhenjia == "真" ? "true" : "false"
                    }
                }
                if (this.proxy.gameState.threeybrskill) {
                    let seat = this.proxy.gameState.seats[this.proxy.gameState.threeybrskill];
                    this.popupGameInfoWindow.thirdRound.skillText = GameInfo.attack;
                    this.popupGameInfoWindow.thirdRound.yaoSkill = {
                        color: seat.color.source,
                        url: seat.avatarUrl,
                        name: seat.name,
                    };
                }
                else if (playerInfor.skipskill3) {
                    this.popupGameInfoWindow.thirdRound.skillText = GameInfo.skipSkill;
                }
            }
            else {
                if (playerInfor.touxi1) {
                    this.popupGameInfoWindow.firstRound.text = GameInfo.attacked
                }
                else {
                    if (playerInfor.onebaowu) {
                        let antiques = this.proxy.antiquesMap.get(playerInfor.onebaowu);
                        this.popupGameInfoWindow.firstRound.r1 = {
                            source: antiques.source,
                            resultRes: "",
                            resultLabel: ""
                        }
                        playerInfor.onezhenjia == GameInfo.cannotJudge
                            ? this.popupGameInfoWindow.firstRound.r1.resultLabel = GameInfo.cannotJudge
                            : this.popupGameInfoWindow.firstRound.r1.resultRes = (playerInfor.onezhenjia == "真" ? "true" : "false");
                    }
                    if (playerInfor.onebaowu2) {
                        let antiques = this.proxy.antiquesMap.get(playerInfor.onebaowu2);
                        this.popupGameInfoWindow.firstRound.r2 = {
                            source: antiques.source,
                            resultRes: playerInfor.onezhenjia2 == "真" ? "true" : "false"
                        }
                    }
                    if (playerInfor.skipskill1) {
                        this.popupGameInfoWindow.firstRound.skillText = GameInfo.skipSkill;
                    }
                }
                if (playerInfor.touxi2) {
                    this.popupGameInfoWindow.secondRound.text = GameInfo.attacked
                }
                else {
                    if (playerInfor.twobaowu) {
                        let antiques = this.proxy.antiquesMap.get(playerInfor.twobaowu);
                        this.popupGameInfoWindow.secondRound.r1 = {
                            source: antiques.source,
                            resultRes: "",
                            resultLabel: ""
                        }
                        playerInfor.twozhenjia == GameInfo.cannotJudge
                            ? this.popupGameInfoWindow.secondRound.r1.resultLabel = GameInfo.cannotJudge
                            : this.popupGameInfoWindow.secondRound.r1.resultRes = (playerInfor.twozhenjia == "真" ? "true" : "false");
                    }
                    if (playerInfor.twobaowu2) {
                        let antiques = this.proxy.antiquesMap.get(playerInfor.twobaowu2);
                        this.popupGameInfoWindow.secondRound.r2 = {
                            source: antiques.source,
                            resultRes: playerInfor.twozhenjia2 == "真" ? "true" : "false"
                        }
                    }
                    if (playerInfor.skipskill2) {
                        this.popupGameInfoWindow.secondRound.skillText = GameInfo.skipSkill;
                    }
                }
                if (playerInfor.touxi3) {
                    this.popupGameInfoWindow.thirdRound.text = GameInfo.attacked
                }
                else {
                    if (playerInfor.threebaowu) {
                        let antiques = this.proxy.antiquesMap.get(playerInfor.threebaowu);
                        this.popupGameInfoWindow.thirdRound.r1 = {
                            source: antiques.source,
                            resultRes: "",
                            resultLabel: ""
                        }
                        playerInfor.threezhenjia == GameInfo.cannotJudge
                            ? this.popupGameInfoWindow.thirdRound.r1.resultLabel = GameInfo.cannotJudge
                            : this.popupGameInfoWindow.thirdRound.r1.resultRes = (playerInfor.threezhenjia == "真" ? "true" : "false");
                    }
                    if (playerInfor.threebaowu2) {
                        let antiques = this.proxy.antiquesMap.get(playerInfor.threebaowu2);
                        this.popupGameInfoWindow.thirdRound.r2 = {
                            source: antiques.source,
                            resultRes: playerInfor.threezhenjia2 == "真" ? "true" : "false"
                        }
                    }
                    if (playerInfor.skipskill3) {
                        this.popupGameInfoWindow.thirdRound.skillText = GameInfo.skipSkill;
                    }
                }
            }
        }

        public get popupGameInfoWindow(): PopupGameInfoWindow {
            return <PopupGameInfoWindow><any>(this.viewComponent);
        }
    }
}