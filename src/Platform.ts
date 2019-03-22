
namespace moa {

    export interface Platform {

        env: string;
        name: string;
        appVersion: string;
        isConnected: boolean;
        os: string;

        getUserInfo(): Promise<UserInfo>;

        authorizeUserInfo(imageUrl?: string): Promise<UserInfo>;

        login(): Promise<any>;

        getVersion(): Promise<any>;

        applyUpdate(version: string);

        getOpenDataContext();

        onNetworkStatusChange(callback: Function);

        onResume: Function;

        registerOnResume(callback: Function);

        resume();

        showToast(message: string);

        setStorage(key, data);

        getStorage(key);

        setStorageAsync(key, data);

        getStorageAsync(key);

        setSecurityStorageAsync(key, data);

        getSecurityStorageAsync(key);

        playVideo(src: string);

        destroyVideo(videoContainer);

        showModal(message: string, confirmText?: string, cancelText?: string): Promise<any>;

        showLoading(message?: string);

        hideLoading();

        shareAppMessage(message?: string, imageUrl?: string, query?: string, callback?: Function);

        showShareMenu(imageUrl?: string);

        showPreImage(data: any, index?: any);

        createBannerAd(name: string, adUnitId: string, style: any);

        showBannerAd(name: string);

        hideAllBannerAds();

        createRewardedVideoAd(name: string, adUnitId: string, callback: Function, onError: Function);

        showVideoAd(name: string);

        isVideoAdDisabled(name: string);

        disableVideoAd(name: string);

        navigateToMiniProgram();

        setClipboardData(data: string): Promise<any>;

        openExternalLink(url: string);

        checkIfWeChatInstalled(): Promise<boolean>;

        setupIM(userId?: string): Promise<any>;

        quitIM(): Promise<any>;

        loginIM(imInfo): Promise<any>;

        enterChatRoom(roomId): Promise<any>;

        exitChatRoom(): Promise<any>;

        enableMic(value: boolean): Promise<any>;

        createGroupChat(users: any[]): Promise<any>;

        openGroupChat(teamId: string, users: any[]): Promise<any>;
    }

    export class DebugPlatform implements Platform {

        public get env(): string {
            return "dev";
        }

        public get name(): string {
            return "DebugPlatform";
        }

        public get appVersion(): string {
            return "1.1.8";
        }

        public get os(): string {
            return "Browser";
        }

        public isConnected: boolean = true;

        public async getUserInfo() {
            return { nickName: CommonData.logon && CommonData.logon.unionId || "username" };
        }

        public async authorizeUserInfo(imageUrl?: string) {
            return { nickName: CommonData.logon && CommonData.logon.unionId || "username" };
        }

        public async login() {
            return { code: "anonymous", token: "" };
        }

        public async getVersion() {

        }

        public getOpenDataContext() {
            return {
                postMessage: () => { },
                createDisplayObject: () => { },
            };
        }

        public showShareMenu(imageUrl: string) {

        }

        public getLaunchInfo() {

        }

        public createRewardedVideoAd() {

        }

        public showVideoAd() {

        }

        public isVideoAdDisabled() {
            return true;
        }

        public disableVideoAd() {

        }

        public applyUpdate() {
            return true;
        }

        public onNetworkStatusChange(callback: Function) {

        }

        public onResume: Function;

        public registerOnResume(callback: Function) {

        }

        public resume() {

        }

        public showToast(message: string) {
            console.log("DebugPlatform toast:", message);
        }

        public setStorage(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        }

        public getStorage(key) {
            return JSON.parse(localStorage.getItem(key));
        }

        public async setStorageAsync(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        }

        public async getStorageAsync(key) {
            return JSON.parse(localStorage.getItem(key));
        }

        public async setSecurityStorageAsync(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        }

        public async getSecurityStorageAsync(key) {
            return JSON.parse(localStorage.getItem(key));
        }

