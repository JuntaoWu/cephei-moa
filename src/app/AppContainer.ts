
module game {

    export class AppContainer extends eui.UILayer {

        public startScreen: StartScreen = new StartScreen();
        public gameScreen: GameScreen = new GameScreen();

        public constructor() {
            super();
            this.alpha = 0;
        }

        /**
         * 进入开始页面
         */
        public enterStartScreen(): void {
            // SoundPool.playBGM("generic-music_mp3");
            // const gameScreen = this.getChildByName("gameScreen");
            // gameScreen && this.removeChild(this.gameScreen);
            this.removeChildren();

            this.addChild(this.startScreen);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public enterGameScreen(): void {
            this.addChild(this.gameScreen);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public userInfoWindow: UserInfoWindow;
        public showUserInfoWindow(): void {
            if (!this.userInfoWindow) {
                this.userInfoWindow = new UserInfoWindow();
            }
            this.addChild(this.userInfoWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }
        
        public noticeWindow: NoticeWindow;
        public showNoticeWindow(): void {
            if (!this.noticeWindow) {
                this.noticeWindow = new NoticeWindow();
            }
            this.addChild(this.noticeWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public rankWindow: RankWindow;
        public showRankWindow(): void {
            if (!this.rankWindow) {
                this.rankWindow = new RankWindow();
            }
            this.addChild(this.rankWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public guideWindow: GuideWindow;
        public showGuideWindow(): void {
            if (!this.guideWindow) {
                this.guideWindow = new GuideWindow();
            }
            this.addChild(this.guideWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public barWindow: BarWindow;
        public showBarWindow(): void {
            if (!this.barWindow) {
                this.barWindow = new BarWindow();
            }
            this.addChild(this.barWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public settingWindow: SettingWindow;
        public showSettingWindow(): void {
            if (!this.settingWindow) {
                this.settingWindow = new SettingWindow();
            }
            this.addChild(this.settingWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public aboutWindow: AboutWindow;
        public showAboutWindow(data: any): void {
            if (!this.aboutWindow) {
                this.aboutWindow = new AboutWindow();
            }
            this.addChild(this.aboutWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public threeKingdomsWindow: ThreeKingdomsWindow;
        public showThreeKingdomsWindow(): void {
            if (!this.threeKingdomsWindow) {
                this.threeKingdomsWindow = new ThreeKingdomsWindow();
            }
            this.addChild(this.threeKingdomsWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public resultWindow: ResultWindow;
        public showResultWindow(): void {
            if (!this.resultWindow) {
                this.resultWindow = new ResultWindow();
            }
            this.addChild(this.resultWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
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
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
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
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public guideGameProcessWindow: GuideGameProcessWindow;
        public showGuideGameProcessWindow(): void {
            if (!this.guideGameProcessWindow) {
                this.guideGameProcessWindow = new GuideGameProcessWindow();
            }
            this.addChild(this.guideGameProcessWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public guideRoleSkillWindow: GuideRoleSkillWindow;
        public showGuideRoleSkillWindow(): void {
            if (!this.guideRoleSkillWindow) {
                this.guideRoleSkillWindow = new GuideRoleSkillWindow();
            }
            this.addChild(this.guideRoleSkillWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public guideWinJudgeWindow: GuideWinJudgeWindow;
        public showGuideWinJudgeWindow(): void {
            if (!this.guideWinJudgeWindow) {
                this.guideWinJudgeWindow = new GuideWinJudgeWindow();
            }
            this.addChild(this.guideWinJudgeWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public guideGameTermWindow: GuideGameTermWindow;
        public showGuideGameTermWindow(): void {
            if (!this.guideGameTermWindow) {
                this.guideGameTermWindow = new GuideGameTermWindow();
            }
            this.addChild(this.guideGameTermWindow);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public popupNumberKeyboard: PopupNumberKeyboard;
        public showPopupNumberKeyboard(): void {
            if (!this.popupNumberKeyboard) {
                this.popupNumberKeyboard = new PopupNumberKeyboard();
            }
            this.addChild(this.popupNumberKeyboard);
            this.popupNumberKeyboard.show();
        }
    }
}