
namespace moa {

    export class NoticeItemRenderer extends eui.ItemRenderer {
        constructor() {
            super();
            this.skinName = "skins.NoticeItemRenderer";
        }

        protected createChildren(): void {
            super.createChildren();
        }

        protected dataChanged(): void {
            super.dataChanged();
            this.data.createdAtLocaleString = this.data.createdAt.toLocaleDateString();
        }

    }

}