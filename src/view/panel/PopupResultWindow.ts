
module game {

    export class PopupResultWindow extends game.BasePanel {

        public constructor() {
            super();
            this.skinName = "skins.PopupResultWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new PopupResultWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}