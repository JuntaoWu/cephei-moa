
module game {

    export class PopupVoteResultWindow extends game.BasePanel {

        public constructor() {
            super();
            this.skinName = "skins.PopupVoteResultWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public round: string;
        public ant1: any;
        public ant2: any;
        public ant3: any;
        public ant4: any;

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new PopupVoteResultWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}