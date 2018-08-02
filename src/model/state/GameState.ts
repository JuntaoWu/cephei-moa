
module game {
    export class GameState {

        public roomName: string;
        public players: number;
        public maxPlayers: number;

        public phase: GamePhase;

        public seats: Array<Photon.LoadBalancing.Actor>;

        public role:Array<Photon.LoadBalancing.Actor>;

        public shunwei_one_been:Array<Photon.LoadBalancing.Actor>;
    }
}