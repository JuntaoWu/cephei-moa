
namespace moa {

    export class PopupGameInfoWindow extends moa.BasePanel {

        public constructor() {
            super();
            this.skinName = "skins.PopupGameInfoWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public role: any;
        public nickName: string;
        public avatarUrl: string;
        public selfColor: string;
        public teammate: any;
        public firstRound: any;
        public secondRound: any;
        public thirdRound: any;

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new PopupGameInfoWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}