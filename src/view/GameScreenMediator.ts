

namespace moa {

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
        private skillAnimAdded: boolean = false;
        private myRole: Role;

        public constructor(viewComponent: any) {
            super(GameScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.gameScreen.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            //this.gameScreen.btnSeat1.addEventListener(egret.TouchEvent.TOUCH_TAP,this.findSeat2,this);
            this.gameScreen.btnGuide.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showGuide, this);
            this.gameScreen.btnQuit.addEventListener(egret.TouchEvent.TOUCH_TAP, this.quitClick, this);
            this.gameScreen.btnGameInfo.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showGameInfo, this);
            this.gameScreen.btnGameRecord.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showGameRecord, this);

            this.gameScreen.btnEnableMic.addEventListener(egret.TouchEvent.CHANGE, this.changeEnableMic, this);

            this.findSeat();
        }

        public async initData() {
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;
            this.skillAnimAdded = false;
            this.gameScreen.isLastPlayer = false;

            console.log("GameScreen initData");

            this.gameScreen.btnEnableMic.enabled = this.proxy.isIMEnabled;
            this.gameScreen.btnEnableMic.selected = false;

            console.log("EnableMic:", this.gameScreen.btnEnableMic.selected);

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

        private changeEnableMic(event: egret.TouchEvent) {
            console.log("changeEnableMic", this.gameScreen.btnEnableMic.selected);
            this.proxy.enableMic(this.gameScreen.btnEnableMic.selected);
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
                GameProxy.ONE_ZGQSKILL,
                GameProxy.TOUREN,
                GameProxy.TOUREN_JIEGUO,
                GameCommand.JOIN_ROOM,
                GameProxy.START_TOUPIAO_BUTTON,
                GameProxy.ROLEING,
                GameProxy.AUTH_EDN
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
                case GameProxy.AUTH_EDN: {
                    this.isWaitTouRen();
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
                this.myRole = this.proxy.rolesMap.get(roleIndex.toString());

                this.gameScreen.role = this.myRole;
                this.gameScreen.isNotFangZhen = this.myRole.name != "方震"
                this.gameScreen.isFangZhen = this.myRole.name == "方震";
                this.gameScreen.isYaoBuran = this.myRole.name == "药不然";
                this.gameScreen.isZhengGuoqu = this.myRole.name == "郑国渠";

                allValidSeats.forEach((seat) => {
                    this.gameScreen[`ybrskill${seat.seatNumber}`].update(seat);
                    this.gameScreen[`fangzhenskill${seat.seatNumber}`].update(seat);
                    this.gameScreen[`shunwei${seat.seatNumber}`].update(seat);
                });

                if (!this.skillAnimAdded) {

                    let oldDragonBone = this.gameScreen.btnSkill.getChildByName("dragonBone") as dragonBones.EgretArmatureDisplay;
                    if (oldDragonBone) {
                        this.gameScreen.btnSkill.removeChild(oldDragonBone);
                    }
                    const dragonBone = DragonBones.createDragonBone("skills", this.myRole.skillRes);
                    dragonBone.name = "dragonBone";
                    dragonBone.animation.play(this.myRole.skillRes, 0);
                    dragonBone.animation.animationConfig.timeScale = 0.5;
                    dragonBone.x = 250;
                    dragonBone.y = 120;
                    dragonBone.scaleX = 0.5;
                    dragonBone.scaleY = 0.5;
                    this.gameScreen.btnSkill.addChild(dragonBone);
                    this.skillAnimAdded = true;
                }
            }

            switch (data.phase) {
                case GamePhase.Preparing:
                    this.gameScreen.isInitial = !isWaiting && !isAllReady;
                    this.gameScreen.isWaiting = isWaiting;
                    this.gameScreen.isAllReady = isAllReady;
                    this.gameScreen.isAllRolesReady = false;
                    this.gameScreen.canChooseSeat = true;
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

                    this.gameScreen.btnjs3.filters = this.proxy.gameState.maxPlayers != 8 ? [ColorFilter.grey] : [];
                    this.gameScreen.btnjs8.filters = this.proxy.gameState.maxPlayers == 6 ? [ColorFilter.grey] : [];

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

                    const mySeat = this.proxy.gameState.seats.find(seat => seat && seat.actorNr == this.proxy.actorNr);
                    this.setMyTurnState(data.seats);
                    const currentAction = mySeat.action;
                    if (currentAction != this.previousAction) {
                        this.previousAction = currentAction;
                        this.setAnims();
                        this.setChoosingNextOrVotingPersonUI();
                        this.setToupiaoUI();
                        this.tourenjieguo2(this.proxy.gameState.touren);
                    }

                    this.gameScreen.isWaitNextTurnOrWaitTouRen = this.gameScreen.isWaitNextTurn || this.gameScreen.isWaitTouRen;
                    break;
            }

            this.touxiang(data.seats);
        }

        private previousAction: string;

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

                const control = this.gameScreen[config.controlName] as eui.Group;
                let content = control.getChildByName("content") as eui.Image;
                let nickName = control.getChildByName("nickName") as eui.Label;
                let normalBg = control.getChildByName("normalBg") as eui.Image;
                let masterBg = control.getChildByName("masterBg") as eui.Image;
                let selfMark = control.getChildByName("selfMark") as eui.Image;

                if (seats[config.seatNumber]) {
                    content.source = platform.name == "DebugPlatform" ? config.defaultSource : (seats[config.seatNumber].avatarUrl || config.defaultSource);
                    nickName.text = seats[config.seatNumber].name || "blank name";
                    masterBg.visible = this.proxy.isActorMaster(seats[config.seatNumber]);
                    normalBg.visible = !masterBg.visible;
                    selfMark.visible = this.proxy.isActorLocal(seats[config.seatNumber]);
                    content.visible = true;
                    nickName.visible = true;

                    control.filters = (!platform.isConnected || seats[config.seatNumber].suspended) ? [ColorFilter.grey] : [];
                }
                else {
                    normalBg.visible = true;
                    masterBg.visible = false;
                    selfMark.visible = false;
                    content.visible = false;
                    nickName.visible = false;

                    control.filters = [];
                }
            });
        }

        public startChooseRole() {
            this.skillAnimAdded = false;
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

        public xingdong(message: number) {
            if (this.proxy.isMasterClient) {
                const actorModel = this.proxy.gameState.seats[message] as ActorModel;
                this.proxy.updateActorState(actorModel.actorNr, "isAuthing", true);
            }
        }

        private syncMyTurnState(action, updateOthers: boolean = false, receiver: Receiver = Receiver.Self) {
            this.proxy.updateMyState(action, updateOthers, receiver);
        }

        private setMyTurnState(seats: ActorModel[]) {
            const actionList = ["isAuthing", "isSkilling", "isChoosingSkillingTarget", "isChoosingNext", "isSpeaking", "isVoting", "isVoteEnd", "isWaitNextTurn", "isWaitTouRen", "isVotingPerson", "isWaitOthersTouRen"];
            const mySeat = seats.find(seat => seat && seat.actorNr == this.proxy.actorNr);
            const actionSeats = seats.filter(seat => seat && seat.action);

            this.gameScreen.isMyTurn = mySeat && mySeat.action && mySeat.action != "isSpeaking";
            this.gameScreen.isOthersTurn = !mySeat.action && actionSeats.length > 0 && actionSeats.some(seat => seat && (/isAuthing|isSkilling|isChoosingSkillingTarget|isChoosingNext/.test(seat.action)));
            actionList.forEach(s => {
                this.gameScreen[s] = mySeat && mySeat.action == s;
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
                this.syncMyTurnState("isSkilling", true);
            }
        }

        public applySkill(event: egret.TouchEvent) {
            if (this.gameScreen.role.id == 2) {
                this.syncMyTurnState("isChoosingSkillingTarget", true);
                this.fangzhenskill();
            }
            else if (this.gameScreen.role.id == 6) {
                this.lcfskill();
            }
            else if (this.gameScreen.role.id == 7) {
                this.syncMyTurnState("isChoosingSkillingTarget", true);
                this.ybrskill();
            }
            else if (this.gameScreen.role.id == 8) {
                this.syncMyTurnState("isChoosingSkillingTarget", true);
                this.zgqskill();
            }
        }

        public skipSkill(event: egret.TouchEvent) {
            let roleId = this.myRole.id;
            const hasBeenAttacked = this.hasBeenAttacked();
            if (roleId == 6 || roleId == 7 || roleId == 8
                || (this.proxy.isActorLocal(this.proxy.gameState.role[2]) && !hasBeenAttacked)) {
                // set playerInfo for history.
                this.proxy.updatePlayerInfo(`skipskill${this.proxy.gameState.lunci}`, true);
            }

            if (hasBeenAttacked) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                this.proxy.updatePlayerInfo(`touxi${this.proxy.gameState.lunci}`, true);
            }

            console.log("skipSkill");
            this.chuanshunwei();
        }

        public chooseAnim(event: egret.TouchEvent) {
            console.log(this.selectedAnims);

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
                this.syncMyTurnState("isSkilling", true);
            }

            if (this.proxy.isActorLocal(this.proxy.gameState.role[1])) {
                if (this.hasBeenAttacked()) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.proxy.updatePlayerInfo(`touxi${this.proxy.gameState.lunci}`, true);
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
                            results[0] = "无法鉴定";
                        }
                        if (this.proxy.gameState.onezgqskill == this.selectedAnims[1]) {
                            results[1] = "无法鉴定";
                        }
                        this.proxy.updatePlayerInfo("onebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("onezhenjia", results[0]);
                        this.proxy.updatePlayerInfo("onebaowu2", this.proxy.gameState.baowulist[this.selectedAnims[1]]);
                        this.proxy.updatePlayerInfo("onezhenjia2", results[1]);
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
                            results[0] = "无法鉴定";
                        }
                        if (this.proxy.gameState.twozgqskill == this.selectedAnims[1] - 4) {
                            results[1] = "无法鉴定";
                        }
                        this.proxy.updatePlayerInfo("twobaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("twozhenjia", results[0]);
                        this.proxy.updatePlayerInfo("twobaowu2", this.proxy.gameState.baowulist[this.selectedAnims[1]]);
                        this.proxy.updatePlayerInfo("twozhenjia2", results[1]);
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
                            results[0] = "无法鉴定";
                        }
                        if (this.proxy.gameState.threezgqskill == this.selectedAnims[1] - 8) {
                            results[1] = "无法鉴定";
                        }
                        this.proxy.updatePlayerInfo("threebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("threezhenjia", results[0]);
                        this.proxy.updatePlayerInfo("threebaowu2", this.proxy.gameState.baowulist[this.selectedAnims[1]]);
                        this.proxy.updatePlayerInfo("threezhenjia2", results[1]);
                    }
                }
                this.chuanshunwei();
            }
            else if (this.proxy.isActorLocal(this.proxy.gameState.role[3])) {
                if (this.hasBeenAttacked()) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.proxy.updatePlayerInfo(`touxi${this.proxy.gameState.lunci}`, true);
                    this.proxy.gameState.jyfskill = false;
                } else if (!this.proxy.gameState.jyfskill) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "无法鉴定");
                    if (this.proxy.gameState.lunci == 1) {
                        this.proxy.updatePlayerInfo("onebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("onezhenjia", "无法鉴定");
                    } else if (this.proxy.gameState.lunci == 2) {
                        this.proxy.updatePlayerInfo("twobaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("twozhenjia", "无法鉴定");
                    } else if (this.proxy.gameState.lunci == 3) {
                        this.proxy.updatePlayerInfo("threebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("threezhenjia", "无法鉴定");
                    }
                } else {
                    if (this.proxy.gameState.lunci == 1) {
                        if (this.proxy.gameState.onezgqskill == this.selectedAnims[0]) {
                            results[0] = "无法鉴定";
                        }
                        else {
                            results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]];
                        }
                        this.proxy.updatePlayerInfo("onebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("onezhenjia", results[0]);
                    }
                    else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twozgqskill == this.selectedAnims[0] - 4) {
                            results[0] = "无法鉴定";
                        }
                        else {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                        }
                        this.proxy.updatePlayerInfo("twobaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("twozhenjia", results[0]);
                    }
                    else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threezgqskill == this.selectedAnims[0] - 8) {
                            results[0] = "无法鉴定";
                        }
                        else {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8];
                        }
                        this.proxy.updatePlayerInfo("threebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("threezhenjia", results[0]);
                    }
                }
                this.chuanshunwei();
            }
            else if (this.proxy.isActorLocal(this.proxy.gameState.role[4])) {
                if (this.hasBeenAttacked()) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.proxy.updatePlayerInfo(`touxi${this.proxy.gameState.lunci}`, true);
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
                            results[0] = "无法鉴定";
                        }
                        this.proxy.updatePlayerInfo("onebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("onezhenjia", results[0]);
                    }
                    else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twolcfskill) {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                        }

                        if (this.proxy.gameState.twozgqskill == this.selectedAnims[0] - 4 || this.proxy.gameState.hyyskill == 2) {
                            results[0] = "无法鉴定";
                        }
                        this.proxy.updatePlayerInfo("twobaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("twozhenjia", results[0]);
                    }
                    else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threelcfskill) {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8];
                        }

                        if (this.proxy.gameState.threezgqskill == this.selectedAnims[0] - 8 || this.proxy.gameState.hyyskill == 3) {
                            results[0] = "无法鉴定";
                        }
                        this.proxy.updatePlayerInfo("threebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("threezhenjia", results[0]);
                    }
                }
                this.chuanshunwei();
            }
            else if (this.proxy.isActorLocal(this.proxy.gameState.role[5])) {
                if (this.hasBeenAttacked()) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.proxy.updatePlayerInfo(`touxi${this.proxy.gameState.lunci}`, true);
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
                            results[0] = "无法鉴定";
                        }
                        this.proxy.updatePlayerInfo("onebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("onezhenjia", results[0]);

                    }
                    else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twolcfskill) {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                        }

                        if (this.proxy.gameState.twozgqskill == this.selectedAnims[0] - 4 || this.proxy.gameState.mhjnskill == 2) {
                            results[0] = "无法鉴定";
                        }
                        this.proxy.updatePlayerInfo("twobaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("twozhenjia", results[0]);
                    }
                    else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threelcfskill) {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8] == "真" ? "假" : "真";
                        }
                        else {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8];
                        }

                        if (this.proxy.gameState.threezgqskill == this.selectedAnims[0] - 8 || this.proxy.gameState.mhjnskill == 3) {
                            results[0] = "无法鉴定";
                        }
                        this.proxy.updatePlayerInfo("threebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("threezhenjia", results[0]);
                    }
                }
                this.chuanshunwei();
            }
            else if (this.proxy.isActorLocal(this.proxy.gameState.role[6])) {
                const hasBeenAttacked = this.hasBeenAttacked();
                console.log("hasBeenAttacked: ", hasBeenAttacked);
                if (this.hasBeenAttacked()) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.proxy.updatePlayerInfo(`touxi${this.proxy.gameState.lunci}`, true);
                    this.chuanshunwei();
                }
                else {
                    if (this.proxy.gameState.lunci == 1) {
                        if (this.proxy.gameState.onezgqskill == this.selectedAnims[0]) {
                            results[0] = "无法鉴定";
                        }
                        else {
                            results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]];
                        }
                        this.proxy.updatePlayerInfo("onebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("onezhenjia", results[0]);
                    }
                    else if (this.proxy.gameState.lunci == 2) {
                        if (this.proxy.gameState.twozgqskill == this.selectedAnims[0] - 4) {
                            results[0] = "无法鉴定";
                        }
                        else {
                            results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                        }
                        this.proxy.updatePlayerInfo("twobaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("twozhenjia", results[0]);
                    }
                    else if (this.proxy.gameState.lunci == 3) {
                        if (this.proxy.gameState.threezgqskill == this.selectedAnims[0] - 8) {
                            results[0] = "无法鉴定";
                        }
                        else {
                            results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8];
                        }
                        this.proxy.updatePlayerInfo("threebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("threezhenjia", results[0]);
                    }
                }
            } else if (this.proxy.isActorLocal(this.proxy.gameState.role[7])) {
                if (this.proxy.gameState.lunci == 1) {
                    if (this.proxy.gameState.onezgqskill == this.selectedAnims[0]) {
                        results[0] = "无法鉴定";
                    }
                    else {
                        results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]];
                    }
                    this.proxy.updatePlayerInfo("onebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                    this.proxy.updatePlayerInfo("onezhenjia", results[0]);
                }
                else if (this.proxy.gameState.lunci == 2) {
                    if (this.proxy.gameState.twozgqskill == this.selectedAnims[0] - 4) {
                        results[0] = "无法鉴定";
                    }
                    else {
                        results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                    }
                    this.proxy.updatePlayerInfo("twobaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                    this.proxy.updatePlayerInfo("twozhenjia", results[0]);
                }
                else if (this.proxy.gameState.lunci == 3) {
                    if (this.proxy.gameState.threezgqskill == this.selectedAnims[0] - 8) {
                        results[0] = "无法鉴定";
                    }
                    else {
                        results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8];
                    }
                    this.proxy.updatePlayerInfo("threebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                    this.proxy.updatePlayerInfo("threezhenjia", results[0]);
                }
            }
            else if (this.proxy.isActorLocal(this.proxy.gameState.role[8])) {
                if (this.hasBeenAttacked()) {
                    this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                    this.proxy.updatePlayerInfo(`touxi${this.proxy.gameState.lunci}`, true);
                    this.chuanshunwei();
                }
                else {
                    if (this.proxy.gameState.lunci == 1) {
                        results[0] = this.proxy.gameState.onezj[this.selectedAnims[0]];
                        this.proxy.updatePlayerInfo("onebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("onezhenjia", results[0]);
                    }
                    else if (this.proxy.gameState.lunci == 2) {
                        results[0] = this.proxy.gameState.twozj[this.selectedAnims[0] - 4];
                        this.proxy.updatePlayerInfo("twobaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("twozhenjia", results[0]);
                    }
                    else if (this.proxy.gameState.lunci == 3) {
                        results[0] = this.proxy.gameState.threezj[this.selectedAnims[0] - 8];
                        this.proxy.updatePlayerInfo("threebaowu", this.proxy.gameState.baowulist[this.selectedAnims[0]]);
                        this.proxy.updatePlayerInfo("threezhenjia", results[0]);
                    }
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
                this.syncMyTurnState("isChoosingNext", true);
                this.gameScreen.isChoosingNextText = true;
                this.gameScreen.touren_note.text = "选择下一位行动的玩家";
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
            this.syncMyTurnState("", false, Receiver.Self);

            if (this.proxy.gameState.lunci == 99) {
                this.syncMyTurnState("isWaitOthersTouRen");
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tourenjieguo, nextNr);
            } else {
                this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.nextNr, nextNr);
            }
        }

        public shunwei2(nextNr: string) {
            if (this.proxy.gameState.lunci == 1 && !this.proxy.gameState.shunwei_one_been.some(ss => ss && ss == this.proxy.gameState.seats[nextNr])) {
                this.proxy.gameState.shunwei_one_been.push(this.proxy.gameState.seats[nextNr]);
                const Nr = +nextNr;
                this.xingdong(Nr);
            } else if (this.proxy.gameState.lunci == 2 && !this.proxy.gameState.shunwei_two_been.some(ss => ss && ss == this.proxy.gameState.seats[nextNr])) {
                this.proxy.gameState.shunwei_two_been.push(this.proxy.gameState.seats[nextNr]);
                const Nr = +nextNr;
                this.xingdong(Nr);
            } else if (this.proxy.gameState.lunci == 3 && !this.proxy.gameState.shunwei_three_been.some(ss => ss && ss == this.proxy.gameState.seats[nextNr])) {
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
            console.log("GameScreenMediator triggered ybrskilling:", message);
            const seatNumber = +message;
            if (this.proxy.isActorLocal(this.proxy.gameState.seats[seatNumber])) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "不能对自己使用此技能");
            }
            else {
                this.proxy.ybrskilling(seatNumber);

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

        public hasBeenAttacked() {
            return this.proxy.ybrSkillTable && this.proxy.ybrSkillTable.some(attack => {
                return attack.affectRound === this.proxy.gameState.lunci
                    && this.proxy.isActorLocal(this.proxy.gameState.seats[attack.seatNumber]);
            });
        }

        public fangzhenskill() {
            if (this.hasBeenAttacked()) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你被偷袭");
                this.proxy.updatePlayerInfo(`touxi${this.proxy.gameState.lunci}`, true);
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
                // this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, Nr + "号位是许愿阵营");
                this.sendNotification(SceneCommand.SHOW_FANG_POPUP, Nr);
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.updatePlayerInfo("onebaowu", Nr);
                    this.proxy.updatePlayerInfo("onezhenjia", "许愿阵营");
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.updatePlayerInfo("twobaowu", Nr);
                    this.proxy.updatePlayerInfo("twozhenjia", "许愿阵营");
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.updatePlayerInfo("threebaowu", Nr);
                    this.proxy.updatePlayerInfo("threezhenjia", "许愿阵营");
                }
            } else if (6 <= skilled && skilled <= 8) {
                // this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, Nr + "号位是老朝奉阵营");
                this.sendNotification(SceneCommand.SHOW_FANG_POPUP, Nr);
                if (this.proxy.gameState.lunci == 1) {
                    this.proxy.updatePlayerInfo("onebaowu", Nr);
                    this.proxy.updatePlayerInfo("onezhenjia", "老朝奉阵营");
                } else if (this.proxy.gameState.lunci == 2) {
                    this.proxy.updatePlayerInfo("twobaowu", Nr);
                    this.proxy.updatePlayerInfo("twozhenjia", "老朝奉阵营");
                } else if (this.proxy.gameState.lunci == 3) {
                    this.proxy.updatePlayerInfo("threebaowu", Nr);
                    this.proxy.updatePlayerInfo("threezhenjia", "老朝奉阵营");
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
            this.syncMyTurnState("isSpeaking", false, Receiver.All);
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
            //this.gameScreen.isSpeaking = true;
            this.gameScreen.isOthersTurn = false;
        }

        public onespeakend() {
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.tongzhi, "开始录入票数");
            this.proxy.loadBalancingClient.sendMessage(CustomPhotonEvents.toupiaoui);
        }

        public setToupiaoUI() {

            if (this.proxy.gameState.lunci == 99) {
                return;
            }

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
                let bgNormal = antiqueGroup.getChildByName("antique-normal");
                let bgSelected = antiqueGroup.getChildByName("antique-selected");
                bgNormal.visible = true;
                bgSelected.visible = false;
                let image = antiqueGroup.getChildByName("antique-content") as eui.Image;
                image.source = antiqueObject.source;
                let label = control.getChildByName("antique-label") as eui.Label;
                label.text = antiqueObject.name;
                control.enabled = true;
            });

            if (this.proxy.gameState.lunci == 1) {
                this.sypiaoshu = 2;
                this.muqianpiaoshu = 2;
            }
            else if (this.proxy.gameState.lunci == 2 || this.proxy.gameState.lunci == 3) {
                this.muqianpiaoshu = this.sypiaoshu = this.proxy.getSyPiaoshu() + 2;
            }
            this.gameScreen.toupiao11.text = "0";
            this.gameScreen.toupiao21.text = "0";
            this.gameScreen.toupiao31.text = "0";
            this.gameScreen.toupiao41.text = "0";
            this.baowu1 = 0;
            this.baowu2 = 0;
            this.baowu3 = 0;
            this.baowu4 = 0;
            this.gameScreen.piaoshu.text = this.muqianpiaoshu + "/" + this.sypiaoshu;
        }

        public toupiaoui() {
            this.syncMyTurnState("isVoting", false, Receiver.All);
        }

        public qingkong() {
            [1, 2, 3, 4].forEach(num => {
                let control = this.gameScreen[`toupiao${num}`] as eui.Button;
                let antiqueGroup = control.getChildByName("antique-group") as eui.Group;
                let bgNormal = antiqueGroup.getChildByName("antique-normal");
                let bgSelected = antiqueGroup.getChildByName("antique-selected");
                bgNormal.visible = true;
                bgSelected.visible = false;
            });
            this.baowu1 = 0;
            this.baowu2 = 0;
            this.baowu3 = 0;
            this.baowu4 = 0;
            this.gameScreen.toupiao11.text = "0";
            this.gameScreen.toupiao21.text = "0";
            this.gameScreen.toupiao31.text = "0";
            this.gameScreen.toupiao41.text = "0";
            this.muqianpiaoshu = this.sypiaoshu;
            this.gameScreen.piaoshu.text = this.muqianpiaoshu + "/" + this.sypiaoshu;
        }

        public baowu1: number = 0;
        public baowu2: number = 0;
        public baowu3: number = 0;
        public baowu4: number = 0;
        public sypiaoshu: number = 0;
        public muqianpiaoshu: number = 0;
        public toupiao(baowuNr: string) {
            if (this.muqianpiaoshu <= 0) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "你的票数不足");
            } else {
                let control = this.gameScreen[`toupiao${baowuNr}`] as eui.Button;
                let antiqueGroup = control.getChildByName("antique-group") as eui.Group;
                let bgNormal = antiqueGroup.getChildByName("antique-normal");
                let bgSelected = antiqueGroup.getChildByName("antique-selected");
                bgNormal.visible = false;
                bgSelected.visible = true;
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
                this.gameScreen.piaoshu.text = this.muqianpiaoshu + "/" + this.sypiaoshu;
            }
        }

        public toupiaoqueren() {
            this.sypiaoshu = this.muqianpiaoshu;
            const myRole = this.gameScreen.role;
            this.proxy.setSypiaoshu(this.sypiaoshu);
            this.syncMyTurnState("isVoteEnd");
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

            if (this.proxy.gameState.lunci != 3 && this.proxy.isMasterClient) {
                this.syncMyTurnState("isWaitNextTurn", false, Receiver.All);
                this.gameScreen.startno2.visible = true;
            }
        }

        public isWaitTouRen() {
            if (this.proxy.gameState.defen < 2) {
                this.gameScreen.startno2.visible = false;
                this.sendNotification(SceneCommand.SHOW_RESULT_WINDOW);
                if (this.proxy.isMasterClient) {
                    this.proxy.updateUserGameRecords();
                }
            }
            else if (this.proxy.gameState.defen == 6) {
                this.gameScreen.startno2.visible = false;
                this.sendNotification(SceneCommand.SHOW_RESULT_WINDOW);
                if (this.proxy.isMasterClient) {
                    this.proxy.updateUserGameRecords();
                }
            }
            else if (this.proxy.isMasterClient) {
                this.syncMyTurnState("isWaitTouRen", false, Receiver.All);
                this.gameScreen.startno2.visible = true;
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
            this.gameScreen.startno2.visible = false;
            this.proxy.gameState.lunci = 99;

            // note this UI need all of us show isChoosingNext buttons.
            this.syncMyTurnState("isVotingPerson", false, Receiver.All);

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
            if (!touren) {
                return;
            }
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
                if (this.proxy.gameState.role[6] && this.proxy.gameState.touren[1] && this.proxy.gameState.touren[1].actorNr == this.proxy.gameState.role[6].actorNr) {
                    this.proxy.gameState.lcfpiao++;
                }
                if (this.proxy.gameState.role[6] && this.proxy.gameState.touren[2] && this.proxy.gameState.touren[2].actorNr == this.proxy.gameState.role[6].actorNr) {
                    this.proxy.gameState.lcfpiao++;
                }
                if (this.proxy.gameState.role[6] && this.proxy.gameState.touren[3] && this.proxy.gameState.touren[3].actorNr == this.proxy.gameState.role[6].actorNr) {
                    this.proxy.gameState.lcfpiao++;
                }
                if (this.proxy.gameState.role[6] && this.proxy.gameState.touren[4] && this.proxy.gameState.touren[4].actorNr == this.proxy.gameState.role[6].actorNr) {
                    this.proxy.gameState.lcfpiao++;
                }
                if (this.proxy.gameState.role[6] && this.proxy.gameState.touren[5] && this.proxy.gameState.touren[5].actorNr == this.proxy.gameState.role[6].actorNr) {
                    this.proxy.gameState.lcfpiao++;
                }
                if (this.proxy.gameState.lcfpiao >= 3) {
                    message1 = "找到老朝奉";
                    this.proxy.gameState.defen++;
                    this.proxy.gameState.findPeopleScore++;
                } else {
                    message1 = "没找到老朝奉";
                }
                if (this.proxy.gameState.role[1] && this.proxy.gameState.touren[6] && this.proxy.gameState.touren[6].actorNr == this.proxy.gameState.role[1].actorNr) {
                    message2 = "找到许愿";
                } else {
                    message2 = "没找到许愿";
                    this.proxy.gameState.defen += 2;
                    this.proxy.gameState.findPeopleScore += 2;
                }
                if (this.proxy.gameState.role[2] && this.proxy.gameState.touren[7] && this.proxy.gameState.touren[7].actorNr == this.proxy.gameState.role[2].actorNr) {
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
                console.log(this.proxy.gameState.lcfpiao);
                console.log(message1);
                console.log(message2);
                console.log(message3);

                this.sendNotification(SceneCommand.SHOW_RESULT_WINDOW);
                if (this.proxy.isMasterClient) {
                    this.proxy.updateUserGameRecords();
                }
            }
        }

        public tourenjieguo2(touren: Array<any>) {
            if (!touren) {
                return;
            }
            let i: number = 0;
            touren.forEach(element => {
                if (element) {
                    i++;
                }
            });
            if (i == this.proxy.gameState.maxPlayers) {
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