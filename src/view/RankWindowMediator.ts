
module game {

    export class RankWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "RankWindowMediator";

        public constructor(viewComponent: any) {
            super(RankWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.rankWindow.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.backButtonClick, this);
            this.initData();
        }

        public async initData() {
            let filterList = [
                [ 
                    { key: "0", name: "胜率榜" }
                    , { key: "1", name: "场次榜" } 
                ], 
                [
                    { key: "0", name: "全部人数" }
                    , { key: "6", name: "六人局" }
                    , { key: "7", name: "七人局" }
                    , { key: "8", name: "八人局" }
                ],
                [
                    { key: "0", name: "全部角色" }
                    , { key: "1", name: "许愿" }
                    , { key: "2", name: "方震" }
                    , { key: "3", name: "黄烟烟" }
                    , { key: "4", name: "木户加奈" }
                    , { key: "5", name: "姬云浮" }
                    , { key: "6", name: "老朝奉" }
                    , { key: "7", name: "药不然" }
                    , { key: "8", name: "郑国渠" }
                ],
                [
                    { key: "0", name: "10场以上" }
                    , { key: "1", name: "50场以上" }
                    , { key: "2", name: "100场以上" }
                ]
            ]
            this.filterKeyList = [];
            this.nameList = ["rateTime", "gameType", "role", "other"];
            this.nameList.forEach((v, i) => {
                this.rankWindow[`${v}Filter`].addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.showFilterGroup(i), this);
                
                this.rankWindow[`${v}List`].visible = false;
                this.rankWindow[`${v}List`].addEventListener(eui.ItemTapEvent.ITEM_TAP, () => this.selectedItem(i), this);
                this.rankWindow[`${v}List`].dataProvider = new eui.ArrayCollection(filterList[i]);
                this.rankWindow[`${v}List`].itemRenderer = CityItemRenderer;

                this.rankWindow[v] = filterList[i][0].name;
                this.filterKeyList[i] = filterList[i][0].key;
            })
            this.setRankList();
        }

        private rankList: Array<any>;

        private nameList: Array<string>;
        private filterKeyList: Array<string>;

        private rankListSort(key: string) {
            console.log(key)
        }

        private backButtonClick(event: egret.TouchEvent) {
            this.rankWindow.close();
        }

        private showFilterGroup(index: number) {
            this.nameList.forEach((v, i) => {
                this.rankWindow[`${v}List`].visible = i == index ? !this.rankWindow[`${v}List`].visible : false;
            })
        }

        private selectedItem(index: number) {
            let selectedItem = this.rankWindow[`${this.nameList[index]}List`].selectedItem;
            if (this.filterKeyList[index] != selectedItem.key) {
                this.filterKeyList[index] = selectedItem.key;
                this.rankWindow[`${this.nameList[index]}List`].visible = false;
                this.rankWindow[this.nameList[index]] = selectedItem.name;
                this.setRankList();
            }
        }

        private setRankList() {
            this.rankList = [];
            this.getRank().then(res => {
                console.log(res)
                // this.rankList = res;
            }) 
        }

        private getRank() {
            return new Promise((resolve, reject) => {
                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(`${game.Constants.Endpoints.service}rank/`, egret.HttpMethod.POST);
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                request.send();
                request.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    let req = <egret.HttpRequest>(event.currentTarget);
                    let res = JSON.parse(req.response);
                    if (res.error) {
                        console.error(res.message);
                        reject(res.message);
                    }
                    else {
                        resolve();
                    }
                }, this);
            })
        }

        public listNotificationInterests(): Array<any> {
            return [];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
        }

        public get rankWindow(): RankWindow {
            return <RankWindow><any>(this.viewComponent);
        }
    }
}