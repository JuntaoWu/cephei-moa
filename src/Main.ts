//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
/** 
 * namespace Mystery of Antiques。
 */
namespace moa {

    export class Main extends eui.UILayer {

        private loadingView: LoadingUI;

        public constructor() {
            super();
            Object.entries = typeof Object.entries === 'function' ? Object.entries : obj => Object.keys(obj).map(k => [k, obj[k]] as [string, any]);
        }

        protected createChildren(): void {
            super.createChildren();

            egret.lifecycle.addLifecycleListener((context) => {
                // custom lifecycle plugin
            })

            egret.lifecycle.onPause = () => {
                egret.ticker.pause();
            }

            egret.lifecycle.onResume = () => {
                egret.ticker.resume();
                console.log("egret onResume");
                platform.resume();
            }

            //inject the custom material parser
            //注入自定义的素材解析器
            let assetAdapter = new AssetAdapter();
            egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
            egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());

            if (platform.name == "native") {
                let ratio = this.stage.stageHeight / this.stage.stageWidth;
                console.log("ratio: ", ratio);
                if (ratio <= 1.5) {
                    this.stage.scaleMode = egret.StageScaleMode.SHOW_ALL;
                    this.stage.height = 1280;
                }
            }

            this.runGame().catch(e => {
                console.error(e);
                this.loadingView.showInformation(e);
            });
        }

        private async tryAuthorize() {
            const userInfo = await AccountAdapter.loadUserInfo();
            if (userInfo && userInfo.userId) {
                this.createGameScene();
                platform.createBannerAd("top", "adunit-4616af6cd0c20ef1", "top");
            }
            else {
                await this.tryAuthorize();
            }
        }

        private async runGame() {

            await this.loadResource();
            this.loadingView.groupLoading.visible = false;

            if (platform.name == "native") {
                platform.hideLoading();
            }

            const preference: Preference = await AccountAdapter.loadPreference().catch((error) => {
                console.error(`AccountAdapter.loadPreference catch error ${error}.`);
                platform.showToast(error);
                return null;
            });
            if (!preference) {
                console.error("AccountAdapter.loadPreference failed.");
                return;
            }

            // if (preference.enabledIM) {
            //     platform.setupIM();
            // }

            this.createGameScene();

            // if (platform.name == "wxgame") {
            //     await AccountAdapter.login();
            //     await this.tryAuthorize();
            // }
            // else if (platform.name == "DebugPlatform") {
            //     let anonymousToken = platform.getStorage("anonymoustoken");
            //     await AccountAdapter.login({ token: anonymousToken });
            //     this.createGameScene();
            // }
            // else {

            //     let savedToken = await platform.getSecurityStorageAsync("token");
            //     let savedAnonymousToken = await platform.getSecurityStorageAsync("anonymoustoken");
            //     if (savedToken || savedAnonymousToken) {
            //         await AccountAdapter.login({ token: savedToken || savedAnonymousToken });
            //         platform.hideLoading();
            //         this.createGameScene();
            //     }
            //     else {
            //         const isWeChatInstalled = await platform.checkIfWeChatInstalled();
            //         this.loadingView.btnAnonymousLogin.visible = preference.showAnonymousLogin;
            //         this.loadingView.btnLogin.visible = preference.showWeChatLogin && isWeChatInstalled;
            //         this.loadingView.btnLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, async () => {
            //             egret.ExternalInterface.call("sendWxLoginToNative", "native");
            //             egret.ExternalInterface.addCallback("sendWxLoginCodeToJS", async (code) => {
            //                 this.loadingView.btnLogin.enabled = false;
            //                 await AccountAdapter.login({ code: code });
            //                 this.createGameScene();
            //             });
            //         }, this);
            //         this.loadingView.btnAnonymousLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, async () => {

            //             platform.showLoading("加载中");

            //             let anonymousToken = await platform.getSecurityStorageAsync("anonymoustoken");
            //             await AccountAdapter.login({ token: anonymousToken });

            //             platform.hideLoading();

            //             this.createGameScene();
            //         }, this);
            //     }
            // }
        }

        private async loadResource() {
            try {

                if (platform.name != "native") {
                    const checkVersionResult: any = await AccountAdapter.checkForUpdate();

                    if (checkVersionResult.hasUpdate) {
                        platform.applyUpdate(checkVersionResult.version);
                    }
                }

                await RES.loadConfig("default.res.json", `${moa.Constants.ResourceEndpoint}resource/`);
                await this.loadTheme();

                await RES.loadGroup("loading", 1);
                this.loadingView = new LoadingUI();
                this.stage.addChild(this.loadingView);

                await RES.loadGroup("preload", 0, this.loadingView);

                RES.loadGroup("lazyload", 0);
            }
            catch (e) {
                console.error(e);
            }
        }

        private loadTheme() {
            return new Promise((resolve, reject) => {
                // load skin theme configuration file, you can manually modify the file. And replace the default skin.
                //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
                let theme = new eui.Theme("resource/default.thm.json", this.stage);
                theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                    resolve();
                }, this);
            });
        }

        /**
         * 创建场景界面
         * Create scene interface
         */
        protected createGameScene(): void {

            // egret.Tween.get(this.loadingView).to({ alpha: 0 }, 1500).call(() => {
            //     this.stage.removeChild(this.loadingView);
            // });

            this.stage.removeChild(this.loadingView);

            const appContainer = new moa.AppContainer();
            this.addChild(appContainer);

            moa.ApplicationFacade.getInstance().startUp(appContainer);
        }
    }

}
