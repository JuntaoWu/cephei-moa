
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
            
            for (let key in this.buttonList) {
                this.buttonList[key].forEach(i => {
                    i.btn.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.TouchEvent) => {
                        this.buttonList[key].forEach(item => {
                            if (item.btn.selected) item.btn.selected = false;
                        })
                        event.currentTarget.selected = true;
                        this.rankListSort(i.key)
                    }, this);
                });
            }
            this.initData();
        }

        public async initData() {
            this.rankList = [];
            for (let i = 1; i < 21; i++) {
                this.rankList.push({
                    key: i,
                    name: "name"+i,
                    score: i,
                    totalGame: i,
                })
            }
            this.rankWindow.rankList.dataProvider = new eui.ArrayCollection(this.rankList);
            this.rankWindow.rankList.itemRenderer = RankListItemRenderer;
        }

        private rankList: Array<any>;
        private buttonList: any = {
            winRate: [
                { btn: this.rankWindow.totalRate, key: "totalRate"},
                { btn: this.rankWindow.gameRate6, key: "gameRate6"},
                { btn: this.rankWindow.gameRate7, key: "gameRate7"},
                { btn: this.rankWindow.gameRate8, key: "gameRate8"},
            ],
            role: [
                { btn: this.rankWindow.roleTeamXu, key: "roleTeamXu"},
                { btn: this.rankWindow.roleTeamLao, key: "roleTeamLao"},
                { btn: this.rankWindow.roleAuthRate, key: "roleAuthRate"},
                { btn: this.rankWindow.roleAuthPlayer, key: "roleAuthPlayer"},
                { btn: this.rankWindow.roleXu, key: "roleXu"},
                { btn: this.rankWindow.roleFang, key: "roleFang"},
                { btn: this.rankWindow.roleHuang, key: "roleHuang"},
                { btn: this.rankWindow.roleMu, key: "roleMu"},
                { btn: this.rankWindow.roleJi, key: "roleJi"},
                { btn: this.rankWindow.roleLao, key: "roleLao"},
                { btn: this.rankWindow.roleYao, key: "roleYao"},
                { btn: this.rankWindow.roleZheng, key: "roleZheng"},
            ],
            gameNum: [
                { btn: this.rankWindow.totalPlay, key: "totalPlay"},
            ],
        };

        private rankListSort(key: string) {
            console.log(key)
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