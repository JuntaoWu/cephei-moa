

module game {

    export class PopupNumberKeyboardMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupNumberKeyboardMediator";

        public constructor(viewComponent: any) {
            super(PopupNumberKeyboardMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.popupNumberKeyboard.num1.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.numberClick(1), this); 
            this.popupNumberKeyboard.num2.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.numberClick(2), this); 
            this.popupNumberKeyboard.num3.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.numberClick(3), this); 
            this.popupNumberKeyboard.num4.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.numberClick(4), this); 
            this.popupNumberKeyboard.num5.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.numberClick(5), this); 
            this.popupNumberKeyboard.num6.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.numberClick(6), this); 
            this.popupNumberKeyboard.num7.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.numberClick(7), this); 
            this.popupNumberKeyboard.num8.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.numberClick(8), this); 
            this.popupNumberKeyboard.num9.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.numberClick(9), this); 
            this.popupNumberKeyboard.num0.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.numberClick(0), this); 
            
            this.popupNumberKeyboard.cancel.addEventListener(egret.TouchEvent.TOUCH_TAP, this.cancelClick, this); 
            this.popupNumberKeyboard.confirm.addEventListener(egret.TouchEvent.TOUCH_TAP, this.confirmClick, this); 
            this.popupNumberKeyboard.delete.addEventListener(egret.TouchEvent.TOUCH_TAP, this.deleteClick, this); 
        }

        public numberClick(n: number) {
            if (this.popupNumberKeyboard.roomName.length < 6) {
                this.popupNumberKeyboard.roomName += n;
                this.sendNotification(GameProxy.INPUT_NUMBER, this.popupNumberKeyboard.roomName);
            }
            this.popupNumberKeyboard.showText = !this.popupNumberKeyboard.roomName;
        }

        public cancelClick(e: egret.TouchEvent) {
            platform.hideAllBannerAds();
            this.popupNumberKeyboard.roomName = "";
            this.sendNotification(GameProxy.INPUT_NUMBER, this.popupNumberKeyboard.roomName);
            this.popupNumberKeyboard.showText = true;
            this.popupNumberKeyboard.close();
        }
        
        public confirmClick(e: egret.TouchEvent) {
            this.popupNumberKeyboard.roomName = "";
            this.sendNotification(GameProxy.FINISH_INPUT);
            this.popupNumberKeyboard.showText = true;
            this.popupNumberKeyboard.close();
        }
        
        public deleteClick(e: egret.TouchEvent) {
            this.popupNumberKeyboard.roomName = this.popupNumberKeyboard.roomName.substr(0, this.popupNumberKeyboard.roomName.length - 1);
            this.popupNumberKeyboard.showText = !this.popupNumberKeyboard.roomName;
            this.sendNotification(GameProxy.INPUT_NUMBER, this.popupNumberKeyboard.roomName);
        }

        public get popupNumberKeyboard(): PopupNumberKeyboard {
            return <PopupNumberKeyboard><any>(this.viewComponent);
        }
    }
}