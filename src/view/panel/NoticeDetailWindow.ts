
namespace moa {

    export class NoticeDetailWindow extends eui.Panel {

        public backButton: eui.Button;

        private headGroup: eui.Group;
        private contentScroller: eui.Scroller;
        private navigationBar: eui.Group;

        public txtContent: eui.Group;

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

            this.setData(this.data);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        public setData(data: Notice) {
            this.data = data;

            if (this.txtContent && this.data) {
                this.txtContent.removeChildren();

                const regexp = /<img [^>]*src=['"]([^'"]+)[^>]*>/gim;
                let match = regexp.exec(this.data.content);
                let previousIndex = 0;
                let elements = [];
                while (match) {
                    elements.push({ type: "text", value: this.data.content.slice(previousIndex, match.index) });
                    elements.push({ type: "image", value: match[1] });
                    previousIndex = match.index + match[0].length;
                    match = regexp.exec(this.data.content);
                }
                elements.push({ type: "text", value: this.data.content.slice(previousIndex) });

                const parsedElements = elements.map(element => {
                    if (element.type == "text") {
                        const label = new eui.Label();
                        const textElements = new egret.HtmlTextParser().parser(element.value);
                        label.textFlow = textElements;
                        return label;
                    }
                    else {
                        const image = new eui.Image(element.value);
                        return image;
                    }
                });

                const textImage = new TextImage(parsedElements);

                this.txtContent.addChild(textImage);
            }
        }
    }
}