

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
            GameProxy.START_TWO,
            GameProxy.ONE_YBRSKILL,
            GameProxy.ONE_ZGQSKILL,
            GameProxy.TOUREN,
            GameProxy.TOUREN_JIEGUO
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
                case GameProxy.ONE_YBRSKILL: {
                    this.ybrskilladd(data);
                    break;
                }
                case GameProxy.ONE_ZGQSKILL: {
                    break;
                }
                case GameProxy.TOUREN: {
                    this.tourenui();
                    break;
                }
                case GameProxy.TOUREN_JIEGUO: {
                    this.tourenjieguo(data);
                    break;
                }
            }
        }

        public updateGameScreen(data: GameState) {
            this.gameScreen.currentPlayers = data.players;
            this.gameScreen.maxPlayers = data.maxPlayers;

            let allValidSeats = this.proxy.gameState.seats.filter(seat => seat && seat.actorNr !== undefined);
            let allValidRoles = this.proxy.gameState.role.filter(r => r && r.actorNr != undefined);

            let isAllReady = allValidSeats.length == data.maxPlayers;
            let isAllRolesReady = allValidRoles.length == data.maxPlayers;
            let isWaiting = !isAllReady && this.proxy.gameState.seats.some(seat => seat && seat.actorNr == this.proxy.actorNr);

            switch (data.phase) {
                case GamePhase.Preparing:
                    this.gameScreen.isInitial = !isWaiting && !isAllReady;
                    this.gameScreen.isWaiting = isWaiting;
                    this.gameScreen.isAllReady = isAllReady;
                    this.gameScreen.isAllRolesReady = false;
                    this.gameScreen.canChooseSeat = !isAllReady;
                    this.gameScreen.isChoosingRole = false;
                    this.gameScreen.isChoosingRoleOrMasterClient = false;
                    this.gameScreen.isAllRolesReadyAndNormalClient = false;
                    this.gameScreen.isPhasePreparing = true;
                    this.gameScreen.isPhaseChoosingRole = false;
                    this.gameScreen.isPhaseFirstRound = false;
                    break;
                case GamePhase.ChoosingRole:
                    this.gameScreen.isInitial = false;
                    this.gameScreen.isWaiting = false;
                    this.gameScreen.isAllReady = false;
                    this.gameScreen.isAllRolesReady = isAllRolesReady;
                    this.gameScreen.canChooseSeat = false;
                    this.gameScreen.isChoosingRole = !isAllRolesReady;
                    this.gameScreen.isChoosingRoleOrMasterClient = !isAllRolesReady || this.gameScreen.isMasterClient;
                    this.gameScreen.isAllRolesReadyAndNormalClient = isAllRolesReady && this.gameScreen.isNormalClient;
                    this.gameScreen.isPhasePreparing = false;
                    this.gameScreen.isPhaseChoosingRole = true;
                    this.gameScreen.isPhaseFirstRound = false;
                    break;
                case GamePhase.FirstRound:
                    this.gameScreen.isInitial = false;
                    this.gameScreen.isWaiting = false;
                    this.gameScreen.isAllReady = false;
                    this.gameScreen.isAllRolesReady = false;
                    this.gameScreen.canChooseSeat = false;
                    this.gameScreen.isChoosingRole = false;
                    this.gameScreen.isChoosingRoleOrMasterClient = false;
                    this.gameScreen.isAllRolesReadyAndNormalClient = false;
                    this.gameScreen.isPhasePreparing = false;
                    this.gameScreen.isPhaseChoosingRole = false;
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
            this.gameScreen.ybrskill.addEventListener(egret.TouchEvent.TOUCH_TAP, this.ybrskill, this);
            this.gameScreen.ybrskillpass.addEventListener(egret.TouchEvent.TOUCH_TAP, this.ybrskillpass, this);

            this.gameScreen.ybrskill1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("1") }), this);
            this.gameScreen.ybrskill2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("2") }), this);
            this.gameScreen.ybrskill3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("3") }), this);
            this.gameScreen.ybrskill4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("4") }), this);
            this.gameScreen.ybrskill5.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("5") }), this);
            this.gameScreen.ybrskill6.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("6") }), this);
            this.gameScreen.ybrskill7.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("7") }), this);
            this.gameScreen.ybrskill8.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("8") }), this);

            this.gameScreen.zgqskill.addEventListener(egret.TouchEvent.TOUCH_TAP, this.zgqskill, this);
            this.gameScreen.zgqskillpass.addEventListener(egret.TouchEvent.TOUCH_TAP, this.zgqskillpass, this);
            this.gameScreen.zgqskill1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.zgqskilling("0") }), this);
            this.gameScreen.zgqskill2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.zgqskilling("1") }), this);
            this.gameScreen.zgqskill3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.zgqskilling("2") }), this);
            this.gameScreen.zgqskill4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.zgqskilling("3") }), this);
            this.gameScreen.Anim5.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("4") }), this);
            this.gameScreen.Anim6.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("5") }), this);
            this.gameScreen.Anim7.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("6") }), this);
            this.gameScreen.Anim8.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("7") }), this);
            this.gameScreen.Anim9.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("8") }), this);
            this.gameScreen.Anim10.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("9") }), this);
            this.gameScreen.Anim11.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("10") }), this);
            this.gameScreen.Anim12.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseAnim("11") }), this);
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
        public touxiang(seats: Array<ActorModel>) {

            const seatConfig = {
                "1": { controlName: "btnSeat1", defaultSource: "color-black" },
                "2": { controlName: "btnSeat2", defaultSource: "color-blue" },
                "3": { controlName: "btnSeat3", defaultSource: "color-green" },
                "4": { controlName: "btnSeat4", defaultSource: "color-orange" },
                "5": { controlName: "btnSeat5", defaultSource: "color-purple" },
                "6": { controlName: "btnSeat6", defaultSource: "color-red" },
                "7": { controlName: "btnSeat7", defaultSource: "color-white" },
                "8": { controlName: "btnSeat8", defaultSource: "color-yellow" },
            };

            seats.forEach((seat, index) => {
                if (!seatConfig[index]) {
                    return;
                }
                const config = seatConfig[index];
                const control = this.gameScreen[config.controlName];
                let content = control.getChildByName("content") as eui.Image;
                let nickName = control.getChildByName("nickName") as eui.Label;
                let normalBg = control.getChildByName("normalBg") as eui.Image;
                let masterBg = control.getChildByName("masterBg") as eui.Image;
                let selfMark = control.getChildByName("selfMark") as eui.Image;

                if (seats[index]) {
                    content.source = seats[index].avatarUrl || config.defaultSource;
                    nickName.text = seats[index].name || "blank name";
                    masterBg.visible = this.proxy.isActorMaster(seats[index]);
                    normalBg.visible = !masterBg.visible;
                    selfMark.visible = this.proxy.isActorLocal(seats[index]);
                    content.visible = true;
                    nickName.visible = true;
                }
                else {
                    normalBg.visible = true;
                    masterBg.visible = false;
                    selfMark.visible = false;
                    content.visible = false;
                    nickName.visible = false;
                }
            });
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
                console.log(this.proxy.gameState.baowulist);
                console.log(this.proxy.gameState.onezj);
                console.log(this.proxy.gameState.twozj);
                console.log(this.proxy.gameState.threezj);
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

            const animConfig = [
                { controlName: "Anim1", index: 0 },
                { controlName: "Anim2", index: 1 },
                { controlName: "Anim3", index: 2 },
                { controlName: "Anim4", index: 3 },
            ];

            animConfig.forEach(anim => {
                const animName = this.proxy.gameState.baowulist[anim.index];
                const antiqueObject = this.proxy.antiquesMap.get(animName);
                let control = this.gameScreen[anim.controlName] as eui.Button;
                let image = control.getChildByName("antique-content") as eui.Image;
                image.source = antiqueObject.source;
                let label = control.getChildByName("antique-label") as eui.Label;
                label.text = antiqueObject.name;
            });

            const firstoneNr = +message;
            this.proxy.gameState.shunwei_one_been[1] = this.proxy.gameState.seats[firstoneNr];
            this.xingdong(firstoneNr);
        }

        public xingdong(message: number) {
            if (this.proxy.isActorLocal(this.proxy.gameState.seats[message])) {
                if (this.proxy.gameState.lunci == 1) {
                    this.gameScreen.Anim1.visible = true;
                    this.gameScreen.Anim2.visible = true;
                    this.gameScreen.Anim3.visible = true;
                    this.gameScreen.Anim4.visible = true;
                } else if (this.proxy.gameState.lunci == 2) {
                    this.gameScreen.Anim5.visible = true;
                    this.gameScreen.Anim6.visible = true;
                    this.gameScreen.Anim7.visible = true;
                    this.gameScreen.Anim8.visible = true;
                } else if (this.proxy.gameState.lunci == 3) {
                    this.gameScreen.Anim9.visible = true;
                    this.gameScreen.Anim10.visible = true;
                    this.gameScreen.Anim11.visible = true;
                    this.gameScreen.Anim12.visible = true;
                }
                //方震技能
                if (this.proxy.isActorLocal(this.proxy.gameState.role[2])) {
                    this.gameScreen.Anim1.enabled = false;
                    this.gameScreen.Anim2.enabled = false;
                    this.gameScreen.Anim3.enabled = false;
                    this.gameScreen.Anim4.enabled = false;
                    this.gameScreen.Anim5.enabled = false;
                    this.gameScreen.Anim6.enabled = false;
                    this.gameScreen.Anim7.enabled = false;
                    this.gameScreen.Anim8.enabled = false;
                    this.gameScreen.Anim9.enabled = false;
                    this.gameScreen.Anim10.enabled = false;
                    this.gameScreen.Anim11.enabled = false;
                    this.gameScreen.Anim12.enabled = false;
                    this.gameScreen.fangzhenskill.visible = true;
                }
            }
        }

        public ybrskill1: number = 0;
        public ybrskill2: number = 0;
        public ybrskill3: number = 0;
        public ybrskill4: number = 0;
        public ybrskill5: number = 0;
        public ybrskill6: number = 0;
        public ybrskill8: number = 0;
        public ybrskilladd(message: number) {
            if (this.proxy.gameState.role[1] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[1].actorNr) {
                this.ybrskill1++;
            } else if (this.proxy.gameState.role[2] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[2].actorNr) {
                this.ybrskill2++;
                this.ybrskill1++;
            } else if (this.proxy.gameState.role[3] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[3].actorNr) {
                this.ybrskill3++;
            } else if (this.proxy.gameState.role[4] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[4].actorNr) {
                this.ybrskill4++;
            } else if (this.proxy.gameState.role[5] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[5].actorNr) {
                this.ybrskill5++;
            } else if (this.proxy.gameState.role[6] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[6].actorNr) {
                this.ybrskill6++;
            } else if (this.proxy.gameState.role[8] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[8].actorNr) {
                this.ybrskill8++;
            }
        }

        public AnimVis() {
            this.gameScreen.Anim1.visible = false;
            this.gameScreen.Anim2.visible = false;
            this.gameScreen.Anim3.visible = false;
            this.gameScreen.Anim4.visible = false;
            this.gameScreen.Anim5.visible = false;
            this.gameScreen.Anim6.visible = false;
            this.gameScreen.Anim7.visible = false;
            this.gameScreen.Anim8.visible = false;
            this.gameScreen.Anim9.visible = false;
            this.gameScreen.Anim10.visible = false;
            this.gameScreen.Anim11.visible = false;
            this.gameScreen.Anim12.visible = false;
        }

        public xuyuanjineng: number = 0;
        public frist: number = 100;
        public chooseAnim(message: string) {
            const Nr = +message;
            //许愿技能
            if (this.proxy.isActorLocal(this.proxy.gameState.role[1])) {
                if (this.ybrskill1 > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.ybrskill1--;
                    this.AnimVis();
                    this.chuanshunwei();
                } else {
                    if (this.xuyuanjineng == 0) {
                        if (Nr == 0) {
                            this.gameScreen.Anim1.enabled = false;
                        } else if (Nr == 1) {
                            this.gameScreen.Anim2.enabled = false;
                        } else if (Nr == 2) {
                            this.gameScreen.Anim3.enabled = false;
                        } else if (Nr == 3) {
                            this.gameScreen.Anim4.enabled = false;
                        } else if (Nr == 4) {
                            this.gameScreen.Anim5.enabled = false;
                        } else if (Nr == 5) {
                            this.gameScreen.Anim6.enabled = false;
                        } else if (Nr == 6) {
                            this.gameScreen.Anim7.enabled = false;
                        } else if (Nr == 7) {
                            this.gameScreen.Anim8.enabled = false;
                        } else if (Nr == 8) {
                            this.gameScreen.Anim9.enabled = false;
                        } else if (Nr == 9) {
                            this.gameScreen.Anim10.enabled = false;
                        } else if (Nr == 10) {
                            this.gameScreen.Anim11.enabled = false;
                        } else if (Nr == 11) {
                            this.gameScreen.Anim12.enabled = false;
                        }
                        this.xuyuanjineng++;
                        this.frist = Nr;
                    } else if (this.xuyuanjineng == 1) {
                        let skilled1: string;
                        let skilled2: string;
                        if (this.proxy.gameState.lunci == 1) {
                            if (this.proxy.gameState.onelcfskill) {
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
                                if (this.proxy.gameState.onezgqskill == this.frist) {
                                    skilled1 = "你无法鉴定此宝物";
                                }
                                if (this.proxy.gameState.onezgqskill == Nr) {
                                    skilled2 = "你无法鉴定此宝物";
                                }
                                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[this.frist] + "”" + " 是 " + skilled1 + "   " + "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled2)
                            } else {
                                skilled1 = this.proxy.gameState.onezj[this.frist];
                                skilled2 = this.proxy.gameState.onezj[Nr];
                                if (this.proxy.gameState.onezgqskill == this.frist) {
                                    skilled1 = "你无法鉴定此宝物";
                                }
                                if (this.proxy.gameState.onezgqskill == Nr) {
                                    skilled2 = "你无法鉴定此宝物";
                                }
                                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[this.frist] + "”" + " 是 " + skilled1 + "   " + "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled2);
                            }
                        } else if (this.proxy.gameState.lunci == 2) {
                            if (this.proxy.gameState.twolcfskill) {
                                if (this.proxy.gameState.twozj[this.frist - 4] == "真") {
                                    skilled1 = "假";
                                } else {
                                    skilled1 = "真";
                                }
                                if (this.proxy.gameState.twozj[Nr - 4] == "真") {
                                    skilled2 = "假";
                                } else {
                                    skilled2 = "真";
                                }
                                if (this.proxy.gameState.twozgqskill == this.frist - 4) {
                                    skilled1 = "你无法鉴定此宝物";
                                }
                                if (this.proxy.gameState.twozgqskill == Nr - 4) {
                                    skilled2 = "你无法鉴定此宝物";
                                }
                                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[this.frist] + "”" + " 是 " + skilled1 + "   " + "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled2)
                            } else {
                                skilled1 = this.proxy.gameState.twozj[this.frist - 4];
                                skilled2 = this.proxy.gameState.twozj[Nr - 4];
                                if (this.proxy.gameState.twozgqskill == this.frist - 4) {
                                    skilled1 = "你无法鉴定此宝物";
                                }
                                if (this.proxy.gameState.twozgqskill == Nr - 4) {
                                    skilled2 = "你无法鉴定此宝物";
                                }
                                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[this.frist] + "”" + " 是 " + skilled1 + "   " + "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled2);
                            }
                        } else if (this.proxy.gameState.lunci == 3) {
                            if (this.proxy.gameState.threelcfskill) {
                                if (this.proxy.gameState.threezj[this.frist - 8] == "真") {
                                    skilled1 = "假";
                                } else {
                                    skilled1 = "真";
                                }
                                if (this.proxy.gameState.threezj[Nr - 8] == "真") {
                                    skilled2 = "假";
                                } else {
                                    skilled2 = "真";
                                }
                                if (this.proxy.gameState.threezgqskill == this.frist - 8) {
                                    skilled1 = "你无法鉴定此宝物";
                                }
                                if (this.proxy.gameState.threezgqskill == Nr - 8) {
                                    skilled2 = "你无法鉴定此宝物";
                                }
                                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[this.frist] + "”" + " 是 " + skilled1 + "   " + "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled2)
                            } else {
                                skilled1 = this.proxy.gameState.threezj[this.frist - 8];
                                skilled2 = this.proxy.gameState.threezj[Nr - 8];
                                if (this.proxy.gameState.threezgqskill == this.frist - 8) {
                                    skilled1 = "你无法鉴定此宝物";
                                }
                                if (this.proxy.gameState.threezgqskill == Nr - 8) {
                                    skilled2 = "你无法鉴定此宝物";
                                }
                                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[this.frist] + "”" + " 是 " + skilled1 + "   " + "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled2);
                            }
                        }
                        this.AnimVis();
                        this.chuanshunwei();
                        this.xuyuanjineng = 0;
                    }
                }
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[3])) {
                if (this.ybrskill3 > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.ybrskill3--;
                } else {
                    if (this.proxy.gameState.lunci == 1) {
                        if (this.proxy.gameState.onezgqskill == Nr) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.onezj[Nr]);
                        }
                    } else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twozgqskill == Nr - 4) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.twozj[Nr - 4]);
                        }
                    } else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threezgqskill == Nr - 8) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.threezj[Nr - 8]);
                        }
                    }
                }
                this.AnimVis();
                console.log(this.proxy.gameState.lunci);
                this.chuanshunwei();
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[4])) {
                if (this.ybrskill4 > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.ybrskill4--;
                } else if (this.proxy.gameState.hyyskill == 1 && this.proxy.gameState.lunci == 1) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                } else if (this.proxy.gameState.hyyskill == 2 && this.proxy.gameState.lunci == 2) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                } else if (this.proxy.gameState.hyyskill == 3 && this.proxy.gameState.lunci == 3) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                } else {
                    if (this.proxy.gameState.lunci == 1) {
                        if (this.proxy.gameState.onezgqskill == Nr) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else if (this.proxy.gameState.onelcfskill) {
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
                    } else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twozgqskill == Nr - 4) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else if (this.proxy.gameState.twolcfskill) {
                            let skilled: string;
                            if (this.proxy.gameState.twozj[Nr - 4] == "真") {
                                skilled = "假";
                            } else {
                                skilled = "真";
                            }
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled);
                        } else {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.twozj[Nr - 4]);
                        }
                    } else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threezgqskill == Nr - 8) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else if (this.proxy.gameState.threelcfskill) {
                            let skilled: string;
                            if (this.proxy.gameState.threezj[Nr - 8] == "真") {
                                skilled = "假";
                            } else {
                                skilled = "真";
                            }
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled);
                        } else {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.threezj[Nr - 8]);
                        }
                    }
                }
                this.AnimVis();
                this.chuanshunwei();
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[5])) {
                if (this.ybrskill5 > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.ybrskill5--;
                } else if (this.proxy.gameState.mhjnskill == 1 && this.proxy.gameState.lunci == 1) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                } else if (this.proxy.gameState.mhjnskill == 2 && this.proxy.gameState.lunci == 2) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                } else if (this.proxy.gameState.mhjnskill == 3 && this.proxy.gameState.lunci == 3) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                } else {
                    if (this.proxy.gameState.lunci == 1) {
                        if (this.proxy.gameState.onezgqskill == Nr) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else if (this.proxy.gameState.onelcfskill) {
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
                    } else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twozgqskill == Nr - 4) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else if (this.proxy.gameState.twolcfskill) {
                            let skilled: string;
                            if (this.proxy.gameState.twozj[Nr - 4] == "真") {
                                skilled = "假";
                            } else {
                                skilled = "真";
                            }
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled);
                        } else {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.twozj[Nr - 4]);
                        }
                    } else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threezgqskill == Nr - 8) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else if (this.proxy.gameState.threelcfskill) {
                            let skilled: string;
                            if (this.proxy.gameState.threezj[Nr - 8] == "真") {
                                skilled = "假";
                            } else {
                                skilled = "真";
                            }
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + skilled);
                        } else {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.threezj[Nr - 8]);
                        }
                    }
                }
                this.AnimVis();
                this.chuanshunwei();
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[6])) {
                if (this.ybrskill6 > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.ybrskill6--;
                    this.chuanshunwei();
                } else {
                    if (this.proxy.gameState.lunci == 1) {
                        if (this.proxy.gameState.onezgqskill == Nr) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.onezj[Nr]);
                        }
                    } else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twozgqskill == Nr - 4) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.twozj[Nr - 4]);
                        }
                    } else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threezgqskill == Nr - 8) {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                        } else {
                            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.threezj[Nr - 8]);
                        }
                    }
                    this.gameScreen.lcfskill.visible = true;
                    this.gameScreen.lcfskillpass.visible = true;
                }
                this.AnimVis();
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[7])) {
                if (this.proxy.gameState.lunci == 1) {
                    if (this.proxy.gameState.onezgqskill == Nr) {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                    } else {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.onezj[Nr]);
                    }
                } else if (this.proxy.gameState.lunci == 2) {
                    if (this.proxy.gameState.twozgqskill == Nr - 4) {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                    } else {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.twozj[Nr - 4]);
                    }
                } else if (this.proxy.gameState.lunci == 3) {
                    if (this.proxy.gameState.threezgqskill == Nr - 8) {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                    } else {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.threezj[Nr - 8]);
                    }
                }
                this.AnimVis();
                this.gameScreen.ybrskill.visible = true;
                this.gameScreen.ybrskillpass.visible = true;
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[8])) {
                if (this.ybrskill8 > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.ybrskill8--;
                    this.chuanshunwei();
                } else {
                    if (this.proxy.gameState.lunci == 1) {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.onezj[Nr]);
                    } else if (this.proxy.gameState.lunci == 2) {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.twozj[Nr - 4]);
                    } else if (this.proxy.gameState.lunci == 3) {
                        this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "“" + this.proxy.gameState.baowulist[Nr] + "”" + " 是 " + this.proxy.gameState.threezj[Nr - 8]);
                    }
                    this.gameScreen.zgqskill.visible = true;
                    this.gameScreen.zgqskillpass.visible = true;
                }
                this.AnimVis();
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
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.shunwei_one_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[1]) {
                            this.gameScreen.shunwei1.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.shunwei_two_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[1]) {
                            this.gameScreen.shunwei1.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.shunwei_three_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[1]) {
                            this.gameScreen.shunwei1.visible = false;
                        }
                    });
                }
            } else {
                this.gameScreen.shunwei1.visible = false;
            }
            if (this.proxy.gameState.seats[2]) {
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.shunwei_one_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[2]) {
                            this.gameScreen.shunwei2.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.shunwei_two_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[2]) {
                            this.gameScreen.shunwei2.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.shunwei_three_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[2]) {
                            this.gameScreen.shunwei2.visible = false;
                        }
                    });
                }
            } else {
                this.gameScreen.shunwei2.visible = false;
            }
            if (this.proxy.gameState.seats[3]) {
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.shunwei_one_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[3]) {
                            this.gameScreen.shunwei3.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.shunwei_two_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[3]) {
                            this.gameScreen.shunwei3.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.shunwei_three_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[3]) {
                            this.gameScreen.shunwei3.visible = false;
                        }
                    });
                }
            } else {
                this.gameScreen.shunwei3.visible = false;
            }
            if (this.proxy.gameState.seats[4]) {
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.shunwei_one_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[4]) {
                            this.gameScreen.shunwei4.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.shunwei_two_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[4]) {
                            this.gameScreen.shunwei4.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.shunwei_three_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[4]) {
                            this.gameScreen.shunwei4.visible = false;
                        }
                    });
                }
            } else {
                this.gameScreen.shunwei4.visible = false;
            }
            if (this.proxy.gameState.seats[5]) {
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.shunwei_one_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[5]) {
                            this.gameScreen.shunwei5.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.shunwei_two_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[5]) {
                            this.gameScreen.shunwei5.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.shunwei_three_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[5]) {
                            this.gameScreen.shunwei5.visible = false;
                        }
                    });
                }
            } else {
                this.gameScreen.shunwei5.visible = false;
            }
            if (this.proxy.gameState.seats[6]) {
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.shunwei_one_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[6]) {
                            this.gameScreen.shunwei6.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.shunwei_two_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[6]) {
                            this.gameScreen.shunwei6.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.shunwei_three_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[6]) {
                            this.gameScreen.shunwei6.visible = false;
                        }
                    });
                }
            } else {
                this.gameScreen.shunwei6.visible = false;
            }
            if (this.proxy.gameState.seats[7]) {
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.shunwei_one_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[7]) {
                            this.gameScreen.shunwei7.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.shunwei_two_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[7]) {
                            this.gameScreen.shunwei7.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.shunwei_three_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[7]) {
                            this.gameScreen.shunwei7.visible = false;
                        }
                    });
                }
            } else {
                this.gameScreen.shunwei7.visible = false;
            }
            if (this.proxy.gameState.seats[8]) {
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.shunwei_one_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[8]) {
                            this.gameScreen.shunwei8.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.shunwei_two_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[8]) {
                            this.gameScreen.shunwei8.visible = false;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.shunwei_three_been.forEach(element => {
                        if (element == this.proxy.gameState.seats[8]) {
                            this.gameScreen.shunwei8.visible = false;
                        }
                    });
                }
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
            if (this.proxy.gameState.lunci == 99) {
                this.gameScreen.onejieguo.visible = false;
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tourenjieguo, nextNr);
            } else {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.nextNr, nextNr);
            }
        }

        public shunwei2(nextNr: string) {
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.gameState.shunwei_one_been.push(this.proxy.gameState.seats[nextNr]);
                const Nr = +nextNr;
                this.xingdong(Nr);
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.gameState.shunwei_two_been.push(this.proxy.gameState.seats[nextNr]);
                const Nr = +nextNr;
                this.xingdong(Nr);
            } else if (this.proxy.gameState.lunci == 3) {
                this.proxy.gameState.shunwei_three_been.push(this.proxy.gameState.seats[nextNr]);
                const Nr = +nextNr;
                this.xingdong(Nr);
            }

        }

        //老朝奉技能
        public lcfskill() {
            this.gameScreen.lcfskill.visible = false;
            this.gameScreen.lcfskillpass.visible = false;
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.onelcftongbu);
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.twolcftongbu);
            } else if (this.proxy.gameState.lunci == 3) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.threelcftongbu);
            }
            this.chuanshunwei();
        }

        public lcfskillpass() {
            this.gameScreen.lcfskill.visible = false;
            this.gameScreen.lcfskillpass.visible = false;
            this.chuanshunwei();
        }

        //药不然技能
        public ybrskill() {
            this.gameScreen.ybrskill.visible = false;
            this.gameScreen.ybrskillpass.visible = false;
            this.gameScreen.ybrskill1.visible = true;
            this.gameScreen.ybrskill2.visible = true;
            this.gameScreen.ybrskill3.visible = true;
            this.gameScreen.ybrskill4.visible = true;
            this.gameScreen.ybrskill5.visible = true;
            this.gameScreen.ybrskill6.visible = true;
            this.gameScreen.ybrskill7.visible = true;
            this.gameScreen.ybrskill8.visible = true;
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

        public ybrskillpass() {
            this.gameScreen.ybrskill.visible = false;
            this.gameScreen.ybrskillpass.visible = false;
            this.chuanshunwei();
        }

        public ybrskilling(message: string) {
            const Nr = +message;
            if (this.proxy.isActorLocal(this.proxy.gameState.seats[Nr])) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "不能对自己使用此技能");
            } else {
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.oneybrtongbu, message);
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.twoybrtongbu, message);
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.threeybrtongbu, message);
                }
                this.gameScreen.ybrskill1.visible = false;
                this.gameScreen.ybrskill2.visible = false;
                this.gameScreen.ybrskill3.visible = false;
                this.gameScreen.ybrskill4.visible = false;
                this.gameScreen.ybrskill5.visible = false;
                this.gameScreen.ybrskill6.visible = false;
                this.gameScreen.ybrskill7.visible = false;
                this.gameScreen.ybrskill8.visible = false;
                this.chuanshunwei();
            }
        }

        //郑国渠技能
        public zgqskill() {
            this.gameScreen.zgqskill.visible = false;
            this.gameScreen.zgqskillpass.visible = false;
            this.gameScreen.zgqskill1.visible = true;
            this.gameScreen.zgqskill2.visible = true;
            this.gameScreen.zgqskill3.visible = true;
            this.gameScreen.zgqskill4.visible = true;
            if (this.proxy.gameState.lunci == 1) {
                this.gameScreen.zgqskill1.label = this.proxy.gameState.baowulist[0];
                this.gameScreen.zgqskill2.label = this.proxy.gameState.baowulist[1];
                this.gameScreen.zgqskill3.label = this.proxy.gameState.baowulist[2];
                this.gameScreen.zgqskill4.label = this.proxy.gameState.baowulist[3];
            } else if (this.proxy.gameState.lunci == 2) {
                this.gameScreen.zgqskill1.label = this.proxy.gameState.baowulist[4];
                this.gameScreen.zgqskill2.label = this.proxy.gameState.baowulist[5];
                this.gameScreen.zgqskill3.label = this.proxy.gameState.baowulist[6];
                this.gameScreen.zgqskill4.label = this.proxy.gameState.baowulist[7];
            } else if (this.proxy.gameState.lunci == 3) {
                this.gameScreen.zgqskill1.label = this.proxy.gameState.baowulist[8];
                this.gameScreen.zgqskill2.label = this.proxy.gameState.baowulist[9];
                this.gameScreen.zgqskill3.label = this.proxy.gameState.baowulist[10];
                this.gameScreen.zgqskill4.label = this.proxy.gameState.baowulist[11];
            }
        }

        public zgqskillpass() {
            this.gameScreen.zgqskill.visible = false;
            this.gameScreen.zgqskillpass.visible = false;
            this.chuanshunwei();
        }

        public zgqskilling(message: string) {
            this.gameScreen.zgqskill1.visible = false;
            this.gameScreen.zgqskill2.visible = false;
            this.gameScreen.zgqskill3.visible = false;
            this.gameScreen.zgqskill4.visible = false;
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.onezgqtongbu, message);
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.twozgqtongbu, message);
            } else if (this.proxy.gameState.lunci == 3) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.threezgqtongbu, message);
            }
            this.chuanshunwei();
        }

        //方震技能
        public fangzhenskill() {
            this.gameScreen.fangzhenskill.visible = false;
            this.AnimVis();
            if (this.ybrskill2 > 0) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                this.ybrskill2--;
                this.chuanshunwei();
            } else {
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
        }

        public fangzhenskilling(Nr: string) {
            const Nr2 = +Nr;
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
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "第一轮结束，开始发言");
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "第二轮结束，开始发言");
            } else if (this.proxy.gameState.lunci == 3) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "第三轮结束，开始发言");
            }
            this.gameScreen.onespeakend.visible = true;
        }

        public onespeakend() {
            this.gameScreen.onespeakend.visible = false;
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "开始录入票数");
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.toupiaoui);
        }

        public toupiaoui() {
            this.gameScreen.toupiao1.enabled = true;
            this.gameScreen.toupiao2.enabled = true;
            this.gameScreen.toupiao3.enabled = true;
            this.gameScreen.toupiao4.enabled = true;
            this.gameScreen.qingkong.enabled = true;
            this.gameScreen.toupiaoqueren.enabled = true;
            this.gameScreen.toupiao1.visible = true;
            this.gameScreen.toupiao2.visible = true;
            this.gameScreen.toupiao3.visible = true;
            this.gameScreen.toupiao4.visible = true;
            if (this.proxy.gameState.lunci == 1) {
                this.gameScreen.toupiao1.label = this.proxy.gameState.baowulist[0];
                this.gameScreen.toupiao2.label = this.proxy.gameState.baowulist[1];
                this.gameScreen.toupiao3.label = this.proxy.gameState.baowulist[2];
                this.gameScreen.toupiao4.label = this.proxy.gameState.baowulist[3];
                this.zongpiaoshu = 2;
                this.sypiaoshu = 2;
                this.muqianpiaoshu = 2;
            } else if (this.proxy.gameState.lunci == 2) {
                this.gameScreen.toupiao1.label = this.proxy.gameState.baowulist[4];
                this.gameScreen.toupiao2.label = this.proxy.gameState.baowulist[5];
                this.gameScreen.toupiao3.label = this.proxy.gameState.baowulist[6];
                this.gameScreen.toupiao4.label = this.proxy.gameState.baowulist[7];
                this.zongpiaoshu = 4;
                this.sypiaoshu += 2;
                this.muqianpiaoshu += 2;
            } else if (this.proxy.gameState.lunci == 3) {
                this.gameScreen.toupiao1.label = this.proxy.gameState.baowulist[8];
                this.gameScreen.toupiao2.label = this.proxy.gameState.baowulist[9];
                this.gameScreen.toupiao3.label = this.proxy.gameState.baowulist[10];
                this.gameScreen.toupiao4.label = this.proxy.gameState.baowulist[11];
                this.zongpiaoshu = 6;
                this.sypiaoshu += 2;
                this.muqianpiaoshu += 2;
            }
            this.gameScreen.toupiao11.visible = true;
            this.gameScreen.toupiao21.visible = true;
            this.gameScreen.toupiao31.visible = true;
            this.gameScreen.toupiao41.visible = true;
            this.gameScreen.toupiao11.text = "0";
            this.gameScreen.toupiao21.text = "0";
            this.gameScreen.toupiao31.text = "0";
            this.gameScreen.toupiao41.text = "0";
            this.baowu1 = 0;
            this.baowu2 = 0;
            this.baowu3 = 0;
            this.baowu4 = 0;
            this.gameScreen.qingkong.visible = true;

            this.gameScreen.piaoshu.visible = true;
            this.gameScreen.toupiaoqueren.visible = true;
            this.gameScreen.piaoshu.text = this.muqianpiaoshu + "/" + this.zongpiaoshu;
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
            this.muqianpiaoshu = this.sypiaoshu;
            this.gameScreen.piaoshu.text = this.muqianpiaoshu + "/" + this.zongpiaoshu;

        }

        public baowu1: number = 0;
        public baowu2: number = 0;
        public baowu3: number = 0;
        public baowu4: number = 0;
        public sypiaoshu: number = 0;
        public muqianpiaoshu: number = 0;
        public zongpiaoshu: number = 0;
        public toupiao(baowuNr: string) {
            if (this.muqianpiaoshu <= 0) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你的票数不足");
            } else {
                if (baowuNr == "1") {
                    this.baowu1++;
                    this.muqianpiaoshu--;
                    this.gameScreen.toupiao11.text = this.baowu1.toString();
                } else if (baowuNr == "2") {
                    this.baowu2++;
                    this.muqianpiaoshu--;
                    this.gameScreen.toupiao21.text = this.baowu2.toString();
                } else if (baowuNr == "3") {
                    this.baowu3++;
                    this.muqianpiaoshu--;
                    this.gameScreen.toupiao31.text = this.baowu3.toString();
                } else if (baowuNr == "4") {
                    this.baowu4++;
                    this.muqianpiaoshu--;
                    this.gameScreen.toupiao41.text = this.baowu4.toString();
                }
                this.gameScreen.piaoshu.text = this.muqianpiaoshu + "/" + this.zongpiaoshu;
            }
        }

        public toupiaoqueren() {
            this.sypiaoshu = this.muqianpiaoshu;
            this.gameScreen.toupiao1.enabled = false;
            this.gameScreen.toupiao2.enabled = false;
            this.gameScreen.toupiao3.enabled = false;
            this.gameScreen.toupiao4.enabled = false;
            this.gameScreen.qingkong.enabled = false;
            this.gameScreen.toupiaoqueren.enabled = false;
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.piaoshu, "0" + this.baowu1 + "0" + this.baowu2 + "0" + this.baowu3 + "0" + this.baowu4);
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.piaoshu2, "0" + this.baowu1 + "0" + this.baowu2 + "0" + this.baowu3 + "0" + this.baowu4);
            } else if (this.proxy.gameState.lunci == 3) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.piaoshu3, "0" + this.baowu1 + "0" + this.baowu2 + "0" + this.baowu3 + "0" + this.baowu4);
            }

        }

        public piaoshujisuan(toupiao: Array<any>) {
            if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                let i: number = 0;
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.toupiao.forEach(element => {
                        if (element) {
                            i++;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.toupiao2.forEach(element => {
                        if (element) {
                            i++;
                        }
                    });
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.toupiao3.forEach(element => {
                        if (element) {
                            i++;
                        }
                    });
                }
                if (i == this.roomrenshu) {
                    if (this.proxy.gameState.lunci == 1) {
                        this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.toupiaoend);
                    } else if (this.proxy.gameState.lunci == 2) {
                        this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.toupiaoend2);
                    } else if (this.proxy.gameState.lunci == 3) {
                        this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.toupiaoend3);
                    }
                }
            }
        }

        public baowu1_sx: number;
        public baowu2_sx: number;
        public baowu3_sx: number;
        public baowu4_sx: number;
        public toupiaoend(message: string) {
            this.gameScreen.qingkong.visible = false;
            this.gameScreen.piaoshu.visible = false;
            this.gameScreen.toupiaoqueren.visible = false;
            this.gameScreen.onejieguo.visible = true;
            if (this.proxy.gameState.lunci == 2) {
                this.gameScreen.startno2.label = "开始第三轮";
                this.gameScreen.onejieguo.text = "第二轮结果";
            } else if (this.proxy.gameState.lunci == 3) {
                this.gameScreen.startno2.label = "开始投人环节";
                this.gameScreen.onejieguo.text = "第三轮结果";
            }
            const zongpiaoshu = +message;
            this.baowu4 = zongpiaoshu % 100;
            this.baowu3 = ((zongpiaoshu - this.baowu4) / 100) % 100;
            this.baowu2 = (((zongpiaoshu - this.baowu4) / 100 - this.baowu3) / 100) % 100;
            this.baowu1 = (zongpiaoshu - this.baowu4 - (this.baowu3 * 100) - (this.baowu2 * 10000)) / 1000000;
            this.gameScreen.toupiao11.text = this.baowu1.toString();
            this.gameScreen.toupiao21.text = this.baowu2.toString();
            this.gameScreen.toupiao31.text = this.baowu3.toString();
            this.gameScreen.toupiao41.text = this.baowu4.toString();

            if (this.proxy.gameState.lunci == 1) {
                this.baowu1_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[0]);
                this.baowu2_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[1]);
                this.baowu3_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[2]);
                this.baowu4_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[3]);
                this.proxy.gameState.toupiaojieguo1[0] = { baowu: this.proxy.gameState.baowulist[0], piaoshu: this.baowu1, sx: this.baowu1_sx, zhenjia: this.proxy.gameState.onezj[0] };
                this.proxy.gameState.toupiaojieguo1[1] = { baowu: this.proxy.gameState.baowulist[1], piaoshu: this.baowu2, sx: this.baowu2_sx, zhenjia: this.proxy.gameState.onezj[1] };
                this.proxy.gameState.toupiaojieguo1[2] = { baowu: this.proxy.gameState.baowulist[2], piaoshu: this.baowu3, sx: this.baowu3_sx, zhenjia: this.proxy.gameState.onezj[2] };
                this.proxy.gameState.toupiaojieguo1[3] = { baowu: this.proxy.gameState.baowulist[3], piaoshu: this.baowu4, sx: this.baowu4_sx, zhenjia: this.proxy.gameState.onezj[3] };
                this.proxy.gameState.toupiaojieguo1 = _(this.proxy.gameState.toupiaojieguo1).orderBy(["piaoshu", "sx"], ["desc", "asc"]).value();
                console.log(this.proxy.gameState.toupiaojieguo1);
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "第一名: " + this.proxy.gameState.toupiaojieguo1[0].baowu + "   第二名 :" + this.proxy.gameState.toupiaojieguo1[1].baowu + "  " + this.proxy.gameState.toupiaojieguo1[1].zhenjia);

                //this.proxy.gameState.toupiao[1]%100

                if (this.proxy.gameState.toupiaojieguo1[0].zhenjia == "真") {
                    this.proxy.gameState.defen++;
                }
                if (this.proxy.gameState.toupiaojieguo1[1].zhenjia == "真") {
                    this.proxy.gameState.defen++;
                }
            } else if (this.proxy.gameState.lunci == 2) {
                this.baowu1_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[4]);
                this.baowu2_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[5]);
                this.baowu3_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[6]);
                this.baowu4_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[7]);
                this.proxy.gameState.toupiaojieguo2[0] = { baowu: this.proxy.gameState.baowulist[4], piaoshu: this.baowu1, sx: this.baowu1_sx, zhenjia: this.proxy.gameState.twozj[0] };
                this.proxy.gameState.toupiaojieguo2[1] = { baowu: this.proxy.gameState.baowulist[5], piaoshu: this.baowu2, sx: this.baowu2_sx, zhenjia: this.proxy.gameState.twozj[1] };
                this.proxy.gameState.toupiaojieguo2[2] = { baowu: this.proxy.gameState.baowulist[6], piaoshu: this.baowu3, sx: this.baowu3_sx, zhenjia: this.proxy.gameState.twozj[2] };
                this.proxy.gameState.toupiaojieguo2[3] = { baowu: this.proxy.gameState.baowulist[7], piaoshu: this.baowu4, sx: this.baowu4_sx, zhenjia: this.proxy.gameState.twozj[3] };
                this.proxy.gameState.toupiaojieguo2 = _(this.proxy.gameState.toupiaojieguo2).orderBy(["piaoshu", "sx"], ["desc", "asc"]).value();
                console.log(this.proxy.gameState.toupiaojieguo2);
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "第一名: " + this.proxy.gameState.toupiaojieguo2[0].baowu + "   第二名 :" + this.proxy.gameState.toupiaojieguo2[1].baowu + "  " + this.proxy.gameState.toupiaojieguo2[1].zhenjia);
                if (this.proxy.gameState.toupiaojieguo2[0].zhenjia == "真") {
                    this.proxy.gameState.defen++;
                }
                if (this.proxy.gameState.toupiaojieguo2[1].zhenjia == "真") {
                    this.proxy.gameState.defen++;
                }
            } else if (this.proxy.gameState.lunci == 3) {
                this.baowu1_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[8]);
                this.baowu2_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[9]);
                this.baowu3_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[10]);
                this.baowu4_sx = this.proxy.gameState.baowulist2.findIndex(baowu => baowu == this.proxy.gameState.baowulist[11]);
                this.proxy.gameState.toupiaojieguo3[0] = { baowu: this.proxy.gameState.baowulist[8], piaoshu: this.baowu1, sx: this.baowu1_sx, zhenjia: this.proxy.gameState.threezj[0] };
                this.proxy.gameState.toupiaojieguo3[1] = { baowu: this.proxy.gameState.baowulist[9], piaoshu: this.baowu2, sx: this.baowu2_sx, zhenjia: this.proxy.gameState.threezj[1] };
                this.proxy.gameState.toupiaojieguo3[2] = { baowu: this.proxy.gameState.baowulist[10], piaoshu: this.baowu3, sx: this.baowu3_sx, zhenjia: this.proxy.gameState.threezj[2] };
                this.proxy.gameState.toupiaojieguo3[3] = { baowu: this.proxy.gameState.baowulist[11], piaoshu: this.baowu4, sx: this.baowu4_sx, zhenjia: this.proxy.gameState.threezj[3] };
                this.proxy.gameState.toupiaojieguo3 = _(this.proxy.gameState.toupiaojieguo3).orderBy(["piaoshu", "sx"], ["desc", "asc"]).value();
                console.log(this.proxy.gameState.toupiaojieguo3);
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "第一名: " + this.proxy.gameState.toupiaojieguo3[0].baowu + "   第二名 :" + this.proxy.gameState.toupiaojieguo3[1].baowu + "  " + this.proxy.gameState.toupiaojieguo3[1].zhenjia);
                if (this.proxy.gameState.toupiaojieguo3[0].zhenjia == "真") {
                    this.proxy.gameState.defen++;
                }
                if (this.proxy.gameState.toupiaojieguo3[1].zhenjia == "真") {
                    this.proxy.gameState.defen++;
                }
            }

            if (this.proxy.gameState.lunci == 3) {
                if (this.proxy.gameState.defen < 2) {
                    this.gameScreen.startno2.visible = false;
                    this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "许愿阵营失败  得分:" + this.proxy.gameState.defen);
                } else if (this.proxy.gameState.defen == 6) {
                    this.gameScreen.startno2.visible = false;
                    this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "许愿阵营胜利  得分:" + this.proxy.gameState.defen);
                } else {
                    if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                        this.gameScreen.startno2.visible = true;
                    }
                }
            } else {
                if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                    this.gameScreen.startno2.visible = true;
                }
            }

        }

        public startno2() {
            this.gameScreen.startno2.visible = false;
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "第二轮开始");
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.starttwo);
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "第三轮开始");
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.starttwo);
            } else if (this.proxy.gameState.lunci == 3) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "投人环节");
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.touren);
            }
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
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.gameState.lunci = 2;
                this.gameScreen.Anim5.label = this.proxy.gameState.baowulist[4];
                this.gameScreen.Anim6.label = this.proxy.gameState.baowulist[5];
                this.gameScreen.Anim7.label = this.proxy.gameState.baowulist[6];
                this.gameScreen.Anim8.label = this.proxy.gameState.baowulist[7];
                this.proxy.gameState.shunwei_two_been[1] = this.proxy.gameState.shunwei_one_been[this.proxy.gameState.shunwei_one_been.length - 1];
                this.xingdong(this.proxy.gameState.seats.findIndex(seat => seat && seat.actorNr == this.proxy.gameState.shunwei_two_been[1].actorNr));
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.gameState.lunci = 3;
                this.gameScreen.Anim9.label = this.proxy.gameState.baowulist[8];
                this.gameScreen.Anim10.label = this.proxy.gameState.baowulist[9];
                this.gameScreen.Anim11.label = this.proxy.gameState.baowulist[10];
                this.gameScreen.Anim12.label = this.proxy.gameState.baowulist[11];
                this.proxy.gameState.shunwei_three_been[1] = this.proxy.gameState.shunwei_two_been[this.proxy.gameState.shunwei_two_been.length - 1];
                this.xingdong(this.proxy.gameState.seats.findIndex(seat => seat && seat.actorNr == this.proxy.gameState.shunwei_three_been[1].actorNr));
            }
        }

        public tourenui() {
            this.gameScreen.toupiao1.visible = false;
            this.gameScreen.toupiao2.visible = false;
            this.gameScreen.toupiao3.visible = false;
            this.gameScreen.toupiao4.visible = false;
            this.gameScreen.toupiao11.visible = false;
            this.gameScreen.toupiao21.visible = false;
            this.gameScreen.toupiao31.visible = false;
            this.gameScreen.toupiao41.visible = false;
            this.gameScreen.startno2.visible = false;
            this.proxy.gameState.lunci = 99;
            this.gameScreen.shunwei1.visible = true;
            this.gameScreen.shunwei2.visible = true;
            this.gameScreen.shunwei3.visible = true;
            this.gameScreen.shunwei4.visible = true;
            this.gameScreen.shunwei5.visible = true;
            this.gameScreen.shunwei6.visible = true;
            this.gameScreen.shunwei7.visible = true;
            this.gameScreen.shunwei8.visible = true;
            if (!this.proxy.gameState.seats[1]) {
                this.gameScreen.shunwei1.visible = false;
            }
            if (!this.proxy.gameState.seats[2]) {
                this.gameScreen.shunwei2.visible = false;
            }
            if (!this.proxy.gameState.seats[3]) {
                this.gameScreen.shunwei3.visible = false;
            }
            if (!this.proxy.gameState.seats[4]) {
                this.gameScreen.shunwei4.visible = false;
            }
            if (!this.proxy.gameState.seats[5]) {
                this.gameScreen.shunwei5.visible = false;
            }
            if (!this.proxy.gameState.seats[6]) {
                this.gameScreen.shunwei6.visible = false;
            }
            if (!this.proxy.gameState.seats[7]) {
                this.gameScreen.shunwei7.visible = false;
            }
            if (!this.proxy.gameState.seats[8]) {
                this.gameScreen.shunwei8.visible = false;
            }
            if (this.proxy.isActorLocal(this.proxy.gameState.role[1])
                || this.proxy.isActorLocal(this.proxy.gameState.role[2])
                || this.proxy.isActorLocal(this.proxy.gameState.role[3])
                || this.proxy.isActorLocal(this.proxy.gameState.role[4])
                || this.proxy.isActorLocal(this.proxy.gameState.role[5])) {
                this.gameScreen.onejieguo.text = "找出老朝奉";
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[6])) {
                this.gameScreen.onejieguo.text = "找出许愿";
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[7])) {
                this.gameScreen.onejieguo.text = "找出方震";
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[8])) {
                this.gameScreen.onejieguo.text = "装作在选人的样子";
            }
        }

        public tourenjieguo(touren: Array<any>) {
            let message1: string;
            let message2: string;
            let message3: string;
            let isshengli: string;
            let i: number = 0;
            touren.forEach(element => {
                if (element) {
                    i++;
                }
            });

            if (i == this.roomrenshu) {
                let lcfpiao: number = 0;
                if (this.proxy.gameState.role[6] && this.proxy.gameState.touren[1] == this.proxy.gameState.role[6]) {
                    lcfpiao++;
                }
                if (this.proxy.gameState.role[6] && this.proxy.gameState.touren[2] == this.proxy.gameState.role[6]) {
                    lcfpiao++;
                }
                if (this.proxy.gameState.role[6] && this.proxy.gameState.touren[3] == this.proxy.gameState.role[6]) {
                    lcfpiao++;
                }
                if (this.proxy.gameState.role[6] && this.proxy.gameState.touren[4] == this.proxy.gameState.role[6]) {
                    lcfpiao++;
                }
                if (this.proxy.gameState.role[6] && this.proxy.gameState.touren[5] == this.proxy.gameState.role[6]) {
                    lcfpiao++;
                }
                if (lcfpiao >= 3) {
                    //找到老朝奉
                    message1 = "找到老朝奉";
                    this.proxy.gameState.defen++;
                } else {
                    message1 = "没找到老朝奉";
                }
                if (this.proxy.gameState.role[1] && this.proxy.gameState.touren[6] == this.proxy.gameState.role[1]) {
                    //找到许愿
                    message2 = "找到许愿";
                } else {
                    message2 = "没找到许愿";
                    this.proxy.gameState.defen += 2;
                }
                if (this.proxy.gameState.role[2] && this.proxy.gameState.touren[7] == this.proxy.gameState.role[2]) {
                    //找到方震
                    message3 = "找到方震";
                } else {
                    message3 = "没找到方震";
                    this.proxy.gameState.defen++;
                }
                if (this.proxy.gameState.defen < 6) {
                    isshengli = "许愿阵营失败";
                } else {
                    isshengli = "许愿阵营胜利";
                }
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, isshengli + "  " + message1 + " " + message2 + " " + message3);
                //this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "游戏结果");
            }

        }
    }
}