
namespace moa {

    export class AdWindow extends BasePanel {

        public imageAd: eui.Image;

        public data: Ad = {
            src: "",
            href: "",
            enabled: false
        };

        public constructor() {
            super();
            this.skinName = "skins.AdWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            // this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.close, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            this.imageAd.addEventListener(egret.TouchEvent.TOUCH_TAP, this.navigateToExternalLink, this);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        public setData(data?: Ad) {
            this.data = {
                src: /http/.test(data.src) ? data.src : `${Constants.Endpoints.service}${_(data.src).trimStart('/')}`,
                href: data.href,
                enabled: data.enabled,
            };
        }

        public navigateToExternalLink(event: egret.TouchEvent) {
            this.data && this.data.href && platform.openExternalLink(this.data.href);
        }
    }
}