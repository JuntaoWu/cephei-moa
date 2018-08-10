
module game {

    export class Constants {

        public static ServiceEndpoint: string = "http://localhost:3000/";
        //public static ServiceEndpoint: string = "https://cephei-moa.herokuapp.com/";
        public static get Endpoint(): string {
            return platform.name == "DebugPlatform" ? "" : "https://cephei-moa.herokuapp.com/miniGame/";
        };
        //public static Endpoint: string = "";

        public static Endpoints = {
            photonMasterServer: "127.0.0.1:9090",
            //photonAsyncService: "http://127.0.0.1:44301/api",
            //photonNotificationService: "http://127.0.0.1:44302",
            //photonMasterServer: "192.168.2.202:9090",
            // photonAsyncService: "http://192.168.2.202:44301/api",
            // photonNotificationService: "http://192.168.2.202:44302",
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
}