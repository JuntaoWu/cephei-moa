
namespace moa {

    export const photonAppId = "f0e09630-c30e-4d9d-8d60-64d91ebf642b";
    const photonAppVersion = "1.0";

    const connectOnStart = true;

    export class MyLoadBalancingClient extends Photon.LoadBalancing.LoadBalancingClient {

        private isWaitingForStart: boolean = false;

        private static get photonWss() {
            return true;
            // return platform.env == "prod" || platform.env == "test";
        }

        public retried: number = 0;
        private maxRetriedCount: number = 3;

        public setupId: number = 0;

        logger = new Exitgames.Common.Logger("Info:");

        private USERCOLORS = ["#FF0000", "#00AA00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"];

        public get autoRejoin(): boolean {
            return platform.getStorage("autoRejoin") as boolean;
        }
        public set autoRejoin(value: boolean) {
            platform.setStorage("autoRejoin", value);
        }

        constructor() {
            super(MyLoadBalancingClient.photonWss ? Photon.ConnectionProtocol.Wss : Photon.ConnectionProtocol.Ws, photonAppId, photonAppVersion);
            
            Constants.photonNameServer && this.setNameServerAddress(Constants.photonNameServer);

            this.setLogLevel(Exitgames.Common.Logger.Level.ERROR);
        }

        /**
         * delegates goes here:
         */
        public stateChangeSubject = () => { };
        public updateRoomInfoSubject = () => { };
        public onJoinRoomSubject = () => { };
        public receiveMessageSubject = (event, message, sender) => { };
        public onOperationResponseSubject = (errorCode) => { };

        start() {
            this.isWaitingForStart = false;
            if (connectOnStart) {
                this.output(this.logger.format("Init", Constants.photonMasterServer || this.getNameServerAddress(), photonAppVersion));
                this.logger.info("Init", Constants.photonMasterServer || this.getNameServerAddress(), photonAppVersion);

                if (Constants.photonMasterServer) {
                    this.setMasterServerAddress(Constants.photonMasterServer);
                    this.connect();
                }
                else {
                    this.connectToRegionMaster(Constants.photonRegion);
                }
            }
        }

        onError(errorCode: number, errorMsg: string) {

            platform.hideAllBannerAds();
            platform.hideLoading();

            console.log("retried count:", this.retried);

            this.output("Error " + errorCode + ": " + errorMsg);

            if (!platform.isConnected) {
                return;
            }

            if (errorCode == 1003) {
                if (++this.retried <= this.maxRetriedCount) {
                    this.start();
                }
                else if (!this.isWaitingForStart) {
                    this.isWaitingForStart = true;

                    platform.showModal("服务器连接已重置,请检查网络或尝试重连", "重试", "取消").then(res => {
                        if (res && res.confirm) {
                            this.retried = 0;
                            this.autoRejoin = false;
                            
                            egret.setTimeout(() => {
                                this.start();
                            }, this, 4000);
                        }
                        else if (res && res.cancel) {
                            this.autoRejoin = false;
                        }
                    });
                }
            }
            else if (errorCode == 1004) {
                if (++this.retried <= this.maxRetriedCount) {
                    this.start();
                }
                else if (!this.isWaitingForStart) {
                    this.isWaitingForStart = true;

                    platform.showModal("服务器连接超时,请检查网络或尝试重连", "重试", "取消").then(res => {
                        if (res && res.confirm) {
                            this.retried = 0;

                            egret.setTimeout(() => {
                                this.start();
                            }, this, 4000);
                        }
                        else if (res && res.cancel) {
                            this.autoRejoin = false;
                        }
                    });
                }
            }
            else {
                if (++this.retried <= this.maxRetriedCount) {
                    this.start();
                }
                else if (!this.isWaitingForStart) {
                    this.isWaitingForStart = true;

                    platform.showModal("服务器连接失败,请检查网络或尝试重连", "重试", "取消").then(res => {
                        if (res && res.confirm) {
                            this.retried = 0;

                            egret.setTimeout(() => {
                                this.start();
                            }, this, 4000);
                        }
                        else if (res && res.cancel) {
                            this.autoRejoin = false;
                        }
                    });
                }
            }
        }

        onEvent(event: CustomPhotonEvents, message: any, actorNr: number) {
            var sender = this.myRoomActors()[actorNr];
            switch (event) {
                case CustomPhotonEvents.UserMessage:
                    if (actorNr)
                        this.output(actorNr + ": " + message, sender.getCustomProperty("color"));
                    else
                        this.output(actorNr + ": " + message);
                    break;
                case CustomPhotonEvents.UserStartGame:
                    this.output(actorNr + ": started the game", this.myRoomActors()[actorNr].getCustomProperty("color"));
                    break;
                case CustomPhotonEvents.EventRequestGameStates:
                    this.raiseEvent(CustomPhotonEvents.EventLoadSceneItemFromServer, null, {
                        targetActors: [actorNr]
                    });
                    break;
                default:
                    this.receiveMessageSubject(event, message, sender);
                    break;
            }
            this.output(`onEvent: ${event}, message: ${JSON.stringify(message)}, actor: ${actorNr}`);

        }
        // updateUserIdAndNickname(vals, logger) {
        //     super.updateUserIdAndNickname(vals, logger);
        //     let data = vals[Photon.LoadBalancing.Constants.ParameterCode.Data];
        //     this.myActor().setCustomProperty("data", data);
        // }
        onOperationResponse(errorCode, errorMsg, code, content) {
            super.onOperationResponse(errorCode, errorMsg, code, content);  // important to call, to keep state up to date
            if (errorCode) {
                console.error(errorMsg);
                switch (errorCode) {
                    case 32746:
                        platform.showToast("不能重复加入");
                        // this.autoRejoin = false;
                        break;
                    case 32748:
                        platform.showToast("房间已关闭");
                        this.autoRejoin = false;
                        break;
                    case 32758:
                        this.autoRejoin = false;
                        platform.showToast("房间不存在");
                        break;
                    case 32765:
                        this.autoRejoin = false;
                        platform.showToast("房间已满");
                        break;
                    case 32752:
                        this.autoRejoin = false;
                        platform.showToast("无法加入该房间");
                        break;
                    default:
                        platform.showToast(`Code: ${errorCode}`);
                        break;
                }
                this.onOperationResponseSubject && this.onOperationResponseSubject(errorCode);
            }
            switch (code) {
                case Photon.LoadBalancing.Constants.OperationCode.Authenticate:
                    console.log(content);
                    break;
                /*
                    ...
                */
                default:
                    break;
            }
        }

