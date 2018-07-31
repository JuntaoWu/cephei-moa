
module game {

    export class AboutWindow extends eui.Panel {
        public constructor() {
            super();

            this.skinName = "skins.AboutWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.close, this);
        }

        private imgHeight: number;

        public createCompleteEvent(event: eui.UIEvent): void {
            this.imgHeight = this.stage.stageHeight;
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}