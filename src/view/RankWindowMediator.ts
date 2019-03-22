
namespace moa {

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
                    { key: OrderType.winRate, name: "胜率榜" }
                    , { key: OrderType.countTotal, name: "场次榜" }
                ],
                [
                    { key: 0, name: "全部人数" }
                    , { key: 6, name: "六人局" }
                    , { key: 7, name: "七人局" }
                    , { key: 8, name: "八人局" }
                ],
                [
                    { key: 0, name: "全部角色" }
                    , { key: 1, name: "许愿" }
                    , { key: 2, name: "方震" }
                    , { key: 3, name: "姬云浮" }
                    , { key: 4, name: "黄烟烟" }
                    , { key: 5, name: "木户加奈" }
                    , { key: 6, name: "老朝奉" }
                    , { key: 7, name: "药不然" }
                    , { key: 8, name: "郑国渠" }
                ],
                [
                    { key: 0, name: "全部场次" }
                    , { key: 10, name: "10场以上" }
                    , { key: 30, name: "30场以上" }
                    , { key: 50, name: "50场以上" }
                    , { key: 100, name: "100场以上" }
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
            this.rankWindow.rateTime = filterList[0][1].name;
            this.filterKeyList[0] = filterList[0][1].key;
            this.rankWindow.other = filterList[3][1].name;
            this.filterKeyList[3] = filterList[3][1].key;
            this.setRankList();
        }

        private nameList: Array<string>;
        private filterKeyList: Array<any>;

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
                this.rankWindow[this.nameList[index]] = selectedItem.name;
                this.setRankList();
            }
            this.rankWindow[`${this.nameList[index]}List`].visible = false;
        }

        private rankList: Array<Rank>;
        private setRankList() {
            this.rankList = [];
            const accountProxy = this.facade().retrieveProxy(AccountProxy.NAME) as AccountProxy;
            accountProxy.loadRank(this.filterKeyList[0], this.filterKeyList[1], this.filterKeyList[2], this.filterKeyList[3]).then(res => {
                this.rankList = res.map((v, i) => {
                    return {
                        OrderType: this.filterKeyList[0],
                        key: i + 1,
                        ...v,
                        avatarUrl: v.avatarUrl || 'head'
                    };
                });
                this.rankWindow.rankList.dataProvider = new eui.ArrayCollection(this.rankList);
                this.rankWindow.rankList.itemRenderer = RankListItemRenderer;
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