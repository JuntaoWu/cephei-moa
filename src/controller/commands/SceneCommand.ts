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

        public static SHOW_USERINFO_WINDOW: string = "show_user_window";

        public static SHOW_NOTICE_WINDOW: string = "show_notice_window";
        public static SHOW_RANK_WINDOW: string = "show_rank_window";
        public static SHOW_GUIDE_WINDOW: string = "show_guide_window";
        public static SHOW_SETTING_WINDOW: string = "show_setting_window";

        public static SHOW_ABOUT_WINDOW: string = "show_about_window";

        public register(): void {
            this.initializeNotifier("ApplicationFacade");
        }

        initializeNotifier(key: string) {
            super.initializeNotifier(key);
            this.facade().registerCommand(SceneCommand.CHANGE, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_JOIN_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_USERINFO_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_NOTICE_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_RANK_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_GUIDE_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_SETTING_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_ABOUT_WINDOW, SceneCommand);
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
                    break;
                }
                case SceneCommand.SHOW_USERINFO_WINDOW: {
                    appMediator.main.showUserInfoWindow();
                    break;
                }
                case SceneCommand.SHOW_NOTICE_WINDOW: {
                    appMediator.main.showNoticeWindow();
                    break;
                }
                case SceneCommand.SHOW_RANK_WINDOW: {
                    appMediator.main.showRankWindow();
                    break;
                }
                case SceneCommand.SHOW_GUIDE_WINDOW: {
                    appMediator.main.showGuideWindow();
                    break;
                }
                case SceneCommand.SHOW_SETTING_WINDOW: {
                    appMediator.main.showSettingWindow();
                    break;
                }
                case SceneCommand.SHOW_ABOUT_WINDOW: {
                    appMediator.main.showAboutWindow();
                    break;
                }
            }
        }
    }
}