
module game {

    export class VoteAntiquesRenderer extends eui.ItemRenderer {

        public constructor() {
            super();
            this.skinName = "skins.VoteAntiquesRenderer";
        }
        
        protected createChildren(): void {
            super.createChildren();
        }

        public voteDetail: eui.DataGroup;

        protected dataChanged(): void {
            this.voteDetail.dataProvider = new eui.ArrayCollection(this.data.voteDetail);
            this.voteDetail.itemRenderer = VoteNumRenderer;
            super.dataChanged();
        }
    }
}