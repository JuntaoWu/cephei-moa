

module game {

    export class GameScreenMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "GameScreenMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(GameScreenMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            console.log("GameScreen initData:");
            this.initData();
        }

        public async initData() {
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.gameScreen.roomName = this.proxy.roomName;
            this.gameScreen.isMasterClient = this.proxy.isMasterClient;
            this.gameScreen.isNormalClient = !this.proxy.isMasterClient;
            this.updateGameScreen(this.proxy.gameState);
        }

        public listNotificationInterests(): Array<any> {
            return [GameProxy.PLAYER_UPDATE];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
            switch (notification.getName()) {
                case GameProxy.PLAYER_UPDATE: {
                    this.updateGameScreen(data);
                }
            }
        }

        public updateGameScreen(data: GameState) {
            this.gameScreen.currentPlayers = data.players;
            this.gameScreen.maxPlayers = data.maxPlayers;
        }

        public get gameScreen(): GameScreen {
            return <GameScreen><any>(this.viewComponent);
        }
    }
}