
namespace moa {

    export class PopupHandleWindow extends moa.BasePanel {

        public confirmButton: eui.Button;
        public btnCreateRoom: eui.Button;

        public sixButton: eui.ToggleButton;
        public sevenButton: eui.ToggleButton;
        public eightButton: eui.ToggleButton;

        private message: string;
        private isCreate: boolean;

        public constructor() {
            super();
            this.skinName = "skins.PopupHandleWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new PopupHandleWindowMediator(this));
        }

        public setMessage(b: boolean): void {
            this.message = b ? "确定要退出游戏么？" : null;
            this.isCreate = b ? false : true;
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        public onCloseButtonClick(event: egret.TouchEvent) {
            super.onCloseButtonClick(event);
            platform.hideAllBannerAds();
        }
    }
}