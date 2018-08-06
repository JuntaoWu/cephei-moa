
module game {
    export class GameState {

        public roomName: string = undefined;
        public players: number = 0;
        public maxPlayers: number = 2;

        public phase: GamePhase = GamePhase.Preparing;

        public seats: Array<ActorModel> = [];

        public role: Array<ActorModel> = [];
        public touren:Array<any>=[];
        public shunwei_one_been: Array<ActorModel> = [];
        public shunwei_two_been: Array<ActorModel> = [];
        public shunwei_three_been:Array<ActorModel>=[];
        public toupiao: Array<any> = [];
        public toupiao2: Array<any> = [];
        public toupiao3: Array<any> = [];
        public baowulist: Array<any> = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
        public baowulist2: Array<any> = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
        public toupiaojieguo1:Array<any> = [];
        public toupiaojieguo2:Array<any> = [];
        public toupiaojieguo3:Array<any> = [];
        public onezj: Array<any> = ["真", "真", "假", "假"];
        public twozj: Array<any> = ["真", "真", "假", "假"];
        public threezj: Array<any> = ["真", "真", "假", "假"];
        public hyyskill: number = 100;
        public mhjnskill: number = 100;
        public firstone: number = 0;
        public onelcfskill: boolean = false;
        public twolcfskill: boolean = false;
        public threelcfskill: boolean = false;
        public oneybrskill: number = 0;
        public twoybrskill: number = 0;
        public threeybrskill: number = 0;
        public onezgqskill: number = 100;
        public twozgqskill: number = 100;
        public threezgqskill: number = 100;
        public lunci:number=1;
        public defen:number=0;

        public zhenying:string="haha";
        public juese:string="haha";
        public jueselist:Array<any>=["许愿","方震","姬云浮","黄烟烟","木户加奈","老朝奉","药不然","郑国渠"];
        public onebaowu:string="haha";
        public onezhenjia:string="haha";
        public onebaowu2:string="haha";
        public onezhenjia2:string="haha";
        public onetouxi:boolean=false;
        public twobaowu:string="haha";
        public twozhenjia:string="haha";
        public twobaowu2:string="haha";
        public twozhenjia2:string="haha";
        public twotouxi:boolean=false;
        public threebaowu:string="haha";
        public threezhenjia:string="haha";
        public threebaowu2:string="haha";
        public threezhenjia2:string="haha";
        public threetouxi:boolean=false;
    }
}