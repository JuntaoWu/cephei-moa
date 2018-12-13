
namespace moa {

    export class Constants {

        private static _photonConfig: Map<string, string>;
        public static get photonConfig(): Map<string, string> {
            if (!Constants._photonConfig) {
                Constants._photonConfig = new Map<string, string>(Object.entries(RES.getRes("photon_json")));
            }
            return Constants._photonConfig;
        }

        public static get ResourceEndpoint(): string {
            return (platform.env == "local" || platform.env == "dev" || platform.name != "wxgame") ? Constants.Endpoints.localResource : Constants.Endpoints.remoteResource;
        };

        public static get photonMasterServer(): string {
            return (platform.env == "local" || platform.env == "dev") ? Constants.photonConfig.get("localMasterServer") : Constants.photonConfig.get("photonMasterServer");
        }

        public static get photonNameServer(): string {
            return Constants.photonConfig.get("photonNameServer");
        }

        public static get photonRegion(): string {
            return Constants.photonConfig.get("photonRegion");
        }

        public static get Endpoints() {
            if (platform.env == "local") {
                return {
                    service: "http://localhost:4040/",
                    localResource: "",
                    remoteResource: "http://localhost:4040/miniGame/",
                    ws: "ws://192.168.2.117:9092",
                    wss: "wss://192.168.2.117:19092",
                };
            }
            if (platform.env == "dev") {
                return {
                    service: "http://gdjzj.hzsdgames.com:8090/",
                    localResource: "",
                    remoteResource: "http://gdjzj.hzsdgames.com:8090/miniGame/",
                    ws: "ws://192.168.2.202:9092",
                    wss: "wss://192.168.2.202:19092",
                };
            }
            if (platform.env == "prod") {
                return {
                    service: "https://gdjzj.hzsdgames.com:8100/",
                    localResource: "",
                    remoteResource: "https://gdjzj.hzsdgames.com:8100/miniGame/",
                    ws: "ws://photon.hzsdgames.com:9092",
                    wss: "wss://photon.hzsdgames.com:19092",
                };
            }
            if (platform.env == "test") {
                return {
                    service: "http://gdjzj.hzsdgames.com:8090/",
                    localResource: "",
                    remoteResource: "http://gdjzj.hzsdgames.com:8090/miniGame/",
                    ws: "ws://photon.hzsdgames.com:9092",
                    wss: "wss://photon.hzsdgames.com:19092",
                };
            }
        }

        public static authorizeButtonImageUrl = `${Constants.ResourceEndpoint}resource/assets/Button/btn-wxlogin.png`;
        public static gameTitle = `古董局中局`;
        public static shareImageUrl = `${Constants.ResourceEndpoint}resource/assets/shared/share.png`;
    }

    export const gameType = {
        six: "六人局",
        seven: "七人局",
        eight: "八人局",
    }

    export const gameCamp = {
        xuyuan: "许愿阵营",
        laochaofen: "老朝奉阵营",
    }

    export enum RoleId {
        XuYuan = 1,
        FangZheng,
        JiYunFu,
        HuangYanYan,
        MuHuJiaNai,
        LaoChaoFen,
        YaoBuRan,
        ZhengGuoQu,
    }

    export const GameInfo = {
        attacked: "被药不然偷袭",
        attack: "你偷袭了",
        hide: "你隐藏了",
        reverse: "你调换了真假信息",
        skipSkill: "你跳过了技能",
        cannotJudge: "无法鉴定",
    }
}