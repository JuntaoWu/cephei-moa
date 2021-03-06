
namespace moa {

    export class AppContainer extends eui.UILayer {

        public loginScreen: LoginScreen = new LoginScreen();
        public startScreen: StartScreen = new StartScreen();
        public gameScreen: GameScreen = new GameScreen();

        public constructor() {
            super();
        }

        public enterLoginScreen(): void {
            platform.hideAllBannerAds();

            this.addChild(this.loginScreen);
        }

        /**
         * 进入开始页面
         */
        public enterStartScreen(): void {

            platform.hideAllBannerAds();

            // SoundPool.playBGM("generic-music_mp3");
            // const gameScreen = this.getChildByName("gameScreen");
            // gameScreen && this.removeChild(this.gameScreen);
            this.removeChildren();

            this.addChild(this.startScreen);
        }

        // private myChildGame: ap.Main;
        // public enterChildGame() {
        //     this.removeChildren();

        //     if (!this.myChildGame) {
        //         this.myChildGame = new ap.Main();
        //     }
        //     this.addChild(this.myChildGame);
        // }

        public enterGameScreen(): void {
            platform.hideAllBannerAds();

            this.addChild(this.gameScreen);
        }

        public userInfoWindow: UserInfoWindow;
        public showUserInfoWindow(): void {
            if (!this.userInfoWindow) {
                this.userInfoWindow = new UserInfoWindow();
            }
            this.addChild(this.userInfoWindow);
        }

        public noticeWindow: NoticeWindow;
        public showNoticeWindow(): void {
            if (!this.noticeWindow) {
                this.noticeWindow = new NoticeWindow();
            }
            this.addChild(this.noticeWindow);
        }

        public rankWindow: RankWindow;
        public showRankWindow(): void {
            if (!this.rankWindow) {
                this.rankWindow = new RankWindow();
            }
            this.addChild(this.rankWindow);
        }

        public guideWindow: GuideWindow;
        public showGuideWindow(): void {
            if (!this.guideWindow) {
                this.guideWindow = new GuideWindow();
            }
            this.addChild(this.guideWindow);
        }

        public barWindow: BarWindow;
        public showBarWindow(): void {
            if (!this.barWindow) {
                this.barWindow = new BarWindow();
            }
            this.addChild(this.barWindow);
        }

        public settingWindow: SettingWindow;
        public showSettingWindow(): void {
            if (!this.settingWindow) {
                this.settingWindow = new SettingWindow();
            }
            this.addChild(this.settingWindow);
        }

        public aboutWindow: AboutWindow;
        public showAboutWindow(data: any): void {
            if (!this.aboutWindow) {
                this.aboutWindow = new AboutWindow();
            }
            this.addChild(this.aboutWindow);
        }

        public resultWindow: ResultWindow;
        public showResultWindow(): void {
            if (!this.resultWindow) {
                this.resultWindow = new ResultWindow();
            }
            this.addChild(this.resultWindow);
        }

        public popupHandleWindow: PopupHandleWindow;
        public showPopupHandleWindow(b: boolean): void {

            if (!this.popupHandleWindow) {
                this.popupHandleWindow = new PopupHandleWindow();
            }
            this.popupHandleWindow.setMessage(b);
            this.addChild(this.popupHandleWindow);
            this.popupHandleWindow.show();
        }

        public popupPromptWindow: PopupPromptWindow;
        public showPopupPromptWindow(str: string): void {
            if (!this.popupPromptWindow) {
                this.popupPromptWindow = new PopupPromptWindow();
            }
            this.popupPromptWindow.setMessage(str);
            this.addChild(this.popupPromptWindow);
            this.popupPromptWindow.show();
        }

        public popupFangWindow: PopupFangWindow;
        public showPopupFangWindow(str: number): void {
            if (!this.popupFangWindow) {
                this.popupFangWindow = new PopupFangWindow();
            }
            this.popupFangWindow.setSeat(str);
            this.addChild(this.popupFangWindow);
            this.popupFangWindow.show();
        }

        public popupRoleWindow: PopupRoleWindow;
        public showPopupRoleWindow(roleId): void {
            if (!this.popupRoleWindow) {
                this.popupRoleWindow = new PopupRoleWindow();
            }
            this.popupRoleWindow.setRole(roleId)
            this.addChild(this.popupRoleWindow);
            this.popupRoleWindow.show();
        }

