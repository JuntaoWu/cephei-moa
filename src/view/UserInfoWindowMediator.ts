
module game {

    export class UserInfoWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "UserInfoWindowMediator";

        public constructor(viewComponent: any) {
            super(UserInfoWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.userInfoWindow.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.backButtonClick, this);
            this.initData();
        }

        private initData(): void {

        }

        private backButtonClick(event: egret.TouchEvent) {
            this.userInfoWindow.close();
        }

        public get userInfoWindow(): UserInfoWindow {
            return <UserInfoWindow><any>(this.viewComponent);
        }
    }
}