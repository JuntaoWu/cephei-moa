

module game {

	export class GameProxy extends puremvc.Proxy implements puremvc.IProxy {
		public static NAME: string = "GameProxy";

		public constructor() {
			super(GameProxy.NAME);
		}

		public static PLAYER_UPDATE: string = "player_update";
		public static SEAT_UPDATE: string = "seat_update";
		public static SEAT_DESTORY:string = "seat_destory";

		public roomName: string;
		public isMasterClient: boolean;
		public actorNr: number;
		public gameState: GameState = {
			roomName: undefined,
			phase: GamePhase.Preparing,
			players: 0,
			maxPlayers: 6,
			seats: []
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
			this.actorNr = this.loadBalancingClient.myActor().actorNr;
			this.sendNotification(SceneCommand.CHANGE, Scene.Game);
		}

		//接受广播

		private onMessage(event: CustomPhotonEvents, message: string, sender: Photon.LoadBalancing.Actor) {
			switch (event) {
				case CustomPhotonEvents.TakeSeat: {
					const seatNumber = +message;

					//if (!this.gameState.seats.some(seat => seat && seat.actorNr == this.loadBalancingClient.myActor().actorNr)){
						// No one's taken this seatNumber yet
						if (!this.gameState.seats[seatNumber]) {
							//this.sendNotification(GameProxy.SEAT_UPDATE,seatNumber);
							this.gameState.seats[seatNumber] = sender;						
							this.sendNotification(GameProxy.SEAT_UPDATE, this.gameState.seats);
							console.log("同步啊");
						}else if(this.gameState.seats[seatNumber].actorNr != sender.actorNr) {
							// Someone else's already taken this seat.
							console.log("已经有其他人选择这个位置");
						}
					//}
					// if(this.gameState.seats.some(seat => seat && seat.actorNr == this.loadBalancingClient.myActor().actorNr)){
					// 	if(!this.gameState.seats[seatNumber]){
					// 		let seatNo = this.gameState.seats.findIndex(seat => seat == this.loadBalancingClient.myActor());
					// 		// this.gameState.seats[seatNo]=undefined;
					// 		// this.sendNotification(GameProxy.SEAT_DESTORY,seatNo);
					// 		this.gameState.seats[seatNumber] = sender;						
					// 		this.sendNotification(GameProxy.SEAT_UPDATE, this.gameState.seats);
					// 	}else if(this.gameState.seats[seatNumber].actorNr != sender.actorNr) {
					// 		console.log("已经有其他人选择这个位置");
					// 	}
					// }
					break;
				}
			}
			console.log(this.gameState.seats);
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

		//找座位
		public joinSeat(seatNumber:string){
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.TakeSeat,seatNumber);
		}
	}
}