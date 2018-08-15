
module game {

    export class PopupFangWindow extends game.BasePanel {

        public seatNum: number;
        public seat: any;
        public message: string;

        public constructor() {
            super();
            this.skinName = "skins.PopupFangWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new PopupFangWindowMediator(this));
        }

        public setSeat(num: number): void {
            this.seatNum = num;
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}