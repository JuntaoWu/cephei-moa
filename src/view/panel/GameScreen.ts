
namespace moa {

    export class GameScreen extends eui.Component {

        public gameBackground: eui.Image;

        private poweredLabel: eui.Label;
        private navigationBar: eui.Group;

        public btnCreateRoom: eui.Button;
        public btnJoinRoom: eui.Button;
        public btnGuide: eui.Button;
        public btnQuit: eui.Button;
        public btnGameInfo: eui.Button;
        public btnGameRecord: eui.Button;

        public btnEnableMic: eui.ToggleButton;

        //bindings:
        public roomName: string = "";
        public role: Role;
        public isNotFangZhen: boolean = true;
        public isFangZhen: boolean = false;
        public isYaoBuran: boolean = false;
        public isZhengGuoqu: boolean = false;
        public isMasterClient: boolean = false;
        public isNormalClient: boolean = true;
        public currentPlayers: number = 0;
        public maxPlayers: number = 0;

        public isInitial: boolean = false;
        public isWaiting: boolean = false;
        public isAllReady: boolean = false;
        public isAllRolesReady: boolean = false;
        public canChooseSeat: boolean = true;
        public isChoosingRole: boolean = false;
        public isChoosingRoleandEight: boolean = false;
        public isChoosingRoleandSeven: boolean = false;
        public isChoosingRoleOrMasterClient: boolean = false;
        public isAllRolesReadyAndNormalClient: boolean = false;
        public isFirstRound = false;
        public isSecondRound = false;
        public isThirdRound = false;

        public isMyTurn = false;
        public isOthersTurn = false;
        public isAuthing = false;
        public isSkilling = false;
        public isChoosingSkillingTarget = false;
        public isChoosingNext = false;
        public isVotingPerson = false;
        public isChoosingNextOrVotingPerson: boolean = false;
        public isSpeaking: boolean = false;

        public isPhasePreparing: boolean = false;
        public isPhaseChoosingRole: boolean = false;
        public isPhaseGameInProgress: boolean = false;
        public roleing: string;
        public isLastPlayer: boolean = false;
        public isVoteEnd: boolean = false;
        public voteing: string;
        public isWaitNextTurn: boolean = false;
        public isWaitTouRen: boolean = false;
        public isChoosingNextText: boolean = false;
        public isWaitOthersTouRen: boolean = false;
        public isWaitNextTurnOrWaitTouRen: boolean = false;

        public processingPlayer = {
            name: "",
            colorName: "",
        };

        public antiquesVote: eui.Group;
        public processingActorUI: ActorUI;
        public btnSeat1: eui.Button;
        public btnSeat2: eui.Button;
        public btnSeat3: eui.Button;
        public btnSeat4: eui.Button;
        public btnSeat5: eui.Button;
        public btnSeat6: eui.Button;
        public btnSeat7: eui.Button;
        public btnSeat8: eui.Button;
        public btnjs1: eui.Button;
        public btnjs2: eui.Button;
        public btnjs3: eui.Button;
        public btnjs4: eui.Button;
        public btnjs5: eui.Button;
        public btnjs6: eui.Button;
        public btnjs7: eui.Button;
        public btnjs8: eui.Button;
        public startjs: eui.Button;
        public startgame: eui.Button;
        public btnAuth: eui.Button;
        public btnSkipAuth: eui.Button;
        public btnSkill: eui.Button;
        public Anim1: eui.Button;
        public Anim2: eui.Button;
        public Anim3: eui.Button;
        public Anim4: eui.Button;
        public shunwei1: eui.Button;
        public shunwei2: eui.Button;
        public shunwei3: eui.Button;
        public shunwei4: eui.Button;
        public shunwei5: eui.Button;
        public shunwei6: eui.Button;
        public shunwei7: eui.Button;
        public shunwei8: eui.Button;
        public onegameend: eui.Button;
        public onespeakend: eui.Button;
        public fangzhenskill1: eui.Button;
        public fangzhenskill2: eui.Button;
        public fangzhenskill3: eui.Button;
        public fangzhenskill4: eui.Button;
        public fangzhenskill5: eui.Button;
        public fangzhenskill6: eui.Button;
        public fangzhenskill7: eui.Button;
        public fangzhenskill8: eui.Button;
        public toupiao1: eui.Button;
        public toupiao2: eui.Button;
        public toupiao3: eui.Button;
        public toupiao4: eui.Button;
        public toupiao11: eui.Label;
        public toupiao21: eui.Label;
        public toupiao31: eui.Label;
        public toupiao41: eui.Label;
        public qingkong: eui.Button;
        public piaoshu: eui.Label;
        public toupiaoqueren: eui.Button;
        public startno2: eui.Button;
        public ybrskill1: ActorUI;
        public ybrskill2: eui.Button;
        public ybrskill3: eui.Button;
        public ybrskill4: eui.Button;
        public ybrskill5: eui.Button;
        public ybrskill6: eui.Button;
        public ybrskill7: eui.Button;
        public ybrskill8: eui.Button;
        public zgqskill1: eui.Button;
        public zgqskill2: eui.Button;
        public zgqskill3: eui.Button;
        public zgqskill4: eui.Button;
        public Anim5: eui.Button;
        public Anim6: eui.Button;
        public Anim7: eui.Button;
        public Anim8: eui.Button;
        public Anim9: eui.Button;
        public Anim10: eui.Button;
        public Anim11: eui.Button;
        public Anim12: eui.Button;
        public btnSkipSkill: eui.Button;
        public touren_note: eui.Label;

        public constructor() {
            super();

            this.name = "gameScreen";
            this.skinName = "skins.GameScreen";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            this.startjs.visible = false;
            this.startgame.visible = false;
            this.shunwei1.visible = false;
            this.shunwei2.visible = false;
            this.shunwei3.visible = false;
            this.shunwei4.visible = false;
            this.shunwei5.visible = false;
            this.shunwei6.visible = false;
            this.shunwei7.visible = false;
            this.shunwei8.visible = false;
            this.onegameend.visible = false;
            this.onespeakend.visible = false;
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height;
            // this.poweredLabel.y = this.stage.stageHeight - this.poweredLabel.height - 30;
            this.gameBackground.height = this.stage.stageHeight;
            this.btnEnableMic.enabled = false;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new GameScreenMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}