        public playVideo(url) {

            const video = new egret.Video();
            video.load(url);
            video.once(egret.Event.COMPLETE, () => {
                video.play();
            }, this);

            return video;
        }

        public destroyVideo(videoContainer) {
            videoContainer && videoContainer.video && videoContainer.video.remove();
        }

        public showPreImage(data, index?) {

        }

        public async showModal(message: string, confirmText?: string, cancelText?: string): Promise<any> {
            return { confirm: false, cancel: true };
        }

        public showLoading(message?: string) {
            return;
        }

        public hideLoading() {
            return;
        }

        public shareAppMessage(message?: string, imageUrl?: string, query?: string, callback?: Function) {

        }

        public createBannerAd(name: string, adUnitId: string, style: any) {

        }

        public showBannerAd(name: string = "bottom") {

        }

        public hideAllBannerAds() {

        }

        public navigateToMiniProgram() {
            location.href = "https://gdjzj.hzsdgames.com:8095";
        }


        public async setClipboardData(data: string): Promise<any> {

        }

        public openExternalLink(url: string) {
            window.open(url);
        }

        public async checkIfWeChatInstalled() {
            return false;
        }

        public async setupIM(userId?: string): Promise<any> {
            return;
        }

        public async loginIM(imInfo: any): Promise<any> {
            return;
        }

        public async quitIM(): Promise<any> {
            return;
        }

        public async enterChatRoom(roomId: string): Promise<any> {
            return;
        }

        public async exitChatRoom(): Promise<any> {
            return;
        }

        public async enableMic(value: boolean): Promise<any> {
            return;
        }

        public async createGroupChat(users: any[]): Promise<any> {
            return;
        }

        public async openGroupChat(teamId: string, users: any[]): Promise<any> {
            return;
        }
    }

    export class NativePlatform extends DebugPlatform implements Platform {

        private hasGetSecurityStorageAsyncCallback: boolean = false;
        private hasSendShowModalCallback: boolean = false;

        public get env(): string {
            return "prod";
        }

        public get name(): string {
            return "native";
        }

        public get os(): string {
            return "android";
        }

        public setStorage(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        }

        public getStorage(key) {
            return JSON.parse(localStorage.getItem(key));
        }

        public async setStorageAsync(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        }

        public async getStorageAsync(key) {
            return JSON.parse(localStorage.getItem(key));
        }

        public async setSecurityStorageAsync(key, data) {
            let item = {
                key: key,
                value: data !== undefined ? JSON.stringify(data) : "",
            };
            egret.ExternalInterface.call("setSecurityStorageAsync", JSON.stringify(item));
        }

        public async getSecurityStorageAsync(key): Promise<any> {
            egret.ExternalInterface.call("getSecurityStorageAsync", key);
            return new Promise((resolve, reject) => {
                // if (!this.hasGetSecurityStorageAsyncCallback) {
                //     this.hasGetSecurityStorageAsyncCallback = true;
                egret.ExternalInterface.addCallback("getSecurityStorageAsyncCallback", (value) => {
                    console.log("getSecurityStorageAsyncCallback:", value);
                    let result = "";
                    try {
                        result = value ? JSON.parse(value) : "";
                    }
                    catch (error) {
                        result = value || undefined;
                    }
                    return resolve(result);
                });
                // }
            });
        }

        public onNetworkStatusChange(callback: Function) {
            egret.ExternalInterface.addCallback("sendNetworkStatusChangeToJS", (statusCode) => {
                this.isConnected = (statusCode && statusCode != "0");
                callback && callback({
                    isConnected: this.isConnected
                });
            });
        }

        public onResume: Function;

        public registerOnResume(callback: Function) {
            this.onResume = callback;
        }

        public resume() {
            this.onResume && this.onResume({
                isConnected: this.isConnected
            });
        }

