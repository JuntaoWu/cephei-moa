

namespace moa {

    export class AdProxy extends puremvc.Proxy implements puremvc.IProxy {
        public static NAME: string = "AdProxy";

        public constructor() {
            super(AdProxy.NAME);
        }

        public async loadAd(): Promise<Ad[]> {
            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${Constants.Endpoints.service}ads`, egret.HttpMethod.GET);
            request.setRequestHeader("Content-Type", "application/json");

            request.send();

            return new Promise<Ad[]>((resolve, reject) => {
                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    console.log(`loadAds via app server end.`);

                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                        return reject(res.message);
                    }
                    else {
                        console.log("resolve current ranks");
                        return resolve(res.data as Ad[]);
                    }
                }, this);
            });
        }

    }
}