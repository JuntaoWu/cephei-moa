
namespace moa {

    export class SettingWindow extends eui.Panel {

        public shareButton: eui.Button;
        public aboutButton: eui.Button;
        public backButton: eui.Button;
        public logoutButton: eui.Button;

        public showGuide: boolean;
        public showClub: boolean;
        public showMore: boolean;
        public showWeChatLogin: boolean;
        public enabledIM: boolean;

        public toggleShowGuide: eui.ToggleSwitch;
        public toggleShowClub: eui.ToggleSwitch;
        public toggleShowWeChatLogin: eui.ToggleSwitch;
        public groupShowWeChatLogin: eui.Group;
        public toggleEnabledIM: eui.ToggleSwitch;
        public groupEnabledIM: eui.Group;

        private navigationBar: eui.Group;

        public constructor() {
            super();

            this.skinName = "skins.SettingWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new SettingWindowMediator(this));

            if (platform.name == "wxgame") {
                this.logoutButton.visible = false;
                this.groupShowWeChatLogin.visible = false;
                this.groupEnabledIM.visible = false;
            }
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}