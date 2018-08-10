
module game {

    const photonWss = false;
    const photonAppId = "d5a0e7bb-7a5a-4adb-a2a5-4b60951e58f9";
    const photonAppVersion = "1.0";
    const photonMasterServer = Constants.Endpoints.photonMasterServer;
    const photonFbAppId = "";

    const connectOnStart = true;

    export class MyLoadBalancingClient extends Photon.LoadBalancing.LoadBalancingClient {

        public setupId: number = 0;

        logger = new Exitgames.Common.Logger("Info:");

        private USERCOLORS = ["#FF0000", "#00AA00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"];

        constructor() {
            super(photonWss ? Photon.ConnectionProtocol.Wss : Photon.ConnectionProtocol.Ws, photonAppId, photonAppVersion);

            this.output(this.logger.format("Init", photonMasterServer || this.getNameServerAddress(), photonAppVersion));
            this.logger.info("Init", photonMasterServer || this.getNameServerAddress(), photonAppVersion);
            this.setLogLevel(Exitgames.Common.Logger.Level.DEBUG);
        }

        /**
         * delegates goes here:
         */
        public stateChangeSubject = () => { };
        public updateRoomInfoSubject = () => { };
        public onJoinRoomSubject = () => { };
        public receiveMessageSubject = (event, message, sender) => { };

        start() {
            // connect if no fb auth required 
            if (connectOnStart) {
                if (photonMasterServer) {
                    this.setMasterServerAddress(photonMasterServer);
                    this.connect();
                }
                else {
                    this.connectToRegionMaster("US");
                }
            }
        }

        onError(errorCode: number, errorMsg: string) {
            this.output("Error " + errorCode + ": " + errorMsg);

            if(errorCode == 1003) {
                this.start();
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
            this.logger.debug("onEvent", event, "message:", message, "actor:", actorNr);

        }
        updateUserIdAndNickname(vals, logger) {
            super.updateUserIdAndNickname(vals, logger);
            let data = vals[Photon.LoadBalancing.Constants.ParameterCode.Data];
            this.myActor().setCustomProperty("data", data);
        }
        onOperationResponse(errorCode, errorMsg, code, content) {
            super.onOperationResponse(errorCode, errorMsg, code, content);  // important to call, to keep state up to date
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

            this.updateRoomInfo();
            this.onJoinRoomSubject();
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
            platform.showToast(`玩家${actor.getCustomProperty("nickName")}已挂起`);
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
                this.raiseEvent(event, message,{
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