

namespace moa {

    export class ClubProxy extends puremvc.Proxy implements puremvc.IProxy {
        public static NAME: string = "ClubProxy";

        public constructor() {
            super(ClubProxy.NAME);
        }

        public async loadClub(): Promise<Club[]> {
            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${moa.Constants.Endpoints.service}clubs`, egret.HttpMethod.GET);
            request.setRequestHeader("Content-Type", "application/json");

            request.send();

            return new Promise<Club[]>((resolve, reject) => {
                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    console.log(`loadClubs via app server end.`);

                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                        return reject(res.message);
                    }
                    else {
                        console.log("resolve current ranks");
                        return resolve(res.data as Club[]);
                    }
                }, this);
            });
        }

    }
}