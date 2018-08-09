

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

            let isFangZhen = this.proxy.gameState.role.findIndex(r => this.proxy.isActorLocal(r)) == RoleId.FangZheng;
            if (isFangZhen) {
                if (this.proxy.gameState.onetouxi) {
                    this.popupGameInfoWindow.firstRound.text = "被药不然偷袭"
                }
                else if (this.proxy.gameState.onebaowu) {
                    let seeSeat = this.proxy.gameState.seats[this.proxy.gameState.onebaowu];
                    this.popupGameInfoWindow.firstRound.fang = {
                        actorUrl: seeSeat.avatarUrl,
                        color: seeSeat.color.source,
                        name: seeSeat.name,
                        result: this.proxy.gameState.onezhenjia
                    }
                }
                if (this.proxy.gameState.twotouxi) {
                    this.popupGameInfoWindow.secondRound.text = "被药不然偷袭"
                }
                else if (this.proxy.gameState.twobaowu) {
                    let seeSeat = this.proxy.gameState.seats[this.proxy.gameState.twobaowu];
                    this.popupGameInfoWindow.firstRound.fang = {
                        actorUrl: seeSeat.avatarUrl,
                        color: seeSeat.color.source,
                        name: seeSeat.name,
                        result: this.proxy.gameState.twozhenjia
                    }
                }
                if (this.proxy.gameState.threetouxi) {
                    this.popupGameInfoWindow.thirdRound.text = "被药不然偷袭"
                }
                else if (this.proxy.gameState.threebaowu) {
                    let seeSeat = this.proxy.gameState.seats[this.proxy.gameState.threebaowu];
                    this.popupGameInfoWindow.firstRound.fang = {
                        actorUrl: seeSeat.avatarUrl,
                        color: seeSeat.color.source,
                        name: seeSeat.name,
                        result: this.proxy.gameState.threezhenjia
                    }
                }
            }
            else {
                if (this.proxy.gameState.onetouxi) {
                    this.popupGameInfoWindow.firstRound.text = "被药不然偷袭"
                }
                else {
                    if (this.proxy.gameState.onebaowu) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.onebaowu);
                        this.popupGameInfoWindow.firstRound.r1 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.onezhenjia == "真" ? "true" : "false"
                        }
                    }
                    if (this.proxy.gameState.onebaowu2) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.onebaowu2);
                        this.popupGameInfoWindow.firstRound.r2 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.onezhenjia2 == "真" ? "true" : "false"
                        }
                    }
                }
                if (this.proxy.gameState.twotouxi) {
                    this.popupGameInfoWindow.secondRound.text = "被药不然偷袭"
                }
                else {
                    if (this.proxy.gameState.twobaowu) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.twobaowu);
                        this.popupGameInfoWindow.secondRound.r1 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.twozhenjia == "真" ? "true" : "false"
                        }
                    }
                    if (this.proxy.gameState.twobaowu2) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.twobaowu2);
                        this.popupGameInfoWindow.secondRound.r2 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.twozhenjia2 == "真" ? "true" : "false"
                        }
                    }
                }
                if (this.proxy.gameState.threetouxi) {
                    this.popupGameInfoWindow.thirdRound.text = "被药不然偷袭"
                }
                else {
                    if (this.proxy.gameState.threebaowu) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.threebaowu);
                        this.popupGameInfoWindow.thirdRound.r1 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.threezhenjia == "真" ? "true" : "false"
                        }
                    }
                    if (this.proxy.gameState.threebaowu2) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.threebaowu2);
                        this.popupGameInfoWindow.thirdRound.r2 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.threezhenjia2 == "真" ? "true" : "false"
                        }
                    }
                }
            }
        }

        public get popupGameInfoWindow(): PopupGameInfoWindow {
            return <PopupGameInfoWindow><any>(this.viewComponent);
        }
    }
}