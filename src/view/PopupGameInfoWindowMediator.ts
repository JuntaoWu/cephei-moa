

namespace moa {

    export class PopupGameInfoWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupGameInfoWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupGameInfoWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.popupGameInfoWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            // this.initData();
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
                text: "",
                skillText: "",
                yaoSkill: null,
                zhengSkill: null,
            }
            this.popupGameInfoWindow.secondRound = {
                fang: null, //方震
                r1: null,
                r2: null,
                text: "",
                skillText: "",
                yaoSkill: null,
                zhengSkill: null,
            }
            this.popupGameInfoWindow.thirdRound = {
                fang: null, //方震
                r1: null,
                r2: null,
                text: "",
                skillText: "",
                yaoSkill: null,
                zhengSkill: null,

            }
            let playerInfor = this.proxy.getPlayerInfo();
            let i = this.proxy.gameState.role.findIndex(r => this.proxy.isActorLocal(r));
            if (!playerInfor) {
                return;
            }
            if (playerInfor.touxi1) {
                this.popupGameInfoWindow.firstRound.text = GameInfo.attacked
            }
            else {
                if (playerInfor.onebaowu) {
                    if (i == RoleId.FangZheng) {
                        let seeSeat = this.proxy.gameState.seats[playerInfor.onebaowu];
                        this.popupGameInfoWindow.firstRound.fang = {
                            actorUrl: seeSeat.avatarUrl,
                            color: seeSeat.color.source,
                            name: seeSeat.name,
                            result: playerInfor.onezhenjia
                        }
                    } 
                    else {
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
                }
                if (playerInfor.onebaowu2) { //许愿鉴第二个宝
                    let antiques = this.proxy.antiquesMap.get(playerInfor.onebaowu2);
                    this.popupGameInfoWindow.firstRound.r2 = {
                        source: antiques.source,
                        resultRes: "",
                        resultLabel: ""
                    }
                    playerInfor.onezhenjia2 == GameInfo.cannotJudge
                    ? this.popupGameInfoWindow.firstRound.r2.resultLabel = GameInfo.cannotJudge
                    : this.popupGameInfoWindow.firstRound.r2.resultRes = (playerInfor.onezhenjia2 == "真" ? "true" : "false");
                }
                else if (playerInfor.skipskill1) { //跳过技能
                    this.popupGameInfoWindow.firstRound.skillText = GameInfo.skipSkill;
                }
                else if (i == RoleId.YaoBuRan && this.proxy.gameState.oneybrskill) { //药不然技能
                    let seat = this.proxy.gameState.seats[this.proxy.gameState.oneybrskill];
                    this.popupGameInfoWindow.firstRound.skillText = GameInfo.attack;
                    this.popupGameInfoWindow.firstRound.yaoSkill = {
                        color: seat.color.source,
                        url: seat.avatarUrl,
                        name: seat.name,
                    };
                }
                else if (i == RoleId.ZhengGuoQu && this.proxy.gameState.onezgqskill < 100) { //郑国渠技能
                    let antique = this.proxy.antiquesMap.get(this.proxy.gameState.baowulist[this.proxy.gameState.onezgqskill]);
                    this.popupGameInfoWindow.firstRound.skillText = GameInfo.hide;
                    this.popupGameInfoWindow.firstRound.zhengSkill = {
                        source: antique.source,
                    };
                }
                else if (i == RoleId.LaoChaoFen && this.proxy.gameState.onelcfskill) { //老朝奉技能
                    this.popupGameInfoWindow.firstRound.skillText = GameInfo.reverse;
                }
            }

            if (playerInfor.touxi2) {
                this.popupGameInfoWindow.secondRound.text = GameInfo.attacked
            }
            else {
                if (playerInfor.twobaowu) {
                    if (i == RoleId.FangZheng) {
                        let seeSeat = this.proxy.gameState.seats[playerInfor.twobaowu];
                        this.popupGameInfoWindow.secondRound.fang = {
                            actorUrl: seeSeat.avatarUrl,
                            color: seeSeat.color.source,
                            name: seeSeat.name,
                            result: playerInfor.twozhenjia
                        }
                    } 
                    else {
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
                }
                if (playerInfor.twobaowu2) {
                    let antiques = this.proxy.antiquesMap.get(playerInfor.twobaowu2);
                    this.popupGameInfoWindow.secondRound.r2 = {
                        source: antiques.source,
                        resultRes: "",
                        resultLabel: ""
                    }
                    playerInfor.twozhenjia2 == GameInfo.cannotJudge
                    ? this.popupGameInfoWindow.secondRound.r2.resultLabel = GameInfo.cannotJudge
                    : this.popupGameInfoWindow.secondRound.r2.resultRes = (playerInfor.twozhenjia2 == "真" ? "true" : "false");
                }
                else if (playerInfor.skipskill2) { //跳过技能
                    this.popupGameInfoWindow.secondRound.skillText = GameInfo.skipSkill;
                }
                else if (i == RoleId.YaoBuRan && this.proxy.gameState.twoybrskill) { //药不然技能
                    let seat = this.proxy.gameState.seats[this.proxy.gameState.twoybrskill];
                    this.popupGameInfoWindow.secondRound.skillText = GameInfo.attack;
                    this.popupGameInfoWindow.secondRound.yaoSkill = {
                        color: seat.color.source,
                        url: seat.avatarUrl,
                        name: seat.name,
                    };
                }
                else if (i == RoleId.ZhengGuoQu && this.proxy.gameState.twozgqskill < 100) { //郑国渠技能
                    let antique = this.proxy.antiquesMap.get(this.proxy.gameState.baowulist[this.proxy.gameState.twozgqskill + 4]);
                    this.popupGameInfoWindow.secondRound.skillText = GameInfo.hide;
                    this.popupGameInfoWindow.secondRound.zhengSkill = {
                        source: antique.source,
                    };
                }
                else if (i == RoleId.LaoChaoFen && this.proxy.gameState.twolcfskill) { //老朝奉技能
                    this.popupGameInfoWindow.secondRound.skillText = GameInfo.reverse;
                }
            }

            if (playerInfor.touxi3) {
                this.popupGameInfoWindow.thirdRound.text = GameInfo.attacked
            }
            else {
                if (playerInfor.threebaowu) {
                    if (i == RoleId.FangZheng) {
                        let seeSeat = this.proxy.gameState.seats[playerInfor.threebaowu];
                        this.popupGameInfoWindow.thirdRound.fang = {
                            actorUrl: seeSeat.avatarUrl,
                            color: seeSeat.color.source,
                            name: seeSeat.name,
                            result: playerInfor.threezhenjia
                        }
                    } 
                    else {
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
                }
                if (playerInfor.threebaowu2) {
                    let antiques = this.proxy.antiquesMap.get(playerInfor.threebaowu2);
                    this.popupGameInfoWindow.thirdRound.r2 = {
                        source: antiques.source,
                        resultRes: "",
                        resultLabel: ""
                    }
                    playerInfor.threezhenjia2 == GameInfo.cannotJudge
                    ? this.popupGameInfoWindow.thirdRound.r2.resultLabel = GameInfo.cannotJudge
                    : this.popupGameInfoWindow.thirdRound.r2.resultRes = (playerInfor.threezhenjia2 == "真" ? "true" : "false");
                }
                else if (playerInfor.skipskill3) { //跳过技能
                    this.popupGameInfoWindow.thirdRound.skillText = GameInfo.skipSkill;
                }
                else if (i == RoleId.YaoBuRan && this.proxy.gameState.threeybrskill) { //药不然技能
                    let seat = this.proxy.gameState.seats[this.proxy.gameState.threeybrskill];
                    this.popupGameInfoWindow.thirdRound.skillText = GameInfo.attack;
                    this.popupGameInfoWindow.thirdRound.yaoSkill = {
                        color: seat.color.source,
                        url: seat.avatarUrl,
                        name: seat.name,
                    };
                }
                else if (i == RoleId.ZhengGuoQu && this.proxy.gameState.threezgqskill < 100) { //郑国渠技能
                    let antique = this.proxy.antiquesMap.get(this.proxy.gameState.baowulist[this.proxy.gameState.threezgqskill + 8]);
                    this.popupGameInfoWindow.thirdRound.skillText = GameInfo.hide;
                    this.popupGameInfoWindow.thirdRound.zhengSkill = {
                        source: antique.source,
                    };
                }
                else if (i == RoleId.LaoChaoFen && this.proxy.gameState.threelcfskill) { //老朝奉技能
                    this.popupGameInfoWindow.thirdRound.skillText = GameInfo.reverse;
                }
            }
        }

        public get popupGameInfoWindow(): PopupGameInfoWindow {
            return <PopupGameInfoWindow><any>(this.viewComponent);
        }
    }
}