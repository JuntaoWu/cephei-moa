

module game {

    export class GuideGameTermWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "GuideGameTermWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(GuideGameTermWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.initData();
        }

        private initData() {
            let list = RES.getRes("game-term_json") as Array<any>;
            this.termWindow.termList.dataProvider = new eui.ArrayCollection(list);
            this.termWindow.termList.itemRenderer = TermItemRenderer;
        }

        public get termWindow(): GuideGameTermWindow {
            return <GuideGameTermWindow><any>(this.viewComponent);
        }
    }
}