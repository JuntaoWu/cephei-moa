
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

            this.addChild(this.startScreen);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }

        public enterGameScreen(): void {
            this.addChild(this.gameScreen);
            egret.Tween.get(this).to({ alpha: 1 }, 1500);
        }


        private _joinWindow: JoinWindow;
        public get joinWindow(): JoinWindow {
            if (!this._joinWindow) {
                this._joinWindow = new JoinWindow();
            }
            return this._joinWindow;
        }

        public showJoinWindow(): void {
            this.addChild(this.joinWindow);
            this.joinWindow.show();
        }

    }
}