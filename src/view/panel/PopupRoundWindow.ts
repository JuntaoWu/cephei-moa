
module game {

    export class PopupRoundWindow extends game.BasePanel {

        private message: string;
        private isStart: boolean;

        public constructor() {
            super();
            this.skinName = "skins.PopupRoundWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public setMessage(msg: string): void {
            this.message = msg;
            this.isStart = msg ? false : true;
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}