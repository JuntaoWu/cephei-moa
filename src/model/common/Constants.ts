
module game {

    export class Constants {

        private static _photonConfig: Map<string, string>;
        public static get photonConfig(): Map<string, string> {
            if (!Constants._photonConfig) {
                Constants._photonConfig = new Map<string, string>(Object.entries(RES.getRes("photon_json")));
            }
            return Constants._photonConfig;
        }

        public static get ResourceEndpoint(): string {
            return platform.env == "local" || platform.env == "dev" || platform.name != "wxgame" ? this.Endpoints.localResource : this.Endpoints.remoteResource;
        };

        public static get photonMasterServer(): string {
            return platform.env == "local" || platform.env == "dev" ? this.photonConfig.get("localMasterServer") : this.photonConfig.get("photonMasterServer");
        }

        public static get photonNameServer(): string {
            return this.photonConfig.get("photonNameServer");
        }

        public static get photonRegion(): string {
            return this.photonConfig.get("photonRegion");
        }

        public static get Endpoints() {
            if (platform.env == "local") {
                return {
                    service: "http://localhost:4040/",
                    localResource: "",
                    remoteResource: "http://localhost:4040/miniGame/",
                    ws: "ws://192.168.2.117:9090",
                    wss: "wss://192.168.2.117:19090",
                };
            }
            if (platform.env == "dev") {
                return {
                    service: "http://gdjzj.hzsdgames.com:8096/",
                    localResource: "",
                    remoteResource: "http://gdjzj.hzsdgames.com:8096/miniGame/",
                    ws: "ws://192.168.2.202:9090",
                    wss: "wss://192.168.2.202:19090",
                };
            }
            if (platform.env == "prod") {
                return {
                    service: "https://gdjzj.hzsdgames.com:8084/",
                    localResource: "",
                    remoteResource: "https://gdjzj.hzsdgames.com:8084/miniGame/",
                    ws: "ws://photon.hzsdgames.com:9090",
                    wss: "wss://photon.hzsdgames.com:19090",
                };
            }
            if (platform.env == "test") {
                return {
                    service: "http://gdjzj.hzsdgames.com:8096/",
                    localResource: "",
                    remoteResource: "http://gdjzj.hzsdgames.com:8096/miniGame/",
                    ws: "ws://photon.hzsdgames.com:9092",
                    wss: "wss://photon.hzsdgames.com:19092",
                };
            }
        }
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