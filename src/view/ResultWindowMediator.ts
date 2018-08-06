

module game {

    export class ResultWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "ResultWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(ResultWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.initData();
        }

        public initData(): void {
            
        }

        public get ResultWindow(): ResultWindow {
            return <ResultWindow><any>(this.viewComponent);
        }
    }
}