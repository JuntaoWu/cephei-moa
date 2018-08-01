

module game {

    export class PopupResultWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupResultWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupResultWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.initData();
        }

        public initData(): void {
            
        }

        public get popupResultWindow(): PopupResultWindow {
            return <PopupResultWindow><any>(this.viewComponent);
        }
    }
}