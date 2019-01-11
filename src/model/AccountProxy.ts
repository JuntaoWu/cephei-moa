

namespace moa {

    export class AccountProxy extends puremvc.Proxy implements puremvc.IProxy {
        public static NAME: string = "AccountProxy";

        public constructor() {
            super(AccountProxy.NAME);
        }

        public async loadRank(orderType: OrderType = OrderType.winRate, mode: number = 0, role: number = 0, minimumCount: number = 10): Promise<Rank[]> {
            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${moa.Constants.Endpoints.service}ranks/?orderType=${orderType}&mode=${mode}&role=${role}&minimumCount=${minimumCount}&timestamp=${+new Date()}`, egret.HttpMethod.GET);
            request.setRequestHeader("Content-Type", "application/json");

            request.send();

            return new Promise<Rank[]>((resolve, reject) => {
                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    console.log(`loadRanks via app server end.`);

                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                        return reject(res.message);
                    }
                    else {
                        console.log("resolve current ranks");
                        return resolve(res.data as Rank[]);
                    }
                }, this);
            });
        }

    }
}