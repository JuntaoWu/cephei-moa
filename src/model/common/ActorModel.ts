
module game {

    export class ActorModel {
        public actorNr: number;
        public name: string;
        public avatarUrl: string;

        public constructor(actor?: Photon.LoadBalancing.Actor) {

            if (actor) {
                this.actorNr = actor.actorNr;
                this.name = actor.getCustomProperty("nickName");

                this.avatarUrl = actor.getCustomProperty("avatarUrl");
            }

        }
    }
}