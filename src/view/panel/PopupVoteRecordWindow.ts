
module game {

    export class PopupVoteRecordWindow extends game.BasePanel {

        public constructor() {
            super();
            this.skinName = "skins.PopupVoteRecordWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public round1: any;
        public round2: any;
        public round3: any;

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new PopupVoteRecordWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}