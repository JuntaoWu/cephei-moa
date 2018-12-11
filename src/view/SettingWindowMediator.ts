
namespace moa {

    export class SettingWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "SettingWindowMediator";

        public constructor(viewComponent: any) {
            super(SettingWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.settingWindow.shareButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.shareButtonClick, this);
            this.settingWindow.aboutButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.aboutButtonClick, this);
            this.settingWindow.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.backButtonClick, this);
        }

        private backButtonClick(event: egret.TouchEvent) {
            this.settingWindow.close();
        }

        private shareButtonClick(event: egret.TouchEvent) {
            platform.shareAppMessage();
        }

        private aboutButtonClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_ABOUT_WINDOW);
        }

        public get settingWindow(): SettingWindow {
            return <SettingWindow><any>(this.viewComponent);
        }
    }
}