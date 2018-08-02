

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
            return [GameProxy.PLAYER_UPDATE, GameProxy.SEAT_UPDATE,GameProxy.START_JS,GameProxy.CHOOSE_JS_END,GameProxy.START_GAME,GameProxy.FIRST_ONE,GameProxy.NEXT_NR,GameProxy.ONE_GAME_END];
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
                case GameProxy.NEXT_NR:{
                    this.shunwei2(data);
                    break;
                }
                case GameProxy.ONE_GAME_END:{
                    this.onegameend();
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

            this.gameScreen.onegameend.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onegameend2,this);
            this.gameScreen.onespeakend.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onespeakend,this);

            this.gameScreen.fangzhenskill.addEventListener(egret.TouchEvent.TOUCH_TAP,this.fangzhenskill,this);
            this.gameScreen.fangzhenskill1.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.fangzhenskilling("1") }),this);
            this.gameScreen.fangzhenskill2.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.fangzhenskilling("2") }),this);
            this.gameScreen.fangzhenskill3.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.fangzhenskilling("3") }),this);
            this.gameScreen.fangzhenskill4.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.fangzhenskilling("4") }),this);
            this.gameScreen.fangzhenskill5.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.fangzhenskilling("5") }),this);
            this.gameScreen.fangzhenskill6.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.fangzhenskilling("6") }),this);
            this.gameScreen.fangzhenskill7.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.fangzhenskilling("7") }),this);
            this.gameScreen.fangzhenskill8.addEventListener(egret.TouchEvent.TOUCH_TAP,(() => { this.fangzhenskilling("8") }),this);
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
                if (this.proxy.gameState.seats[1].actorNr==this.proxy.loadBalancingClient.myRoomMasterActorNr()){
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
                if (this.proxy.gameState.seats[2].actorNr==this.proxy.loadBalancingClient.myRoomMasterActorNr()){
                    let roommaster = this.gameScreen.btnSeat2.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible=true;
                }     
                if (this.proxy.gameState.seats[2].isLocal){
                    let myself = this.gameScreen.btnSeat2.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible=true;
                }
                a2=1;
            }else{
                let content = this.gameScreen.btnSeat2.getChildAt(2) as eui.Image;
                content.visible=false;
                let roommaster = this.gameScreen.btnSeat2.getChildAt(3) as eui.Image;
                roommaster.visible=false;
                let myself = this.gameScreen.btnSeat2.getChildAt(4) as eui.Image;
                myself.visible=false;
                a2=0;
            }
            if (seats[3]) {
                let content = this.gameScreen.btnSeat3.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-green.png";
                content.visible=true;
                if (this.proxy.gameState.seats[3].actorNr==this.proxy.loadBalancingClient.myRoomMasterActorNr()){
                    let roommaster = this.gameScreen.btnSeat3.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible=true;
                }     
                if (this.proxy.gameState.seats[3].isLocal){
                    let myself = this.gameScreen.btnSeat3.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible=true;
                }
                a3=1;;
            }else{
                let content = this.gameScreen.btnSeat3.getChildAt(2) as eui.Image;
                content.visible=false;
                let roommaster = this.gameScreen.btnSeat3.getChildAt(3) as eui.Image;
                roommaster.visible=false;
                let myself = this.gameScreen.btnSeat3.getChildAt(4) as eui.Image;
                myself.visible=false;
                a3=0;
            }
            if (seats[4]) {
                let content = this.gameScreen.btnSeat4.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-orange.png";
                content.visible=true;
                if (this.proxy.gameState.seats[4].actorNr==this.proxy.loadBalancingClient.myRoomMasterActorNr()){
                    let roommaster = this.gameScreen.btnSeat4.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible=true;
                }     
                if (this.proxy.gameState.seats[4].isLocal){
                    let myself = this.gameScreen.btnSeat4.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible=true;
                }
                a4=1;
            }else{
                let content = this.gameScreen.btnSeat4.getChildAt(2) as eui.Image;
                content.visible=false;
                let roommaster = this.gameScreen.btnSeat4.getChildAt(3) as eui.Image;
                roommaster.visible=false;
                let myself = this.gameScreen.btnSeat4.getChildAt(4) as eui.Image;
                myself.visible=false;
                a4=0;
            }
            if (seats[5]) {
                let content = this.gameScreen.btnSeat5.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-purple.png";
                content.visible=true;
                if (this.proxy.gameState.seats[5].actorNr==this.proxy.loadBalancingClient.myRoomMasterActorNr()){
                    let roommaster = this.gameScreen.btnSeat5.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible=true;
                }     
                if (this.proxy.gameState.seats[5].isLocal){
                    let myself = this.gameScreen.btnSeat5.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible=true;
                }
                a5=1;
            }else{
                let content = this.gameScreen.btnSeat5.getChildAt(2) as eui.Image;
                content.visible=false;
                let roommaster = this.gameScreen.btnSeat5.getChildAt(3) as eui.Image;
                roommaster.visible=false;
                let myself = this.gameScreen.btnSeat5.getChildAt(4) as eui.Image;
                myself.visible=false;
                a5=0;
            }
            if (seats[6]) {
                let content = this.gameScreen.btnSeat6.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-red.png";
                content.visible=true;
                if (this.proxy.gameState.seats[6].actorNr==this.proxy.loadBalancingClient.myRoomMasterActorNr()){
                    let roommaster = this.gameScreen.btnSeat6.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible=true;
                }     
                if (this.proxy.gameState.seats[6].isLocal){
                    let myself = this.gameScreen.btnSeat6.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible=true;
                }
                a6=1;
            }else{
                let content = this.gameScreen.btnSeat6.getChildAt(2) as eui.Image;
                content.visible=false;
                let roommaster = this.gameScreen.btnSeat6.getChildAt(3) as eui.Image;
                roommaster.visible=false;
                let myself = this.gameScreen.btnSeat6.getChildAt(4) as eui.Image;
                myself.visible=false;
                a6=0;
            }
            if (seats[7]) {
                let content = this.gameScreen.btnSeat7.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-white.png";
                content.visible=true;
                if (this.proxy.gameState.seats[7].actorNr==this.proxy.loadBalancingClient.myRoomMasterActorNr()){
                    let roommaster = this.gameScreen.btnSeat7.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible=true;
                }     
                if (this.proxy.gameState.seats[7].isLocal){
                    let myself = this.gameScreen.btnSeat7.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible=true;
                }
                a7=1;
            }else{
                let content = this.gameScreen.btnSeat7.getChildAt(2) as eui.Image;
                content.visible=false;
                let roommaster = this.gameScreen.btnSeat7.getChildAt(3) as eui.Image;
                roommaster.visible=false;
                let myself = this.gameScreen.btnSeat7.getChildAt(4) as eui.Image;
                myself.visible=false;
                a7=0;
            }
            if (seats[8]) {
                let content = this.gameScreen.btnSeat8.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-yellow.png";
                content.visible=true;
                if (this.proxy.gameState.seats[8].actorNr==this.proxy.loadBalancingClient.myRoomMasterActorNr()){
                    let roommaster = this.gameScreen.btnSeat8.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible=true;
                }     
                if (this.proxy.gameState.seats[8].isLocal){
                    let myself = this.gameScreen.btnSeat8.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible=true;
                }
                a8=1;
            }else{
                let content = this.gameScreen.btnSeat8.getChildAt(2) as eui.Image;
                content.visible=false;
                let roommaster = this.gameScreen.btnSeat8.getChildAt(3) as eui.Image;
                roommaster.visible=false;
                let myself = this.gameScreen.btnSeat8.getChildAt(4) as eui.Image;
                myself.visible=false;
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
                    if (jsNumber=="1"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你已经选择了“许愿”");
                    }else if (jsNumber=="2"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你已经选择了“方震”");
                    }else if (jsNumber=="3"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你已经选择了“姬云浮”");
                    }else if (jsNumber=="4"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你已经选择了“黄烟烟”");
                    }else if (jsNumber=="5"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你已经选择了“木户加奈”");
                    }else if (jsNumber=="6"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你已经选择了“老朝奉”");
                    }else if (jsNumber=="7"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你已经选择了“药不然”");
                    }else if (jsNumber=="8"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你已经选择了“郑国渠”");
                    }                    
                }else{
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"已经有人选了这个角色");
                }
            }else{
                if (jsNo == -1){
                    if (jsNumber=="1"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你选择了“许愿”");
                    }else if (jsNumber=="2"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你选择了“方震”");
                    }else if (jsNumber=="3"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你选择了“姬云浮”");
                    }else if (jsNumber=="4"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你选择了“黄烟烟”");
                    }else if (jsNumber=="5"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你选择了“木户加奈”");
                    }else if (jsNumber=="6"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你选择了“老朝奉”");
                    }else if (jsNumber=="7"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你选择了“药不然”");
                    }else if (jsNumber=="8"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你选择了“郑国渠”");
                    }
                }else{
                    this.sendNotification(GameCommand.CHOOSE_ROLE,("destory"+jsNo));
                    if (jsNumber=="1"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你更换为“许愿”");
                    }else if (jsNumber=="2"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你更换为“方震”");
                    }else if (jsNumber=="3"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你更换为“姬云浮”");
                    }else if (jsNumber=="4"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你更换为“黄烟烟”");
                    }else if (jsNumber=="5"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你更换为“木户加奈”");
                    }else if (jsNumber=="6"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你更换为“老朝奉”");
                    }else if (jsNumber=="7"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你更换为“药不然”");
                    }else if (jsNumber=="8"){
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"你更换为“郑国渠”");
                    }
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
                    this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.firstoneNr,this.firstone.toString());
                }   
            }            
        }

        public first_one(message:string){
            const firstoneNr = +message;
            this.proxy.gameState.shunwei_one_been[1]=this.proxy.gameState.seats[firstoneNr];
            if (this.proxy.gameState.seats[firstoneNr].isLocal){                
                this.gameScreen.Anim1.visible=true;
                this.gameScreen.Anim2.visible=true;
                this.gameScreen.Anim3.visible=true;
                this.gameScreen.Anim4.visible=true; 
                if (this.proxy.gameState.role[2].isLocal){
                    this.gameScreen.Anim1.enabled=false;
                    this.gameScreen.Anim2.enabled=false;
                    this.gameScreen.Anim3.enabled=false;
                    this.gameScreen.Anim4.enabled=false; 
                    this.gameScreen.fangzhenskill.visible=true;
                }               
            }else{

            }
        }

        public chooseAnim(){
            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"这个XX是个XX的");
            this.gameScreen.Anim1.visible=false;
            this.gameScreen.Anim2.visible=false;
            this.gameScreen.Anim3.visible=false;
            this.gameScreen.Anim4.visible=false;            
            this.chuanshunwei();            
        }

        public chuanshunwei(){
            this.gameScreen.shunwei1.visible=true;
            this.gameScreen.shunwei2.visible=true;
            this.gameScreen.shunwei3.visible=true;
            this.gameScreen.shunwei4.visible=true;
            this.gameScreen.shunwei5.visible=true;
            this.gameScreen.shunwei6.visible=true;
            this.gameScreen.shunwei7.visible=true;
            this.gameScreen.shunwei8.visible=true;
            if (this.proxy.gameState.seats[1]){
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[1]){
                        this.gameScreen.shunwei1.visible=false;
                    }
                });
            }else{
                this.gameScreen.shunwei1.visible=false;
            }
            if (this.proxy.gameState.seats[2]){
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[2]){
                        this.gameScreen.shunwei2.visible=false;
                    }
                });
            }else{
                this.gameScreen.shunwei2.visible=false;
            }
            if (this.proxy.gameState.seats[3]){
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[3]){
                        this.gameScreen.shunwei3.visible=false;
                    }
                });
            }else{
                this.gameScreen.shunwei3.visible=false;
            }
            if (this.proxy.gameState.seats[4]){
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[4]){
                        this.gameScreen.shunwei4.visible=false;
                    }
                });
            }else{
                this.gameScreen.shunwei4.visible=false;
            }
            if (this.proxy.gameState.seats[5]){
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[5]){
                        this.gameScreen.shunwei5.visible=false;
                    }
                });
            }else{
                this.gameScreen.shunwei5.visible=false;
            }
            if (this.proxy.gameState.seats[6]){
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[6]){
                        this.gameScreen.shunwei6.visible=false;
                    }
                });
            }else{
                this.gameScreen.shunwei6.visible=false;
            }
            if (this.proxy.gameState.seats[7]){
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[7]){
                        this.gameScreen.shunwei7.visible=false;
                    }
                });
            }else{
                this.gameScreen.shunwei7.visible=false;
            }
            if (this.proxy.gameState.seats[8]){
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[8]){
                        this.gameScreen.shunwei8.visible=false;
                    }
                });
            }else{
                this.gameScreen.shunwei8.visible=false;
            }

            if (this.gameScreen.shunwei1.visible==false
            &&this.gameScreen.shunwei2.visible==false
            &&this.gameScreen.shunwei3.visible==false
            &&this.gameScreen.shunwei4.visible==false
            &&this.gameScreen.shunwei5.visible==false
            &&this.gameScreen.shunwei6.visible==false
            &&this.gameScreen.shunwei7.visible==false
            &&this.gameScreen.shunwei8.visible==false
            ){
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.onegameend);
            }
        }

        public shunwei(nextNr:string){
            this.gameScreen.shunwei1.visible=false;
            this.gameScreen.shunwei2.visible=false;
            this.gameScreen.shunwei3.visible=false;
            this.gameScreen.shunwei4.visible=false;
            this.gameScreen.shunwei5.visible=false;
            this.gameScreen.shunwei6.visible=false;
            this.gameScreen.shunwei7.visible=false;
            this.gameScreen.shunwei8.visible=false;
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.nextNr,nextNr);
        }

        public shunwei2(nextNr:string){
            this.proxy.gameState.shunwei_one_been.push(this.proxy.gameState.seats[nextNr]);
            const Nr= +nextNr;
            if (this.proxy.gameState.seats[Nr].isLocal){
                this.gameScreen.Anim1.visible=true;
                this.gameScreen.Anim2.visible=true;
                this.gameScreen.Anim3.visible=true;
                this.gameScreen.Anim4.visible=true;
                if (this.proxy.gameState.role[2].isLocal){
                    this.gameScreen.Anim1.enabled=false;
                    this.gameScreen.Anim2.enabled=false;
                    this.gameScreen.Anim3.enabled=false;
                    this.gameScreen.Anim4.enabled=false; 
                    this.gameScreen.fangzhenskill.visible=true;
                }
            }
        }

        public fangzhenskill(){
            this.gameScreen.fangzhenskill.visible=false;
            this.gameScreen.Anim1.visible=false;
            this.gameScreen.Anim2.visible=false;
            this.gameScreen.Anim3.visible=false;
            this.gameScreen.Anim4.visible=false;
            this.gameScreen.fangzhenskill1.visible=true;
            this.gameScreen.fangzhenskill2.visible=true;
            this.gameScreen.fangzhenskill3.visible=true;
            this.gameScreen.fangzhenskill4.visible=true;
            this.gameScreen.fangzhenskill5.visible=true;
            this.gameScreen.fangzhenskill6.visible=true;
            this.gameScreen.fangzhenskill7.visible=true;
            this.gameScreen.fangzhenskill8.visible=true;
            if (!this.proxy.gameState.seats[1]){
                this.gameScreen.fangzhenskill1.visible=false;
            }
            if (!this.proxy.gameState.seats[2]){
                this.gameScreen.fangzhenskill2.visible=false;
            }
            if (!this.proxy.gameState.seats[3]){
                this.gameScreen.fangzhenskill3.visible=false;
            }
            if (!this.proxy.gameState.seats[4]){
                this.gameScreen.fangzhenskill4.visible=false;
            }
            if (!this.proxy.gameState.seats[5]){
                this.gameScreen.fangzhenskill5.visible=false;
            }
            if (!this.proxy.gameState.seats[6]){
                this.gameScreen.fangzhenskill6.visible=false;
            }
            if (!this.proxy.gameState.seats[7]){
                this.gameScreen.fangzhenskill7.visible=false;
            }
            if (!this.proxy.gameState.seats[8]){
                this.gameScreen.fangzhenskill8.visible=false;
            }
        }
        
        public fangzhenskilling(Nr:string){
            if (this.proxy.gameState.seats[Nr].isLocal){
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"不能对自己使用此技能");
            }else{
                this.fangzhenskilling2(Nr);
            }            
        }

        public fangzhenskilling2(Nr:string){
            let skilled = this.proxy.gameState.role.findIndex(xx => xx==this.proxy.gameState.seats[Nr]);
            if (1 <= skilled && skilled <=5){
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,Nr+"号位是好人");
            }else if(6<=skilled&&skilled<=8){
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,Nr+"号位是坏人");
            }
            this.gameScreen.fangzhenskill1.visible=false;
            this.gameScreen.fangzhenskill2.visible=false;
            this.gameScreen.fangzhenskill3.visible=false;
            this.gameScreen.fangzhenskill4.visible=false;
            this.gameScreen.fangzhenskill5.visible=false;
            this.gameScreen.fangzhenskill6.visible=false;
            this.gameScreen.fangzhenskill7.visible=false;
            this.gameScreen.fangzhenskill8.visible=false;
            this.chuanshunwei();
        }

        public onegameend(){
            if (this.proxy.loadBalancingClient.myRoomMasterActorNr()==this.proxy.loadBalancingClient.myActor().actorNr){
                this.gameScreen.onegameend.visible=true;
            }           
        }

        public onegameend2(){
            this.gameScreen.onegameend.visible=false;
            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"第一轮结束，开始发言");
            this.gameScreen.onespeakend.visible=true;
        }

        public onespeakend(){
            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP,"录入票数");
        }
    }
}