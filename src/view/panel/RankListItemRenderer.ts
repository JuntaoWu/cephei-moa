
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
        }
    }
}