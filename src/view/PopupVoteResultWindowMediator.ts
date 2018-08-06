

module game {

    export class PopupVoteResultWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupVoteResultWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupVoteResultWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.initData();
        }

        public initData(): void {
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
        }

        public get popupVoteResultWindow(): PopupVoteResultWindow {
            return <PopupVoteResultWindow><any>(this.viewComponent);
        }
    }
}