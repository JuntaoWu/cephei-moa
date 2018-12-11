
namespace moa {

    export class PopupVoteRecordWindow extends eui.Panel {

        public backButton: eui.Button;
        private navigationBar: eui.Group;
        
        public orderGroup1: eui.DataGroup;
        public orderGroup2: eui.DataGroup;
        public orderGroup3: eui.DataGroup;
        public roundGroup1: eui.DataGroup;
        public roundGroup2: eui.DataGroup;
        public roundGroup3: eui.DataGroup;

        public constructor() {
            super();
            this.skinName = "skins.PopupVoteRecordWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
          
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new PopupVoteRecordWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}