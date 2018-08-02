

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
            return [GameProxy.PLAYER_UPDATE, GameProxy.SEAT_UPDATE,GameProxy.START_JS,GameProxy.CHOOSE_JS_END,GameProxy.START_GAME,GameProxy.FIRST_ONE];
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
                case GameProxy.START_JS:{
                    this.startjschoose();
                    break;
                }
                case GameProxy.CHOOSE_JS_END:{
                    this.choosejsend(data);
                    break;
                }
                case GameProxy.START_GAME:{
                    this.startgame2();
                    break;
                }
                case GameProxy.FIRST_ONE:{
                    this.first_one(data);
                    break;
                }
            }
        }

        public updateGameScreen(data: GameState) {
            this.gameScreen.currentPlayers = data.players;
            this.gameScreen.maxPlayers = data.maxPlayers;
        }

        public get gameScreen(): GameScreen {
            return <GameScreen><any>(this.viewComponent);
        }

        public findSeat() {
            this.gameScreen.btnSeat1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("1") }), this);
            this.gameScreen.btnSeat2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("2") }), this);
            this.gameScreen.btnSeat3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("3") }), this);
            this.gameScreen.btnSeat4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("4") }), this);
            this.gameScreen.btnSeat5.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("5") }), this);
            this.gameScreen.btnSeat6.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("6") }), this);
            this.gameScreen.btnSeat7.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("7") }), this);
            this.gameScreen.btnSeat8.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.findSeat2("8") }), this);

            this.gameScreen.startjs.addEventListener(egret.TouchEvent.TOUCH_TAP,this.startjschoose2,this);

            this.gameScreen.btnjs1.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.choosejs("1") }),this);
            this.gameScreen.btnjs2.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.choosejs("2") }),this);
            this.gameScreen.btnjs3.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.choosejs("3") }),this);
            this.gameScreen.btnjs4.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.choosejs("4") }),this);
            this.gameScreen.btnjs5.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.choosejs("5") }),this);
            this.gameScreen.btnjs6.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.choosejs("6") }),this);
            this.gameScreen.btnjs7.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.choosejs("7") }),this);
            this.gameScreen.btnjs8.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.choosejs("8") }),this);

            this.gameScreen.startgame.addEventListener(egret.TouchEvent.TOUCH_TAP,this.startgame,this);

            this.gameScreen.Anim1.addEventListener(egret.TouchEvent.TOUCH_TAP,this.chooseAnim,this);
            this.gameScreen.Anim2.addEventListener(egret.TouchEvent.TOUCH_TAP,this.chooseAnim,this);
            this.gameScreen.Anim3.addEventListener(egret.TouchEvent.TOUCH_TAP,this.chooseAnim,this);
            this.gameScreen.Anim4.addEventListener(egret.TouchEvent.TOUCH_TAP,this.chooseAnim,this);

            this.gameScreen.shunwei1.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.shunwei("1") }),this);
            this.gameScreen.shunwei2.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.shunwei("2") }),this);
            this.gameScreen.shunwei3.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.shunwei("3") }),this);
            this.gameScreen.shunwei4.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.shunwei("4") }),this);
            this.gameScreen.shunwei5.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.shunwei("5") }),this);
            this.gameScreen.shunwei6.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.shunwei("6") }),this);
            this.gameScreen.shunwei7.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.shunwei("7") }),this);
            this.gameScreen.shunwei8.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.shunwei("8") }),this);
        }

        public findSeat2(seatNumber: string) {
            if (this.proxy.gameState.seats[seatNumber]){

            }else{
                let seatNo = this.proxy.gameState.seats.findIndex(seat => seat==this.proxy.loadBalancingClient.myActor());
                if (seatNo == -1){

                }else{
                    this.sendNotification(GameCommand.JOIN_SEAT,("destory"+seatNo));
                }  
                this.sendNotification(GameCommand.JOIN_SEAT, seatNumber);              
            }    
        }

        public touxiang(seats: Array<any>) {
            let i:number = 0;
            let a1:number=0;
            let a2:number=0;
            let a3:number=0;
            let a4:number=0;
            let a5:number=0;
            let a6:number=0;
            let a7:number=0;
            let a8:number=0;
            if (seats[1]) {
                let content = this.gameScreen.btnSeat1.getChildAt(2) as eui.Image;
                //let content = this.gameScreen.btnSeat1.getChildByName("XXXX") as eui.Image;
                content.source = "resource/assets/seat/color-black.png";
                content.visible=true;
                if (seats[1]==this.proxy.loadBalancingClient.myRoomMasterActorNr()){
                    let roommaster = this.gameScreen.btnSeat1.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible=true;
                }     
                if (this.proxy.gameState.seats[1].isLocal){
                    let myself = this.gameScreen.btnSeat1.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible=true;
                }           
                a1=1;
            }else{
                let content = this.gameScreen.btnSeat1.getChildAt(2) as eui.Image;
                content.visible=false;
                let roommaster = this.gameScreen.btnSeat1.getChildAt(3) as eui.Image;
                roommaster.visible=false;
                let myself = this.gameScreen.btnSeat1.getChildAt(4) as eui.Image;
                myself.visible=false;
                a1=0;
            }
            if (seats[2]) {
                let content = this.gameScreen.btnSeat2.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-blue.png";
                content.visible=true;
                a2=1;
            }else{
                let content = this.gameScreen.btnSeat2.getChildAt(2) as eui.Image;
                content.visible=false;
                a2=0;
            }
            if (seats[3]) {
                let content = this.gameScreen.btnSeat3.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-green.png";
                content.visible=true;
                a3=1;;
            }else{
                let content = this.gameScreen.btnSeat3.getChildAt(2) as eui.Image;
                content.visible=false;
                a3=0;
            }
            if (seats[4]) {
                let content = this.gameScreen.btnSeat4.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-orange.png";
                content.visible=true;
                a4=1;
            }else{
                let content = this.gameScreen.btnSeat4.getChildAt(2) as eui.Image;
                content.visible=false;
                a4=0;
            }
            if (seats[5]) {
                let content = this.gameScreen.btnSeat5.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-purple.png";
                content.visible=true;
                a5=1;
            }else{
                let content = this.gameScreen.btnSeat5.getChildAt(2) as eui.Image;
                content.visible=false;
                a5=0;
            }
            if (seats[6]) {
                let content = this.gameScreen.btnSeat6.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-red.png";
                content.visible=true;
                a6=1;
            }else{
                let content = this.gameScreen.btnSeat6.getChildAt(2) as eui.Image;
                content.visible=false;
                a6=0;
            }
            if (seats[7]) {
                let content = this.gameScreen.btnSeat7.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-white.png";
                content.visible=true;
                a7=1;
            }else{
                let content = this.gameScreen.btnSeat7.getChildAt(2) as eui.Image;
                content.visible=false;
                a7=0;
            }
            if (seats[8]) {
                let content = this.gameScreen.btnSeat8.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-yellow.png";
                content.visible=true;
                a8=1;
            }else{
                let content = this.gameScreen.btnSeat8.getChildAt(2) as eui.Image;
                content.visible=false;
                a8=0;
            }
            i=a1+a2+a3+a4+a5+a6+a7+a8;

            if (i==2){
                this.gameScreen.btnSeat1.enabled=false;
                this.gameScreen.btnSeat2.enabled=false;
                this.gameScreen.btnSeat3.enabled=false;
                this.gameScreen.btnSeat4.enabled=false;
                this.gameScreen.btnSeat5.enabled=false;
                this.gameScreen.btnSeat6.enabled=false;
                this.gameScreen.btnSeat7.enabled=false;
                this.gameScreen.btnSeat8.enabled=false;
                if (this.proxy.loadBalancingClient.myRoomMasterActorNr()==this.proxy.loadBalancingClient.myActor().actorNr){
                    this.gameScreen.startjs.visible=true;
                }                
            }
        }

        public startjschoose2(){
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.startjs);
        }

        public startjschoose(){            
            this.gameScreen.btnjs1.visible=true;
            this.gameScreen.btnjs2.visible=true;
            this.gameScreen.btnjs3.visible=true;
            this.gameScreen.btnjs4.visible=true;
            this.gameScreen.btnjs5.visible=true;
            this.gameScreen.btnjs6.visible=true;
            this.gameScreen.btnjs7.visible=true;
            this.gameScreen.btnjs8.visible=true;
            this.gameScreen.startjs.visible=false;            
        }

        public choosejsend(role:Array<any>){
            let i:number = 0;
            role.forEach(element=> {
                if (element){
                    i++;
                }
            });

            if (i==2){
                this.gameScreen.btnjs1.visible=false;
                this.gameScreen.btnjs2.visible=false;
                this.gameScreen.btnjs3.visible=false;
                this.gameScreen.btnjs4.visible=false;
                this.gameScreen.btnjs5.visible=false;
                this.gameScreen.btnjs6.visible=false;
                this.gameScreen.btnjs7.visible=false;
                this.gameScreen.btnjs8.visible=false;
                if (this.proxy.loadBalancingClient.myRoomMasterActorNr()==this.proxy.loadBalancingClient.myActor().actorNr){
                    this.gameScreen.startgame.visible=true;
                }                
            }
        }

        public choosejs(jsNumber:string){
            let jsNo = this.proxy.gameState.role.findIndex(js => js == this.proxy.loadBalancingClient.myActor());
            if (this.proxy.gameState.role[jsNumber]){                
                if (jsNo.toString() == jsNumber){
                    console.log("你已经选择了这个角色");
                }else{
                    console.log("有人选了这个角色");   
                }
            }else{
                if (jsNo == -1){

                }else{
                    this.sendNotification(GameCommand.CHOOSE_ROLE,("destory"+jsNo));
                    console.log("换角色");
                }    
                this.sendNotification(GameCommand.CHOOSE_ROLE,jsNumber);          
            }            
        }

        public startgame(){
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.startgame);
        }

        public startgame2(){            
            this.gameScreen.startgame.visible=false;
            this.suijishu();
        }

        public firstone:number;
        public suijishu(){
            if (this.proxy.loadBalancingClient.myRoomMasterActorNr()==this.proxy.loadBalancingClient.myActor().actorNr){
                let min =Math.ceil(1);
                let max=Math.floor(8);
                this.firstone = Math.floor(Math.random() * (8-1+1))+1;
                if (!this.proxy.gameState.seats[this.firstone]){
                    this.suijishu();
                }else{
                    console.log(this.firstone);
                    this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.firstoneNr,this.firstone.toString());
                }   
            }            
        }

        public first_one(message:string){
            const firstoneNr = +message;
            if (this.proxy.gameState.seats[firstoneNr].isLocal){                
                this.gameScreen.Anim1.visible=true;
                this.gameScreen.Anim2.visible=true;
                this.gameScreen.Anim3.visible=true;
                this.gameScreen.Anim4.visible=true;
            }else{

            }
        }

        public chooseAnim(){
            this.gameScreen.Anim1.visible=false;
            this.gameScreen.Anim2.visible=false;
            this.gameScreen.Anim3.visible=false;
            this.gameScreen.Anim4.visible=false;
            this.gameScreen.shunwei1.visible=true;
            this.gameScreen.shunwei2.visible=true;
            this.gameScreen.shunwei3.visible=true;
            this.gameScreen.shunwei4.visible=true;
            this.gameScreen.shunwei5.visible=true;
            this.gameScreen.shunwei6.visible=true;
            this.gameScreen.shunwei7.visible=true;
            this.gameScreen.shunwei8.visible=true;
        }

        public shunwei(nextNr:string){
            //this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.nextNr);
        }
    }
}