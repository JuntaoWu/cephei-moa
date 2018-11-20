
module game {

    export class RankWindow extends eui.Panel {

        public winRateButton: eui.ToggleButton;
        public roleButton: eui.ToggleButton;
        public gameNumButton: eui.ToggleButton;
        public rankList: eui.List;
        public backButton: eui.Button;

        private headGroup: eui.Group;
        private contentScroller: eui.Scroller;
        private navigationBar: eui.Group;

        public rateTimeFilter: eui.Group;
        public gameTypeFilter: eui.Group;
        public roleFilter: eui.Group;
        public otherFilter: eui.Group;
        
        public rateTimeList: eui.List;
        public gameTypeList: eui.List;
        public roleList: eui.List;
        public otherList: eui.List;

        public rateTime: string;
        public gameType: string;
        public role: string;
        public other: string;

        public constructor() {
            super();

            this.skinName = "skins.RankWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            this.contentScroller.height = this.stage.stageHeight - this.headGroup.height - this.navigationBar.height - 20;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new RankWindowMediator(this));

        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}