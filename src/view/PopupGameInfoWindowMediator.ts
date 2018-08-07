

module game {

    export class PopupGameInfoWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupGameInfoWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupGameInfoWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.initData();
        }

        public async initData() {
            const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
            const userInfo = await accountProxy.loadUserInfo();
            this.popupGameInfoWindow.userName = userInfo.nickName;
            let roleId = this.proxy.gameState.role.findIndex(js => js && js.actorNr == this.proxy.loadBalancingClient.myActor().actorNr);
            this.popupGameInfoWindow.role = this.proxy.rolesMap.get(roleId.toString());

            console.log(this.proxy.gameState)
            // this.proxy.gameState.onebaowu
        }

        public get popupGameInfoWindow(): PopupGameInfoWindow {
            return <PopupGameInfoWindow><any>(this.viewComponent);
        }
    }
}