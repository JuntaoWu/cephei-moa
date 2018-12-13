
namespace moa {

    export class GuideVideoWindow extends eui.Panel {

        private video: any;
        private video1: egret.Video;
        private video2: egret.Video;
        private video3: egret.Video;

        public constructor() {
            super();
            this.skinName = "skins.GuideVideoWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);

            this.btnVideo1.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
                this.video && this.video.destroy();
                this.video = platform.playVideo(`${moa.Constants.ResourceEndpoint}resource/assets/guide/video1.mp4`);
                this.video.poster = "resource/assets/guide/video1.png";
                this.video.x = 15;
                this.video.y = 50;
                this.video.requestFullScreen().then(() => this.video.play());
                this.video.onEnded(() => {
                    this.video.destroy();
                })
            }, this);
            this.btnVideo2.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
                this.video && this.video.destroy();
                this.video = platform.playVideo(`${moa.Constants.ResourceEndpoint}resource/assets/guide/video2.mp4`);
                // this.video.poster = "resource/assets/guide/video2.png";
                this.video.x = 15;
                this.video.y = 50;
                this.video.requestFullScreen().then(() => this.video.play());
                this.video.onEnded(() => {
                    this.video.destroy();
                })
            }, this);
            this.btnVideo3.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
                this.video && this.video.destroy();
                this.video = platform.playVideo(`${moa.Constants.ResourceEndpoint}resource/assets/guide/video3.mp4`);
                this.video.poster = "resource/assets/guide/video3.png";
                this.video.x = 15;
                this.video.y = 50;
                this.video.requestFullScreen().then(() => this.video.play());
                this.video.onEnded(() => {
                    this.video.destroy();
                })
            }, this);
            this.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
                this.video && this.video.destroy();
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