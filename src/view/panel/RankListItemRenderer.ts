
module game {

    export class RankListItemRenderer extends eui.ItemRenderer {

        public constructor() {
            super();
            this.skinName = "skins.RankListItemRenderer";
        }

        protected createChildren(): void {
            super.createChildren();
        }

        public isNotTopThree: boolean;
        public rankRes: string;
        public col1: string;
        public col2: string;

        protected dataChanged(): void {
            super.dataChanged();
            if (this.data.key > 3) {
                this.isNotTopThree = true;
                this.rankRes = null;
            }
            else {
                this.isNotTopThree = false;
                this.rankRes = `rank${this.data.key}`;
            }
            if (this.data.OrderType == OrderType.winRate) {
                this.col1 = `${this.data.winRate}%`;
                this.col2 = `${this.data.countTotal}场`;
            }
            else {
                this.col2 = `${this.data.winRate}%`;
                this.col1 = `${this.data.countTotal}场`;
            }
        }
    }
}