
module game {

    export class GameScreen extends eui.Component {

        public gameBackground: eui.Image;

        private poweredLabel: eui.Label;
        private navigationBar: eui.Group;

        public btnCreateRoom: eui.Button;
        public btnJoinRoom: eui.Button;

        //bindings:
        public roomName: string = "";
        public isMasterClient: boolean = false;
        public isNormalClient: boolean = true;
        public currentPlayers: number = 0;
        public maxPlayers: number = 0;

        public btnSeat1 :eui.Button;
        public btnSeat2 :eui.Button;
        public btnSeat3 :eui.Button;
        public btnSeat4 :eui.Button;
        public btnSeat5 :eui.Button;
        public btnSeat6 :eui.Button;
        public btnSeat7 :eui.Button;
        public btnSeat8 :eui.Button;


        public constructor() {
            super();

            this.skinName = "skins.GameScreen";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            // this.poweredLabel.y = this.stage.stageHeight - this.poweredLabel.height - 30;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new GameScreenMediator(this));

        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}