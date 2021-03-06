
namespace moa {

    export class GuideVideoWindow extends eui.Panel {

        private video: any;
        private video1: egret.Video;
        private video2: egret.Video;
        private video3: egret.Video;

        private shade: Shade;

        public constructor() {
            super();
            this.skinName = "skins.GuideVideoWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);

            const resourceRoot = platform.os == "ios" ? Constants.Endpoints.remoteResource : Constants.ResourceEndpoint;

            this.btnVideo1.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
                this.video && platform.destroyVideo(this.video);

                this.video = platform.playVideo(`${resourceRoot}resource/assets/guide/video1.mp4`);

                if (platform.os == "android") {
                    this.addChild(this.video);
                    this.shade.visible = true;
                    (this.video as egret.Video).addEventListener(egret.Event.REMOVED, () => {
                        this.shade.visible = false;
                    }, this);
                }

                if (platform.name == "wxgame") {
                    this.video.requestFullScreen().then(() => this.video.play());
                    this.video.onEnded(() => {
                        platform.destroyVideo(this.video);
                    });
                }
            }, this);
            this.btnVideo2.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
                this.video && platform.destroyVideo(this.video);
                this.video = platform.playVideo(`${resourceRoot}resource/assets/guide/video2.mp4`);

                if (platform.os == "android") {
                    this.addChild(this.video);
                    this.shade.visible = true;
                    (this.video as egret.Video).addEventListener(egret.Event.REMOVED, () => {
                        this.shade.visible = false;
                    }, this);
                }

                if (platform.name == "wxgame") {
                    this.video.requestFullScreen().then(() => this.video.play());
                    this.video.onEnded(() => {
                        platform.destroyVideo(this.video);
                    });
                }
            }, this);
            this.btnVideo3.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
                this.video && platform.destroyVideo(this.video);
                this.video = platform.playVideo(`${resourceRoot}resource/assets/guide/video3.mp4`);

                if (platform.os == "android") {
                    this.addChild(this.video);
                    this.shade.visible = true;
                    (this.video as egret.Video).addEventListener(egret.Event.REMOVED, () => {
                        this.shade.visible = false;
                    }, this);
                }

                if (platform.name == "wxgame") {
                    this.video.requestFullScreen().then(() => this.video.play());
                    this.video.onEnded(() => {
                        platform.destroyVideo(this.video);
                    });
                }
            }, this);
            this.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
                platform.destroyVideo(this.video);
            }, this);

            // this.video1 = new egret.Video();
            // this.video2 = new egret.Video();
            // this.video3 = new egret.Video();
            // this.video1.load("http://media.w3.org/2010/05/sintel/trailer.mp4");
            // this.video2.load("http://media.w3.org/2010/05/sintel/trailer.mp4");
            // this.video3.load("http://media.w3.org/2010/05/sintel/trailer.mp4");
            // //监听视频加载完成
            // this.video1.once(egret.Event.COMPLETE, () => {
            //     this.btnVideo1.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            //         this.video1.play();
            //     }, this);
            // }, this);
            // this.video2.once(egret.Event.COMPLETE, () => {
            //     this.btnVideo2.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            //         this.video2.play();
            //     }, this);
            // }, this);
            // this.video3.once(egret.Event.COMPLETE, () => {
            //     this.btnVideo3.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            //         this.video3.play();
            //     }, this);
            // }, this);
            // //监听视频加载失败
            // this.video1.once(egret.IOErrorEvent.IO_ERROR, this.onLoadErr, this);

        }

        private onLoadErr(e: egret.Event) {
            console.log("video load error happened");
        }

        public btnVideo1: eui.Button;
        public btnVideo2: eui.Button;
        public btnVideo3: eui.Button;

        private headGroup: eui.Group;
        private contentScroller: eui.Scroller;
        private navigationBar: eui.Group;
        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            this.contentScroller.height = this.stage.stageHeight - this.headGroup.height - this.navigationBar.height - 20;

            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}