        public popupRoundWindow: PopupRoundWindow;
        public showPopupRoundWindow(): void {
            if (!this.popupRoundWindow) {
                this.popupRoundWindow = new PopupRoundWindow();
            }
            this.addChild(this.popupRoundWindow);
            this.popupRoundWindow.show();
        }

        public popupAppraisalWindow: PopupAppraisalWindow;
        public showPopupAppraisalWindow(data: any): void {
            if (!this.popupAppraisalWindow) {
                this.popupAppraisalWindow = new PopupAppraisalWindow();
            }
            this.popupAppraisalWindow.setData(data);
            this.addChild(this.popupAppraisalWindow);
            this.popupAppraisalWindow.show();
        }

        public voteRecordWindow: PopupVoteRecordWindow;
        public showVoteRecordWindow(): void {
            if (!this.voteRecordWindow) {
                this.voteRecordWindow = new PopupVoteRecordWindow();
            }
            this.addChild(this.voteRecordWindow);

        }

        public popupResultWindow: PopupVoteResultWindow;
        public showPopupResultWindow(): void {
            if (!this.popupResultWindow) {
                this.popupResultWindow = new PopupVoteResultWindow();
            }
            this.addChild(this.popupResultWindow);
            this.popupResultWindow.show();
        }

        public popupGameInfoWindow: PopupGameInfoWindow;
        public showPopupGameInfoWindow(): void {
            if (!this.popupGameInfoWindow) {
                this.popupGameInfoWindow = new PopupGameInfoWindow();
            }
            this.addChild(this.popupGameInfoWindow);
            this.popupGameInfoWindow.show();
        }

        public guideVideoWindow: GuideVideoWindow;
        public showGuideVideoWindow(): void {
            if (!this.guideVideoWindow) {
                this.guideVideoWindow = new GuideVideoWindow();
            }
            this.addChild(this.guideVideoWindow);

        }

        public guideGameProcessWindow: GuideGameProcessWindow;
        public showGuideGameProcessWindow(): void {
            if (!this.guideGameProcessWindow) {
                this.guideGameProcessWindow = new GuideGameProcessWindow();
            }
            this.addChild(this.guideGameProcessWindow);

        }

        public guideRoleSkillWindow: GuideRoleSkillWindow;
        public showGuideRoleSkillWindow(): void {
            if (!this.guideRoleSkillWindow) {
                this.guideRoleSkillWindow = new GuideRoleSkillWindow();
            }
            this.addChild(this.guideRoleSkillWindow);

        }

        public guideWinJudgeWindow: GuideWinJudgeWindow;
        public showGuideWinJudgeWindow(): void {
            if (!this.guideWinJudgeWindow) {
                this.guideWinJudgeWindow = new GuideWinJudgeWindow();
            }
            this.addChild(this.guideWinJudgeWindow);

        }

        public guideGameTermWindow: GuideGameTermWindow;
        public showGuideGameTermWindow(): void {
            if (!this.guideGameTermWindow) {
                this.guideGameTermWindow = new GuideGameTermWindow();
            }
            this.addChild(this.guideGameTermWindow);

        }

        public popupNumberKeyboard: PopupNumberKeyboard;
        public showPopupNumberKeyboard(): void {
            if (!this.popupNumberKeyboard) {
                this.popupNumberKeyboard = new PopupNumberKeyboard();
            }
            this.addChild(this.popupNumberKeyboard);
            this.popupNumberKeyboard.show();
        }

        public moreWindow: MoreGameWindow;
        public showMoreWindow(): void {
            if (!this.moreWindow) {
                this.moreWindow = new MoreGameWindow();
            }
            this.addChild(this.moreWindow);

        }

        public noticeDetailWindow: NoticeDetailWindow;
        public showNoticeDetailWindow(data?: Notice): void {
            if (!this.noticeDetailWindow) {
                this.noticeDetailWindow = new NoticeDetailWindow();
            }
            this.addChild(this.noticeDetailWindow);
            this.noticeDetailWindow.setData(data);

        }

        private adWindow: AdWindow;
        public showAdWindow(data?: Ad): void {
            if (!data || !data.enabled) {
                return;
            }
            if (!this.adWindow) {
                this.adWindow = new AdWindow();
            }
            this.addChild(this.adWindow);
            this.adWindow.setData(data);
            this.adWindow.show();
        }

    }
}