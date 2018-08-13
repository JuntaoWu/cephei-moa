

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

            let i = this.proxy.gameState.role.findIndex(r => this.proxy.isActorLocal(r));
            let isYaoburan = this.proxy.gameState.role.findIndex(r => this.proxy.isActorLocal(r)) == RoleId.YaoBuRan;
            let isFangZhen = this.proxy.gameState.role.findIndex(r => this.proxy.isActorLocal(r)) == RoleId.FangZheng;
            if (isFangZhen) {
                if (this.proxy.gameState.playerInfor[2].onetouxi) {
                    this.popupGameInfoWindow.firstRound.text = "被药不然偷袭"
                }
                else if (this.proxy.gameState.playerInfor[2].onebaowu) {
                    let seeSeat = this.proxy.gameState.seats[this.proxy.gameState.playerInfor[2].onebaowu];
                    this.popupGameInfoWindow.firstRound.fang = {
                        actorUrl: seeSeat.avatarUrl,
                        color: seeSeat.color.source,
                        name: seeSeat.name,
                        result: this.proxy.gameState.playerInfor[2].onezhenjia
                    }
                }
                if (this.proxy.gameState.playerInfor[2].twotouxi) {
                    this.popupGameInfoWindow.secondRound.text = "被药不然偷袭"
                }
                else if (this.proxy.gameState.playerInfor[2].twobaowu) {
                    let seeSeat = this.proxy.gameState.seats[this.proxy.gameState.playerInfor[2].twobaowu];
                    this.popupGameInfoWindow.firstRound.fang = {
                        actorUrl: seeSeat.avatarUrl,
                        color: seeSeat.color.source,
                        name: seeSeat.name,
                        result: this.proxy.gameState.playerInfor[2].twozhenjia
                    }
                }
                if (this.proxy.gameState.playerInfor[2].threetouxi) {
                    this.popupGameInfoWindow.thirdRound.text = "被药不然偷袭"
                }
                else if (this.proxy.gameState.playerInfor[2].threebaowu) {
                    let seeSeat = this.proxy.gameState.seats[this.proxy.gameState.playerInfor[2].threebaowu];
                    this.popupGameInfoWindow.firstRound.fang = {
                        actorUrl: seeSeat.avatarUrl,
                        color: seeSeat.color.source,
                        name: seeSeat.name,
                        result: this.proxy.gameState.playerInfor[2].threezhenjia
                    }
                }
            }
            else {
                if (this.proxy.gameState.playerInfor[i].onetouxi) {
                    this.popupGameInfoWindow.firstRound.text = "被药不然偷袭"
                }
                else {
                    if (this.proxy.gameState.playerInfor[i].onebaowu) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.playerInfor[i].onebaowu);
                        this.popupGameInfoWindow.firstRound.r1 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.playerInfor[i].onezhenjia == "真" ? "true" : "false"
                        }
                    }
                    if (this.proxy.gameState.playerInfor[i].onebaowu2) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.playerInfor[i].onebaowu2);
                        this.popupGameInfoWindow.firstRound.r2 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.playerInfor[i].onezhenjia2 == "真" ? "true" : "false"
                        }
                    }
                    // if (isYaoburan && this.proxy.gameState.oneybrskill) {
                    //     let seat = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == this.proxy.gameState.oneybrskill);
                    //     let role = this.proxy.rolesMap.get(seat.actorNr.toString());
                    //     this.popupGameInfoWindow.firstRound.r2 = {
                    //         resultRes: `你偷袭了${role.name}`
                    //     }
                    // }
                }
                if (this.proxy.gameState.playerInfor[i].twotouxi) {
                    this.popupGameInfoWindow.secondRound.text = "被药不然偷袭"
                }
                else {
                    if (this.proxy.gameState.playerInfor[i].twobaowu) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.playerInfor[i].twobaowu);
                        this.popupGameInfoWindow.secondRound.r1 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.playerInfor[i].twozhenjia == "真" ? "true" : "false"
                        }
                    }
                    if (this.proxy.gameState.playerInfor[i].twobaowu2) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.playerInfor[i].twobaowu2);
                        this.popupGameInfoWindow.secondRound.r2 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.playerInfor[i].twozhenjia2 == "真" ? "true" : "false"
                        }
                    }
                    // if (isYaoburan && this.proxy.gameState.twoybrskill) {
                    //     let seat = this.proxy.gameState.seats[this.proxy.gameState.twoybrskill];
                    //     let role = this.proxy.rolesMap.get(seat.actorNr.toString());
                    //     this.popupGameInfoWindow.firstRound.r2 = {
                    //         resultRes: `你偷袭了${role.name}`
                    //     }
                    // }
                }
                if (this.proxy.gameState.playerInfor[i].threetouxi) {
                    this.popupGameInfoWindow.thirdRound.text = "被药不然偷袭"
                }
                else {
                    if (this.proxy.gameState.playerInfor[i].threebaowu) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.playerInfor[i].threebaowu);
                        this.popupGameInfoWindow.thirdRound.r1 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.playerInfor[i].threezhenjia == "真" ? "true" : "false"
                        }
                    }
                    if (this.proxy.gameState.playerInfor[i].threebaowu2) {
                        let antiques = this.proxy.antiquesMap.get(this.proxy.gameState.playerInfor[i].threebaowu2);
                        this.popupGameInfoWindow.thirdRound.r2 = {
                            source: antiques.source,
                            resultRes: this.proxy.gameState.playerInfor[i].threezhenjia2 == "真" ? "true" : "false"
                        }
                    }
                    // if (isYaoburan && this.proxy.gameState.threeybrskill) {
                    //     let seat = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == this.proxy.gameState.threeybrskill);
                    //     let role = this.proxy.rolesMap.get(seat.actorNr.toString());
                    //     this.popupGameInfoWindow.firstRound.r2 = {
                    //         resultRes: `你偷袭了${role.name}`
                    //     }
                    // }
                }
            }
        }

        public get popupGameInfoWindow(): PopupGameInfoWindow {
            return <PopupGameInfoWindow><any>(this.viewComponent);
        }
    }
}