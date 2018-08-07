

module game {

	export class GameProxy extends puremvc.Proxy implements puremvc.IProxy {
		public static NAME: string = "GameProxy";

		public constructor() {
			super(GameProxy.NAME);
		}

		public async initialize() {
			const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
			const userInfo = await accountProxy.loadUserInfo();

			this.loadBalancingClient.setCustomAuthentication(`openId=${userInfo.openId}`,
				Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom);
			this.loadBalancingClient.start();
		}

		public static PLAYER_UPDATE: string = "player_update";
		public static SEAT_UPDATE: string = "seat_update";
		public static CHOOSE_JS_END: string = "choose_js_end";
		public static FIRST_ONE: string = "first_one";
		public static NEXT_NR: string = "next_nr";
		public static ONE_GAME_END: string = "one_game_end";
		public static TONGZHI: string = "tongzhi";
		public static TOUPIAO_UI: string = "toupiao_ui";
		public static ZONG_PIAOSHU: string = "zong_piaoshu";
		public static INPUT_NUMBER: string = "input_number";
		public static DELETE_NUMBER: string = "delete_number";
		public static CANCEL_INPUT: string = "cancel_input";
		public static FINISH_INPUT: string = "finish_input";
		public static PIAO_SHU: string = "piao_shu";
		public static TOUPIAO_END: string = "toupiao_end";
		public static START_TWO: string = "start_two";
		public static ONE_YBRSKILL: string = "one_ybrskill";
		public static ONE_ZGQSKILL: string = "one_zgqskill";
		public static TOUREN: string = "touren";
		public static TOUREN_JIEGUO: string = "touren_jieguo";

		public roomName: string;
		public isMasterClient: boolean;
		public actorNr: number;
		public gameState: GameState = new GameState();

		public isActorMaster(actorModel: ActorModel): boolean {
			return actorModel && actorModel.actorNr == this.loadBalancingClient.myRoomMasterActorNr();
		}

		public isActorLocal(actorModel: ActorModel): boolean {
			return actorModel && actorModel.actorNr == this.loadBalancingClient.myActor().actorNr;
		}

		private _antiquesMap: Map<string, any>;
		public get antiquesMap(): Map<string, any> {
			if (!this._antiquesMap) {
				this._antiquesMap = new Map<string, any>(Object.entries(RES.getRes("antiques_json")));
			}
			return this._antiquesMap;
		}

		private _seatsMap: Map<string, any>;
		public get seatsMap(): Map<string, any> {
			if (!this._seatsMap) {
				this._seatsMap = new Map<string, any>(Object.entries(RES.getRes("seats_json")));
			}
			return this._seatsMap;
		}


