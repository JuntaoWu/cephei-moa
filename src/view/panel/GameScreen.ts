
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

        public isInitial: boolean = false;
        public isWaiting: boolean = false;
        public isAllReady: boolean = false;
        
        public btnSeat1 :eui.Button;
        public btnSeat2 :eui.Button;
        public btnSeat3 :eui.Button;
        public btnSeat4 :eui.Button;
        public btnSeat5 :eui.Button;
        public btnSeat6 :eui.Button;
        public btnSeat7 :eui.Button;
        public btnSeat8 :eui.Button;
        public btnjs1 :eui.Button;
        public btnjs2 :eui.Button;
        public btnjs3 :eui.Button;
        public btnjs4 :eui.Button;
        public btnjs5 :eui.Button;
        public btnjs6 :eui.Button;
        public btnjs7 :eui.Button;
        public btnjs8 :eui.Button;
        public startjs :eui.Button;
        public startgame :eui.Button;
        public Anim1:eui.Button;
        public Anim2:eui.Button;
        public Anim3:eui.Button;
        public Anim4:eui.Button;
        public shunwei1:eui.Button;
        public shunwei2:eui.Button;
        public shunwei3:eui.Button;
        public shunwei4:eui.Button;
        public shunwei5:eui.Button;
        public shunwei6:eui.Button;
        public shunwei7:eui.Button;
        public shunwei8:eui.Button;


        public constructor() {
            super();

            this.skinName = "skins.GameScreen";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            this.btnjs1.visible=false;
            this.btnjs2.visible=false;
            this.btnjs3.visible=false;
            this.btnjs4.visible=false;
            this.btnjs5.visible=false;
            this.btnjs6.visible=false;
            this.btnjs7.visible=false;
            this.btnjs8.visible=false;
            this.startjs.visible=false;
            this.startgame.visible=false;
            this.Anim1.visible=false;
            this.Anim2.visible=false;
            this.Anim3.visible=false;
            this.Anim4.visible=false;
            this.shunwei1.visible=false;
            this.shunwei2.visible=false;
            this.shunwei3.visible=false;
            this.shunwei4.visible=false;
            this.shunwei5.visible=false;
            this.shunwei6.visible=false;
            this.shunwei7.visible=false;
            this.shunwei8.visible=false;
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