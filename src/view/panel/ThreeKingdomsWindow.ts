
module game {

    export class ThreeKingdomsWindow extends eui.Panel {
        public constructor() {
            super();

            this.skinName = "skins.ThreeKingdomsWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public closeGroup: eui.Group;
        private imgHeight: number;

        public createCompleteEvent(event: eui.UIEvent): void {
            this.imgHeight = this.stage.stageHeight;
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            this.closeGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this.close, this);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}