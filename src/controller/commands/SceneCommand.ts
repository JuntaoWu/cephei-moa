/**
 * Created by xzper on 2014/11/15.
 */

module game {

    export class SceneCommand extends puremvc.SimpleCommand implements puremvc.ICommand {

        public constructor() {
            super();
        }
        public static NAME: string = "SceneCommand";

        /**
         * 切换场景
         */
        public static CHANGE: string = "scene_change";

        public static SHOW_JOIN_WINDOW: string = "show_join_window";

        public register(): void {
            this.initializeNotifier("ApplicationFacade");
        }

        initializeNotifier(key: string) {
            super.initializeNotifier(key);
            this.facade().registerCommand(SceneCommand.CHANGE, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_JOIN_WINDOW, SceneCommand);
        }

        public async execute(notification: puremvc.INotification): Promise<any> {
            var data: any = notification.getBody();
            var appMediator: ApplicationMediator =
                <ApplicationMediator><any>this.facade().retrieveMediator(ApplicationMediator.NAME);

            var gameProxy: GameProxy = <GameProxy><any>this.facade().retrieveProxy(GameProxy.NAME);
            switch (notification.getName()) {
                case SceneCommand.CHANGE: {
                    if (data == Scene.Start) {
                        appMediator.main.enterStartScreen();
                    }
                    else if (data == Scene.Game) {
                        appMediator.main.enterGameScreen();
                    }
                    break;
                }
                case SceneCommand.SHOW_JOIN_WINDOW: {
                    appMediator.main.showJoinWindow();
                }
            }
        }
    }
}