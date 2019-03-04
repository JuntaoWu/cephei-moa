
namespace moa {

    export class LoginScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "LoginScreenMediator";

        private accountProxy: AccountProxy;
        private gameProxy: GameProxy;

        public constructor(viewComponent: any) {
            super(LoginScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.initData();
        }

        private async tryAuthorize() {
            const userInfo = await AccountAdapter.loadUserInfo();
            if (userInfo && userInfo.userId) {
                this.sendNotification(SceneCommand.CHANGE, Scene.Start);
                platform.createBannerAd("top", "adunit-4616af6cd0c20ef1", "top");
            }
            else {
                await this.tryAuthorize();
            }
        }

        public async initData() {

            const preference: Preference = await AccountAdapter.loadPreference().catch((error) => {
                console.error(`AccountAdapter.loadPreference catch error ${error}.`);
                platform.showToast(error);
                return null;
            });
            if (!preference) {
                console.error("AccountAdapter.loadPreference failed.");
                return;
            }

            if (platform.name == "wxgame") {
                await AccountAdapter.login();
                await this.tryAuthorize();
            }
            else if (platform.name == "DebugPlatform") {
                let anonymousToken = platform.getStorage("anonymoustoken");
                await AccountAdapter.login({ token: anonymousToken });
                this.sendNotification(SceneCommand.CHANGE, Scene.Start);
            }
            else {
                const isWeChatInstalled = await platform.checkIfWeChatInstalled();
                this.viewComponent.btnAnonymousLogin.visible = preference.showAnonymousLogin;
                this.viewComponent.btnLogin.visible = preference.showWeChatLogin && isWeChatInstalled;
                this.viewComponent.btnLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, async () => {
                    egret.ExternalInterface.call("sendWxLoginToNative", "native");
                    egret.ExternalInterface.addCallback("sendWxLoginCodeToJS", async (code) => {
                        this.viewComponent.btnLogin.enabled = false;
                        await AccountAdapter.login({ code: code });
                        this.sendNotification(SceneCommand.CHANGE, Scene.Start);
                    });
                }, this);
                this.viewComponent.btnAnonymousLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, async () => {

                    platform.showLoading("加载中");

                    let anonymousToken = await platform.getSecurityStorageAsync("anonymoustoken");
                    await AccountAdapter.login({ token: anonymousToken });

                    platform.hideLoading();

                    this.sendNotification(SceneCommand.CHANGE, Scene.Start);
                }, this);

                let savedToken = await platform.getSecurityStorageAsync("token");
                let savedAnonymousToken = await platform.getSecurityStorageAsync("anonymoustoken");
                if (savedToken || savedAnonymousToken) {
                    await AccountAdapter.login({ token: savedToken || savedAnonymousToken });
                    platform.hideLoading();
                    this.sendNotification(SceneCommand.CHANGE, Scene.Start);
                }
            }

        }

        public listNotificationInterests(): Array<any> {
            return [];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
            switch (notification.getName()) {

            }
        }

        public get loginScreen(): LoginScreen {
            return <LoginScreen><any>(this.viewComponent);
        }
    }
}