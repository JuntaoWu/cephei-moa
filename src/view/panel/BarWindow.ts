
namespace moa {

    export class BarWindow extends eui.Panel {

        public backButton: eui.Button;

        private headGroup: eui.Group;
        private contentScroller: eui.Scroller;
        private navigationBar: eui.Group;

        public constructor() {
            super();

            this.skinName = "skins.BarWindow";
            this.addEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
        }

        public provinceGroup: eui.Group;
        public cityGroup: eui.Group;
        public districtGroup: eui.Group;
        public listClub: eui.List;
        public listProvince: eui.List;
        public listCity: eui.List;
        public listDistrict: eui.List;

        public province: string;
        public city: string;
        public district: string;
        public showListProvince: boolean;
        public showListCity: boolean;
        public showListDistrict: boolean;

        public createCompleteEvent(event: eui.UIEvent): void {
            this.navigationBar.y = this.stage.stageHeight - this.navigationBar.height - 10;
            this.contentScroller.height = this.stage.stageHeight - this.headGroup.height - this.navigationBar.height - 20;
            
            this.removeEventListener(eui.UIEvent.ADDED, this.createCompleteEvent, this);
            ApplicationFacade.getInstance().registerMediator(new BarWindowMediator(this));
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}