
namespace moa {

    export class ClubListItemRenderer extends eui.ItemRenderer {

        public listIcons: eui.List;
        public constructor() {
            super();
            this.skinName = "skins.ClubListItemRenderer";
        }

        protected createChildren(): void {
            super.createChildren();
        }

        protected async dataChanged() {
            super.dataChanged();
            this.listIcons.dataProvider = new eui.ArrayCollection(this.data.gameIcons);
            this.listIcons.itemRenderer = GameIconItemRenderer;
        }
    }
}