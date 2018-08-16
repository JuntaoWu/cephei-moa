

module game {

	export class GameProxy extends puremvc.Proxy implements puremvc.IProxy {
		public static NAME: string = "GameProxy";

		private userInfo: UserInfo;

		public constructor() {
			super(GameProxy.NAME);

			const self = this;

			platform.onNetworkStatusChange((res) => {
				console.log(res);
				if (!res) {
					return;
				}
				if (res.isConnected) {
					if (self.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Disconnected
						|| self.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Error) {
						self.loadBalancingClient.autoRejoin = true;
						self.loadBalancingClient.start();
					}
				}
			});
		}

		public async initialize() {
			const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
			this.userInfo = await accountProxy.loadUserInfo();

			this.loadBalancingClient.setCustomAuthentication(`openId=${this.userInfo.openId}`,
				Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom);
			this.loadBalancingClient.start();
		}

		public static PLAYER_UPDATE: string = "player_update";
		public static SEAT_UPDATE: string = "seat_update";
		public static CHOOSE_JS_END: string = "choose_js_end";
		public static FIRST_ONE: string = "first_one";
		public static NEXT_NR: string = "next_nr";
		public static TONGZHI: string = "tongzhi";
		public static BAOWU_TONGZHI: string = "baowu_tongzhi";
		public static TOUPIAO_UI: string = "toupiao_ui";
		public static ZONG_PIAOSHU: string = "zong_piaoshu";
		public static INPUT_NUMBER: string = "input_number";
		public static FINISH_INPUT: string = "finish_input";
		public static PIAO_SHU: string = "piao_shu";
		public static TOUPIAO_END: string = "toupiao_end";
		public static START_TWO: string = "start_two";
		public static ONE_YBRSKILL: string = "one_ybrskill";
		public static ONE_ZGQSKILL: string = "one_zgqskill";
		public static TOUREN: string = "touren";
		public static TOUREN_JIEGUO: string = "touren_jieguo";
		public static START_TOUPIAO_BUTTON: string = "start_toupiao_button";
		public static ROLEING: string = "roleing";

		public roomName: string;
		public get isMasterClient(): boolean {
			return this.loadBalancingClient && this.loadBalancingClient.myActor().actorNr == this.loadBalancingClient.myRoomMasterActorNr();
		}
		public isCreating: boolean;

		private _actorNr: number;
		public get actorNr(): number {
			return this._actorNr;
		}
		public set actorNr(v: number) {
			this._actorNr = v;
			platform.setStorage("currentRoom", {
				roomName: this.roomName,
				actorNr: this.actorNr
			});
		}

