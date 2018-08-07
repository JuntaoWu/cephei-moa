
module game {

    export class ResultWindow extends eui.Panel {

        private contentScroller: eui.Scroller;
        private navigationBar: eui.Group;
        private borderBg: eui.Image;

        public shareButton: eui.Button;
        public confirmButton: eui.Button;

        public constructor() {
            super();
            this.skinName = "skins.ResultWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public campRes: string;
        public winResult: string;
        public winRes: string;

        public findAntiqueScore: number;
        public findPeopleScore: number;
        public totalScore: number;

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            this.contentScroller.height = this.stage.stageHeight - this.navigationBar.height - 60;
            this.borderBg.height = this.stage.stageHeight;

            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new ResultWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}