        onStateChange(state: number) {
            this.stateChangeSubject();
        }

        updateRoomInfo() {
            this.updateRoomInfoSubject();
        }

        objToStr(x: {}) {
            var res = "";
            for (var i in x) {
                res += (res == "" ? "" : " ,") + i + "=" + x[i];
            }
            return res;
        }

        onActorPropertiesChange(actor: Photon.LoadBalancing.Actor) {
            this.updateRoomInfo();
        }

        onMyRoomPropertiesChange() {
            super.onMyRoomPropertiesChange();
            console.log("onMyRoomPropertiesChange");
            this.updateRoomInfo();
        }

        onRoomListUpdate(rooms: Photon.LoadBalancing.Room[], roomsUpdated: Photon.LoadBalancing.Room[], roomsAdded: Photon.LoadBalancing.Room[], roomsRemoved: Photon.LoadBalancing.Room[]) {
            this.logger.info("Info: onRoomListUpdate", rooms, roomsUpdated, roomsAdded, roomsRemoved);
            this.output("Info: Rooms update: " + roomsUpdated.length + " updated, " + roomsAdded.length + " added, " + roomsRemoved.length + " removed");
            this.onRoomList(rooms);
        }

        onRoomList(rooms: Photon.LoadBalancing.Room[]) {
            this.output("Info: Rooms total: " + rooms.length);
        }

        onJoinRoom() {
            let color = this.USERCOLORS[this.myRoomActorCount() - 1];
            this.myActor().setCustomProperty("color", color);
            this.output("Game " + this.myRoom().name + " joined", color);

            let data = this.myActor().getCustomProperty("data");

            this.toggleActorState(this.myActor().name, data && data.Avatar, true);

            if (!this.myRoom().getCustomProperty("setupId")) {
                this.myRoom().setCustomProperty("setupId", this.setupId);
            }

            this.onJoinRoomSubject();
            this.updateRoomInfo();
        }

        onActorJoin(actor: Photon.LoadBalancing.Actor) {
            this.output("Actor " + (actor.name || actor.actorNr) + " joined", actor.getCustomProperty("color"));
            this.updateRoomInfo();
        }

        onActorLeave(actor: Photon.LoadBalancing.Actor) {
            this.output("Actor " + (actor.name || actor.actorNr) + " left", actor.getCustomProperty("color"));

            this.updateRoomInfo();
        }

        onActorSuspend(actor: Photon.LoadBalancing.Actor) {
            this.output("Actor " + (actor.name || actor.actorNr) + " suspended", actor.getCustomProperty("color"));
            platform.showToast(`${actor.getCustomProperty("nickName")}已挂起`);
            let data = this.myActor().getCustomProperty("data");

            this.toggleActorState(actor.name, data && data.Avatar, false);

            this.updateRoomInfo();
        }

        private toggleActorState(name, avatar, active) {
            let current: any[] = this.myRoom().getCustomProperty("myRoomActorStates") || [];
            let currentDictionary = _.keyBy(current, "name") || {};
            currentDictionary[name] = currentDictionary[name] || { name: name, avatar: avatar };

            currentDictionary[name].active = active;
            this.myRoom().setCustomProperty("myRoomActorStates", _.toArray(currentDictionary), true);  //webforward = true to trigger GameProperties webhook.
        }

        public getActorState(name) {
            let current: any[] = this.myRoom().getCustomProperty("myRoomActorStates") || [];
            let currentDictionary = _.keyBy(current, "name") || {};
            return currentDictionary[name] && currentDictionary[name].active;
        }

        sendMessage(event: CustomPhotonEvents, message?: any) {
            try {
                //todo: Use chat client to send messages to players not in the room.
                //if (/\/invite:/.test(message)) {
                //    let people = message.match(/\/invite:(.*)/)[1];
                //    this.raiseEvent(3, { room: this.myRoom().name }, {
                //        receivers: Photon.LoadBalancing.Constants.ReceiverGroup.Others
                //    });
                //}
                //default:
                this.raiseEvent(event, message, {
                    receivers: Photon.LoadBalancing.Constants.ReceiverGroup.All
                });
                this.output('me[' + (this.myActor().name || this.myActor().actorNr) + ']: ' + JSON.stringify(message), this.myActor().getCustomProperty("color"));
            }
            catch (err) {
                this.output("error: " + err.message);
            }
        }

        startGame() {
            try {
                this.raiseEvent(CustomPhotonEvents.UserStartGame, { message: "", sender: this.myActor().actorNr });
                this.output('me[' + (this.myActor().name || this.myActor().actorNr) + ']: ' + "start the game", this.myActor().getCustomProperty("color"));
            }
            catch (err) {
                this.output("error: " + err.message);
            }
        }

        output(str: string, color?: string) {
            var escaped = str.replace(/&/, "&amp;").replace(/</, "&lt;").
                replace(/>/, "&gt;").replace(/"/, "&quot;");
            console.log(str);
        }
    }
}