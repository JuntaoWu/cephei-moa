

module game {

    export class GameScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "GameScreenMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(GameScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            //this.gameScreen.btnSeat1.addEventListener(egret.TouchEvent.TOUCH_TAP,this.findSeat2,this);

            console.log("GameScreen initData:");
            this.initData();
            this.findSeat();
        }

        public async initData() {
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.gameScreen.roomName = this.proxy.roomName;
            this.gameScreen.isMasterClient = this.proxy.isMasterClient;
            this.gameScreen.isNormalClient = !this.proxy.isMasterClient;
            this.updateGameScreen(this.proxy.gameState);
        }

        public listNotificationInterests(): Array<any> {
            return [GameProxy.PLAYER_UPDATE, GameProxy.SEAT_UPDATE, GameProxy.SEAT_DESTORY];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
            switch (notification.getName()) {
                case GameProxy.PLAYER_UPDATE: {
                    this.updateGameScreen(data);
                    break;
                }
                case GameProxy.SEAT_UPDATE: {
                    this.touxiang(data);
                    break;
                }
                case GameProxy.SEAT_DESTORY: {
                    this.qutouxiang(data);
                    break;
                }
            }
        }

        public updateGameScreen(data: GameState) {
            this.gameScreen.currentPlayers = data.players;
            this.gameScreen.maxPlayers = data.maxPlayers;

            let isAllReady = this.proxy.gameState.seats.length == data.maxPlayers && this.proxy.gameState.seats.every(seat => seat.actorNr !== undefined);
            let isWaiting = !isAllReady && this.proxy.gameState.seats.some(seat => seat.actorNr == this.proxy.actorNr);

            switch (data.phase) {
                case GamePhase.Preparing:
                    this.gameScreen.isInitial = !isWaiting && !isAllReady;
                    this.gameScreen.isWaiting = isWaiting;
                    this.gameScreen.isAllReady = isAllReady;
                    break;
                case GamePhase.Ready:
                    this.gameScreen.isInitial = false;
                    this.gameScreen.isWaiting = false;
                    this.gameScreen.isAllReady = false;
                    break;
                case GamePhase.Input:
                    this.gameScreen.isInitial = false;
                    this.gameScreen.isWaiting = false;
                    this.gameScreen.isAllReady = false;
                    break;
            }
        }

        public get gameScreen(): GameScreen {
            return <GameScreen><any>(this.viewComponent);
        }

        //找座位
        public findSeat() {
            this.gameScreen.btnSeat1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("1") }), this);
            this.gameScreen.btnSeat2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("2") }), this);
            this.gameScreen.btnSeat3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("3") }), this);
            this.gameScreen.btnSeat4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("4") }), this);
            this.gameScreen.btnSeat5.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("5") }), this);
            this.gameScreen.btnSeat6.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("6") }), this);
            this.gameScreen.btnSeat7.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("7") }), this);
            this.gameScreen.btnSeat8.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("8") }), this);
        }

        public findSeat2(seatNumber: string) {
            this.sendNotification(GameCommand.JOIN_SEAT, seatNumber);
        }

        // public touxiang(seats:number){
        //     let img=new eui.Image();
        //     img.x=50;
        //     img.y=50;
        //     if (seats==1){
        //         img.source="resource/assets/seat/color-black.png";
        //         this.gameScreen.btnSeat1.addChild(img);
        //     }
        //     if(seats==2){
        //         img.source="resource/assets/seat/color-blue.png";
        //         this.gameScreen.btnSeat2.addChild(img);
        //     }
        //     if(seats==3){
        //         img.source="resource/assets/seat/color-green.png";
        //         this.gameScreen.btnSeat3.addChild(img);
        //     }
        //     if(seats==4){
        //         img.source="resource/assets/seat/color-orange.png";
        //         this.gameScreen.btnSeat4.addChild(img);
        //     }
        //     if(seats==5){
        //         img.source="resource/assets/seat/color-purple.png";
        //         this.gameScreen.btnSeat5.addChild(img);
        //     }
        //     if(seats==6){
        //         img.source="resource/assets/seat/color-red.png";
        //         this.gameScreen.btnSeat6.addChild(img);
        //     }
        //     if(seats==7){
        //         img.source="resource/assets/seat/color-white.png";
        //         this.gameScreen.btnSeat7.addChild(img);
        //     }
        //     if(seats==8){
        //         img.source="resource/assets/seat/color-yellow.png";
        //         this.gameScreen.btnSeat8.addChild(img);
        //     }    
        // }

        public touxiang(seats: Array<any>) {
            // let img = new eui.Image();
            // img.x = 50;
            // img.y = 50;
            if (seats[1]) {
                // img.source="resource/assets/seat/color-black.png";
                let content = this.gameScreen.btnSeat1.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-black.png";
            }
            if (seats[2]) {
                // img.source="resource/assets/seat/color-blue.png";
                // this.gameScreen.btnSeat2.addChild(img);
                let content = this.gameScreen.btnSeat2.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-blue.png";
            }
            if (seats[3]) {
                // img.source="resource/assets/seat/color-green.png";
                // this.gameScreen.btnSeat3.addChild(img);
                let content = this.gameScreen.btnSeat3.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-green.png";
            }
            // if (seats[4]) {
            //     img.source = "resource/assets/seat/color-orange.png";
            //     this.gameScreen.btnSeat4.addChild(img);
            // }
            // if (seats[5]) {
            //     img.source = "resource/assets/seat/color-purple.png";
            //     this.gameScreen.btnSeat5.addChild(img);
            // }
            // if (seats[6]) {
            //     img.source = "resource/assets/seat/color-red.png";
            //     this.gameScreen.btnSeat6.addChild(img);
            // }
            // if (seats[7]) {
            //     img.source = "resource/assets/seat/color-white.png";
            //     this.gameScreen.btnSeat7.addChild(img);
            // }
            // if (seats[8]) {
            //     img.source = "resource/assets/seat/color-yellow.png";
            //     this.gameScreen.btnSeat8.addChild(img);
            // }
        }

        public qutouxiang(seatNo: number) {
            // if (seatNo == 1){
            //     this.gameScreen.btnSeat1.removeChild(this.img);
            // }
            // if(seatNo==2){
            //     this.gameScreen.btnSeat2.removeChild(this.img);
            // }
            // if(seatNo==3){
            //     this.gameScreen.btnSeat3.removeChild(this.img);
            // }
            // if(seatNo==4){
            //     this.gameScreen.btnSeat4.removeChild(this.img);
            // }
            // if(seatNo==5){
            //     this.gameScreen.btnSeat5.removeChild(this.img);
            // }
            // if(seatNo==6){
            //     this.gameScreen.btnSeat6.removeChild(this.img);
            // }
            // if(seatNo==7){
            //     this.gameScreen.btnSeat7.removeChild(this.img);
            // }
            // if(seatNo==8){
            //     this.gameScreen.btnSeat8.removeChild(this.img);
            // }
        }
    }
}