		public get currentRoom(): any {
			return platform.getStorage("currentRoom");
		}
		public set currentRoom(value: any) {
			platform.setStorage("currentRoom", value);
		}

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
					if (this.roomName) {  // UI triggered goes here.
						if (this.isMasterClient && this.isCreating) {
							this.createRoomWithDefaultOptions();
						}
						else {
							this.joinRoom(this.roomName);
						}
					}
					else if (this.loadBalancingClient.autoRejoin) {  // Auto rejoin goes here.
						const currentRoom = this.currentRoom;
						if (currentRoom && currentRoom.roomName) {
							this.joinRoom(currentRoom.roomName);
						}
					}
					break;
			}
		}

		private onUpdateRoomInfo() {

			const myRoom = this.loadBalancingClient.myRoom();
			const myRoomActors = this.loadBalancingClient.myRoomActors();
			const myRoomActorCount = _(myRoomActors).toArray().value().filter((actor: ActorModel) => actor && !actor.suspended).length;

			this.gameState.players = myRoomActorCount;

			this.gameState.seats.filter(seat => seat).forEach(seat => {
				seat.suspended = !myRoomActors[seat.actorNr] || myRoomActors[seat.actorNr].suspended;
			});

			if (this.isMasterClient) {
				if (this.gameState.phase == GamePhase.Preparing) {
					console.log("GamePhase.Preparing: setCustomProperty");
					this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
				}

			}
			else {

			}
			this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
		}

		private async onJoinRoom() {

			console.log("onJoinRoom hideLoading");

			platform.hideLoading();

			this.loadBalancingClient.autoRejoin = true;

			this.actorNr = this.loadBalancingClient.myActor().actorNr;

			this.sendNotification(SceneCommand.CHANGE, Scene.Game);

			this.gameState = this.loadBalancingClient.myRoom().getCustomProperty("gameState") || this.gameState;

			const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
			const userInfo = await accountProxy.loadUserInfo();

			this.loadBalancingClient.myActor().setCustomProperty("avatarUrl", userInfo.avatarUrl);
			this.loadBalancingClient.myActor().setCustomProperty("nickName", userInfo.nickName);
		}

		private onMessage(event: CustomPhotonEvents, message: any, sender: Photon.LoadBalancing.Actor) {
			if (!this.loadBalancingClient.isConnectedToGame()) {
				console.log("Disconnected: skip onMessage");
				return;
			}

			switch (event) {
				case CustomPhotonEvents.TakeSeat: {

					const { oldSeatNumber, newSeatNumber } = message;

					let oldIndex = this.gameState.seats.findIndex(seat => seat && seat.actorNr == sender.actorNr);
					if (oldIndex != -1) {
						this.gameState.seats[oldIndex] = undefined;
					}

					let actorModel = new ActorModel(sender, newSeatNumber);
					let color = this.seatsMap.get(newSeatNumber.toString());
					actorModel.color = color;
					this.gameState.seats[newSeatNumber] = actorModel;

					if (this.isMasterClient) {
						console.log("CustomPhotonEvents.TakeSeat: setCustomProperty");
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
					}

					this.sendNotification(GameProxy.SEAT_UPDATE, this.gameState.seats);
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
					this.sendNotification(GameProxy.ROLEING, 0);
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
					const { oldRoleId, newRoleId } = message;

					if (oldRoleId) {
						this.gameState.role[oldRoleId] = undefined;
					}
					this.gameState.role[newRoleId] = new ActorModel(sender);

					let i: number = 0;
					this.gameState.role.forEach(element => {
						if (element) {
							i++;
						}
					});
					this.sendNotification(GameProxy.ROLEING, i);
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);

					if (this.isMasterClient) {
						console.log("CustomPhotonEvents.ChooseRole: setCustomProperty");
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
					}
					break;
				}
				case CustomPhotonEvents.FirstOneNr: {
					this.gameState = this.loadBalancingClient.myRoom().getCustomProperty("gameState");
					this.sendNotification(SceneCommand.SHOW_ROUND_POPUP);
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
					this.sendNotification(GameProxy.FIRST_ONE, message);
					break;
				}
				case CustomPhotonEvents.nextNr: {
					this.sendNotification(GameProxy.NEXT_NR, message);
					break;
				}
				case CustomPhotonEvents.tongzhi: {
					this.sendNotification(GameProxy.TONGZHI, message);
					break;
				}
				case CustomPhotonEvents.baowutongzhi: {
					this.sendNotification(GameProxy.BAOWU_TONGZHI, message);
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
					if (this.isMasterClient) {
						console.log("CustomPhotonEvents.piaoshu: setCustomProperty");
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
					}
					break;
				}
				case CustomPhotonEvents.piaoshu2: {
					let seatNo = this.gameState.seats.findIndex(seat => seat && seat.actorNr == sender.actorNr);
					this.gameState.toupiao2[seatNo] = message;
					this.sendNotification(GameProxy.PIAO_SHU, this.gameState.toupiao2);
					if (this.isMasterClient) {
						console.log("CustomPhotonEvents.piaoshu2: setCustomProperty");
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
					}
					break;
				}
				case CustomPhotonEvents.piaoshu3: {
					let seatNo = this.gameState.seats.findIndex(seat => seat && seat.actorNr == sender.actorNr);
					this.gameState.toupiao3[seatNo] = message;
					this.sendNotification(GameProxy.PIAO_SHU, this.gameState.toupiao3);
					if (this.isMasterClient) {
						console.log("CustomPhotonEvents.piaoshu3: setCustomProperty");
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
					}
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
					if (this.isMasterClient) {
						console.log("CustomPhotonEvents.tourenjieguo: setCustomProperty");
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);
					}
					break;
				}
				case CustomPhotonEvents.starttoupiao: {
					this.sendNotification(GameProxy.START_TOUPIAO_BUTTON);
					break;
				}
				case CustomPhotonEvents.UpdateCurrentTurn: {
					this.gameState.seats.forEach(seat => {
						if (!seat) {
							return;
						}

						if (seat.actorNr == sender.actorNr || message.receiver == Receiver.All) {
							seat.action = message.action;
						}
						else if (message.updateOthers) {
							seat.action = "";
						}
					});

					if (this.isMasterClient) {
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState);
					}
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
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
			console.log(this.gameState.baowulist);
			console.log(this.gameState.onezj);
			console.log(this.gameState.twozj);
			console.log(this.gameState.threezj);
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
				this.isCreating = false;
			}
		}

		public createRoom(maxPlayers: number) {

			platform.showLoading();

			this.roomName = this.generateRoomNumber();
			if (this.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Uninitialized
				|| this.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Error) {
				// this.loadBalancingClient.setCustomAuthentication(`access_token=${me.access_token}`, Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom, "");
				this.loadBalancingClient.start();
			}
			this.gameState.maxPlayers = maxPlayers || this.gameState.maxPlayers;
			this.isCreating = true;
			this.createRoomWithDefaultOptions();
		}

		private getCurrentJoinToken(roomName: string): any {
			if (this.actorNr && this.actorNr != -1) {
				return this.actorNr;
			}
			else if (this.loadBalancingClient.myActor().getJoinToken()) {
				return this.loadBalancingClient.myActor().getJoinToken();
			}
			else {
				const currentRoom = platform.getStorage("currentRoom");
				if (currentRoom && currentRoom.roomName == roomName) {
					return currentRoom.actorNr;
				}
				else {
					return this.userInfo.openId.substr(5);
				}
			}
		}

		public joinRoom(roomName: string) {

			platform.showLoading();

			this.roomName = roomName;
			if (this.loadBalancingClient.isInLobby()) {
				console.log(`Begin joinRoom: ${roomName}`);
				this.loadBalancingClient.joinRoom(roomName, {
					joinToken: this.getCurrentJoinToken(roomName)
				});
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
			else if (this.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Uninitialized
				|| this.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Error) {
				// this.loadBalancingClient.setCustomAuthentication(`access_token=${me.access_token}`, Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom, "");
				this.loadBalancingClient.start();
			}
		}

		public suspendRoom() {
			this.reset();
			this.loadBalancingClient.leaveRoom();
		}

		public leaveRoom() {
			this.reset();
			this.loadBalancingClient.leaveRoom();
		}

		public reset() {
			this.roomName = undefined;
			this.loadBalancingClient.autoRejoin = false;
			this.gameState = new GameState();
		}

		public joinSeat(data: any) {
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.TakeSeat, data);
		}

		public chooseRole({oldRoleId, newRoleId}) {
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.ChooseRole, { oldRoleId, newRoleId });
		}

		public startChooseRole() {
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.StartChoosingRole);
		}

		public updateMyState(action: string, updateOthers: boolean = false, receiver: Receiver) {
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.UpdateCurrentTurn, { action: action, receiver: receiver, updateOthers: updateOthers });
		}

		public setSypiaoshu(syPiaoshu: number) {
			this.loadBalancingClient.myActor().setCustomProperty("syPiaoshu", syPiaoshu);
		}

		public getSyPiaoshu() {
			return this.loadBalancingClient.myActor().getCustomProperty("syPiaoshu");
		}

		public updatePlayerInfo(key, value) {
			let playerInfo: PlayerInfo = this.getPlayerInfo() || new PlayerInfo();
			playerInfo[key] = value;
			this.setPlayerInfo(playerInfo);
		}

		public setPlayerInfo(playerInfo: PlayerInfo) {
			this.loadBalancingClient.myActor().setCustomProperty("playerInfo", playerInfo);
		}

		public getPlayerInfo(): PlayerInfo {
			return this.loadBalancingClient.myActor().getCustomProperty("playerInfo");
		}
	}
}