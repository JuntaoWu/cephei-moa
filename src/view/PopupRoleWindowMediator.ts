

module game {

    export class PopupRoleWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "PopupRoleWindowMediator";

        private proxy: GameProxy;

        public constructor(viewComponent: any) {
            super(PopupRoleWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");
            this.proxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            this.popupRoleWindow.confirmButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.confirmClick, this);
            this.popupRoleWindow.addEventListener(egret.Event.ADDED_TO_STAGE, this.initData, this);
            this.initData();
        }

        public initData(): void {
            this.popupRoleWindow.promptInfo = "";
            this.popupRoleWindow.role = this.proxy.rolesMap.get(this.popupRoleWindow.roleId.toString());
            let existingRoleId = this.proxy.gameState.role.findIndex(r => r && r.actorNr == this.proxy.actorNr);
            if (!this.proxy.gameState.role[this.popupRoleWindow.roleId] && existingRoleId != -1) {
                let roleName = this.proxy.rolesMap.get(existingRoleId.toString()).name;
                this.popupRoleWindow.promptInfo = `你已经选择了${roleName},是否更换${this.popupRoleWindow.role.name}`;
            }
        }

        private confirmClick(event: egret.TouchEvent) {
            let existingRoleId = this.proxy.gameState.role.findIndex(r => r && r.actorNr == this.proxy.actorNr);
            if (this.proxy.gameState.role[this.popupRoleWindow.roleId]) {
                this.sendNotification(SceneCommand.SHOW_PROMPT_POPUP, "已经有人选择此身份，请重新选择")
            }
            else {
                if (existingRoleId != -1) {
                    this.sendNotification(GameCommand.CHOOSE_ROLE, { oldRoleId: existingRoleId, newRoleId: this.popupRoleWindow.roleId });
                } else {
                    this.sendNotification(GameCommand.CHOOSE_ROLE, { oldRoleId: null, newRoleId: this.popupRoleWindow.roleId });
                }
            }
            this.popupRoleWindow.close();
        }
        public get popupRoleWindow(): PopupRoleWindow {
            return <PopupRoleWindow><any>(this.viewComponent);
        }
    }
}