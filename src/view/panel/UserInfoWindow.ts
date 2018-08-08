
module game {

    export class UserInfoWindow extends eui.Panel {

        public backButton: eui.Button;

        private headGroup: eui.Group;
        public content: eui.Group;
        private navigationBar: eui.Group;

        public avatarUrl: string;
        public nickName: string;

        public totalPlay: string;
        public winPlay: number;
        public failPlay: number;

        public totalWinRate: string;
        public gameWinRate6: string;
        public gameWinRate7: string;
        public gameWinRate8: string;
        public campXuWinRate: string;
        public campLaoWinRate: string;

        public constructor() {
            super();

            this.skinName = "skins.UserInfoWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            this.content.height = this.stage.stageHeight - this.navigationBar.height - this.headGroup.height - 15;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new UserInfoWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}