

namespace moa {

	export class GameProxy extends puremvc.Proxy implements puremvc.IProxy {
		public static NAME: string = "GameProxy";

		public userInfo: UserInfo;

		private lastSeenErrorAt = 0;

		public isIMEnabled = false;
		private isIMInitialized = false;
		private isEnteredChatRoom = false;

		private isBotEnabled = false;

		public constructor() {
			super(GameProxy.NAME);

			const self = this;

			platform.onNetworkStatusChange((res) => {

				this.gameState && this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);

				if (!res || !res.isConnected) {
					console.log("onNetworkStatusChange: not connected");
					return;
				}
				console.log("onNetworkStatusChange reset retried:", self.loadBalancingClient.retried,
					"state:", self.loadBalancingClient.state, Photon.LoadBalancing.LoadBalancingClient.StateToName(self.loadBalancingClient.state));

				self.loadBalancingClient.retried = 0;
				// network is connected now.
				if (self.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Disconnected
					|| self.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Error) {
					self.loadBalancingClient.autoRejoin = true;
					egret.setTimeout(() => {
						self.loadBalancingClient.start();
					}, this, 1000);
				}
				else if (self.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.JoinedLobby
					&& this.loadBalancingClient.autoRejoin) {
					const currentRoom = this.currentRoom;
					if (currentRoom && currentRoom.roomName) {
						console.log("autoRejoin room:", currentRoom.roomName);
						this.joinRoom(currentRoom.roomName);
					}
				}
			});

			platform.registerOnResume((res) => {
				// todo: check if quitIM works.
				platform.quitIM();

				if (!res || !res.isConnected) {
					console.log("onResume: not connected");
					return;
				}
				console.log("onResume reset retried:", self.loadBalancingClient.retried,
					"state:", self.loadBalancingClient.state, Photon.LoadBalancing.LoadBalancingClient.StateToName(self.loadBalancingClient.state));

				self.loadBalancingClient.retried = 0;
				// network is connected now.
				if (self.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Disconnected
					|| self.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Error) {
					self.loadBalancingClient.autoRejoin = true;
					egret.setTimeout(() => {
						self.loadBalancingClient.start();
					}, this, 1000);
				}
				else if (self.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.JoinedLobby
					&& this.loadBalancingClient.autoRejoin) {
					const currentRoom = this.currentRoom;
					if (currentRoom && currentRoom.roomName) {
						console.log("autoRejoin room:", currentRoom.roomName);
						this.joinRoom(currentRoom.roomName);
					}
				}
			});
		}

		public async initialize() {
			this.userInfo = await AccountAdapter.loadUserInfo();

			const preference = await AccountAdapter.loadPreference();
			this.enableIM(preference && preference.enabledIM);
			this.enableBot(preference && preference.enabledBot);

			this.loadBalancingClient.setCustomAuthentication(`userId=${this.userInfo.userId}`,
				Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom);
			this.loadBalancingClient.start();
		}

		public enableBot(enabled: boolean) {
			this.isBotEnabled = enabled;
		}

		public enableIM(enabled: boolean) {
			this.isIMEnabled = enabled;
			if (this.isIMEnabled && !this.isIMInitialized) {
				this.isIMInitialized = true;
				platform.setupIM(this.userInfo.userId);
			}
		}

