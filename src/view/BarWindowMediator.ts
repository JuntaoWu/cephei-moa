
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
        private provinceList: Array<any> = [{ name: "四川省" }];
        private cityList: Array<any> = [{ name: "成都市" }];
        private districtList: Array<any> = [{ name: "成华区" }];

        private selectedProvince: any;
        private selectedCity: any;
        private selectedDistrict: any;


        private _allClubs: Club[];
        public get allClubs(): Club[] {
            if (!this._allClubs) {
                this._allClubs = RES.getRes("clubs_json") as Club[];
            }
            return this._allClubs;
        }

        public async initData() {

            this.barWindow.showListProvince = this.barWindow.showListCity = this.barWindow.showListDistrict = false;

            this.refresh();

            this.refreshProvinces();
        }

        private refresh() {
            this.clubList = this.allClubs
                .filter(m => !this.selectedProvince || m.province == this.selectedProvince)
                .filter(m => !this.selectedCity || m.city == this.selectedCity)
                .filter(m => !this.selectedDistrict || m.district == this.selectedDistrict)
                .map(m => {
                    return {
                        clubName: m.name,
                        time: m.time,
                        phone: m.phone,
                        attr: m.attr,
                        game_1: `club_game1_${m.game_1 == "1" ? 1 : 2}`,
                        game_2: `club_game2_${m.game_2 == "1" ? 1 : 2}`,
                        game_3: `club_game3_${m.game_3 == "1" ? 1 : 2}`,
                        game_4: `club_game4_${m.game_4 == "1" ? 1 : 2}`
                    };
                });
            this.barWindow.listClub.dataProvider = new eui.ArrayCollection(this.clubList);
            this.barWindow.listClub.itemRenderer = ClubListItemRenderer;
        }

        private refreshProvinces() {
            const provinceList = _(this.allClubs.map(m => m.province)).uniq().value().map(m => {
                return {
                    name: m
                };
            });

            this.barWindow.listProvince.dataProvider = new eui.ArrayCollection(provinceList);
            this.barWindow.listProvince.itemRenderer = CityItemRenderer;

            this.refreshCities();
        }

        private refreshCities() {
            const cityList = _(this.allClubs.filter(m => !m.province || m.province == this.selectedProvince).map(m => m.city)).uniq().value().map(m => {
                return {
                    name: m
                };
            });

            this.barWindow.listCity.dataProvider = new eui.ArrayCollection(cityList);
            this.barWindow.listCity.itemRenderer = CityItemRenderer;

            this.barWindow.city = this.selectedCity = "";

            this.refreshDistrict();
        }

        refreshDistrict() {
            const districtList = _(this.allClubs.filter(m => !m.city || m.city == this.selectedCity).map(m => m.district)).uniq().value().map(m => {
                return {
                    name: m
                };
            });


            this.barWindow.listDistrict.dataProvider = new eui.ArrayCollection(districtList);
            this.barWindow.listDistrict.itemRenderer = CityItemRenderer;

            this.barWindow.district = this.selectedDistrict = "";
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

        private selectProvince(event: eui.ItemTapEvent) {
            this.barWindow.showListProvince = false;
            if (this.selectedProvince != event.item.name) {
                this.barWindow.province = this.selectedProvince = event.item.name;
                this.refreshCities();
                this.refresh();
            }
        }

        private selectCity(event: eui.ItemTapEvent) {
            this.barWindow.showListCity = false;
            if (this.selectedCity != event.item.name) {
                this.barWindow.city = this.selectedCity = event.item.name;
                this.refreshDistrict();
                this.refresh();
            }
        }

        private selectDistrict(event: eui.ItemTapEvent) {
            if (this.selectedDistrict != event.item.name) {
                this.barWindow.showListDistrict = false;
                this.barWindow.district = this.selectedDistrict = event.item.name;
                this.refresh();
            }
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