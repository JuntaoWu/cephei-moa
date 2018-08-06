
module game {

    export class ActorUI extends eui.Component {

        public data: ActorModel = {
            avatarUrl: "",
            name: "",
        };

        public enabled: boolean = false;

        public color: string = "";  // entry point for UI binding constants.

        private btnActor: eui.Button;

        public constructor() {
            super();

            this.skinName = "skins.ActorUI";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public update(data) {
            this.data = data;
            let content = this.btnActor.getChildByName("content") as eui.Image;
            content.source = this.data.avatarUrl;

            let nickName = this.btnActor.getChildByName("nickName") as eui.Label;
            nickName.text = this.data.name;

            let selfMark = this.btnActor.getChildByName("selfMark") as eui.Image;
            selfMark.visible = this.data.isLocal;

            let normalBg = this.btnActor.getChildByName("normalBg") as eui.Image;
            normalBg.visible = !this.data.isMaster;

            let masterBg = this.btnActor.getChildByName("masterBg") as eui.Image;
            masterBg.visible = this.data.isMaster;

            this.color = this.data.color.source || this.color;

            let colorImage = this.btnActor.getChildByName("colorImage") as eui.Image;
            colorImage.source = this.color;
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}