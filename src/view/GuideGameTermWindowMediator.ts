

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
            let list = [];
            for (let i = 0; i < 20; i++){
                list.push(i);
            }
            this.termWindow.termList.dataProvider = new eui.ArrayCollection(list);
            this.termWindow.termList.itemRenderer = TermItemRenderer;
        }

        public get termWindow(): GuideGameTermWindow {
            return <GuideGameTermWindow><any>(this.viewComponent);
        }
    }
}