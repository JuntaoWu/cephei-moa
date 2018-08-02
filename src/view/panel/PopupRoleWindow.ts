
module game {

    export class PopupRoleWindow extends game.BasePanel {

        public confirmButton: eui.Button;

        public constructor() {
            super();
            this.skinName = "skins.PopupRoleWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new PopupRoleWindowMediator(this));
        }

        public role;
        public setRole(role): void {
            this.role = role;
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}