		public enableMic(enabled: boolean) {
			platform.enableMic(enabled);
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
		public static ONE_ZGQSKILL: string = "one_zgqskill";
		public static TOUREN: string = "touren";
		public static TOUREN_JIEGUO: string = "touren_jieguo";
		public static START_TOUPIAO_BUTTON: string = "start_toupiao_button";
		public static ROLEING: string = "roleing";
		public static AUTH_EDN: string = "auth_end";

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

		public get isLastPlayer(): boolean {
			return platform.getStorage("isLastPlayer") && platform.getStorage("isLastPlayer") == "true";
		}
		public set isLastPlayer(v: boolean) {
			platform.setStorage("isLastPlayer", (!!v).toString());
		}

		public gameState: GameState = new GameState();

		public ybrSkillTable: Attack[] = [];

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

				this._loadBalancingClient.onOperationResponseSubject = (errorCode) => {
					this.onOperationResponse(errorCode);
				}
			}
			return this._loadBalancingClient;
		}

		private onOperationResponse(errorCode: number) {
			if (errorCode) {
				this.reset();
			}
		}

		private onStateChange() {

			const state = this.loadBalancingClient.state;
			console.log("onStateChange: ", state, Photon.LoadBalancing.LoadBalancingClient.StateToName(state));
			switch (state) {
				case Photon.LoadBalancing.LoadBalancingClient.State.Error:
					this.lastSeenErrorAt = +new Date();
					break;
				case Photon.LoadBalancing.LoadBalancingClient.State.JoinedLobby:
					platform.showToast("连接服务器成功");

					const rejoinAt = this.lastSeenErrorAt + 6000;
					let delay = Math.max(rejoinAt - (+new Date()), 500);
					console.log("Will rejoin after: ", delay);

					delay = 0;

					if (delay > 0 && (this.roomName || (this.loadBalancingClient.autoRejoin && this.currentRoom && this.currentRoom.roomName))) {
						egret.setTimeout(() => {
							console.log("showLoading after a delay of 50ms");
							platform.showLoading("加载中");
						}, this, 50);
					}

					egret.setTimeout(() => {

						console.log("Rejoining after a delay");

						if (this.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.JoinedLobby) {
							if (this.roomName) {  // UI triggered goes here.
								console.log("UI triggered create/join room:", this.roomName);
								this.loadBalancingClient.retried = 0;
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
									console.log("autoRejoin room:", currentRoom.roomName);
									this.joinRoom(currentRoom.roomName);
								}
							}
						}
					}, this, delay);
					break;
				case Photon.LoadBalancing.LoadBalancingClient.State.Joined:
					platform.showToast("加入房间成功");
					break;
			}
		}

		private onUpdateRoomInfo() {

			const myRoom = this.loadBalancingClient.myRoom();
			const myRoomActors = this.loadBalancingClient.myRoomActors();
			const myRoomActorCount = _(myRoomActors).toArray().value().filter((actor: ActorModel) => actor && !actor.suspended).length;

			this.gameState.players = myRoomActorCount;

			for (var i = 0; i < this.gameState.seats.length; ++i) {
				const seat = this.gameState.seats[i];
				if (seat) {
					if (!myRoomActors[seat.actorNr]) {
						this.gameState.seats[i] = undefined;
					}
					else {
						seat.suspended = myRoomActors[seat.actorNr].suspended;
					}
				}
			}

			// this.ybrSkillTable = this.loadBalancingClient.myRoom().getCustomProperty("ybrSkillTable");

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

			platform.setStorage(this.roomName, (+new Date()).toString());

			platform.hideLoading();

			this.loadBalancingClient.autoRejoin = true;

			this.actorNr = this.loadBalancingClient.myActor().actorNr;

			this.sendNotification(SceneCommand.CHANGE, Scene.Game);

			this.gameState = this.loadBalancingClient.myRoom().getCustomProperty("gameState") || this.gameState;

			this.ybrSkillTable = this.loadBalancingClient.myRoom().getCustomProperty("ybrSkillTable") || this.ybrSkillTable;

			const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
			const userInfo = await AccountAdapter.loadUserInfo();

			this.loadBalancingClient.myActor().setCustomProperties({
				userId: userInfo.userId,
				avatarUrl: userInfo.avatarUrl,
				nickName: userInfo.nickName,
				anonymous: userInfo.anonymous,
			});

			if (this.isIMEnabled && !this.isEnteredChatRoom) {
				await platform.enterChatRoom(this.loadBalancingClient.myRoom().name);
				// const imInfo = await AccountAdapter.loadIMInfo();
				// await platform.loginIM(imInfo);
				this.isEnteredChatRoom = true;
				// this.loadBalancingClient.myActor().setCustomProperty("imAccId", imInfo.account);
			}
		}

		private onMessage(event: CustomPhotonEvents, message: any, sender: Photon.LoadBalancing.Actor) {
			if (!this.loadBalancingClient.isConnectedToGame()) {
				console.log("Disconnected: skip onMessage");
				return;
			}

			switch (event) {
				case CustomPhotonEvents.TakeSeat: {

					console.log("CustomPhotonEvents.TakeSeat");

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

						AccountAdapter.logCurrentRoomReady(this.roomName, this.loadBalancingClient.getUserId());
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
					// if (this.loadBalancingClient.myActor().actorNr == actorNr) {
					// 	this.updateActorState(actorNr, "isAuthing", true);
					// 	// this.sendNotification(GameProxy.FIRST_ONE, message);
					// }
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
						if (message && message.action == "isSpeaking") {
							console.log("MasterClient notified: isSpeaking");
							if (this.isIMEnabled) {
								// const chatUsers = this.gameState.seats.filter(seat => seat && seat.imAccId).map(seat => seat.imAccId);
								// platform.createGroupChat(chatUsers).then(teamId => {
								// 	if (teamId) {
								// 		this.loadBalancingClient.sendMessage(CustomPhotonEvents.OpenGroupChat, teamId);
								// 	}
								// });
							}
						}
					}
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
					break;
				}
				case CustomPhotonEvents.UpdateCurrentActor: {
					this.gameState.seats.forEach(seat => {
						if (!seat) {
							return;
						}

						if (seat.actorNr == message.actorNr) {
							seat.action = message.action;
						}
						else if (message.updateOthers) {
							seat.action = "";
						}
					});

					this.ybrSkillTable = this.loadBalancingClient.myRoom().getCustomProperty("ybrSkillTable");

					if (this.isMasterClient) {
						this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState);
					}
					this.sendNotification(GameProxy.PLAYER_UPDATE, this.gameState);
					break;
				}
				case CustomPhotonEvents.DestroyRoom: {
					this.leaveRoom();
					this.sendNotification(SceneCommand.CHANGE, Scene.Start);
					break;
				}
				case CustomPhotonEvents.OpenGroupChat: {
					if (this.isIMEnabled) {
						// const chatUsers = this.gameState.seats.filter(seat => seat && seat.imAccId).map(seat => seat.imAccId);
						// platform.openGroupChat(message, chatUsers);
					}
					break;
				}
			}
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

			const firstActor = this.gameState.seats[this.gameState.firstOne];

			this.gameState.shunwei_one_been[1] = firstActor;

			this.updateCurrentActor({
				actorNr: firstActor.actorNr,
				action: "isAuthing",
				updateOthers: true,
			});

			this.loadBalancingClient.myRoom().setCustomProperty("gameState", this.gameState, false, null);

			//sync gameState
			console.log("MasterClient startGame: setCustomProperty");
			console.log(this.gameState.baowulist);
			console.log(this.gameState.onezj);
			console.log(this.gameState.twozj);
			console.log(this.gameState.threezj);

			this.loadBalancingClient.sendMessage(CustomPhotonEvents.FirstOneNr, this.gameState.firstOne.toString());
		}

		private updateCurrentActor(message) {
			this.gameState.seats.forEach(seat => {
				if (!seat) {
					return;
				}

				if (seat.actorNr == message.actorNr) {
					seat.action = message.action;
				}
				else if (message.updateOthers) {
					seat.action = "";
				}
			});
		}

		public ybrskilling(seatNumber: number) {
			const ybrSkillTable = this.ybrSkillTable || [];
			const actorNr = this.gameState.seats[seatNumber].actorNr;
			const roleNumber = this.gameState.role.findIndex(r => r && r.actorNr == actorNr);

			// check if actor completed his turn in current round.
			let affectRound = this.gameState.lunci;
			if (this.gameState.lunci === 1
				&& this.gameState.shunwei_one_been.some(actor => actor && actor.actorNr == actorNr)) {
				++affectRound;
			}
			else if (this.gameState.lunci === 2
				&& (this.gameState.shunwei_two_been.some(actor => actor && actor.actorNr == actorNr))
				|| ybrSkillTable.some(attack => attack.actorNr == actorNr && attack.attackRound == 1 && attack.affectRound == 2)) {
				++affectRound;
			}

			ybrSkillTable.push({
				actorNr: actorNr,
				seatNumber: seatNumber,
				roleNumber: roleNumber,
				affectRound: affectRound,
				attackRound: this.gameState.lunci,
			});

			this.loadBalancingClient.myRoom().setCustomProperty("ybrSkillTable", ybrSkillTable, false, null);
		}

		private generateRoomNumber(roomNameLength: number) {
			if (!+roomNameLength || roomNameLength <= 0) {
				roomNameLength = 6;
			}
			const name = _.random(0, Math.pow(10, roomNameLength) - 1);
			// let random = _.padStart(Math.floor(1000 * Math.random()).toString(), 3, '0');
			// let name = parseInt(`${random}${new Date().getMilliseconds()}`).toString(10);
			return _.padStart(name.toString(), roomNameLength, '0');
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
					propsListedInLobby: []
				});
				this.isCreating = false;
			}
		}

		public createRoom(maxPlayers: number = 6, roomNameLength: number = 6) {

			platform.showLoading("加载中");

			this.roomName = this.generateRoomNumber(roomNameLength);
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
			return platform.getStorage(roomName);
		}

		public joinRoom(roomName: string) {

			if (this.isBotEnabled && roomName == "0000") {
				this.createRoom(6, 4);
				return;
			}

			console.log(`joinRoom: ${roomName}`);

			platform.showLoading("加载中");

			this.roomName = roomName;
			const joinToken = this.getCurrentJoinToken(roomName);
			this.loadBalancingClient.autoRejoin = !!joinToken;

			if (this.loadBalancingClient.isInLobby() && !this.loadBalancingClient.isJoinedToRoom()) {
				console.log(`Begin joinRoom: ${roomName} with joinToken: ${joinToken}`);
				this.loadBalancingClient.joinRoom(roomName, {
					rejoin: !!joinToken,
				});
			}
			else if (this.loadBalancingClient.isJoinedToRoom()) {
				let existingRoom = this.loadBalancingClient.myRoom().name;
				if (this.loadBalancingClient.myRoom().name == roomName) {
					console.log(`Already in room: ${roomName}`);
				}
				else {
					this.loadBalancingClient.leaveRoom();
					this.loadBalancingClient.joinRoom(roomName, {
						rejoin: !!joinToken
					});
				}
			}
			else if (this.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Uninitialized
				|| this.loadBalancingClient.state == Photon.LoadBalancing.LoadBalancingClient.State.Error) {
				// this.loadBalancingClient.setCustomAuthentication(`access_token=${me.access_token}`, Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom, "");
				this.loadBalancingClient.start();
			}
		}

		public suspendRoom() {
			if (this.gameState.phase != GamePhase.Preparing) {
				this.loadBalancingClient.sendMessage(CustomPhotonEvents.DestroyRoom);
			}
			else {
				this.leaveRoom();
				this.sendNotification(SceneCommand.CHANGE, Scene.Start);
			}
		}

		public leaveRoom() {
			this.reset();
			this.cleanup();
			this.loadBalancingClient.leaveRoom();
		}

		// cleanup persist room info when LeaveRoom manually.
		// so autoRejoining based on persist room info will be stopped.
		public cleanup() {
			platform.setStorage(this.loadBalancingClient.myRoom().name, "");
			platform.setStorage("currentRoom", {
				roomName: "",
				actorNr: -1
			});
			this.isEnteredChatRoom = false;
			platform.exitChatRoom();
		}

		// reset memory room info when Disconnected
		// so UI triggered joinRoom won't be retried again.
		// autoRejoining based on persist room info will still work.
		public reset() {
			this.roomName = undefined;
			this.gameState = new GameState();
			this.ybrSkillTable = [];
			this.resetPlayerInfo();
			this.isLastPlayer = false;
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

		public updateActorState(actorNr: number, action: string, updateOthers: boolean = false) {
			this.loadBalancingClient.sendMessage(CustomPhotonEvents.UpdateCurrentActor, { actorNr: actorNr, action: action, updateOthers: updateOthers });
		}

		public setSypiaoshu(syPiaoshu: number) {
			this.loadBalancingClient.myActor().setCustomProperty("syPiaoshu", syPiaoshu);
		}

		public getSyPiaoshu() {
			return this.loadBalancingClient.myActor().getCustomProperty("syPiaoshu");
		}

		public setIsLastPlayer(isLastPlayer) {
			this.loadBalancingClient.myActor().setCustomProperty("isLastPlayer", isLastPlayer);
		}

		public getIsLastPlayer() {
			return this.loadBalancingClient.myActor().getCustomProperty("isLastPlayer");
		}

		public updatePlayerInfo(key, value) {
			let playerInfo: PlayerInfo = this.getPlayerInfo() || new PlayerInfo();
			playerInfo[key] = value;
			this.setPlayerInfo(playerInfo);
		}

		public setPlayerInfo(playerInfo: PlayerInfo) {
			this.loadBalancingClient.myActor().setCustomProperty("playerInfo", playerInfo);
		}

		public resetPlayerInfo() {
			this.loadBalancingClient.myActor().setCustomProperty("playerInfo", new PlayerInfo());
		}

		public getPlayerInfo(): PlayerInfo {
			return this.loadBalancingClient.myActor().getCustomProperty("playerInfo");
		}

		private randomShuffle(array: any[]) {
			array.sort(() => {
				return 0.5 - Math.random();
			});
		}

		public async updateUserGameRecords(): Promise<void> {

			const masterRoleId = this.gameState.role.findIndex(r => this.isActorLocal(r));
			const masterCamp = this.rolesMap.get(masterRoleId.toString()).camp;
			const isMasterWin = (masterCamp == gameCamp.xuyuan)
				? (this.gameState.defen >= 6)
				: (this.gameState.defen < 6);

			let records = this.gameState.role.map((role, index) => {
				if (!role) {
					return;
				}
				let result = {
					userId: role.userId,
					camp: index < 6 ? 1 : 2,
					roleId: index,
					gameType: this.gameState.maxPlayers,
					isWin: this.rolesMap.get(index.toString()).camp == masterCamp ? isMasterWin : !isMasterWin,
					roomName: this.roomName
				};
				return result;
			}).filter(record => record);

			await AccountAdapter.saveUserGameRecords(records, this.roomName, this.loadBalancingClient.getUserId());
		}
	}
}