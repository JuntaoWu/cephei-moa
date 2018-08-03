
module game {

    export class Constants {

        public static ServiceEndpoint: string = "https://cephei-moa.herokuapp.com/";
        //public static Endpoint: string = "https://cephei-moa.herokuapp.com/miniGame/";
        public static Endpoint: string = "";

        public static Endpoints = {
            photonMasterServer: "127.0.0.1:9090",
            //photonAsyncService: "http://127.0.0.1:44301/api",
            //photonNotificationService: "http://127.0.0.1:44302",
            //photonMasterServer: "192.168.2.202:9090",
            // photonAsyncService: "http://192.168.2.202:44301/api",
            // photonNotificationService: "http://192.168.2.202:44302",
        }

        public static photonMasterServer: string = "";
    }

}