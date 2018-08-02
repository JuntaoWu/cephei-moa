

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
		public static NEXT_NR:string="next_nr";
		public static ONE_GAME_END:string="one_game_end";
		public static TONGZHI:string="tongzhi";
		public static TOUPIAO_UI:string="toupiao_ui";

		public static INPUT_NUMBER:string="input_number";
		public static DELETE_NUMBER:string="delete_number";
		public static CANCEL_INPUT:string="cancel_input";
		public static FINISH_INPUT:string="finish_input";

		public roomName: string;
		public isMasterClient: boolean;
		public actorNr: number;
		public gameState: GameState = {
			roomName: undefined,
			phase: GamePhase.Preparing,
			players: 0,
			maxPlayers: 2,
			seats: [],
			role: [],
			shunwei_one_been:[]
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
				this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
				if (this.gameState.phase == GamePhase.Preparing) {
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
				}
			}
			else {

			}
			this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
		}

		private onJoinRoom() {
			this.actorNr = this.loadBalancingClient.myActor().actorNr;
			this.sendNotification(SceneCommand.CHANGE, Scene.Game);

			this.gameState = this.loadBalancingClient.myRoom().getCustomProperty("gameState") || this.gameState;
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
						this.gameState.seats[seatNumber] = {
							actorNr: sender.actorNr,
							name: sender.name
						};
						this.sendNotification(GameProxy.SEAT_UPDATE, this.gameState.seats);	
						this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);				
					}

					if(this.isMasterClient) {
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
					}
					break;					
				}
				case CustomPhotonEvents.startjs:{
					this.gameState.phase = GamePhase.Ready;
					if(this.isMasterClient) {
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
					}
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
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
				case CustomPhotonEvents.nextNr:{
					this.sendNotification(GameProxy.NEXT_NR,message);
					break;
				}
				case CustomPhotonEvents.onegameend:{
					this.sendNotification(GameProxy.ONE_GAME_END);
					break;
				}
				case CustomPhotonEvents.tongzhi:{
					this.sendNotification(GameProxy.TONGZHI,message);
					break;
				}
				case CustomPhotonEvents.toupiaoui:{
					this.sendNotification(GameProxy.TOUPIAO_UI);
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
					maxPlayers: 2,
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

		public startChooseRole() {
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.startjs);
			
		}
	}
}