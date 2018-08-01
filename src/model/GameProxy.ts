

module game {

	export class GameProxy extends puremvc.Proxy implements puremvc.IProxy {
		public static NAME: string = "GameProxy";

		public constructor() {
			super(GameProxy.NAME);
		}

		public static PLAYER_UPDATE: string = "player_update";
		public static SEAT_UPDATE: string = "seat_update";
		public static START_JS:string="start_js";
		public static CHOOSE_JS_END:string="choose_js_end";
		public static START_GAME:string="start_game";
		public static FIRST_ONE:string="first_one";

		public roomName: string;
		public isMasterClient: boolean;
		public gameState: GameState = {
			roomName: undefined,
			phase: GamePhase.Preparing,
			players: 0,
			maxPlayers: 6,
			seats: [],
			role: []
		};

		private _loadBalancingClient: MyLoadBalancingClient;
		public get loadBalancingClient(): MyLoadBalancingClient {
			if (!this._loadBalancingClient) {
				this._loadBalancingClient = new MyLoadBalancingClient();

				// register loadBalancing Subjects.
				this._loadBalancingClient.updateRoomInfoSubject = () => {
					this.onUpdateRoomInfo();
				};

				this._loadBalancingClient.stateChangeSubject = () => {
					this.onStateChange();
				};

				this._loadBalancingClient.onJoinRoomSubject = () => {
					this.onJoinRoom();
				};

				this._loadBalancingClient.receiveMessageSubject = (event, message, sender) => {
					this.onMessage(event, message, sender);
				}
			}
			return this._loadBalancingClient;
		}

		private onStateChange() {
			const state = this.loadBalancingClient.state;
			switch (state) {
				case Photon.LoadBalancing.LoadBalancingClient.State.JoinedLobby:
					if (this.roomName) {
						if (this.isMasterClient) {
							this.createRoomWithDefaultOptions();
						}
						else {
							this.joinRoom(this.roomName);
						}
					}
					break;
			}
		}

		private onUpdateRoomInfo() {
			const myRoom = this.loadBalancingClient.myRoom();
			const myRoomActors = this.loadBalancingClient.myRoomActors();
			const myRoomActorCount = this.loadBalancingClient.myRoomActorCount();

			this.gameState.players = myRoomActorCount;

			if (this.isMasterClient) {
				if (this.gameState.phase == GamePhase.Preparing) {
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
				}
			}
			else {

			}
		}

		private onJoinRoom() {
			this.sendNotification(SceneCommand.CHANGE, Scene.Game);
		}

