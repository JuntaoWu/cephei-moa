namespace moa {

    export class Club {
        public id: string;
        public attr: string;
        public district: string;
        public phone: string;
        public name: string;
        public city: string;
        public level: string;
        public time: string;
        public province: string;

        public games: Array<number>;  // Array of gameIconId.
        public game_1: string;
        public game_2: string;
        public game_3: string;
        public game_4: string;
    }
}