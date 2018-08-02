
module game {

    export class PopupNumberKeyboard extends game.BasePanel {

        public num1: eui.BitmapLabel;
        public num2: eui.BitmapLabel;
        public num3: eui.BitmapLabel;
        public num4: eui.BitmapLabel;
        public num5: eui.BitmapLabel;
        public num6: eui.BitmapLabel;
        public num7: eui.BitmapLabel;
        public num8: eui.BitmapLabel;
        public num9: eui.BitmapLabel;
        public num0: eui.BitmapLabel;
        
        public cancel: eui.Image;
        public confirm: eui.Image;
        public delete: eui.Image;

        public constructor() {
            super();
            this.skinName = "skins.PopupNumberKeyboard";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.height = this.stage.stageHeight;
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new PopupNumberKeyboardMediator(this));
        }

        show() {
            this.container.bottom = -600;
            this.container.visible = true;
            egret.Tween.get(this.container).to({ bottom: 0 }, 300);
        }
        
        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}