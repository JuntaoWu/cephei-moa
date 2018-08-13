
module game {

    export class BarWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "BarWindowMediator";

        public constructor(viewComponent: any) {
            super(BarWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.barWindow.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.backButtonClick, this);
            this.barWindow.provinceGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showProvinceList, this);
            this.barWindow.cityGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showCityList, this);
            this.barWindow.districtGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showDistrictList, this);
            this.barWindow.listProvince.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.selectProvince, this);
            this.barWindow.listCity.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.selectCity, this);
            this.barWindow.listDistrict.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.selectDistrict, this);
            
            this.initData();
        }

        private clubList: Array<any>;
        private provinceList: Array<any> = [{name: "四川省"}];
        private cityList: Array<any> = [{name: "成都市"}];
        private districtList: Array<any> = [{name: "成华区"}];

        public async initData() {
            this.barWindow.showListProvince = this.barWindow.showListCity = this.barWindow.showListDistrict = false;
            this.clubList = [];
            for (let i = 1; i < 21; i++) {
                this.clubList.push({
                    clubName: "xx桌吧",
                    time: "10:00~18:00",
                    phone: "18112345678",
                    attr: ".........................",
                })
            }
            this.barWindow.listClub.dataProvider = new eui.ArrayCollection(this.clubList);
            this.barWindow.listClub.itemRenderer = ClubListItemRenderer;

            this.barWindow.listProvince.dataProvider = new eui.ArrayCollection(this.provinceList);
            this.barWindow.listProvince.itemRenderer = CityItemRenderer;
            
            this.barWindow.listCity.dataProvider = new eui.ArrayCollection(this.cityList);
            this.barWindow.listCity.itemRenderer = CityItemRenderer;
            
            this.barWindow.listDistrict.dataProvider = new eui.ArrayCollection(this.districtList);
            this.barWindow.listDistrict.itemRenderer = CityItemRenderer;
        }

        private showProvinceList(event: egret.TouchEvent) {
            this.barWindow.showListProvince = !this.barWindow.showListProvince;
            this.barWindow.showListCity = this.barWindow.showListDistrict = false;
        }

        private showCityList(event: egret.TouchEvent) {
            this.barWindow.showListCity = !this.barWindow.showListCity;
            this.barWindow.showListProvince = this.barWindow.showListDistrict = false;
            
        }
        
        private showDistrictList(event: egret.TouchEvent) {
            this.barWindow.showListDistrict = !this.barWindow.showListDistrict;
            this.barWindow.showListCity = this.barWindow.showListProvince = false;
            
        }
        
        private selectProvince(event: egret.TouchEvent) {
            this.barWindow.showListProvince = false;
            
        }
        
        private selectCity(event: egret.TouchEvent) {
            this.barWindow.showListCity = false;
            
        }
        
        private selectDistrict(event: egret.TouchEvent) {
            this.barWindow.showListDistrict = false;
            
        }

        private backButtonClick(event: egret.TouchEvent) {
            this.barWindow.close();
        }

        public listNotificationInterests(): Array<any> {
            return [];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
        }

        public get barWindow(): BarWindow {
            return <BarWindow><any>(this.viewComponent);
        }
    }
}