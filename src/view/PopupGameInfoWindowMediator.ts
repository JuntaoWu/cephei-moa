

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
            let role = "许愿"
            this.popupGameInfoWindow.role = this.proxy.roleMap.get(role);
            this.popupGameInfoWindow.userName = userInfo.nickName;
        }

        public get popupGameInfoWindow(): PopupGameInfoWindow {
            return <PopupGameInfoWindow><any>(this.viewComponent);
        }
    }
}