        public async showModal(message: string, confirmText?: string, cancelText?: string): Promise<any> {
            egret.ExternalInterface.call("sendShowModalToNative", JSON.stringify({ message, confirmText, cancelText }));
            return new Promise((resolve, reject) => {
                if (!this.hasSendShowModalCallback) {
                    this.hasSendShowModalCallback = true;
                    egret.ExternalInterface.addCallback("sendShowModalResultToJS", (value) => {
                        return resolve({
                            confirm: value == "confirm",
                            cancel: value == "cancel",
                        });
                    });
                }
            });
        }

        public showToast(message: string) {
            egret.ExternalInterface.call("sendShowToastToNative", message);
        }

        public showLoading(message?: string) {
            egret.ExternalInterface.call("sendShowLoadingToNative", message || "Loading");
        }

        public hideLoading() {
            egret.ExternalInterface.call("sendHideLoadingToNative", "");
        }

        public navigateToMiniProgram() {
            throw "Don't do this in native.";
        }

        public destroyVideo(videoContainer) {
            console.log("destroyVideo did nothing.");
        }

        public openExternalLink(url) {
            egret.ExternalInterface.call("sendOpenExternalLinkToNative", url);
        }

        public async checkIfWeChatInstalled(): Promise<boolean> {
            egret.ExternalInterface.call("sendCheckIfWeChatInstalledToNative", "");
            return new Promise<boolean>((resolve, reject) => {
                egret.ExternalInterface.addCallback("sendCheckIfWeChatInstalledToNativeCallback", (value) => {
                    return resolve(value && value != "0");
                });
            });
        }

        public async setupIM(userId?: string): Promise<any> {
            if (!userId) {
                return;
            }
            egret.ExternalInterface.call("sendSetupIMToNative", userId.toString());
        }

        public async quitIM(): Promise<any> {
            egret.ExternalInterface.call("sendQuitIMToNative", "");
        }

        public async loginIM(imInfo: IMInfo): Promise<any> {
            if (!imInfo || !imInfo.account || !imInfo.token) {
                return;
            }
            egret.ExternalInterface.call("sendLoginIMToNative", JSON.stringify(imInfo));
        }

        public async enterChatRoom(roomId: string): Promise<any> {
            if (!roomId) {
                return;
            }
            egret.ExternalInterface.call("sendEnterChatRoomToNative", roomId);
        }

        public async exitChatRoom(): Promise<any> {
            egret.ExternalInterface.call("sendExitChatRoomToNative", "");
        }

        public async enableMic(value: boolean): Promise<any> {
            egret.ExternalInterface.call("sendEnableMicToNative", value ? "true" : "false");
        }

        // return teamId
        public async createGroupChat(users: any[]): Promise<string> {
            if (!users || !users.length) {
                console.log("No chat users found.");
                return;
            }
            users = _(users).orderBy(item => item).value();
            const key = JSON.stringify(users);
            const teamId = await platform.getSecurityStorageAsync(key);

            if (teamId) {
                console.log("Local GroupChat found, teamId: ", teamId);
                return teamId;
            }

            console.log("platform.createGroupChat, users count:", users.length);
            egret.ExternalInterface.call("sendCreateGroupSessionToNative", JSON.stringify(users));
            return new Promise<string>((resolve, reject) => {
                egret.ExternalInterface.addCallback("sendCreateGroupSessionToNativeCallback", (value) => {
                    console.log("createGroupChat completed, teamId: ", value);
                    return resolve(value);
                });
            });
        }

        public async openGroupChat(teamId: string, users: any[]): Promise<any> {
            if (!teamId) {
                console.log("No teamId found.");
                return;
            }
            console.log("platform.openGroupChat, teamId:", teamId);
            egret.ExternalInterface.call("sendOpenGroupSessionToNative", teamId.toString());

            try {
                if (users && users.length) {
                    const key = JSON.stringify(users);
                    await platform.setSecurityStorageAsync(key, teamId);
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    }

    // todo: in the wrapped project, the platform had been declared in the child lib project alreay.
    export let platform: Platform;
    platform = window["platform"] || new DebugPlatform();

}
