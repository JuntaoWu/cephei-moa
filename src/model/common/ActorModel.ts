
module game {

    export class ActorModel {
        public actorNr: number;
        public name: string;

        public constructor(actor?: any) {

            if (actor) {
                this.actorNr = actor.actorNr;
                this.name = actor.name;
            }

        }
    }
}