

module game {

    export class ResultWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "ResultWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(ResultWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.ResultWindow.shareButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.shareClick, this);
            this.ResultWindow.confirmButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.confirmClick, this);
            this.ResultWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.initData();
        }

        private shareClick() {

        }

        private confirmClick() {
            this.proxy.leaveRoom();
            this.sendNotification(SceneCommand.CHANGE, Scene.Start);
            this.ResultWindow.close();
        }

        public initData(): void {
            let roleId = this.proxy.gameState.role.findIndex(js => js && js.actorNr == this.proxy.loadBalancingClient.myActor().actorNr);
            let role = this.proxy.rolesMap.get(roleId.toString());
            if　(role.camp == gameCamp.xuyuan) {
                this.ResultWindow.campRes = "share_team_xu";
                if (this.proxy.gameState.defen < 6) {
                    this.ResultWindow.winRes = "lose";
                    this.ResultWindow.winResult = "result2";
                }
                else {
                    this.ResultWindow.winRes = "victory";
                    this.ResultWindow.winResult = "result1";
                }
            }
            else {
                this.ResultWindow.campRes = "share_team_lao";
                if (this.proxy.gameState.defen < 6) {
                    this.ResultWindow.winRes = "victory";
                    this.ResultWindow.winResult = "result3";
                }
                else {
                    this.ResultWindow.winRes = "lose";
                    this.ResultWindow.winResult = "result4";
                }
            }
            this.ResultWindow.totalScore = this.proxy.gameState.defen;
            this.ResultWindow.findPeopleScore = this.proxy.gameState.findPeopleScore;
            this.ResultWindow.findAntiqueScore = this.ResultWindow.totalScore - this.ResultWindow.findPeopleScore;
        }

        public get ResultWindow(): ResultWindow {
            return <ResultWindow><any>(this.viewComponent);
        }
    }
}