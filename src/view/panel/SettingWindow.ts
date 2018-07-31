
module game {

    export class SettingWindow extends eui.Panel {

        public shareButton: eui.Button;
        public aboutButton: eui.Button;
        public backButton: eui.Button;

        private navigationBar: eui.Group;

        public constructor() {
            super();

            this.skinName = "skins.SettingWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new SettingWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}