		private _rolesMap: Map<string, Role>;
		public get rolesMap(): Map<string, Role> {
			if (!this._rolesMap) {
				this._rolesMap = new Map<string, Role>(Object.entries(RES.getRes("role_json")));
			}
			return this._rolesMap;
		}

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
					console.log("GamePhase.Preparing: setCustomProperty");
					this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
				}

			}
			else {

			}
			this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
		}

		private async onJoinRoom() {
			const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
			const userInfo = await accountProxy.loadUserInfo();
			this.actorNr = this.loadBalancingClient.myActor().actorNr;

			this.loadBalancingClient.myActor().setCustomProperty("avatarUrl", userInfo.avatarUrl);
			this.loadBalancingClient.myActor().setCustomProperty("nickName", userInfo.nickName);

			this.sendNotification(SceneCommand.CHANGE, Scene.Game);

			this.gameState = this.loadBalancingClient.myRoom().getCustomProperty("gameState") || this.gameState;
		}

		private onMessage(event: CustomPhotonEvents, message: string, sender: Photon.LoadBalancing.Actor) {
			switch (event) {
				case CustomPhotonEvents.TakeSeat: {

					if (message == "destory1") {
						this.gameState.seats[1] = undefined;
					} else if (message == "destory2") {
						this.gameState.seats[2] = undefined;
					} else if (message == "destory3") {
						this.gameState.seats[3] = undefined;
					} else if (message == "destory4") {
						this.gameState.seats[4] = undefined;
					} else if (message == "destory5") {
						this.gameState.seats[5] = undefined;
					} else if (message == "destory6") {
						this.gameState.seats[6] = undefined;
					} else if (message == "destory7") {
						this.gameState.seats[7] = undefined;
					} else if (message == "destory8") {
						this.gameState.seats[8] = undefined;
					} else {
						const seatNumber = +message;
						let actorModel = new ActorModel(sender);
						let color = this.seatsMap.get(seatNumber.toString());
						actorModel.color = color;
						this.gameState.seats[seatNumber] = actorModel;
						this.sendNotification(GameProxy.SEAT_UPDATE, this.gameState.seats);
						this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
					}

					if (this.isMasterClient) {
						console.log("CustomPhotonEvents.TakeSeat: setCustomProperty");
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
					}
					break;
				}
				case CustomPhotonEvents.StartChoosingRole: {
					this.gameState.phase = GamePhase.ChoosingRole;
					if (this.isMasterClient) {
						console.log("CustomPhotonEvents.StartChoosingRole: setCustomProperty");
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
					}
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
					break;
				}
				case CustomPhotonEvents.ChooseRole: {
					if (message == "destory1") {
						this.gameState.role[1] = undefined;
					} else if (message == "destory2") {
						this.gameState.role[2] = undefined;
					} else if (message == "destory3") {
						this.gameState.role[3] = undefined;
					} else if (message == "destory4") {
						this.gameState.role[4] = undefined;
					} else if (message == "destory5") {
						this.gameState.role[5] = undefined;
					} else if (message == "destory6") {
						this.gameState.role[6] = undefined;
					} else if (message == "destory7") {
						this.gameState.role[7] = undefined;
					} else if (message == "destory8") {
						this.gameState.role[8] = undefined;
					} else {
						const jsNumber = +message;
						this.gameState.role[jsNumber] = new ActorModel(sender);
					}

					//this.sendNotification(GameProxy.CHOOSE_JS_END, this.gameState.role);
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
					break;
				}
				case CustomPhotonEvents.FirstOneNr: {
					this.gameState = this.loadBalancingClient.myRoom().getCustomProperty("gameState");
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
					this.sendNotification(GameProxy.FIRST_ONE, message);
					break;
				}
				case CustomPhotonEvents.nextNr: {
					this.sendNotification(GameProxy.NEXT_NR, message);
					break;
				}
				case CustomPhotonEvents.onegameend: {
					this.sendNotification(GameProxy.ONE_GAME_END);
					break;
				}
				case CustomPhotonEvents.tongzhi: {
					this.sendNotification(GameProxy.TONGZHI, message);
					break;
				}
				case CustomPhotonEvents.toupiaoui: {
					this.sendNotification(GameProxy.TOUPIAO_UI);
					break;
				}
				case CustomPhotonEvents.piaoshu: {
					let seatNo = this.gameState.seats.findIndex(seat => seat && seat.actorNr == sender.actorNr);
					this.gameState.toupiao[seatNo] = message;
					this.sendNotification(GameProxy.PIAO_SHU, this.gameState.toupiao);
					break;
				}
				case CustomPhotonEvents.piaoshu2: {
					let seatNo = this.gameState.seats.findIndex(seat => seat && seat.actorNr == sender.actorNr);
					this.gameState.toupiao2[seatNo] = message;
					this.sendNotification(GameProxy.PIAO_SHU, this.gameState.toupiao2);
					break;
				}
				case CustomPhotonEvents.piaoshu3: {
					let seatNo = this.gameState.seats.findIndex(seat => seat && seat.actorNr == sender.actorNr);
					this.gameState.toupiao3[seatNo] = message;
					this.sendNotification(GameProxy.PIAO_SHU, this.gameState.toupiao3);
					break;
				}
				case CustomPhotonEvents.toupiaoend: {
					let zongpiaoshu: number = 0;
					this.gameState.toupiao.forEach(element => {
						const piaoshu = +element;
						zongpiaoshu += piaoshu;
					});
					this.sendNotification(GameProxy.ZONG_PIAOSHU, zongpiaoshu);
					break;
				}
				case CustomPhotonEvents.toupiaoend2: {
					let zongpiaoshu: number = 0;
					this.gameState.toupiao2.forEach(element => {
						const piaoshu = +element;
						zongpiaoshu += piaoshu;
					});
					this.sendNotification(GameProxy.ZONG_PIAOSHU, zongpiaoshu);
					break;
				}
				case CustomPhotonEvents.toupiaoend3: {
					let zongpiaoshu: number = 0;
					this.gameState.toupiao3.forEach(element => {
						const piaoshu = +element;
						zongpiaoshu += piaoshu;
					});
					this.sendNotification(GameProxy.ZONG_PIAOSHU, zongpiaoshu);
					break;
				}
				case CustomPhotonEvents.starttwo: {
					this.sendNotification(GameProxy.START_TWO);
					break;
				}
				case CustomPhotonEvents.onelcftongbu: {
					this.gameState.onelcfskill = true;
					break;
				}
				case CustomPhotonEvents.twolcftongbu: {
					this.gameState.twolcfskill = true;
					break;
				}
				case CustomPhotonEvents.threelcftongbu: {
					this.gameState.threelcfskill = true;
					break;
				}
				case CustomPhotonEvents.oneybrtongbu: {
					const Nr = +message;
					this.gameState.oneybrskill = Nr;
					this.sendNotification(GameProxy.ONE_YBRSKILL, Nr);
					break;
				}
				case CustomPhotonEvents.twoybrtongbu: {
					const Nr = +message;
					this.gameState.twoybrskill = Nr;
					this.sendNotification(GameProxy.ONE_YBRSKILL, Nr);
					break;
				}
				case CustomPhotonEvents.threeybrtongbu: {
					const Nr = +message;
					this.gameState.threeybrskill = Nr;
					this.sendNotification(GameProxy.ONE_YBRSKILL, Nr);
					break;
				}
				case CustomPhotonEvents.onezgqtongbu: {
					const Nr = +message;
					this.gameState.onezgqskill = Nr;
					this.sendNotification(GameProxy.ONE_ZGQSKILL, Nr);
					break;
				}
				case CustomPhotonEvents.twozgqtongbu: {
					const Nr = +message;
					this.gameState.twozgqskill = Nr;
					this.sendNotification(GameProxy.ONE_ZGQSKILL, Nr);
					break;
				}
				case CustomPhotonEvents.threezgqtongbu: {
					const Nr = +message;
					this.gameState.threezgqskill = Nr;
					this.sendNotification(GameProxy.ONE_ZGQSKILL, Nr);
					break;
				}
				case CustomPhotonEvents.lunci: {
					const Nr = +message;
					this.gameState.lunci = Nr;
					console.log(this.gameState.lunci);
					break;
				}
				case CustomPhotonEvents.touren: {
					this.sendNotification(GameProxy.TOUREN);
					break;
				}
				case CustomPhotonEvents.tourenjieguo: {
					const Nr = +message;
					if (this.gameState.role[1] && sender.actorNr == this.gameState.role[1].actorNr) {
						this.gameState.touren[1] = this.gameState.seats[Nr];
					} else if (this.gameState.role[2] && sender.actorNr == this.gameState.role[2].actorNr) {
						this.gameState.touren[2] = this.gameState.seats[Nr];
					} else if (this.gameState.role[3] && sender.actorNr == this.gameState.role[3].actorNr) {
						this.gameState.touren[3] = this.gameState.seats[Nr];
					} else if (this.gameState.role[4] && sender.actorNr == this.gameState.role[4].actorNr) {
						this.gameState.touren[4] = this.gameState.seats[Nr];
					} else if (this.gameState.role[5] && sender.actorNr == this.gameState.role[5].actorNr) {
						this.gameState.touren[5] = this.gameState.seats[Nr];
					} else if (this.gameState.role[6] && sender.actorNr == this.gameState.role[6].actorNr) {
						this.gameState.touren[6] = this.gameState.seats[Nr];
					} else if (this.gameState.role[7] && sender.actorNr == this.gameState.role[7].actorNr) {
						this.gameState.touren[7] = this.gameState.seats[Nr];
					} else if (this.gameState.role[8] && sender.actorNr == this.gameState.role[8].actorNr) {
						this.gameState.touren[8] = this.gameState.seats[Nr];
					}
					this.sendNotification(GameProxy.TOUREN_JIEGUO, this.gameState.touren);
					console.log(this.gameState.touren);
					break;
				}
			}
		}

		private randomShuffle(array: any[]) {
			array.sort(() => {
				return 0.5 - Math.random();
			});
		}

		public startGame() {
			this.randomShuffle(this.gameState.baowulist);
			this.randomShuffle(this.gameState.onezj);
			this.randomShuffle(this.gameState.twozj);
			this.randomShuffle(this.gameState.threezj);

			this.gameState.hyyskill = _.random(1, 3);
			this.gameState.mhjnskill = _.random(1, 3);
			let validSeats = this.gameState.seats
				.map((actor, index) => { return { actor: actor, index: index }; })
				.filter((value, index) => { return value.actor; });
			let firstOneIndex = _.random(0, validSeats.length - 1);
			this.gameState.firstOne = validSeats[firstOneIndex].index;

			this.gameState.phase = GamePhase.GameInProgress;

			//sync gameState
			console.log("MasterClient startGame: setCustomProperty");
			this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.FirstOneNr, this.gameState.firstOne.toString());
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
					maxPlayers: this.gameState.maxPlayers,
					suspendedPlayerLiveTime: -1,
					emptyRoomLiveTime: 12000,
					uniqueUserId: true,
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

		public joinSeat(seatNumber: string) {
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.TakeSeat, seatNumber);
		}

		public chooseRole(jsNumber: string) {
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.ChooseRole, jsNumber);
		}

		public startChooseRole() {
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.StartChoosingRole);
		}
	}
}