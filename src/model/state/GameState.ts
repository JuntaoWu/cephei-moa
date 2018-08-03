
module game {
    export class GameState {

        public roomName: string = undefined;
        public players: number = 0;
        public maxPlayers: number = 2;

        public phase: GamePhase = GamePhase.Preparing;

        public seats: Array<ActorModel> = [];

        public role:Array<ActorModel> = [];

        public shunwei_one_been:Array<ActorModel> = [];
        public toupiao:Array<any> = [];
        public baowulist:Array<any>=["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
        public onezj:Array<any>=["真","真","假","假"];
        public twozj:Array<any>=["真","真","假","假"];
        public threezj:Array<any>=["真","真","假","假"];        
        public hyyskill:number=100;
        public mhjnskill:number=100;
        public firstone: number = 0;
        public onelcfskill:boolean=false;
        public oneybrskill:number=0;

        //public initialized: boolean = false;
    }
}