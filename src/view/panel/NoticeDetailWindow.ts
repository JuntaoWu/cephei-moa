
namespace moa {

    export class NoticeDetailWindow extends eui.Panel {

        public backButton: eui.Button;

        private headGroup: eui.Group;
        private contentScroller: eui.Scroller;
        private navigationBar: eui.Group;

        public txtContent: eui.Label;

        public data: Notice;

        public constructor() {
            super();

            this.skinName = "skins.NoticeDetailWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            this.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.close, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            this.contentScroller.height = this.stage.stageHeight - this.headGroup.height - this.navigationBar.height - 20;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);

            if (this.txtContent && this.data) {
                const textElements = new egret.HtmlTextParser().parser(this.data.content);
                this.txtContent.textFlow = textElements;
            }
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        public setData(data: Notice) {
            this.data = data;

            if (this.txtContent) {
                const textElements = new egret.HtmlTextParser().parser(data.content);
                this.txtContent.textFlow = textElements;
            }
        }
    }
}