
module game {

    export class MoreGameWindow extends eui.Panel {

        public backButton: eui.Button;
        public backItem1: eui.Button;
        public backItem2: eui.Button;

        private headGroup: eui.Group;
        private contentScroller: eui.Scroller;
        private navigationBar: eui.Group;

        public constructor() {
            super();

            this.skinName = "skins.MoreGameWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            this.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.close, this);
            this.backItem1.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.viewMoreClick(0), this);
            this.backItem2.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.viewMoreClick(1), this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            this.contentScroller.height = this.stage.stageHeight - this.headGroup.height - this.navigationBar.height - 20;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public viewMoreClick(index?: number) {
            let imgList = [
                "https://gdjzj.hzsdgames.com:8084/miniGame/resource/assets/start/qrcode-tk2048.jpg",
                "https://gdjzj.hzsdgames.com:8084/miniGame/resource/assets/start/qrcode-img.jpg"
            ]
            platform.showPreImage(imgList, index);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}