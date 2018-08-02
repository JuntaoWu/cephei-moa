
module game {
    export class PopupWindowWrapper extends eui.Panel {

        onCloseButtonClick(event: egret.TouchEvent) {
            this.parent && (this.parent as game.BasePanel).close();
        }
    }
}