
module game {

    export class RankWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "RankWindowMediator";

        public constructor(viewComponent: any) {
            super(RankWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.rankWindow.winRateButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.winRateButtonClick, this);
            this.rankWindow.roleButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.roleButtonClick, this);
            this.rankWindow.gameNumButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.gameNumButtonClick, this);
            this.rankWindow.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.backButtonClick, this);

            this.initData();
        }

        public async initData() {
            let rankData = [];
            for (let i = 1; i < 21; i++) {
                rankData.push({
                    key: i,
                    name: "name"+i,
                    score: i,
                })
            }
            this.rankWindow.rankList.dataProvider = new eui.ArrayCollection(rankData);
            this.rankWindow.rankList.itemRenderer = RankListItemRenderer;
        }

        private backButtonClick(event: egret.TouchEvent) {
            this.rankWindow.close();
        }

        private winRateButtonClick(event: egret.TouchEvent) {
            this.rankWindow.showGameNumSwitch = this.rankWindow.showRoleSwitch = false;
            this.rankWindow.showWinRateSwitch = !this.rankWindow.showWinRateSwitch;
            this.rankWindow.winRateButton.selected = true;
            this.rankWindow.roleButton.selected = this.rankWindow.gameNumButton.selected = false;
        }

        private roleButtonClick(event: egret.TouchEvent) {
            this.rankWindow.showGameNumSwitch = this.rankWindow.showWinRateSwitch = false;
            this.rankWindow.showRoleSwitch = !this.rankWindow.showRoleSwitch;
            this.rankWindow.roleButton.selected = true;
            this.rankWindow.winRateButton.selected = this.rankWindow.gameNumButton.selected = false;
        }

        private gameNumButtonClick(event: egret.TouchEvent) {
            this.rankWindow.showWinRateSwitch = this.rankWindow.showRoleSwitch = false;
            this.rankWindow.showGameNumSwitch = !this.rankWindow.showGameNumSwitch;
            this.rankWindow.gameNumButton.selected = true;
            this.rankWindow.roleButton.selected = this.rankWindow.winRateButton.selected = false;
        }

        public listNotificationInterests(): Array<any> {
            return [];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
        }

        public get rankWindow(): RankWindow {
            return <RankWindow><any>(this.viewComponent);
        }
    }
}