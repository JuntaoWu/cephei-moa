
namespace moa {

    export class PopupRoundWindow extends BasePanel {

        public constructor() {
            super();
            this.skinName = "skins.PopupRoundWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public roundText: string;
        public ant1: string;
        public ant2: string;
        public ant3: string;
        public ant4: string;

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new PopupRoundWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}