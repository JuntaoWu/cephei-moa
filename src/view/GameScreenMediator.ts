

module game {

    const animConfig = [
        { controlName: "Anim1", index: 0 },
        { controlName: "Anim2", index: 1 },
        { controlName: "Anim3", index: 2 },
        { controlName: "Anim4", index: 3 },
        { controlName: "Anim5", index: 4 },
        { controlName: "Anim6", index: 5 },
        { controlName: "Anim7", index: 6 },
        { controlName: "Anim8", index: 7 },
        { controlName: "Anim9", index: 8 },
        { controlName: "Anim10", index: 9 },
        { controlName: "Anim11", index: 10 },
        { controlName: "Anim12", index: 11 },
    ];

    export class GameScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "GameScreenMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(GameScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.gameScreen.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            //this.gameScreen.btnSeat1.addEventListener(egret.TouchEvent.TOUCH_TAP,this.findSeat2,this);
            this.gameScreen.btnGuide.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showGuide, this);
            this.gameScreen.btnQuit.addEventListener(egret.TouchEvent.TOUCH_TAP, this.quitClick, this);
            this.gameScreen.btnGameInfo.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showGameInfo, this);
            this.gameScreen.btnGameRecord.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showGameRecord, this);

            this.findSeat();
        }

        public async initData() {
            console.log("GameScreen initData");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.updateGameScreen(this.proxy.gameState);
        }

        private showGuide() {
            this.sendNotification(SceneCommand.SHOW_GUIDE_WINDOW);
        }

        private quitClick() {
            this.sendNotification(SceneCommand.SHOW_HANDLE_POPUP, true);
        }

        private showGameInfo() {
            this.sendNotification(SceneCommand.SHOW_GAMEINFO_POPUP);
        }

        private showGameRecord() {
            this.sendNotification(SceneCommand.SHOW_VOTERECORD_WINDOW);
        }

        public listNotificationInterests(): Array<any> {
            return [
                GameProxy.PLAYER_UPDATE,
                GameProxy.SEAT_UPDATE,
                GameProxy.FIRST_ONE,
                GameProxy.NEXT_NR,
                GameProxy.TONGZHI,
                GameProxy.BAOWU_TONGZHI,
                GameProxy.TOUPIAO_UI,
                GameProxy.PIAO_SHU,
                GameProxy.ZONG_PIAOSHU,
                GameProxy.START_TWO,
                GameProxy.ONE_YBRSKILL,
                GameProxy.ONE_ZGQSKILL,
                GameProxy.TOUREN,
                GameProxy.TOUREN_JIEGUO,
                GameCommand.JOIN_ROOM,
                GameProxy.START_TOUPIAO_BUTTON,
                GameProxy.ROLEING
            ];
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
                case GameProxy.FIRST_ONE: {
                    this.first_one(data);
                    break;
                }
                case GameProxy.NEXT_NR: {
                    this.shunwei2(data);
                    break;
                }
                case GameProxy.TONGZHI: {
                    this.tongzhi(data);
                    break;
                }
                case GameProxy.BAOWU_TONGZHI: {
                    this.baowu_tongzhi(data);
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
                case GameCommand.JOIN_ROOM: {
                    this.initData();
                    break;
                }
                case GameProxy.START_TOUPIAO_BUTTON: {
                    this.start_toupiao_button();
                    break;
                }
                case GameProxy.ROLEING: {
                    this.roleing(data);
                    break;
                }
            }
        }

        public updateGameScreen(data: GameState) {

            this.gameScreen.roomName = this.proxy.roomName;
            this.gameScreen.isMasterClient = this.proxy.isMasterClient;
            this.gameScreen.isNormalClient = !this.proxy.isMasterClient;

            this.gameScreen.currentPlayers = data.players;
            this.gameScreen.maxPlayers = data.maxPlayers;

            let allValidSeats = this.proxy.gameState.seats.filter(seat => seat && seat.actorNr !== undefined);
            let allValidRoles = this.proxy.gameState.role.filter(r => r && r.actorNr != undefined);

            let isAllReady = allValidSeats.length == data.maxPlayers;
            let isAllRolesReady = allValidRoles.length == data.maxPlayers;
            let isWaiting = !isAllReady && this.proxy.gameState.seats.some(seat => seat && seat.actorNr == this.proxy.actorNr);

            if (isAllRolesReady) {
                //set current player's role
                let roleIndex = data.role.findIndex(r => this.proxy.isActorLocal(r));
                let myRole = this.proxy.rolesMap.get(roleIndex.toString());
                this.gameScreen.role = myRole;
                this.gameScreen.isNotFangZhen = myRole.name != "方震"
                this.gameScreen.isFangZhen = myRole.name == "方震";
                this.gameScreen.isYaoBuran = myRole.name == "药不然";
                this.gameScreen.isZhengGuoqu = myRole.name == "郑国渠";

                allValidSeats.forEach((seat) => {
                    this.gameScreen[`ybrskill${seat.seatNumber}`].update(seat);
                    this.gameScreen[`fangzhenskill${seat.seatNumber}`].update(seat);
                });
            }

            switch (data.phase) {
                case GamePhase.Preparing:
                    this.gameScreen.isInitial = !isWaiting && !isAllReady;
                    this.gameScreen.isWaiting = isWaiting;
                    this.gameScreen.isAllReady = isAllReady;
                    this.gameScreen.isAllRolesReady = false;
                    //this.gameScreen.canChooseSeat = !isAllReady;
                    this.gameScreen.isChoosingRole = false;
                    this.gameScreen.isChoosingRoleandSeven = false;
                    this.gameScreen.isChoosingRoleandEight = false;
                    this.gameScreen.isChoosingRoleOrMasterClient = false;
                    this.gameScreen.isAllRolesReadyAndNormalClient = false;
                    this.gameScreen.isPhasePreparing = true;
                    this.gameScreen.isPhaseChoosingRole = false;
                    this.gameScreen.isPhaseGameInProgress = false;

                    this.gameScreen.isMyTurn = false;
                    this.gameScreen.isOthersTurn = false;
                    break;
                case GamePhase.ChoosingRole:
                    this.gameScreen.isInitial = false;
                    this.gameScreen.isWaiting = false;
                    this.gameScreen.isAllReady = false;
                    this.gameScreen.isAllRolesReady = isAllRolesReady;
                    this.gameScreen.canChooseSeat = false;
                    this.gameScreen.isChoosingRole = !isAllRolesReady;
                    this.gameScreen.isChoosingRoleandSeven = !isAllRolesReady && (this.proxy.gameState.maxPlayers == 7 || this.proxy.gameState.maxPlayers == 8);
                    this.gameScreen.isChoosingRoleandEight = !isAllRolesReady && this.proxy.gameState.maxPlayers == 8;
                    if (!this.gameScreen.isChoosingRoleandSeven) {
                        var colorMatrix = [
                            0.3, 0.6, 0, 0, 0,
                            0.3, 0.6, 0, 0, 0,
                            0.3, 0.6, 0, 0, 0,
                            0, 0, 0, 1, 0
                        ];

                        var colorFlilter = new egret.ColorMatrixFilter(colorMatrix);
                        this.gameScreen.btnjs3.filters = [colorFlilter];
                    }
                    if (!this.gameScreen.isChoosingRoleandEight) {
                        var colorMatrix = [
                            0.3, 0.6, 0, 0, 0,
                            0.3, 0.6, 0, 0, 0,
                            0.3, 0.6, 0, 0, 0,
                            0, 0, 0, 1, 0
                        ];

                        var colorFlilter = new egret.ColorMatrixFilter(colorMatrix);
                        this.gameScreen.btnjs8.filters = [colorFlilter];
                    }
                    this.gameScreen.isChoosingRoleOrMasterClient = !isAllRolesReady || this.gameScreen.isMasterClient;
                    this.gameScreen.isAllRolesReadyAndNormalClient = isAllRolesReady && this.gameScreen.isNormalClient;
                    this.gameScreen.isPhasePreparing = false;
                    this.gameScreen.isPhaseChoosingRole = true;
                    this.gameScreen.isPhaseGameInProgress = false;

                    this.gameScreen.isMyTurn = false;
                    this.gameScreen.isOthersTurn = false;
                    if (this.proxy.gameState.maxPlayers == 6) {
                        this.gameScreen.btnjs3.enabled = false;
                        this.gameScreen.btnjs8.enabled = false;
                    } else if (this.proxy.gameState.maxPlayers == 7) {
                        this.gameScreen.btnjs3.enabled = false;
                    }
                    break;
                case GamePhase.GameInProgress:
                    this.gameScreen.isInitial = false;
                    this.gameScreen.isWaiting = false;
                    this.gameScreen.isAllReady = false;
                    this.gameScreen.isAllRolesReady = false;
                    this.gameScreen.canChooseSeat = false;
                    this.gameScreen.isChoosingRole = false;
                    this.gameScreen.isChoosingRoleandSeven = false;
                    this.gameScreen.isChoosingRoleandEight = false;
                    this.gameScreen.isChoosingRoleOrMasterClient = false;
                    this.gameScreen.isAllRolesReadyAndNormalClient = false;
                    this.gameScreen.isPhasePreparing = false;
                    this.gameScreen.isPhaseChoosingRole = false;
                    this.gameScreen.isPhaseGameInProgress = true;
                    this.gameScreen.isFirstRound = data.lunci == 1;
                    this.gameScreen.isSecondRound = data.lunci == 2;
                    this.gameScreen.isThirdRound = data.lunci == 3;

                    this.setMyTurnState(data.seats);
                    this.setAnims();
                    this.setChoosingNextOrVotingPersonUI();
                    break;
            }

            this.touxiang(data.seats);
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

            this.gameScreen.startjs.addEventListener(egret.TouchEvent.TOUCH_TAP, this.startChooseRole, this);

            this.gameScreen.btnjs1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseRole(1) }), this);
            this.gameScreen.btnjs2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseRole(2) }), this);
            this.gameScreen.btnjs3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseRole(3) }), this);
            this.gameScreen.btnjs4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseRole(4) }), this);
            this.gameScreen.btnjs5.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseRole(5) }), this);
            this.gameScreen.btnjs6.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseRole(6) }), this);
            this.gameScreen.btnjs7.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseRole(7) }), this);
            this.gameScreen.btnjs8.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.chooseRole(8) }), this);

            this.gameScreen.startgame.addEventListener(egret.TouchEvent.TOUCH_TAP, this.startGame, this);

            this.gameScreen.Anim1.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(0, event) }), this);
            this.gameScreen.Anim2.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(1, event) }), this);
            this.gameScreen.Anim3.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(2, event) }), this);
            this.gameScreen.Anim4.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(3, event) }), this);
            this.gameScreen.Anim5.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(4, event) }), this);
            this.gameScreen.Anim6.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(5, event) }), this);
            this.gameScreen.Anim7.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(6, event) }), this);
            this.gameScreen.Anim8.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(7, event) }), this);
            this.gameScreen.Anim9.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(8, event) }), this);
            this.gameScreen.Anim10.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(9, event) }), this);
            this.gameScreen.Anim11.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(10, event) }), this);
            this.gameScreen.Anim12.addEventListener(egret.TouchEvent.TOUCH_TAP, ((event: egret.TouchEvent) => { this.chooseAnimReal(11, event) }), this);

            this.gameScreen.btnAuth.addEventListener(egret.TouchEvent.TOUCH_TAP, this.chooseAnim, this);
            this.gameScreen.btnSkipAuth.addEventListener(egret.TouchEvent.TOUCH_TAP, this.skipAuth, this);
            this.gameScreen.btnSkill.addEventListener(egret.TouchEvent.TOUCH_TAP, this.applySkill, this);
            this.gameScreen.btnSkipSkill.addEventListener(egret.TouchEvent.TOUCH_TAP, this.skipSkill, this);

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

            this.gameScreen.ybrskill1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("1") }), this);
            this.gameScreen.ybrskill2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("2") }), this);
            this.gameScreen.ybrskill3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("3") }), this);
            this.gameScreen.ybrskill4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("4") }), this);
            this.gameScreen.ybrskill5.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("5") }), this);
            this.gameScreen.ybrskill6.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("6") }), this);
            this.gameScreen.ybrskill7.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("7") }), this);
            this.gameScreen.ybrskill8.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.ybrskilling("8") }), this);

            this.gameScreen.zgqskill1.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.zgqskilling("0") }), this);
            this.gameScreen.zgqskill2.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.zgqskilling("1") }), this);
            this.gameScreen.zgqskill3.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.zgqskilling("2") }), this);
            this.gameScreen.zgqskill4.addEventListener(egret.TouchEvent.TOUCH_TAP, (() => { this.zgqskilling("3") }), this);
        }

        public findSeat2(seatNumber: string) {
            if (this.proxy.gameState.seats[seatNumber]) {

            } else {
                let seatNo = this.proxy.gameState.seats.findIndex(seat => seat && seat.actorNr == this.proxy.loadBalancingClient.myActor().actorNr);
                this.sendNotification(GameCommand.JOIN_SEAT, { oldSeatNumber: seatNo, newSeatNumber: seatNumber });
            }
        }

        //updated by updateGameScreen
        public touxiang(seats: Array<ActorModel>) {

            const seatConfig = [
                { seatNumber: 1, controlName: "btnSeat1", defaultSource: "color-black" },
                { seatNumber: 2, controlName: "btnSeat2", defaultSource: "color-blue" },
                { seatNumber: 3, controlName: "btnSeat3", defaultSource: "color-green" },
                { seatNumber: 4, controlName: "btnSeat4", defaultSource: "color-orange" },
                { seatNumber: 5, controlName: "btnSeat5", defaultSource: "color-purple" },
                { seatNumber: 6, controlName: "btnSeat6", defaultSource: "color-red" },
                { seatNumber: 7, controlName: "btnSeat7", defaultSource: "color-white" },
                { seatNumber: 8, controlName: "btnSeat8", defaultSource: "color-yellow" },
            ];

            seatConfig.forEach((config, index) => {

                const control = this.gameScreen[config.controlName];
                let content = control.getChildByName("content") as eui.Image;
                let nickName = control.getChildByName("nickName") as eui.Label;
                let normalBg = control.getChildByName("normalBg") as eui.Image;
                let masterBg = control.getChildByName("masterBg") as eui.Image;
                let selfMark = control.getChildByName("selfMark") as eui.Image;

                if (seats[config.seatNumber]) {
                    content.source = seats[config.seatNumber].avatarUrl || config.defaultSource;
                    nickName.text = seats[config.seatNumber].name || "blank name";
                    masterBg.visible = this.proxy.isActorMaster(seats[config.seatNumber]);
                    normalBg.visible = !masterBg.visible;
                    selfMark.visible = this.proxy.isActorLocal(seats[config.seatNumber]);
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

        public startChooseRole() {
            this.proxy.startChooseRole();
        }

        public chooseRole(roleId: number) {
            this.sendNotification(SceneCommand.SHOW_ROLE_POPUP, roleId);
        }

        public roleing(i: number) {
            this.gameScreen.roleing = i + "/" + this.proxy.gameState.maxPlayers;
        }

        public startGame() {
            this.sendNotification(GameCommand.START_GAME);
        }

        // updated by updateGameScreen
        public setAnims() {
            animConfig.forEach(anim => {
                const animName = this.proxy.gameState.baowulist[anim.index];
                const antiqueObject = this.proxy.antiquesMap.get(animName);
                let control = this.gameScreen[anim.controlName] as eui.Button;

                let antiqueGroup = control.getChildByName("antique-group") as eui.Group;
                let bgNormal = antiqueGroup.getChildByName("antique-normal");
                let bgSelected = antiqueGroup.getChildByName("antique-selected");
                bgNormal.visible = true;
                bgSelected.visible = false;
                let image = antiqueGroup.getChildByName("antique-content") as eui.Image;
                image.source = antiqueObject.source;
                let label = control.getChildByName("antique-label") as eui.Label;
                label.text = antiqueObject.name;
            });
        }

        public first_one(message: string) {
            this.setAnims();

            const dragonBone = DragonBones.createDragonBone("fangzhen", "fangzhen");
            dragonBone.animation.play("newAnimation", 0);

            this.gameScreen.btnSkill.addChild(dragonBone);

            const firstoneNr = +message;
            this.proxy.gameState.shunwei_one_been[1] = this.proxy.gameState.seats[firstoneNr];
            this.xingdong(firstoneNr);
        }

        public xingdong(message: number) {
            if (this.proxy.isActorLocal(this.proxy.gameState.seats[message])) {
                console.log("syncMyTurnState isAuthing");
                this.syncMyTurnState("isAuthing");
            }
        }

        private syncMyTurnState(action, receiver: Receiver = Receiver.Self) {
            this.proxy.updateMyState(action, receiver);
        }

        private setMyTurnState(seats: ActorModel[]) {
            const actionList = ["isAuthing", "isSkilling", "isChoosingSkillingTarget", "isChoosingNext", "isSpeaking", "isVotingPerson"];
            const mySeat = seats.find(seat => seat && seat.actorNr == this.proxy.actorNr);
            const actionSeats = seats.filter(seat => seat && seat.action);

            this.gameScreen.isMyTurn = mySeat.action && mySeat.action != "isSpeaking";
            this.gameScreen.isOthersTurn = !mySeat.action && actionSeats.length > 0 && !actionSeats.find(seat => seat.action == "isVotingPerson");
            actionList.forEach(s => {
                this.gameScreen[s] = mySeat.action == s;
            });
            this.gameScreen.isChoosingNextOrVotingPerson = this.gameScreen.isChoosingNext || this.gameScreen.isVotingPerson;

            if (this.gameScreen.isChoosingNextOrVotingPerson) {
                //todo: update visible seats.

            }

            if (actionSeats.length == 1 && this.gameScreen.isOthersTurn) {
                const seat = actionSeats[0];
                this.gameScreen.processingActorUI.update({ ...seat });
                this.gameScreen.processingPlayer = {
                    colorName: seat.color.color,
                    name: seat.name,
                };
            }
        }

        public ybrskilladd(message: number) {
            if (this.proxy.gameState.role[1] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[1].actorNr) {
                this.proxy.gameState.ybrskill[1]++;
            } else if (this.proxy.gameState.role[2] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[2].actorNr) {
                this.proxy.gameState.ybrskill[2]++;
                this.proxy.gameState.ybrskill[1]++;
            } else if (this.proxy.gameState.role[3] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[3].actorNr) {
                this.proxy.gameState.ybrskill[3]++;
                this.proxy.gameState.jyfskill = false;
            } else if (this.proxy.gameState.role[4] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[4].actorNr) {
                this.proxy.gameState.ybrskill[4]++;
            } else if (this.proxy.gameState.role[5] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[5].actorNr) {
                this.proxy.gameState.ybrskill[5]++;
            } else if (this.proxy.gameState.role[6] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[6].actorNr) {
                this.proxy.gameState.ybrskill[6]++;
            } else if (this.proxy.gameState.role[8] && this.proxy.gameState.seats[message].actorNr == this.proxy.gameState.role[8].actorNr) {
                this.proxy.gameState.ybrskill[8]++;
            }
        }

        private selectedAnims = [];

        public chooseAnimReal(number: number, event: egret.TouchEvent) {
            if (this.selectedAnims.findIndex(anim => anim == number) != -1) {
                // you have choosed this anim already.
                return;
            }
            let antiqueGroup = event.currentTarget.getChildByName("antique-group") as eui.Group;
            let bgNormal = antiqueGroup.getChildByName("antique-normal");
            let bgSelected = antiqueGroup.getChildByName("antique-selected");
            bgNormal.visible = false;
            bgSelected.visible = true;

            this.selectedAnims.push(number);

            if (this.selectedAnims.length > this.gameScreen.role.roleCheckCount) {
                let shiftAnim = this.selectedAnims.shift();
                animConfig.forEach((anim, index) => {
                    if (anim.index == shiftAnim) {
                        let control: eui.Button = this.gameScreen[anim.controlName];
                        let antiqueGroup = control.getChildByName("antique-group") as eui.Group;
                        let shiftControlBgNormal = antiqueGroup.getChildByName("antique-normal");
                        let shiftControlBgSelected = antiqueGroup.getChildByName("antique-selected");
                        shiftControlBgNormal.visible = true;
                        shiftControlBgSelected.visible = false;
                    }
                });
            }
        }

        public skipAuth(event: egret.TouchEvent) {
            if (this.proxy.isActorLocal(this.proxy.gameState.role[2])) {
                this.syncMyTurnState("isSkilling");
            }
        }

        public applySkill(event: egret.TouchEvent) {
            if (this.gameScreen.role.id == 2) {
                this.syncMyTurnState("isChoosingSkillingTarget");
                this.fangzhenskill();
            }
            else if (this.gameScreen.role.id == 6) {
                this.lcfskill();
            }
            else if (this.gameScreen.role.id == 7) {
                this.syncMyTurnState("isChoosingSkillingTarget");
                this.ybrskill();
            }
            else if (this.gameScreen.role.id == 8) {
                this.syncMyTurnState("isChoosingSkillingTarget");
                this.zgqskill();
            }
        }

        public skipSkill(event: egret.TouchEvent) {
            if (this.proxy.isActorLocal(this.proxy.gameState.role[2])) {
                if (this.proxy.gameState.ybrskill[2] > 0) {
                    this.proxy.gameState.ybrskill[2]--;
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                } else {
                    if (this.proxy.gameState.lunci == 1) {
                        this.proxy.gameState.playerInfor[2].skipskill1 = true;
                    } else if (this.proxy.gameState.lunci == 2) {
                        this.proxy.gameState.playerInfor[2].skipskill2 = true;
                    } else if (this.proxy.gameState.lunci == 3) {
                        this.proxy.gameState.playerInfor[2].skipskill3 = true;
                    }
                }
            }
            let no = this.proxy.gameState.role.findIndex(no => no && no.actorNr == this.proxy.actorNr);
            if (no == 6 || no == 7 || no == 8) {
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.playerInfor[no].skipskill1 = true;
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.playerInfor[no].skipskill2 = true;
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.playerInfor[no].skipskill3 = true;
                }
            }
            console.log("skipSkill");
            this.chuanshunwei();
        }

        public chooseAnim(event: egret.TouchEvent) {

            if (this.proxy.isActorLocal(this.proxy.gameState.role[1])) {
                if (this.selectedAnims.length < 2) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "请选择两个宝物进行鉴定");
                    return;
                }
            } else {
                if (this.selectedAnims.length < 1) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "请选择一个宝物进行鉴定");
                    return;
                }
            }

            const results = [];

            if (this.gameScreen.role.hasActiveSkill) {
                this.syncMyTurnState("isSkilling");
            }
            else {
                this.syncMyTurnState("isChoosingNext");
            }

            if (this.proxy.isActorLocal(this.proxy.gameState.role[1])) {
                if (this.proxy.gameState.ybrskill[1] > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    if (this.proxy.gameState.lunci == 1) {
                        this.proxy.gameState.playerInfor[1].onetouxi = true;
                    } else if (this.proxy.gameState.lunci == 2) {
                        this.proxy.gameState.playerInfor[1].twotouxi = true;
                    } else if (this.proxy.gameState.lunci == 3) {
                        this.proxy.gameState.playerInfor[1].threetouxi = true;
                    }
                    this.proxy.gameState.ybrskill[1]--;
                }
                else {
                    if (this.proxy.gameState.lunci == 1) {
                        if (this.proxy.gameState.onelcfskill) {
                            results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]] == "真" ? "假" : "真";
                            results[1] = this.proxy.gameState.onezj[this.selectedAnims[1]] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]];
                            results[1] = this.proxy.gameState.onezj[this.selectedAnims[1]];
                        }

                        if (this.proxy.gameState.onezgqskill == this.selectedAnims[0]) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        if (this.proxy.gameState.onezgqskill == this.selectedAnims[1]) {
                            results[1] = "你无法鉴定此宝物";
                        }

                        this.proxy.gameState.playerInfor[1].onebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[1].onezhenjia = results[0];
                        this.proxy.gameState.playerInfor[1].onebaowu2 = this.proxy.gameState.baowulist[this.selectedAnims[1]];
                        this.proxy.gameState.playerInfor[1].onezhenjia2 = results[1];
                    }
                    else if (this.proxy.gameState.lunci == 2) {

                        if (this.proxy.gameState.twolcfskill) {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4] == "真" ? "假" : "真";
                            results[1] = this.proxy.gameState.twozj[this.selectedAnims[1] - 4] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                            results[1] = this.proxy.gameState.twozj[this.selectedAnims[1] - 4];
                        }

                        if (this.proxy.gameState.twozgqskill == this.selectedAnims[0] - 4) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        if (this.proxy.gameState.twozgqskill == this.selectedAnims[1] - 4) {
                            results[1] = "你无法鉴定此宝物";
                        }

                        this.proxy.gameState.playerInfor[1].twobaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[1].twozhenjia = results[0];
                        this.proxy.gameState.playerInfor[1].twobaowu2 = this.proxy.gameState.baowulist[this.selectedAnims[1]];
                        this.proxy.gameState.playerInfor[1].twozhenjia2 = results[1];
                    }
                    else if (this.proxy.gameState.lunci == 3) {

                        if (this.proxy.gameState.threelcfskill) {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8] == "真" ? "假" : "真";
                            results[1] = this.proxy.gameState.threezj[this.selectedAnims[1] - 8] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8];
                            results[1] = this.proxy.gameState.threezj[this.selectedAnims[1] - 8];
                        }

                        if (this.proxy.gameState.threezgqskill == this.selectedAnims[0] - 8) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        if (this.proxy.gameState.threezgqskill == this.selectedAnims[1] - 8) {
                            results[1] = "你无法鉴定此宝物";
                        }

                        this.proxy.gameState.playerInfor[1].threebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[1].threezhenjia = results[0];
                        this.proxy.gameState.playerInfor[1].threebaowu2 = this.proxy.gameState.baowulist[this.selectedAnims[1]];
                        this.proxy.gameState.playerInfor[1].threezhenjia2 = results[1];
                    }
                }
                this.chuanshunwei();
            }
            else if (this.proxy.isActorLocal(this.proxy.gameState.role[3])) {
                if (this.proxy.gameState.ybrskill[3] > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    if (this.proxy.gameState.lunci == 1) {
                        this.proxy.gameState.playerInfor[3].onetouxi = true;
                    } else if (this.proxy.gameState.lunci == 2) {
                        this.proxy.gameState.playerInfor[3].twotouxi = true;
                    } else if (this.proxy.gameState.lunci == 3) {
                        this.proxy.gameState.playerInfor[3].threetouxi = true;
                    }
                    this.proxy.gameState.jyfskill = false;
                    this.proxy.gameState.ybrskill[3]--;
                } else if (!this.proxy.gameState.jyfskill) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你无法鉴定此宝物");
                    if (this.proxy.gameState.lunci == 1) {
                        this.proxy.gameState.playerInfor[3].onezhenjia = "你无法鉴定此宝物";
                    } else if (this.proxy.gameState.lunci == 2) {
                        this.proxy.gameState.playerInfor[3].twozhenjia = "你无法鉴定此宝物";
                    } else if (this.proxy.gameState.lunci == 3) {
                        this.proxy.gameState.playerInfor[3].threezhenjia = "你无法鉴定此宝物";
                    }
                } else {
                    if (this.proxy.gameState.lunci == 1) {
                        if (this.proxy.gameState.onezgqskill == this.selectedAnims[0]) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        else {
                            results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]];
                        }
                        this.proxy.gameState.playerInfor[3].onebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[3].onezhenjia = results[0];
                    }
                    else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twozgqskill == this.selectedAnims[0]) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        else {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                        }
                        this.proxy.gameState.playerInfor[3].twobaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[3].twozhenjia = results[0];
                    }
                    else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threezgqskill == this.selectedAnims[0]) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        else {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8];
                        }
                        this.proxy.gameState.playerInfor[3].threebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[3].threezhenjia = results[0];
                    }
                }
                this.chuanshunwei();
            }
            else if (this.proxy.isActorLocal(this.proxy.gameState.role[4])) {

                if (this.proxy.gameState.ybrskill[4] > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    if (this.proxy.gameState.lunci == 1) {
                        this.proxy.gameState.playerInfor[4].onetouxi = true;
                    } else if (this.proxy.gameState.lunci == 2) {
                        this.proxy.gameState.playerInfor[4].twotouxi = true;
                    } else if (this.proxy.gameState.lunci == 3) {
                        this.proxy.gameState.playerInfor[4].threetouxi = true;
                    }
                    this.proxy.gameState.ybrskill[4]--;
                }
                else {
                    if (this.proxy.gameState.lunci == 1) {

                        if (this.proxy.gameState.onelcfskill) {
                            results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]];
                        }

                        if (this.proxy.gameState.onezgqskill == this.selectedAnims[0] || this.proxy.gameState.hyyskill == 1) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        this.proxy.gameState.playerInfor[4].onebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[4].onezhenjia = results[0];
                    }
                    else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twolcfskill) {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                        }

                        if (this.proxy.gameState.twozgqskill == this.selectedAnims[0] - 4 || this.proxy.gameState.hyyskill == 2) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        this.proxy.gameState.playerInfor[4].twobaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[4].twozhenjia = results[0];
                    }
                    else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threelcfskill) {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0]] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0]];
                        }

                        if (this.proxy.gameState.threezgqskill == this.selectedAnims[0] - 8 || this.proxy.gameState.hyyskill == 3) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        this.proxy.gameState.playerInfor[4].threebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[4].threezhenjia = results[0];
                    }
                }
                this.chuanshunwei();
            }
            else if (this.proxy.isActorLocal(this.proxy.gameState.role[5])) {
                if (this.proxy.gameState.ybrskill[5] > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    if (this.proxy.gameState.lunci == 1) {
                        this.proxy.gameState.playerInfor[5].onetouxi = true;
                    } else if (this.proxy.gameState.lunci == 2) {
                        this.proxy.gameState.playerInfor[5].twotouxi = true;
                    } else if (this.proxy.gameState.lunci == 3) {
                        this.proxy.gameState.playerInfor[5].threetouxi = true;
                    }
                    this.proxy.gameState.ybrskill[5]--;
                }
                else {
                    if (this.proxy.gameState.lunci == 1) {

                        if (this.proxy.gameState.onelcfskill) {
                            results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]];
                        }

                        if (this.proxy.gameState.onezgqskill == this.selectedAnims[0] || this.proxy.gameState.mhjnskill == 1) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        this.proxy.gameState.playerInfor[5].onebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[5].onezhenjia = results[0];

                    }
                    else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twolcfskill) {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                        }

                        if (this.proxy.gameState.twozgqskill == this.selectedAnims[0] - 4 || this.proxy.gameState.mhjnskill == 2) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        this.proxy.gameState.playerInfor[5].twobaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[5].twozhenjia = results[0];
                    }
                    else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threelcfskill) {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0]] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0]];
                        }

                        if (this.proxy.gameState.threezgqskill == this.selectedAnims[0] - 8 || this.proxy.gameState.mhjnskill == 3) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        this.proxy.gameState.playerInfor[5].threebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[5].threezhenjia = results[0];
                    }
                }
                this.chuanshunwei();
            }
            else if (this.proxy.isActorLocal(this.proxy.gameState.role[6])) {
                if (this.proxy.gameState.ybrskill[6] > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    if (this.proxy.gameState.lunci == 1) {
                        this.proxy.gameState.playerInfor[6].onetouxi = true;
                    } else if (this.proxy.gameState.lunci == 2) {
                        this.proxy.gameState.playerInfor[6].twotouxi = true;
                    } else if (this.proxy.gameState.lunci == 3) {
                        this.proxy.gameState.playerInfor[6].threetouxi = true;
                    }
                    this.proxy.gameState.ybrskill[6]--;
                    this.chuanshunwei();
                }
                else {
                    if (this.proxy.gameState.lunci == 1) {
                        if (this.proxy.gameState.onezgqskill == this.selectedAnims[0]) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        else {
                            results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]];
                        }
                        this.proxy.gameState.playerInfor[6].onebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[6].onezhenjia = results[0];
                    }
                    else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twozgqskill == this.selectedAnims[0]) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        else {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                        }
                        this.proxy.gameState.playerInfor[6].twobaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[6].twozhenjia = results[0];
                    }
                    else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threezgqskill == this.selectedAnims[0]) {
                            results[0] = "你无法鉴定此宝物";
                        }
                        else {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8];
                        }
                        this.proxy.gameState.playerInfor[6].threebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[6].threezhenjia = results[0];
                    }
                }
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[7])) {
                if (this.proxy.gameState.lunci == 1) {
                    if (this.proxy.gameState.onezgqskill == this.selectedAnims[0]) {
                        results[0] = "你无法鉴定此宝物";
                    }
                    else {
                        results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]];
                    }
                    this.proxy.gameState.playerInfor[7].onebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                    this.proxy.gameState.playerInfor[7].onezhenjia = results[0];
                }
                else if (this.proxy.gameState.lunci == 2) {
                    if (this.proxy.gameState.twozgqskill == this.selectedAnims[0] - 4) {
                        results[0] = "你无法鉴定此宝物";
                    }
                    else {
                        results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                    }
                    this.proxy.gameState.playerInfor[7].twobaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                    this.proxy.gameState.playerInfor[7].twozhenjia = results[0];
                }
                else if (this.proxy.gameState.lunci == 3) {
                    if (this.proxy.gameState.threezgqskill == this.selectedAnims[0] - 8) {
                        results[0] = "你无法鉴定此宝物";
                    }
                    else {
                        results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8];
                    }
                    this.proxy.gameState.playerInfor[7].threebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                    this.proxy.gameState.playerInfor[7].threezhenjia = results[0];
                }
            }
            else if (this.proxy.isActorLocal(this.proxy.gameState.role[8])) {
                if (this.proxy.gameState.ybrskill[8] > 0) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    if (this.proxy.gameState.lunci == 1) {
                        this.proxy.gameState.playerInfor[8].onetouxi = true;
                    } else if (this.proxy.gameState.lunci == 2) {
                        this.proxy.gameState.playerInfor[8].twotouxi = true;
                    } else if (this.proxy.gameState.lunci == 3) {
                        this.proxy.gameState.playerInfor[8].threetouxi = true;
                    }
                    this.proxy.gameState.ybrskill[8]--;
                    this.chuanshunwei();
                }
                else {
                    if (this.proxy.gameState.lunci == 1) {
                        results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[8].onebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[8].onezhenjia = results[0];
                    }
                    else if (this.proxy.gameState.lunci == 2) {
                        results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                        this.proxy.gameState.playerInfor[8].twobaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                        this.proxy.gameState.playerInfor[8].twozhenjia = results[0];
                    }
                    else if (this.proxy.gameState.lunci == 3) {
                        results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8];
                    }
                    this.proxy.gameState.playerInfor[8].threebaowu = this.proxy.gameState.baowulist[this.selectedAnims[0]];
                    this.proxy.gameState.playerInfor[8].threezhenjia = results[0];
                }
            }

            let data = [];
            for (let i = 0; i < results.length; i++) {
                data.push({
                    source: this.proxy.antiquesMap.get(this.proxy.gameState.baowulist[this.selectedAnims[i]]).source,
                    name: this.proxy.gameState.baowulist[this.selectedAnims[i]] + "首",
                    result: results[i]
                })
            }
            if (data.length) {
                this.sendNotification(SceneCommand.SHOW_APPRAISAL_POPUP, data);
            }

            // reset selectedAnims.length
            this.selectedAnims.length = 0;
        }

        private setChoosingNextOrVotingPersonUI() {
            this.gameScreen.shunwei1.visible = true;
            this.gameScreen.shunwei2.visible = true;
            this.gameScreen.shunwei3.visible = true;
            this.gameScreen.shunwei4.visible = true;
            this.gameScreen.shunwei5.visible = true;
            this.gameScreen.shunwei6.visible = true;
            this.gameScreen.shunwei7.visible = true;
            this.gameScreen.shunwei8.visible = true;

            for (var i = 1; i <= 8; ++i) {
                let seat = this.proxy.gameState.seats[i];
                if (seat) {
                    if (this.proxy.gameState.lunci == 1) {
                        if (this.proxy.gameState.shunwei_one_been.some(element => element && element.actorNr == seat.actorNr)) {
                            this.gameScreen[`shunwei${seat.seatNumber}`].visible = false;
                        }
                    }
                    else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.shunwei_two_been.some(element => element && element.actorNr == seat.actorNr)) {
                            this.gameScreen[`shunwei${seat.seatNumber}`].visible = false;
                        }
                    }
                    else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.shunwei_three_been.some(element => element && element.actorNr == seat.actorNr)) {
                            this.gameScreen[`shunwei${seat.seatNumber}`].visible = false;
                        }
                    }
                }
                else {
                    this.gameScreen[`shunwei${i}`] && (this.gameScreen[`shunwei${i}`].visible = false);
                }
            }
        }

        public chuanshunwei() {

            if (this.proxy.gameState.lunci != 99) {
                this.syncMyTurnState("isChoosingNext");
                this.gameScreen.isChoosingNextText = true;
            } else {
                this.syncMyTurnState("isVotingPerson");
                this.gameScreen.isChoosingNextText = false;
            }

            this.setChoosingNextOrVotingPersonUI();

            if (!this.gameScreen.shunwei1.visible
                && !this.gameScreen.shunwei2.visible
                && !this.gameScreen.shunwei3.visible
                && !this.gameScreen.shunwei4.visible
                && !this.gameScreen.shunwei5.visible
                && !this.gameScreen.shunwei6.visible
                && !this.gameScreen.shunwei7.visible
                && !this.gameScreen.shunwei8.visible
            ) {
                this.onegameend();
            }
        }

        public shunwei(nextNr: string) {
            this.syncMyTurnState("", Receiver.Self);

            if (this.proxy.gameState.lunci == 99) {
                this.gameScreen.onejieguo.visible = false;
                this.gameScreen.isOthersTurn = false;
                this.gameScreen.isWaitOthersTouRen = true;
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

        public lcfskill() {
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.onelcftongbu);
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.twolcftongbu);
            } else if (this.proxy.gameState.lunci == 3) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.threelcftongbu);
            }
            this.chuanshunwei();
        }

        public ybrskill() {
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

        public zgqskill() {
            const animConfig = [
                { controlName: "zgqskill1", index: 0 },
                { controlName: "zgqskill2", index: 1 },
                { controlName: "zgqskill3", index: 2 },
                { controlName: "zgqskill4", index: 3 }
            ];

            animConfig.forEach(anim => {
                const animName = this.proxy.gameState.baowulist[(this.proxy.gameState.lunci - 1) * 4 + anim.index];
                const antiqueObject = this.proxy.antiquesMap.get(animName);
                let control = this.gameScreen[anim.controlName] as eui.Button;
                let antiqueGroup = control.getChildByName("antique-group") as eui.Group;
                let image = antiqueGroup.getChildByName("antique-content") as eui.Image;
                image.source = antiqueObject.source;
                let label = control.getChildByName("antique-label") as eui.Label;
                label.text = antiqueObject.name;

                control.enabled = true;
            });
        }

        public zgqskilling(message: string) {
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.onezgqtongbu, message);
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.twozgqtongbu, message);
            } else if (this.proxy.gameState.lunci == 3) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.threezgqtongbu, message);
            }
            this.chuanshunwei();
        }

        public fangzhenskill() {
            if (this.proxy.gameState.ybrskill[2] > 0) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.playerInfor[2].onetouxi = true;
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.playerInfor[2].twotouxi = true;
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.playerInfor[2].threetouxi = true;
                }
                this.proxy.gameState.ybrskill[2]--;
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
            let skilled = this.proxy.gameState.role.findIndex(xx => xx && xx.actorNr == this.proxy.gameState.seats[Nr2].actorNr);
            if (1 <= skilled && skilled <= 5) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, Nr + "号位是许愿阵营");
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.playerInfor[2].onebaowu = Nr;
                    this.proxy.gameState.playerInfor[2].onezhenjia = "许愿阵营"
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.playerInfor[2].twobaowu = Nr;
                    this.proxy.gameState.playerInfor[2].twozhenjia = "许愿阵营"
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.playerInfor[2].threebaowu = Nr;
                    this.proxy.gameState.playerInfor[2].threezhenjia = "许愿阵营"
                }
            } else if (6 <= skilled && skilled <= 8) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, Nr + "号位是老朝奉阵营");
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.gameState.playerInfor[2].onebaowu = Nr;
                    this.proxy.gameState.playerInfor[2].onezhenjia = "老朝奉阵营"
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.gameState.playerInfor[2].twobaowu = Nr;
                    this.proxy.gameState.playerInfor[2].twozhenjia = "老朝奉阵营"
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.gameState.playerInfor[2].threebaowu = Nr;
                    this.proxy.gameState.playerInfor[2].threezhenjia = "老朝奉阵营"
                }
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
            this.gameScreen.isChoosingNextText = false;
            this.gameScreen.isLastPlayer = true;
            this.gameScreen.isChoosingNext = false;
            this.gameScreen.onegameend.visible = true;
        }

        public tongzhi(message: string) {
            this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, message);
        }

        public baowu_tongzhi(message: string) {
            this.sendNotification(SceneCommand.SHOW_ROUND_POPUP, message);
        }

        public onegameend2() {
            this.syncMyTurnState("isSpeaking", Receiver.All);
            this.gameScreen.onegameend.visible = false;
            this.gameScreen.isLastPlayer = false;
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "第一轮结束，开始发言");
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "第二轮结束，开始发言");
            } else if (this.proxy.gameState.lunci == 3) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "第三轮结束，开始发言");
            }
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.starttoupiao);

        }

        public start_toupiao_button() {
            this.gameScreen.isSpeaking = true;
            this.gameScreen.isOthersTurn = false;
        }

        public onespeakend() {
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "开始录入票数");
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.toupiaoui);
        }

        public toupiaoui() {
            this.gameScreen.isSpeaking = false;
            const animConfig = [
                { controlName: "toupiao1", index: 0 },
                { controlName: "toupiao2", index: 1 },
                { controlName: "toupiao3", index: 2 },
                { controlName: "toupiao4", index: 3 }
            ];
            animConfig.forEach(anim => {
                const animName = this.proxy.gameState.baowulist[(this.proxy.gameState.lunci - 1) * 4 + anim.index];
                const antiqueObject = this.proxy.antiquesMap.get(animName);
                let control = this.gameScreen[anim.controlName] as eui.Button;
                let antiqueGroup = control.getChildByName("antique-group") as eui.Group;
                let image = antiqueGroup.getChildByName("antique-content") as eui.Image;
                image.source = antiqueObject.source;
                let label = control.getChildByName("antique-label") as eui.Label;
                label.text = antiqueObject.name;
                control.enabled = true;
            });
            this.gameScreen.isMyTurn = false;
            this.gameScreen.isOthersTurn = false;
            this.gameScreen.isSpeaking = false;
            this.gameScreen.isVoteVisible = true;
            this.gameScreen.qingkong.enabled = true;
            this.gameScreen.toupiaoqueren.enabled = true;
            if (this.proxy.gameState.lunci == 1) {
                this.zongpiaoshu = 2;
                this.sypiaoshu = 2;
                this.muqianpiaoshu = 2;
            } else if (this.proxy.gameState.lunci == 2) {
                this.zongpiaoshu = 4;
                this.sypiaoshu += 2;
                this.muqianpiaoshu += 2;
            } else if (this.proxy.gameState.lunci == 3) {
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
            this.gameScreen.isVoteVisible = false;
            this.gameScreen.isVoteEnd = true;
            this.gameScreen.toupiao1.enabled = false;
            this.gameScreen.toupiao2.enabled = false;
            this.gameScreen.toupiao3.enabled = false;
            this.gameScreen.toupiao4.enabled = false;
            this.gameScreen.qingkong.enabled = false;
            this.gameScreen.toupiaoqueren.visible = false;
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.piaoshu, "0" + this.baowu1 + "0" + this.baowu2 + "0" + this.baowu3 + "0" + this.baowu4);
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.piaoshu2, "0" + this.baowu1 + "0" + this.baowu2 + "0" + this.baowu3 + "0" + this.baowu4);
            } else if (this.proxy.gameState.lunci == 3) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.piaoshu3, "0" + this.baowu1 + "0" + this.baowu2 + "0" + this.baowu3 + "0" + this.baowu4);
            }
        }

        public piaoshujisuan(toupiao: Array<any>) {

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
            this.gameScreen.voteing = i + "/" + this.proxy.gameState.maxPlayers + "  已完成投票"
            if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                if (i == this.proxy.gameState.maxPlayers) {
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
            this.gameScreen.isVoteEnd = false;
            this.gameScreen.qingkong.visible = false;
            this.gameScreen.piaoshu.visible = false;
            this.gameScreen.toupiaoqueren.visible = false;
            this.gameScreen.onejieguo.visible = true;
            if (this.proxy.gameState.lunci == 2) {
                this.gameScreen.startno2.label = "开始第三轮";
                this.gameScreen.onejieguo.text = "第二轮结果";
            } else if (this.proxy.gameState.lunci == 3) {
                this.gameScreen.startno2.label = "开始鉴人环节";
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
                this.sendNotification(SceneCommand.SHOW_RESULT_POPUP)
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
                this.sendNotification(SceneCommand.SHOW_RESULT_POPUP)
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
                this.sendNotification(SceneCommand.SHOW_RESULT_POPUP)
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
                    this.sendNotification(SceneCommand.SHOW_RESULT_WINDOW);
                } else if (this.proxy.gameState.defen == 6) {
                    this.gameScreen.startno2.visible = false;
                    this.sendNotification(SceneCommand.SHOW_RESULT_WINDOW);
                } else {
                    this.gameScreen.isWaitTouRen = true;
                    if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                        this.gameScreen.startno2.visible = true;
                    }
                }
            } else {
                this.gameScreen.isWaitNextTurn = true;
                if (this.proxy.loadBalancingClient.myRoomMasterActorNr() == this.proxy.loadBalancingClient.myActor().actorNr) {
                    this.gameScreen.startno2.visible = true;
                }
            }
        }

        public startno2() {
            this.gameScreen.startno2.visible = false;
            if (this.proxy.gameState.lunci == 1) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.starttwo);
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.starttwo);
            } else if (this.proxy.gameState.lunci == 3) {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "鉴人环节");
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.touren);
            }
        }

        public starttwo() {
            this.gameScreen.isWaitNextTurn = false;
            this.gameScreen.isVoteVisible = false;
            this.gameScreen.toupiao11.visible = false;
            this.gameScreen.toupiao21.visible = false;
            this.gameScreen.toupiao31.visible = false;
            this.gameScreen.toupiao41.visible = false;
            this.gameScreen.startno2.visible = false;
            this.gameScreen.onejieguo.visible = false;

            this.gameScreen.isFirstRound = false;
            this.gameScreen.isSecondRound = this.proxy.gameState.lunci == 1;
            this.gameScreen.isThirdRound = this.proxy.gameState.lunci == 2;

            if (this.proxy.gameState.lunci == 1) {
                this.proxy.gameState.lunci = 2;
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.baowutongzhi);
                this.proxy.gameState.shunwei_two_been[1] = this.proxy.gameState.shunwei_one_been[this.proxy.gameState.shunwei_one_been.length - 1];
                this.xingdong(this.proxy.gameState.seats.findIndex(seat => seat && seat.actorNr == this.proxy.gameState.shunwei_two_been[1].actorNr));
            } else if (this.proxy.gameState.lunci == 2) {
                this.proxy.gameState.lunci = 3;
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.baowutongzhi);
                this.proxy.gameState.shunwei_three_been[1] = this.proxy.gameState.shunwei_two_been[this.proxy.gameState.shunwei_two_been.length - 1];
                this.xingdong(this.proxy.gameState.seats.findIndex(seat => seat && seat.actorNr == this.proxy.gameState.shunwei_three_been[1].actorNr));
            }
        }

        public tourenui() {
            this.gameScreen.isChoosingNextText = true;
            this.gameScreen.isWaitTouRen = false;
            this.gameScreen.isVoteVisible = false;
            this.gameScreen.startno2.visible = false;
            this.proxy.gameState.lunci = 99;

            // note this UI need all of us show isChoosingNext buttons.
            this.syncMyTurnState("isVotingPerson", Receiver.All);

            if (this.proxy.isActorLocal(this.proxy.gameState.role[1])
                || this.proxy.isActorLocal(this.proxy.gameState.role[2])
                || this.proxy.isActorLocal(this.proxy.gameState.role[3])
                || this.proxy.isActorLocal(this.proxy.gameState.role[4])
                || this.proxy.isActorLocal(this.proxy.gameState.role[5])) {
                this.gameScreen.touren_note.text = "找出老朝奉";
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[6])) {
                this.gameScreen.touren_note.text = "找出许愿";
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[7])) {
                this.gameScreen.touren_note.text = "找出方震";
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[8])) {
                this.gameScreen.touren_note.text = "装作在选人的样子";
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

            console.log("check tourenjieguo");
            if (i == this.proxy.gameState.maxPlayers) {
                this.gameScreen.isWaitOthersTouRen = false;
                console.log("check tourenjieguo finished.");
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
                    message1 = "找到老朝奉";
                    this.proxy.gameState.defen++;
                    this.proxy.gameState.findPeopleScore++;
                } else {
                    message1 = "没找到老朝奉";
                }
                if (this.proxy.gameState.role[1] && this.proxy.gameState.touren[6] == this.proxy.gameState.role[1]) {
                    message2 = "找到许愿";
                } else {
                    message2 = "没找到许愿";
                    this.proxy.gameState.defen += 2;
                    this.proxy.gameState.findPeopleScore += 2;
                }
                if (this.proxy.gameState.role[2] && this.proxy.gameState.touren[7] == this.proxy.gameState.role[2]) {
                    message3 = "找到方震";
                } else {
                    message3 = "没找到方震";
                    this.proxy.gameState.defen++;
                    this.proxy.gameState.findPeopleScore++;
                }
                if (this.proxy.gameState.defen < 6) {
                    isshengli = "许愿阵营失败";
                } else {
                    isshengli = "许愿阵营胜利";
                }
                this.zhaoren();
                this.sendNotification(SceneCommand.SHOW_RESULT_WINDOW);
            }
        }

        public xuyuanweizhi: number;
        public fangzhenweizhi: number;
        public laochaofengweizhi: number;
        public zhaoren() {
            this.xuyuanweizhi = this.proxy.gameState.seats.findIndex(seat => seat && this.proxy.gameState.role[1] && seat.actorNr == this.proxy.gameState.role[1].actorNr);
            this.fangzhenweizhi = this.proxy.gameState.seats.findIndex(seat => seat && this.proxy.gameState.role[2] && seat.actorNr == this.proxy.gameState.role[2].actorNr);
            this.laochaofengweizhi = this.proxy.gameState.seats.findIndex(seat => seat && this.proxy.gameState.role[6] && seat.actorNr == this.proxy.gameState.role[6].actorNr);
            this.proxy.gameState.weizhi_xuyuan = this.xuyuanweizhi;
            this.proxy.gameState.weizhi_fangzhen = this.fangzhenweizhi;
            this.proxy.gameState.weizhi_laochaofeng = this.laochaofengweizhi;
        }
    }
}