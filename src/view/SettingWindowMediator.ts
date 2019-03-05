
namespace moa {

    export class SettingWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "SettingWindowMediator";

        public constructor(viewComponent: any) {
            super(SettingWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.settingWindow.shareButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.shareButtonClick, this);
            this.settingWindow.aboutButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.aboutButtonClick, this);
            this.settingWindow.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.backButtonClick, this);
            this.settingWindow.logoutButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.logoutButtonClick, this);

            this.initData();
        }

        async initData() {
            const preference = await AccountAdapter.loadPreference();
            this.settingWindow.showGuide = preference.showGuide;
            this.settingWindow.showClub = preference.showClub;
            this.settingWindow.showMore = preference.showMore;
            this.settingWindow.showWeChatLogin = preference.showWeChatLogin;
            this.settingWindow.enabledIM = preference.enabledIM;

            this.settingWindow.toggleShowGuide.addEventListener(egret.Event.CHANGE, async (event: egret.Event) => {
                await this.setPreference("showGuide", (event.target as eui.ToggleSwitch).selected);
            }, this);
            this.settingWindow.toggleShowClub.addEventListener(egret.Event.CHANGE, async (event) => {
                await this.setPreference("showClub", (event.target as eui.ToggleSwitch).selected);
            }, this);
            this.settingWindow.toggleShowWeChatLogin.addEventListener(egret.Event.CHANGE, async (event) => {
                await this.setPreference("showWeChatLogin", (event.target as eui.ToggleSwitch).selected);
            }, this);
            this.settingWindow.toggleEnabledIM.addEventListener(egret.Event.CHANGE, async (event) => {
                const enabledIM = (event.target as eui.ToggleSwitch).selected;
                await this.setPreference("enabledIM", enabledIM);
                const proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
                proxy.enableIM(enabledIM);
            }, this);
        }

        private async setPreference(key, value) {
            let preference = await platform.getSecurityStorageAsync("preference");
            preference = preference || {};
            preference[key] = value;
            await platform.setSecurityStorageAsync("preference", preference);
            this.sendNotification(SettingProxy.PREFERENCE_UPDATE, preference);
        }

        private backButtonClick(event: egret.TouchEvent) {
            this.settingWindow.close();
        }

        private shareButtonClick(event: egret.TouchEvent) {
            platform.shareAppMessage(Constants.gameTitle, Constants.shareImageUrl);
        }

        private aboutButtonClick(event: egret.TouchEvent) {
            this.sendNotification(SceneCommand.SHOW_ABOUT_WINDOW);
        }

        private async logoutButtonClick(event: egret.TouchEvent) {
            // todo: logout.
            await platform.setSecurityStorageAsync("token", "");
            await platform.setSecurityStorageAsync("anonymoustoken", "");
            this.sendNotification(SceneCommand.CHANGE, Scene.Login);
        }

        public get settingWindow(): SettingWindow {
            return <SettingWindow><any>(this.viewComponent);
        }
    }
}