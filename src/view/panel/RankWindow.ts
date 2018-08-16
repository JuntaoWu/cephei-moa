
module game {

    export class RankWindow extends eui.Panel {

        public winRateButton: eui.ToggleButton;
        public roleButton: eui.ToggleButton;
        public gameNumButton: eui.ToggleButton;
        public rankList: eui.List;
        public backButton: eui.Button;

        private headGroup: eui.Group;
        private contentScroller: eui.Scroller;
        private navigationBar: eui.Group;

        public showWinRateSwitch: boolean;
        public showRoleSwitch: boolean;
        public showGameNumSwitch: boolean;

        public totalRate: eui.ToggleButton;
        public gameRate6: eui.ToggleButton;
        public gameRate7: eui.ToggleButton;
        public gameRate8: eui.ToggleButton;

        public roleTeamXu: eui.ToggleButton;
        public roleTeamLao: eui.ToggleButton;
        public roleAuthRate: eui.ToggleButton;
        public roleAuthPlayer: eui.ToggleButton;
        public roleXu: eui.ToggleButton;
        public roleFang: eui.ToggleButton;
        public roleHuang: eui.ToggleButton;
        public roleMu: eui.ToggleButton;
        public roleJi: eui.ToggleButton;
        public roleLao: eui.ToggleButton;
        public roleYao: eui.ToggleButton;
        public roleZheng: eui.ToggleButton;

        public totalPlay: eui.ToggleButton;

        public constructor() {
            super();

            this.skinName = "skins.RankWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.headGroup.height = 100;
            this.contentScroller.y = 100;
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            this.contentScroller.height = this.stage.stageHeight - this.headGroup.height - this.navigationBar.height - 20;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new RankWindowMediator(this));

        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}