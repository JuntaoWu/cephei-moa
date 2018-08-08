

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
            const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
            const userInfo = await accountProxy.loadUserInfo();
            this.popupGameInfoWindow.nickName = userInfo.nickName;
            this.popupGameInfoWindow.avatarUrl = userInfo.avatarUrl;
            let roleId = this.proxy.gameState.role.findIndex(js => js && js.actorNr == this.proxy.loadBalancingClient.myActor().actorNr);
            this.popupGameInfoWindow.role = this.proxy.rolesMap.get(roleId.toString());

            console.log(this.proxy.gameState)
            this.popupGameInfoWindow.firstRound = {
                r1: null,
                r2: null,
                text: ""
            }
            this.popupGameInfoWindow.secondRound = {
                r1: null,
                r2: null,
                text: ""
            }
            this.popupGameInfoWindow.thirdRound = {
                r1: null,
                r2: null,
                text: ""
            }
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

        public get popupGameInfoWindow(): PopupGameInfoWindow {
            return <PopupGameInfoWindow><any>(this.viewComponent);
        }
    }
}