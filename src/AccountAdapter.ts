
class AccountAdapter {

    static async login(code?: string): Promise<any> {
        let wxRes = { code: code };  //Maybe we fetch the code via native app.
        if (!code) {
            wxRes = await platform.login();
        }

        //log the login information into backend.
        //https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
        console.log(`Login app server begin, code: ${wxRes.code}`);

        const request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(`${game.Constants.Endpoints.service}users/${code ? "login-native" : "login-wxgame"}?code=${wxRes.code}`, egret.HttpMethod.POST);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();

        return new Promise((resolve, reject) => {
            request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                const req = event.currentTarget as egret.HttpRequest;
                const res = JSON.parse(req.response);
                if (res.error) {
                    console.error(res.message);
                    return reject(res.message);
                }
                else {
                    game.CommonData.logon = { ...game.CommonData.logon, ...res.data };  //this is the unique Id.
                    console.log(`Login app server end, unionId: ${res.data && res.data.unionId}, wxgameOpenId: ${res.data && res.data.wxgameOpenId}`);
                    return resolve();
                }
            }, this);
            // request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this);
            // request.addEventListener(egret.ProgressEvent.PROGRESS, this.onGetProgress, this);
        });
    }

    static async checkForUpdate() {

        if (platform.name == "DebugPlatform") {
            return {
                hasUpdate: false
            };
        }

        let version = await platform.getVersion() || 0;
        console.log(`Check version begin, current version is: ${version}`);

        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(`${game.Constants.Endpoints.service}version/check?version=${version}`, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();

        return new Promise((resolve, reject) => {
            request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                let req = <egret.HttpRequest>(event.currentTarget);
                let res = JSON.parse(req.response);
                if (res.error) {
                    console.error(res.message);
                    return reject(res.message);
                }
                else {
                    console.log(`Check version end, lastest version is: ${res.data && res.data.version || version}`);
                    return resolve(res.data);
                }
            }, this);
            // request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onGetIOError, this);
            // request.addEventListener(egret.ProgressEvent.PROGRESS, this.onGetProgress, this);
        });
    }
}