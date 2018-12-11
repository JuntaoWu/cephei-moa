/** 
 * 平台数据接口。
 * 由于每款游戏通常需要发布到多个平台上，所以提取出一个统一的接口用于开发者获取平台数据信息
 * 推荐开发者通过这种方式封装平台逻辑，以保证整体结构的稳定
 * 由于不同平台的接口形式各有不同，白鹭推荐开发者将所有接口封装为基于 Promise 的异步形式
 */
namespace moa {

    export interface Platform {

        env: string;
        name: string;
        appVersion: string;
        isConnected: boolean;

        getUserInfo(): Promise<UserInfo>;

        authorizeUserInfo(): Promise<UserInfo>;

        login(): Promise<any>;

        getVersion(): Promise<any>;

        applyUpdate(version: string);

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

        showModal(message: string, confirmText?: string, cancelText?: string): Promise<any>;

        showLoading(message?: string);

        hideLoading();

        shareAppMessage();

        showPreImage(data: any, index?: any);

        createBannerAd(name: string, adUnitId: string, style: any);

        showBannerAd(name: string);

        hideAllBannerAds();

        navigateToMiniProgram();
    }

    export class DebugPlatform implements Platform {

        public get env(): string {
            return "test";
        }

        public get name(): string {
            return "DebugPlatform";
        }

        public get appVersion(): string {
            return "0.4.0";
        }

        public isConnected: boolean = true;

        public async getUserInfo() {
            return { nickName: CommonData.logon && CommonData.logon.unionId || "username" };
        }

        public async authorizeUserInfo() {
            return { nickName: CommonData.logon && CommonData.logon.unionId || "username" };
        }

        public async login() {
            return { code: "anonymous", token: "" };
        }

        public async getVersion() {

        }

        public async checkForUpdate() {

        }

        public getOpenDataContext() {

        }

        public showShareMenu() {

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
            console.log(message);
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

        public playVideo() {
            return {};
        }

        public showPreImage(data, index) {

        }

        public async showModal(message: string, confirmText?: string, cancelText?: string): Promise<any> {
            return { confirm: false, cancel: true };
        }

        public showLoading() {
            return true;
        }

        public hideLoading() {
            return true;
        }

        public shareAppMessage() {

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
    }

    export class NativePlatform extends DebugPlatform implements Platform {

        private hasGetSecurityStorageAsyncCallback: boolean = false;
        private hasSendShowModalCallback: boolean = false;

        public get env(): string {
            return "test";
        }

        public get name(): string {
            return "native";
        }

        public get appVersion(): string {
            return "0.4.0";
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
                value: data,
            };
            egret.ExternalInterface.call("setSecurityStorageAsync", JSON.stringify(item));
        }

        public async getSecurityStorageAsync(key): Promise<any> {
            egret.ExternalInterface.call("getSecurityStorageAsync", key);
            return new Promise((resolve, reject) => {
                if (!this.hasGetSecurityStorageAsyncCallback) {
                    this.hasGetSecurityStorageAsyncCallback = true;
                    egret.ExternalInterface.addCallback("getSecurityStorageAsyncCallback", (value) => {
                        return resolve(value);
                    });
                }
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

        public navigateToMiniProgram() {
            throw "Don't do this in native.";
        }

    }

    // todo: in the wrapped project, the platform had been declared in the child lib project alreay.
    export let platform: Platform;
    platform = window["platform"] || new DebugPlatform();

}
