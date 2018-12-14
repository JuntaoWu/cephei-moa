

namespace moa {

    export class NoticeProxy extends puremvc.Proxy implements puremvc.IProxy {
        public static NAME: string = "NoticeProxy";

        public constructor() {
            super(NoticeProxy.NAME);
        }

        public notice: Notice[];

        public async getNotice(): Promise<Notice[]> {
            var request = new egret.HttpRequest();
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(`${Constants.Endpoints.service}notice/`, egret.HttpMethod.GET);
            request.setRequestHeader("Content-Type", "application/json");

            request.send();

            return new Promise<Notice[]>((resolve, reject) => {
                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    console.log(`getNotice via app server end.`);

                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                        return reject(res.message);
                    }
                    else {
                        if (!res.data) {
                            this.notice = [];
                        }
                        else {
                            this.notice = res.data.map(i => {
                                i.createdAt = i.createdAt && new Date(i.createdAt);
                                i.updatedAt = i.updatedAt && new Date(i.updatedAt);
                                return i;
                            });
                        }
                        return resolve(this.notice);
                    }
                }, this);
            });
        }

        public async markAsRead(): Promise<any> {

            if (!this.notice || !this.notice.length) {
                return;
            }

            if (platform.name == "native") {
                await platform.setSecurityStorageAsync("lastSeenNoticeAt", _(this.notice).maxBy("createdAt").createdAt.toJSON());
            }
            else {
                await platform.setStorageAsync("lastSeenNoticeAt", _(this.notice).maxBy("createdAt").createdAt.toJSON());
            }
        }

        public async hasUnreadNotice(): Promise<boolean> {

            if (!this.notice || !this.notice.length) {
                await this.getNotice();
            }

            if (!this.notice || !this.notice.length) {
                return false;
            }

            let lastSeenNoticeAt = new Date(0);
            if (platform.name == "native") {
                let storedValue: string = await platform.getSecurityStorageAsync("lastSeenNoticeAt");
                if (storedValue) {
                    lastSeenNoticeAt = new Date(storedValue);
                }
            }
            else {
                let storedValue: string = await platform.getStorageAsync("lastSeenNoticeAt");
                if (storedValue) {
                    lastSeenNoticeAt = new Date(storedValue);
                }
            }

            return this.notice.some(i => i.createdAt > lastSeenNoticeAt);
        }

    }
}