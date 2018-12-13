
namespace moa {

    export class GuideGameProcessWindow extends eui.Panel {

        public winJudgeButton: eui.Button;
        
        public constructor() {
            super();
            this.skinName = "skins.GuideGameProcessWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            this.winJudgeButton.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
                ApplicationFacade.getInstance().sendNotification(SceneCommand.SHOW_GUIDE_WINJUDGE);
            }, this);
        }

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