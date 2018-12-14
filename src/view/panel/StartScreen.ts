
namespace moa {

    export class StartScreen extends eui.Component {

        public startBackground: eui.Image;

        private poweredLabel: eui.Label;
        private navigationBar: eui.Group;

        public btnCreateRoom: eui.Button;
        public btnJoinRoom: eui.Button;
        public btnTanbao: eui.Button;

        public headGroup: eui.Group;
        public contentScroller: eui.Scroller;
        public groupNavigationBar: eui.Group;

        public btnNotice: eui.Button;
        public btnRank: eui.Button;
        public btnGuide: eui.Button;
        public btnSetting: eui.Button;
        public btnClub: eui.Button;
        public btnViewMore: eui.Button;

        public nickName: string = "";
        public avatarUrl: string = "btn-share";
        public isDebugPlatform: boolean = false;
        public isWxPlatform: boolean = true;
        public isNativePlatform: boolean = false;
        public roomNum: string = "";

        public constructor() {
            super();

            this.skinName = "skins.StartScreen";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height;
            // this.poweredLabel.y = this.stage.stageHeight - this.poweredLabel.height - 30;
            this.contentScroller.height = this.stage.stageHeight - this.navigationBar.height - this.headGroup.height - 40;

            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new StartScreenMediator(this));

        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }

        public showNoticeTips() {
            let redtips = this.btnNotice.getChildByName("redtips");
            redtips.visible = true;
        }

        public hideNoticeTips() {
            let redtips = this.btnNotice.getChildByName("redtips");
            redtips.visible = false;
        }
    }
}