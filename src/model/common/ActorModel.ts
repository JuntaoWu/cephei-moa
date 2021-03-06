
namespace moa {

    export class ActorModel {
        public seatNumber?: number;
        public actorNr?: number;
        public name: string;
        public avatarUrl: string;
        public isLocal?: boolean;
        public isMaster?: boolean;
        public color?: { color?: string, source?: string };
        public isMyTurn?: boolean;
        public action?: string;
        public suspended?: boolean;

        public userId?: number;

        public anonymous?: boolean;

        public imAccId?: string;

        public constructor(actor: Photon.LoadBalancing.Actor, seatNumber?: number) {

            if (actor) {
                this.actorNr = actor.actorNr;

                this.userId = actor.getCustomProperty("userId");

                this.anonymous = actor.getCustomProperty("anonymous");

                this.name = this.anonymous ? this.userId : actor.getCustomProperty("nickName");

                this.avatarUrl = actor.getCustomProperty("avatarUrl");

                this.seatNumber = seatNumber;

                this.imAccId = actor.getCustomProperty("imAccId");
            }

        }
    }
}