

module game {

	export class GameProxy extends puremvc.Proxy implements puremvc.IProxy {
		public static NAME: string = "GameProxy";

		public constructor() {
			super(GameProxy.NAME);
		}

		public static PLAYER_UPDATE: string = "player_update";

		public roomName: string;
		public isMasterClient: boolean;
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
			this.sendNotification(SceneCommand.CHANGE, Scene.Game);
		}

		private changeSeat() {
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.TakeSeat, 6);
		}

		private onMessage(event: CustomPhotonEvents, message: string, sender: Photon.LoadBalancing.Actor) {

			switch (event) {
				case CustomPhotonEvents.TakeSeat: {
					const seatNumber = +message;
					// No one's taken this seatNumber yet
					if (!this.gameState.seats[seatNumber]) {
						this.gameState.seats[seatNumber] = sender;
						
						//this.sendNotification(SEAT_UPDATE, this.gameState.seats);
					}
					else if(this.gameState.seats[seatNumber].actorNr != sender.actorNr) {
						// Someone else's already taken this seat.
					}

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

	}
}