		private onMessage(event: CustomPhotonEvents, message: string, sender: Photon.LoadBalancing.Actor) {
			switch (event) {
				case CustomPhotonEvents.TakeSeat: {	

					if (message == "destory1"){
						this.gameState.seats[1]=undefined;	
					}else if(message == "destory2"){
						this.gameState.seats[2]=undefined;
					}else if(message == "destory3"){
						this.gameState.seats[3]=undefined;
					}else if(message == "destory4"){
						this.gameState.seats[4]=undefined;
					}else if(message == "destory5"){
						this.gameState.seats[5]=undefined;
					}else if(message == "destory6"){
						this.gameState.seats[6]=undefined;
					}else if(message == "destory7"){
						this.gameState.seats[7]=undefined;
					}else if(message == "destory8"){
						this.gameState.seats[8]=undefined;
					}else{
						const seatNumber = +message;
						this.gameState.seats[seatNumber] = sender;
						this.sendNotification(GameProxy.SEAT_UPDATE, this.gameState.seats);					
					}

					// if (!this.gameState.seats.some(seat => seat && seat.actorNr == this.loadBalancingClient.myActor().actorNr)){
					// 	if (!this.gameState.seats[seatNumber]) {
					// 		this.gameState.seats[seatNumber] = sender;						
					// 		this.sendNotification(GameProxy.SEAT_UPDATE, this.gameState.seats);
					// 	}else if(this.gameState.seats[seatNumber].actorNr != sender.actorNr) {
					// 		// Someone else's already taken this seat.
					// 	}
					// }else{
					// 	if(!this.gameState.seats[seatNumber]){
					// 		let seatNo = this.gameState.seats.findIndex(seat => seat == this.loadBalancingClient.myActor());
					// 		this.gameState.seats[seatNo]=undefined;
					// 		this.gameState.seats[seatNumber] = sender;						
					// 		this.sendNotification(GameProxy.SEAT_UPDATE, this.gameState.seats);
					// 	}else if(this.gameState.seats[seatNumber].actorNr != sender.actorNr) {
					// 		console.log("已经有其他人选择这个位置");
					// 	}
					// }
					break;					
				}
				case CustomPhotonEvents.startjs:{
					this.sendNotification(GameProxy.START_JS);
					break;
				}
				case CustomPhotonEvents.Chooserole:{
					if (message == "destory1"){
						this.gameState.role[1]=undefined;	
					}else if(message == "destory2"){
						this.gameState.role[2]=undefined;
					}else if(message == "destory3"){
						this.gameState.role[3]=undefined;
					}else if(message == "destory4"){
						this.gameState.role[4]=undefined;
					}else if(message == "destory5"){
						this.gameState.role[5]=undefined;
					}else if(message == "destory6"){
						this.gameState.role[6]=undefined;
					}else if(message == "destory7"){
						this.gameState.role[7]=undefined;
					}else if(message == "destory8"){
						this.gameState.role[8]=undefined;
					}else{
						const jsNumber = +message;
						this.gameState.role[jsNumber] = sender;
					}
					console.log(this.gameState.role);
					this.sendNotification(GameProxy.CHOOSE_JS_END,this.gameState.role);
					break;
				}		
				case CustomPhotonEvents.startgame:{
					this.sendNotification(GameProxy.START_GAME);
					break;
				}	
				case CustomPhotonEvents.firstoneNr:{
					this.sendNotification(GameProxy.FIRST_ONE,message);
					break;
				}	
			}
		}

		private generateRoomNumber() {
			let random = _.padStart(Math.floor(1000 * Math.random()).toString(), 3, '0');
			let name = parseInt(`${random}${new Date().getMilliseconds()}`).toString(10);
			return _.padStart(name, 6, '0').toUpperCase();

		}

		private createRoomWithDefaultOptions() {
			if (this.loadBalancingClient.isInLobby()) {
				console.log("Client is in lobby.");
				this.loadBalancingClient.createRoom(this.roomName, {
					isVisible: true,
					isOpen: true,
					maxPlayers: 8,
					suspendedPlayerLiveTime: -1,
					emptyRoomLiveTime: 12000,
					uniqueUserId: false,
					propsListedInLobby: []
				});
			}
		}

		public createRoom() {
			this.isMasterClient = true;
			this.roomName = this.generateRoomNumber();
			if (this.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Uninitialized) {
				// this.loadBalancingClient.setCustomAuthentication(`access_token=${me.access_token}`, Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom, "");
				this.loadBalancingClient.start();
			}

			this.createRoomWithDefaultOptions();
		}

		public joinRoom(roomName: string) {
			this.isMasterClient = false;
			this.roomName = roomName;
			if (this.loadBalancingClient.isInLobby()) {
				console.log(`Begin joinRoom: ${roomName}`);
				this.loadBalancingClient.joinRoom(roomName);
			}
			else if (this.loadBalancingClient.isJoinedToRoom()) {
				let existingRoom = this.loadBalancingClient.myRoom().name;
				if (this.loadBalancingClient.myRoom().name == roomName) {
					console.log(`Already in room: ${roomName}`);
				}
				else {
					this.loadBalancingClient.leaveRoom();
					this.loadBalancingClient.joinRoom(roomName);
				}
			}
			else if (this.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Uninitialized) {
				// this.loadBalancingClient.setCustomAuthentication(`access_token=${me.access_token}`, Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom, "");
				this.loadBalancingClient.start();
			}
		}

		public leaveRoom() {
			this.reset();
			this.loadBalancingClient.leaveRoom();
		}

		public reset() {
			this.roomName = undefined;
		}

		public joinSeat(seatNumber:string){
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.TakeSeat,seatNumber);
		}

		public chooserole(jsNumber:string){
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.Chooserole,jsNumber);
		}
	}
}