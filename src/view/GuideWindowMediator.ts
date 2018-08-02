

module game {

    export class GuideWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "GuideWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(GuideWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.guideWindow.videoButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.videoButtonClick, this); 
            this.guideWindow.gameProcessButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.gameProcessButtonClick, this); 
            this.guideWindow.roleSkillButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.roleSkillButtonClick, this); 
            this.guideWindow.winJudgeButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.winJudgeButtonClick, this); 
            this.guideWindow.gameTermButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.gameTermButtonClick, this); 

        }

        private videoButtonClick() {
            this.sendNotification(SceneCommand.SHOW_GUIDE_VIDEO);
        }

        private gameProcessButtonClick() {
            this.sendNotification(SceneCommand.SHOW_GUIDE_PROCESS);
        }

        private roleSkillButtonClick() {
            this.sendNotification(SceneCommand.SHOW_GUIDE_ROLE);
        }

        private winJudgeButtonClick() {
            this.sendNotification(SceneCommand.SHOW_GUIDE_WINJUDGE);
        }

        private gameTermButtonClick() {
            this.sendNotification(SceneCommand.SHOW_GUIDE_TERM);
        }

        public listNotificationInterests(): Array<any> {
            return [];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
        }

        public get guideWindow(): GuideWindow {
            return <GuideWindow><any>(this.viewComponent);
        }
    }
}