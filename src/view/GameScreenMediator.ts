

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
            return [GameProxy.PLAYER_UPDATE,
            GameProxy.SEAT_UPDATE,
            GameProxy.START_JS,
            GameProxy.CHOOSE_JS_END,
            GameProxy.START_GAME,
            GameProxy.FIRST_ONE,
            GameProxy.NEXT_NR,
            GameProxy.ONE_GAME_END,
            GameProxy.TONGZHI,
            GameProxy.TOUPIAO_UI,
            GameProxy.PIAO_SHU,
            GameProxy.ZONG_PIAOSHU,
            GameProxy.START_TWO
            ];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
            switch (notification.getName()) {
                case GameProxy.PLAYER_UPDATE: {
                    this.updateGameScreen(data);
                    if (this.proxy.gameState.phase == GamePhase.Preparing) {
                        this.touxiang(data.seats);
                    }
                    break;
                }
                case GameProxy.SEAT_UPDATE: {
                    this.touxiang(data);
                    break;
                }
                case GameProxy.START_JS: {
                    this.startjschoose();
                    break;
                }
                case GameProxy.CHOOSE_JS_END: {
                    this.choosejsend(data);
                    break;
                }
                case GameProxy.START_GAME: {
                    this.startgame2();
                    break;
                }
                case GameProxy.FIRST_ONE: {
                    this.first_one(data);
                    console.log("隐隐约约");
                    break;
                }
                case GameProxy.NEXT_NR: {
                    this.shunwei2(data);
                    break;
                }
                case GameProxy.ONE_GAME_END: {
                    this.onegameend();
                    break;
                }
                case GameProxy.TONGZHI: {
                    this.tongzhi(data);
                    break;
                }
                case GameProxy.TOUPIAO_UI: {
                    this.toupiaoui();
                    break;
                }
                case GameProxy.PIAO_SHU: {
                    this.piaoshujisuan(data);
                    break;
                }
                case GameProxy.ZONG_PIAOSHU: {
                    this.toupiaoend(data);
                    break;
                }
                case GameProxy.START_TWO: {
                    this.starttwo();
                    break;
                }
            }
        }

        public updateGameScreen(data: GameState) {
            this.gameScreen.currentPlayers = data.players;
            this.gameScreen.maxPlayers = data.maxPlayers;

            let allValidSeats = this.proxy.gameState.seats.filter(seat => seat && seat.actorNr !== undefined);

            let isAllReady = allValidSeats.length == data.maxPlayers;
            let isWaiting = !isAllReady && this.proxy.gameState.seats.some(seat => seat && seat.actorNr == this.proxy.actorNr);

            switch (data.phase) {
                case GamePhase.Preparing:
                    this.gameScreen.isInitial = !isWaiting && !isAllReady;
                    this.gameScreen.isWaiting = isWaiting;
                    this.gameScreen.isAllReady = isAllReady;
                    this.gameScreen.isPhasePreparing = true;
                    this.gameScreen.isPhaseChoosingRole = false;
                    this.gameScreen.isPhaseFirstRound = false;
                    break;
                case GamePhase.ChoosingRole:
                    this.gameScreen.isInitial = false;
                    this.gameScreen.isWaiting = false;
                    this.gameScreen.isAllReady = false;
                    this.gameScreen.isBindingIdentity = true;
                    this.gameScreen.isPhasePreparing = false;
                    this.gameScreen.isPhaseChoosingRole = true;
                    this.gameScreen.isPhaseFirstRound = false;
                    break;
                case GamePhase.StartGame:
                    this.gameScreen.isInitial = false;
                    this.gameScreen.isWaiting = false;
                    this.gameScreen.isAllReady = false;
                    this.gameScreen.isPhasePreparing = false;
                    this.gameScreen.isPhaseChoosingRole = false;
                    this.gameScreen.isPhaseStartGame = true;
                    this.gameScreen.isPhaseFirstRound = true;
                    break;
                case GamePhase.FirstRound:
                    this.gameScreen.isInitial = false;
                    this.gameScreen.isWaiting = false;
                    this.gameScreen.isAllReady = false;
                    this.gameScreen.isPhasePreparing = false;
                    this.gameScreen.isPhaseChoosingRole = false;
                    this.gameScreen.isPhaseStartGame = false;
                    this.gameScreen.isPhaseFirstRound = true;
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

            this.gameScreen.startjs.addEventListener(egret.TouchEvent.TOUCH_TAP, this.startjschoose2, this);

            this.gameScreen.btnjs1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.choosejs("1") }), this);
            this.gameScreen.btnjs2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.choosejs("2") }), this);
            this.gameScreen.btnjs3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.choosejs("3") }), this);
            this.gameScreen.btnjs4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.choosejs("4") }), this);
            this.gameScreen.btnjs5.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.choosejs("5") }), this);
            this.gameScreen.btnjs6.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.choosejs("6") }), this);
            this.gameScreen.btnjs7.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.choosejs("7") }), this);
            this.gameScreen.btnjs8.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.choosejs("8") }), this);

            this.gameScreen.startgame.addEventListener(egret.TouchEvent.TOUCH_TAP, this.startgame, this);

            this.gameScreen.Anim1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("0") }), this);
            this.gameScreen.Anim2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("1") }), this);
            this.gameScreen.Anim3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("2") }), this);
            this.gameScreen.Anim4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("3") }), this);

            this.gameScreen.shunwei1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.shunwei("1") }), this);
            this.gameScreen.shunwei2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.shunwei("2") }), this);
            this.gameScreen.shunwei3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.shunwei("3") }), this);
            this.gameScreen.shunwei4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.shunwei("4") }), this);
            this.gameScreen.shunwei5.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.shunwei("5") }), this);
            this.gameScreen.shunwei6.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.shunwei("6") }), this);
            this.gameScreen.shunwei7.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.shunwei("7") }), this);
            this.gameScreen.shunwei8.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.shunwei("8") }), this);

            this.gameScreen.onegameend.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onegameend2, this);
            this.gameScreen.onespeakend.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onespeakend, this);

            this.gameScreen.toupiao1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.toupiao("1") }), this);
            this.gameScreen.toupiao2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.toupiao("2") }), this);
            this.gameScreen.toupiao3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.toupiao("3") }), this);
            this.gameScreen.toupiao4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.toupiao("4") }), this);

            this.gameScreen.fangzhenskill.addEventListener(egret.TouchEvent.TOUCH_TAP, this.fangzhenskill, this);
            this.gameScreen.fangzhenskill1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.fangzhenskilling("1") }), this);
            this.gameScreen.fangzhenskill2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.fangzhenskilling("2") }), this);
            this.gameScreen.fangzhenskill3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.fangzhenskilling("3") }), this);
            this.gameScreen.fangzhenskill4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.fangzhenskilling("4") }), this);
            this.gameScreen.fangzhenskill5.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.fangzhenskilling("5") }), this);
            this.gameScreen.fangzhenskill6.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.fangzhenskilling("6") }), this);
            this.gameScreen.fangzhenskill7.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.fangzhenskilling("7") }), this);
            this.gameScreen.fangzhenskill8.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.fangzhenskilling("8") }), this);
            this.gameScreen.qingkong.addEventListener(egret.TouchEvent.TOUCH_TAP, this.qingkong, this);
            this.gameScreen.toupiaoqueren.addEventListener(egret.TouchEvent.TOUCH_TAP, this.toupiaoqueren, this);

            this.gameScreen.startno2.addEventListener(egret.TouchEvent.TOUCH_TAP, this.startno2, this);
            this.gameScreen.lcfskill.addEventListener(egret.TouchEvent.TOUCH_TAP, this.lcfskill, this);
            this.gameScreen.lcfskillpass.addEventListener(egret.TouchEvent.TOUCH_TAP, this.lcfskillpass, this);
            this.gameScreen.ybrskill.addEventListener(egret.TouchEvent.TOUCH_TAP,this.ybrskill,this);
            this.gameScreen.ybrskillpass.addEventListener(egret.TouchEvent.TOUCH_TAP,this.ybrskillpass,this);

            this.gameScreen.ybrskill1.addEventListener(egret.TouchEvent.TOUCH_TAP,(()=>{this.ybrskilling("1")}),this);
            this.gameScreen.ybrskill2.addEventListener(egret.TouchEvent.TOUCH_TAP,(()=>{this.ybrskilling("2")}),this);
            this.gameScreen.ybrskill3.addEventListener(egret.TouchEvent.TOUCH_TAP,(()=>{this.ybrskilling("3")}),this);
            this.gameScreen.ybrskill4.addEventListener(egret.TouchEvent.TOUCH_TAP,(()=>{this.ybrskilling("4")}),this);
            this.gameScreen.ybrskill5.addEventListener(egret.TouchEvent.TOUCH_TAP,(()=>{this.ybrskilling("5")}),this);
            this.gameScreen.ybrskill6.addEventListener(egret.TouchEvent.TOUCH_TAP,(()=>{this.ybrskilling("6")}),this);
            this.gameScreen.ybrskill7.addEventListener(egret.TouchEvent.TOUCH_TAP,(()=>{this.ybrskilling("7")}),this);
            this.gameScreen.ybrskill8.addEventListener(egret.TouchEvent.TOUCH_TAP,(()=>{this.ybrskilling("8")}),this);
        }

        public findSeat2(seatNumber: string) {
            if (this.proxy.gameState.seats[seatNumber]) {

            } else {
                let seatNo = this.proxy.gameState.seats.findIndex(seat => seat && seat.actorNr == this.proxy.loadBalancingClient.myActor().actorNr);
                if (seatNo == -1) {

                } else {
                    this.sendNotification(GameCommand.JOIN_SEAT, ("destory" + seatNo));
                }
                this.sendNotification(GameCommand.JOIN_SEAT, seatNumber);
            }
        }

        public roomrenshu: number = 2;
        public touxiang(seats: Array<any>) {
            let i: number = 0;
            let a1: number = 0;
            let a2: number = 0;
            let a3: number = 0;
            let a4: number = 0;
            let a5: number = 0;
            let a6: number = 0;
            let a7: number = 0;
            let a8: number = 0;
            if (seats[1]) {
                let content = this.gameScreen.btnSeat1.getChildAt(2) as eui.Image;
                //let content = this.gameScreen.btnSeat1.getChildByName("XXXX") as eui.Image;
                content.source = "resource/assets/seat/color-black.png";
                content.visible = true;
                if (this.proxy.isActorMaster(seats[1])) {
                    let roommaster = this.gameScreen.btnSeat1.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible = true;
                }
                if (this.proxy.isActorLocal(seats[1])) {
                    let myself = this.gameScreen.btnSeat1.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible = true;
                }
                a1 = 1;
            } else {
                let content = this.gameScreen.btnSeat1.getChildAt(2) as eui.Image;
                content.visible = false;
                let roommaster = this.gameScreen.btnSeat1.getChildAt(3) as eui.Image;
                roommaster.visible = false;
                let myself = this.gameScreen.btnSeat1.getChildAt(4) as eui.Image;
                myself.visible = false;
                a1 = 0;
            }
            if (seats[2]) {
                let content = this.gameScreen.btnSeat2.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-blue.png";
                content.visible = true;
                if (this.proxy.isActorMaster(seats[2])) {
                    let roommaster = this.gameScreen.btnSeat2.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible = true;
                }
                if (this.proxy.isActorLocal(seats[2])) {
                    let myself = this.gameScreen.btnSeat2.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible = true;
                }
                a2 = 1;
            } else {
                let content = this.gameScreen.btnSeat2.getChildAt(2) as eui.Image;
                content.visible = false;
                let roommaster = this.gameScreen.btnSeat2.getChildAt(3) as eui.Image;
                roommaster.visible = false;
                let myself = this.gameScreen.btnSeat2.getChildAt(4) as eui.Image;
                myself.visible = false;
                a2 = 0;
            }
            if (seats[3]) {
                let content = this.gameScreen.btnSeat3.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-green.png";
                content.visible = true;
                if (this.proxy.isActorMaster(seats[3])) {
                    let roommaster = this.gameScreen.btnSeat3.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible = true;
                }
                if (this.proxy.isActorLocal(seats[3])) {
                    let myself = this.gameScreen.btnSeat3.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible = true;
                }
                a3 = 1;;
            } else {
                let content = this.gameScreen.btnSeat3.getChildAt(2) as eui.Image;
                content.visible = false;
                let roommaster = this.gameScreen.btnSeat3.getChildAt(3) as eui.Image;
                roommaster.visible = false;
                let myself = this.gameScreen.btnSeat3.getChildAt(4) as eui.Image;
                myself.visible = false;
                a3 = 0;
            }
            if (seats[4]) {
                let content = this.gameScreen.btnSeat4.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-orange.png";
                content.visible = true;
                if (this.proxy.isActorMaster(seats[4])) {
                    let roommaster = this.gameScreen.btnSeat4.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible = true;
                }
                if (this.proxy.isActorLocal(seats[4])) {
                    let myself = this.gameScreen.btnSeat4.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible = true;
                }
                a4 = 1;
            } else {
                let content = this.gameScreen.btnSeat4.getChildAt(2) as eui.Image;
                content.visible = false;
                let roommaster = this.gameScreen.btnSeat4.getChildAt(3) as eui.Image;
                roommaster.visible = false;
                let myself = this.gameScreen.btnSeat4.getChildAt(4) as eui.Image;
                myself.visible = false;
                a4 = 0;
            }
            if (seats[5]) {
                let content = this.gameScreen.btnSeat5.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-purple.png";
                content.visible = true;
                if (this.proxy.isActorMaster(seats[5])) {
                    let roommaster = this.gameScreen.btnSeat5.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible = true;
                }
                if (this.proxy.isActorLocal(seats[5])) {
                    let myself = this.gameScreen.btnSeat5.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible = true;
                }
                a5 = 1;
            } else {
                let content = this.gameScreen.btnSeat5.getChildAt(2) as eui.Image;
                content.visible = false;
                let roommaster = this.gameScreen.btnSeat5.getChildAt(3) as eui.Image;
                roommaster.visible = false;
                let myself = this.gameScreen.btnSeat5.getChildAt(4) as eui.Image;
                myself.visible = false;
                a5 = 0;
            }
            if (seats[6]) {
                let content = this.gameScreen.btnSeat6.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-red.png";
                content.visible = true;
                if (this.proxy.isActorMaster(seats[6])) {
                    let roommaster = this.gameScreen.btnSeat6.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible = true;
                }
                if (this.proxy.isActorLocal(seats[6])) {
                    let myself = this.gameScreen.btnSeat6.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible = true;
                }
                a6 = 1;
            } else {
                let content = this.gameScreen.btnSeat6.getChildAt(2) as eui.Image;
                content.visible = false;
                let roommaster = this.gameScreen.btnSeat6.getChildAt(3) as eui.Image;
                roommaster.visible = false;
                let myself = this.gameScreen.btnSeat6.getChildAt(4) as eui.Image;
                myself.visible = false;
                a6 = 0;
            }
            if (seats[7]) {
                let content = this.gameScreen.btnSeat7.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-white.png";
                content.visible = true;
                if (this.proxy.isActorMaster(seats[7])) {
                    let roommaster = this.gameScreen.btnSeat7.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible = true;
                }
                if (this.proxy.isActorLocal(seats[7])) {
                    let myself = this.gameScreen.btnSeat7.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible = true;
                }
                a7 = 1;
            } else {
                let content = this.gameScreen.btnSeat7.getChildAt(2) as eui.Image;
                content.visible = false;
                let roommaster = this.gameScreen.btnSeat7.getChildAt(3) as eui.Image;
                roommaster.visible = false;
                let myself = this.gameScreen.btnSeat7.getChildAt(4) as eui.Image;
                myself.visible = false;
                a7 = 0;
            }
            if (seats[8]) {
                let content = this.gameScreen.btnSeat8.getChildAt(2) as eui.Image;
                content.source = "resource/assets/seat/color-yellow.png";
                content.visible = true;
                if (this.proxy.isActorMaster(seats[8])) {
                    let roommaster = this.gameScreen.btnSeat8.getChildAt(3) as eui.Image;
                    roommaster.source = "resource/assets/Slider/thumb.png";
                    roommaster.visible = true;
                }
                if (this.proxy.isActorLocal(seats[8])) {
                    let myself = this.gameScreen.btnSeat8.getChildAt(4) as eui.Image;
                    myself.source = "resource/assets/seat/self-mark.png";
                    myself.visible = true;
                }
                a8 = 1;
            } else {
                let content = this.gameScreen.btnSeat8.getChildAt(2) as eui.Image;
                content.visible = false;
                let roommaster = this.gameScreen.btnSeat8.getChildAt(3) as eui.Image;
                roommaster.visible = false;
                let myself = this.gameScreen.btnSeat8.getChildAt(4) as eui.Image;
                myself.visible = false;
                a8 = 0;
            }
            i = a1 + a2 + a3 + a4 + a5 + a6 + a7 + a8;

            if (i == this.roomrenshu) {
                this.gameScreen.btnSeat1.enabled = false;
                this.gameScreen.btnSeat2.enabled = false;
                this.gameScreen.btnSeat3.enabled = false;
                this.gameScreen.btnSeat4.enabled = false;
                this.gameScreen.btnSeat5.enabled = false;
                this.gameScreen.btnSeat6.enabled = false;
                this.gameScreen.btnSeat7.enabled = false;
                this.gameScreen.btnSeat8.enabled = false;
                if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                    this.gameScreen.startjs.visible = true;
                }
            }
        }

        public startjschoose2() {
            this.proxy.startChooseRole();
        }

        public startjschoose() {
            this.gameScreen.btnjs1.visible = true;
            this.gameScreen.btnjs2.visible = true;
            this.gameScreen.btnjs3.visible = true;
            this.gameScreen.btnjs4.visible = true;
            this.gameScreen.btnjs5.visible = true;
            this.gameScreen.btnjs6.visible = true;
            this.gameScreen.btnjs7.visible = true;
            this.gameScreen.btnjs8.visible = true;
            this.gameScreen.startjs.visible = false;
        }

        public choosejsend(role: Array<any>) {
            let i: number = 0;
            role.forEach(element => {
                if (element) {
                    i++;
                }
            });

            if (i == this.roomrenshu) {
                this.gameScreen.btnjs1.visible = false;
                this.gameScreen.btnjs2.visible = false;
                this.gameScreen.btnjs3.visible = false;
                this.gameScreen.btnjs4.visible = false;
                this.gameScreen.btnjs5.visible = false;
                this.gameScreen.btnjs6.visible = false;
                this.gameScreen.btnjs7.visible = false;
                this.gameScreen.btnjs8.visible = false;
                if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                    this.gameScreen.startgame.visible = true;
                }
            }
        }

        public choosejs(jsNumber: string) {
            let jsNo = this.proxy.gameState.role.findIndex(js => js && js.actorNr == this.proxy.loadBalancingClient.myActor().actorNr);
            if (this.proxy.gameState.role[jsNumber]) {
                if (jsNo.toString() == jsNumber) {
                    if (jsNumber == "1") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你已经选择了“许愿”");
                    } else if (jsNumber == "2") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你已经选择了“方震”");
                    } else if (jsNumber == "3") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你已经选择了“姬云浮”");
                    } else if (jsNumber == "4") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你已经选择了“黄烟烟”");
                    } else if (jsNumber == "5") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你已经选择了“木户加奈”");
                    } else if (jsNumber == "6") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你已经选择了“老朝奉”");
                    } else if (jsNumber == "7") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你已经选择了“药不然”");
                    } else if (jsNumber == "8") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你已经选择了“郑国渠”");
                    }
                } else {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "已经有人选了这个角色");
                }
            } else {
                if (jsNo == -1) {
                    if (jsNumber == "1") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你选择了“许愿”");
                    } else if (jsNumber == "2") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你选择了“方震”");
                    } else if (jsNumber == "3") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你选择了“姬云浮”");
                    } else if (jsNumber == "4") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你选择了“黄烟烟”");
                    } else if (jsNumber == "5") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你选择了“木户加奈”");
                    } else if (jsNumber == "6") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你选择了“老朝奉”");
                    } else if (jsNumber == "7") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你选择了“药不然”");
                    } else if (jsNumber == "8") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你选择了“郑国渠”");
                    }
                } else {
                    this.sendNotification(GameCommand.CHOOSE_ROLE, ("destory" + jsNo));
                    if (jsNumber == "1") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你更换为“许愿”");
                    } else if (jsNumber == "2") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你更换为“方震”");
                    } else if (jsNumber == "3") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你更换为“姬云浮”");
                    } else if (jsNumber == "4") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你更换为“黄烟烟”");
                    } else if (jsNumber == "5") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你更换为“木户加奈”");
                    } else if (jsNumber == "6") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你更换为“老朝奉”");
                    } else if (jsNumber == "7") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你更换为“药不然”");
                    } else if (jsNumber == "8") {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你更换为“郑国渠”");
                    }
                }
                this.sendNotification(GameCommand.CHOOSE_ROLE, jsNumber);
            }
        }

        public startgame() {
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.startgame);
        }

        public startgame2() {
            if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                this.gameScreen.startgame.visible = false;
                this.baowusuiji(this.proxy.gameState.baowulist);
                this.baowusuiji(this.proxy.gameState.onezj);
                this.baowusuiji(this.proxy.gameState.twozj);
                this.baowusuiji(this.proxy.gameState.threezj);
                this.proxy.gameState.hyyskill = _.random(1, 3);
                this.proxy.gameState.mhjnskill = _.random(1, 3);
                this.proxy.gameState.firstone = this.suijishu();
                this.proxy.startgametongbu();
            }

        }

        public baowusuiji(arr: Array<any>) {
            arr.sort(() => {
                return 0.5 - Math.random();
            })
        }

        public suijishu() {
            if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                let min = Math.ceil(1);
                let max = Math.floor(8);
                let firstone = Math.floor(Math.random() * (8 - 1 + 1)) + 1;
                if (!this.proxy.gameState.seats[firstone]) {
                    return this.suijishu();
                }
                else {
                    return firstone;
                }
            }
        }

        public first_one(message: string) {
            console.log("第一个");
            this.gameScreen.Anim1.label = this.proxy.gameState.baowulist[0];
            this.gameScreen.Anim2.label = this.proxy.gameState.baowulist[1];
            this.gameScreen.Anim3.label = this.proxy.gameState.baowulist[2];
            this.gameScreen.Anim4.label = this.proxy.gameState.baowulist[3];
            const firstoneNr = +message;
            this.proxy.gameState.shunwei_one_been[1] = this.proxy.gameState.seats[firstoneNr];
            this.xingdong(firstoneNr);
        }

        public xingdong(message: number) {
            console.log("准备UI");
            if (this.proxy.isActorLocal(this.proxy.gameState.seats[message])) {
                console.log("出现ui");
                this.gameScreen.Anim1.visible = true;
                this.gameScreen.Anim2.visible = true;
                this.gameScreen.Anim3.visible = true;
                this.gameScreen.Anim4.visible = true;
                //方震技能
                if (this.proxy.isActorLocal(this.proxy.gameState.role[2])) {
                    this.gameScreen.Anim1.enabled = false;
                    this.gameScreen.Anim2.enabled = false;
                    this.gameScreen.Anim3.enabled = false;
                    this.gameScreen.Anim4.enabled = false;
                    this.gameScreen.fangzhenskill.visible = true;
                }
            }
        }

        public xuyuanjineng: number = 0;
        public frist: number = 100;
        public chooseAnim(message: string) {
            const Nr = +message;
            //许愿技能
            if (this.proxy.isActorLocal(this.proxy.gameState.role[1])) {
                if (this.xuyuanjineng == 0) {
                    if (Nr == 0) {
                        this.gameScreen.Anim1.enabled = false;
                        this.xuyuanjineng++;
                        this.frist = Nr;
                    } else if (Nr == 1) {
                        this.gameScreen.Anim2.enabled = false;
                        this.xuyuanjineng++;
                        this.frist = Nr;
                    } else if (Nr == 2) {
                        this.gameScreen.Anim3.enabled = false;
                        this.xuyuanjineng++;
                        this.frist = Nr;
                    } else if (Nr == 3) {
                        this.gameScreen.Anim4.enabled = false;
                        this.xuyuanjineng++;
                        this.frist = Nr;
                    }
                } else if (this.xuyuanjineng == 1) {
                    if (this.proxy.gameState.onelcfskill) {
                        let skilled1: string;
                        let skilled2: string;
                        if (this.proxy.gameState.onezj[this.frist] == "真") {
                            skilled1 = "假";
                        } else {
                            skilled1 = "真";
                        }
                        if (this.proxy.gameState.onezj[Nr] == "真") {
                            skilled2 = "假";
                        } else {
                            skilled2 = "真";
                        }
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[this.frist] + "”" + " 是 " + skilled1 + "   " + "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled2)
                    } else {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[this.frist] + "”" + " 是 " + this.proxy.gameState.onezj[this.frist] + "   " + "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.onezj[Nr]);
                    }
                    this.gameScreen.Anim1.visible = false;
                    this.gameScreen.Anim2.visible = false;
                    this.gameScreen.Anim3.visible = false;
                    this.gameScreen.Anim4.visible = false;
                    this.chuanshunwei();
                }
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[3])) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.onezj[Nr]);
                this.gameScreen.Anim1.visible = false;
                this.gameScreen.Anim2.visible = false;
                this.gameScreen.Anim3.visible = false;
                this.gameScreen.Anim4.visible = false;
                this.chuanshunwei();
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[4])) {
                if (this.proxy.gameState.hyyskill == 1) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                } else {
                    if (this.proxy.gameState.onelcfskill) {
                        let skilled: string;
                        if (this.proxy.gameState.onezj[Nr] == "真") {
                            skilled = "假";
                        } else {
                            skilled = "真";
                        }
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled);
                    } else {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.onezj[Nr]);
                    }
                }
                this.gameScreen.Anim1.visible = false;
                this.gameScreen.Anim2.visible = false;
                this.gameScreen.Anim3.visible = false;
                this.gameScreen.Anim4.visible = false;
                this.chuanshunwei();
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[5])) {
                if (this.proxy.gameState.mhjnskill == 1) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                } else {
                    if (this.proxy.gameState.onelcfskill) {
                        let skilled: string;
                        if (this.proxy.gameState.onezj[Nr] == "真") {
                            skilled = "假";
                        } else {
                            skilled = "真";
                        }
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled);
                    } else {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.onezj[Nr]);
                    }
                }
                this.gameScreen.Anim1.visible = false;
                this.gameScreen.Anim2.visible = false;
                this.gameScreen.Anim3.visible = false;
                this.gameScreen.Anim4.visible = false;
                this.chuanshunwei();
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[6])) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.onezj[Nr]);
                this.gameScreen.Anim1.visible = false;
                this.gameScreen.Anim2.visible = false;
                this.gameScreen.Anim3.visible = false;
                this.gameScreen.Anim4.visible = false;
                this.gameScreen.lcfskill.visible = true;
                this.gameScreen.lcfskillpass.visible=true;
            }else if (this.proxy.isActorLocal(this.proxy.gameState.role[7])){
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.onezj[Nr]);
                this.gameScreen.Anim1.visible = false;
                this.gameScreen.Anim2.visible = false;
                this.gameScreen.Anim3.visible = false;
                this.gameScreen.Anim4.visible = false;
                this.gameScreen.ybrskill.visible=true;
                this.gameScreen.ybrskillpass.visible=true;
            }
            else {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.onezj[Nr]);
                this.gameScreen.Anim1.visible = false;
                this.gameScreen.Anim2.visible = false;
                this.gameScreen.Anim3.visible = false;
                this.gameScreen.Anim4.visible = false;
                this.chuanshunwei();
            }
        }

        public chuanshunwei() {
            this.gameScreen.shunwei1.visible = true;
            this.gameScreen.shunwei2.visible = true;
            this.gameScreen.shunwei3.visible = true;
            this.gameScreen.shunwei4.visible = true;
            this.gameScreen.shunwei5.visible = true;
            this.gameScreen.shunwei6.visible = true;
            this.gameScreen.shunwei7.visible = true;
            this.gameScreen.shunwei8.visible = true;
            if (this.proxy.gameState.seats[1]) {
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[1]) {
                        this.gameScreen.shunwei1.visible = false;
                    }
                });
            } else {
                this.gameScreen.shunwei1.visible = false;
            }
            if (this.proxy.gameState.seats[2]) {
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[2]) {
                        this.gameScreen.shunwei2.visible = false;
                    }
                });
            } else {
                this.gameScreen.shunwei2.visible = false;
            }
            if (this.proxy.gameState.seats[3]) {
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[3]) {
                        this.gameScreen.shunwei3.visible = false;
                    }
                });
            } else {
                this.gameScreen.shunwei3.visible = false;
            }
            if (this.proxy.gameState.seats[4]) {
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[4]) {
                        this.gameScreen.shunwei4.visible = false;
                    }
                });
            } else {
                this.gameScreen.shunwei4.visible = false;
            }
            if (this.proxy.gameState.seats[5]) {
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[5]) {
                        this.gameScreen.shunwei5.visible = false;
                    }
                });
            } else {
                this.gameScreen.shunwei5.visible = false;
            }
            if (this.proxy.gameState.seats[6]) {
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[6]) {
                        this.gameScreen.shunwei6.visible = false;
                    }
                });
            } else {
                this.gameScreen.shunwei6.visible = false;
            }
            if (this.proxy.gameState.seats[7]) {
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[7]) {
                        this.gameScreen.shunwei7.visible = false;
                    }
                });
            } else {
                this.gameScreen.shunwei7.visible = false;
            }
            if (this.proxy.gameState.seats[8]) {
                this.proxy.gameState.shunwei_one_been.forEach(element => {
                    if (element == this.proxy.gameState.seats[8]) {
                        this.gameScreen.shunwei8.visible = false;
                    }
                });
            } else {
                this.gameScreen.shunwei8.visible = false;
            }

            if (this.gameScreen.shunwei1.visible == false
                && this.gameScreen.shunwei2.visible == false
                && this.gameScreen.shunwei3.visible == false
                && this.gameScreen.shunwei4.visible == false
                && this.gameScreen.shunwei5.visible == false
                && this.gameScreen.shunwei6.visible == false
                && this.gameScreen.shunwei7.visible == false
                && this.gameScreen.shunwei8.visible == false
            ) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.onegameend);
            }
        }

        public shunwei(nextNr: string) {
            this.gameScreen.shunwei1.visible = false;
            this.gameScreen.shunwei2.visible = false;
            this.gameScreen.shunwei3.visible = false;
            this.gameScreen.shunwei4.visible = false;
            this.gameScreen.shunwei5.visible = false;
            this.gameScreen.shunwei6.visible = false;
            this.gameScreen.shunwei7.visible = false;
            this.gameScreen.shunwei8.visible = false;
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.nextNr, nextNr);
        }

        public shunwei2(nextNr: string) {
            this.proxy.gameState.shunwei_one_been.push(this.proxy.gameState.seats[nextNr]);
            const Nr = +nextNr;
            this.xingdong(Nr);
        }

        //老朝奉技能
        public lcfskill() {
            this.gameScreen.lcfskill.visible = false;
            this.gameScreen.lcfskillpass.visible = false;
            this.proxy.gameState.onelcfskill = true;
            this.proxy.lcfskilltongbu();
            this.chuanshunwei();
        }

        public lcfskillpass() {
            this.gameScreen.lcfskill.visible = false;
            this.gameScreen.lcfskillpass.visible = false;
            this.chuanshunwei();
        }

        //药不然技能
        public ybrskill(){
            this.gameScreen.ybrskill.visible=false;
            this.gameScreen.ybrskillpass.visible=false;
            this.gameScreen.ybrskill1.visible=true;
            this.gameScreen.ybrskill2.visible=true;
            this.gameScreen.ybrskill3.visible=true;
            this.gameScreen.ybrskill4.visible=true;
            this.gameScreen.ybrskill5.visible=true;
            this.gameScreen.ybrskill6.visible=true;
            this.gameScreen.ybrskill7.visible=true;
            this.gameScreen.ybrskill8.visible=true;
            if (!this.proxy.gameState.seats[1]) {
                this.gameScreen.ybrskill1.visible = false;
            }
            if (!this.proxy.gameState.seats[2]) {
                this.gameScreen.ybrskill2.visible = false;
            }
            if (!this.proxy.gameState.seats[3]) {
                this.gameScreen.ybrskill3.visible = false;
            }
            if (!this.proxy.gameState.seats[4]) {
                this.gameScreen.ybrskill4.visible = false;
            }
            if (!this.proxy.gameState.seats[5]) {
                this.gameScreen.ybrskill5.visible = false;
            }
            if (!this.proxy.gameState.seats[6]) {
                this.gameScreen.ybrskill6.visible = false;
            }
            if (!this.proxy.gameState.seats[7]) {
                this.gameScreen.ybrskill7.visible = false;
            }
            if (!this.proxy.gameState.seats[8]) {
                this.gameScreen.ybrskill8.visible = false;
            }
        }

        public ybrskillpass(){
            this.gameScreen.ybrskill.visible=false;
            this.gameScreen.ybrskillpass.visible=false;
            this.chuanshunwei();
        }

        public ybrskilling(message:string){
            const Nr= +message;
            if (this.proxy.isActorLocal(this.proxy.gameState.seats[Nr])){
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "不能对自己使用此技能");
            }else{
                this.proxy.gameState.oneybrskill=Nr;
                this.proxy.ybrskilltongbu();
            }
            this.chuanshunwei();
        }

        //方震技能
        public fangzhenskill() {
            this.gameScreen.fangzhenskill.visible = false;
            this.gameScreen.Anim1.visible = false;
            this.gameScreen.Anim2.visible = false;
            this.gameScreen.Anim3.visible = false;
            this.gameScreen.Anim4.visible = false;
            this.gameScreen.fangzhenskill1.visible = true;
            this.gameScreen.fangzhenskill2.visible = true;
            this.gameScreen.fangzhenskill3.visible = true;
            this.gameScreen.fangzhenskill4.visible = true;
            this.gameScreen.fangzhenskill5.visible = true;
            this.gameScreen.fangzhenskill6.visible = true;
            this.gameScreen.fangzhenskill7.visible = true;
            this.gameScreen.fangzhenskill8.visible = true;
            if (!this.proxy.gameState.seats[1]) {
                this.gameScreen.fangzhenskill1.visible = false;
            }
            if (!this.proxy.gameState.seats[2]) {
                this.gameScreen.fangzhenskill2.visible = false;
            }
            if (!this.proxy.gameState.seats[3]) {
                this.gameScreen.fangzhenskill3.visible = false;
            }
            if (!this.proxy.gameState.seats[4]) {
                this.gameScreen.fangzhenskill4.visible = false;
            }
            if (!this.proxy.gameState.seats[5]) {
                this.gameScreen.fangzhenskill5.visible = false;
            }
            if (!this.proxy.gameState.seats[6]) {
                this.gameScreen.fangzhenskill6.visible = false;
            }
            if (!this.proxy.gameState.seats[7]) {
                this.gameScreen.fangzhenskill7.visible = false;
            }
            if (!this.proxy.gameState.seats[8]) {
                this.gameScreen.fangzhenskill8.visible = false;
            }
        }

        public fangzhenskilling(Nr: string) {
            const Nr2= +Nr;
            if (this.proxy.isActorLocal(this.proxy.gameState.seats[Nr2])) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "不能对自己使用此技能");
            } else {
                this.fangzhenskilling2(Nr);
            }
        }

        public fangzhenskilling2(Nr: string) {
            const Nr2 = +Nr;
            //const actor: ActorModel = this.proxy.gameState.seats[Nr];
            let skilled = this.proxy.gameState.role.findIndex(xx => xx && xx.actorNr == this.proxy.gameState.seats[Nr2].actorNr);
            if (1 <= skilled && skilled <= 5) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, Nr + "号位是好人");
            } else if (6 <= skilled && skilled <= 8) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, Nr + "号位是坏人");
            }
            this.gameScreen.fangzhenskill1.visible = false;
            this.gameScreen.fangzhenskill2.visible = false;
            this.gameScreen.fangzhenskill3.visible = false;
            this.gameScreen.fangzhenskill4.visible = false;
            this.gameScreen.fangzhenskill5.visible = false;
            this.gameScreen.fangzhenskill6.visible = false;
            this.gameScreen.fangzhenskill7.visible = false;
            this.gameScreen.fangzhenskill8.visible = false;
            this.chuanshunwei();
        }

        public onegameend() {
            if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                this.gameScreen.onegameend.visible = true;
            }
        }

        public tongzhi(message: string) {
            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, message);
        }

        public onegameend2() {
            this.gameScreen.onegameend.visible = false;
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "第一轮结束，开始发言");
            this.gameScreen.onespeakend.visible = true;
        }

        public onespeakend() {
            this.gameScreen.onespeakend.visible = false;
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "开始录入票数");
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.toupiaoui);
        }

        public toupiaoui() {
            this.gameScreen.toupiao1.visible = true;
            this.gameScreen.toupiao2.visible = true;
            this.gameScreen.toupiao3.visible = true;
            this.gameScreen.toupiao4.visible = true;
            this.gameScreen.toupiao11.visible = true;
            this.gameScreen.toupiao21.visible = true;
            this.gameScreen.toupiao31.visible = true;
            this.gameScreen.toupiao41.visible = true;
            this.gameScreen.qingkong.visible = true;
            this.gameScreen.piaoshu.visible = true;
            this.gameScreen.toupiaoqueren.visible = true;
        }

        public qingkong() {
            this.baowu1 = 0;
            this.baowu2 = 0;
            this.baowu3 = 0;
            this.baowu4 = 0;
            this.gameScreen.toupiao11.text = "0";
            this.gameScreen.toupiao21.text = "0";
            this.gameScreen.toupiao31.text = "0";
            this.gameScreen.toupiao41.text = "0";
            this.gameScreen.piaoshu.text = "0/2";
            this.sypiaoshu = 2;
        }

        public baowu1: number = 0;
        public baowu2: number = 0;
        public baowu3: number = 0;
        public baowu4: number = 0;
        public sypiaoshu: number = 2;
        public toupiao(baowuNr: string) {
            if (this.sypiaoshu <= 0) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你的票数不足");
            } else {
                if (baowuNr == "1") {
                    this.baowu1++;
                    this.sypiaoshu--;
                    this.gameScreen.toupiao11.text = this.baowu1.toString();
                } else if (baowuNr == "2") {
                    this.baowu2++;
                    this.sypiaoshu--;
                    this.gameScreen.toupiao21.text = this.baowu2.toString();
                } else if (baowuNr == "3") {
                    this.baowu3++;
                    this.sypiaoshu--;
                    this.gameScreen.toupiao31.text = this.baowu3.toString();
                } else if (baowuNr == "4") {
                    this.baowu4++;
                    this.sypiaoshu--;
                    this.gameScreen.toupiao41.text = this.baowu4.toString();
                }
                this.gameScreen.piaoshu.text = this.sypiaoshu + "/2";
            }
        }

        public toupiaoqueren() {
            this.gameScreen.toupiao1.enabled = false;
            this.gameScreen.toupiao2.enabled = false;
            this.gameScreen.toupiao3.enabled = false;
            this.gameScreen.toupiao4.enabled = false;
            this.gameScreen.qingkong.enabled = false;
            this.gameScreen.toupiaoqueren.enabled = false;
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.piaoshu, "0" + this.baowu1 + "0" + this.baowu2 + "0" + this.baowu3 + "0" + this.baowu4);
        }

        public piaoshujisuan(toupiao: Array<any>) {
            if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                let i: number = 0;
                this.proxy.gameState.toupiao.forEach(element => {
                    if (element) {
                        i++;
                    }
                });
                if (i == this.roomrenshu) {
                    this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.toupiaoend);
                }
            }
        }

        public toupiaoend(message: string) {
            this.gameScreen.qingkong.visible = false;
            this.gameScreen.piaoshu.visible = false;
            this.gameScreen.toupiaoqueren.visible = false;
            this.gameScreen.onejieguo.visible = true;
            const zongpiaoshu = +message;
            this.baowu4 = zongpiaoshu % 100;
            this.baowu3 = ((zongpiaoshu - this.baowu4) / 100) % 100;
            this.baowu2 = (((zongpiaoshu - this.baowu4) / 100 - this.baowu3) / 100) % 100;
            this.baowu1 = (zongpiaoshu - this.baowu4 - (this.baowu3 * 100) - (this.baowu2 * 10000)) / 1000000;
            this.gameScreen.toupiao11.text = this.baowu1.toString();
            this.gameScreen.toupiao21.text = this.baowu2.toString();
            this.gameScreen.toupiao31.text = this.baowu3.toString();
            this.gameScreen.toupiao41.text = this.baowu4.toString();
            if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                this.gameScreen.startno2.visible = true;
            }
        }

        public startno2() {
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "第二轮开始");
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.starttwo);
        }

        public starttwo() {
            this.gameScreen.toupiao1.visible = false;
            this.gameScreen.toupiao2.visible = false;
            this.gameScreen.toupiao3.visible = false;
            this.gameScreen.toupiao4.visible = false;
            this.gameScreen.toupiao11.visible = false;
            this.gameScreen.toupiao21.visible = false;
            this.gameScreen.toupiao31.visible = false;
            this.gameScreen.toupiao41.visible = false;
            this.gameScreen.startno2.visible = false;
            this.gameScreen.onejieguo.visible = false;
        }
    }
}