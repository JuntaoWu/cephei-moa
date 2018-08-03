
module game {
    export class GameState {

        public roomName: string;
        public players: number;
        public maxPlayers: number;

        public phase: GamePhase;

        public seats: Array<ActorModel>;

        public role:Array<ActorModel>;

        public shunwei_one_been:Array<any>;
    }
}