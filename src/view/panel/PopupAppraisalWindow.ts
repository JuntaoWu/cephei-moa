
module game {

    export class PopupAppraisalWindow extends game.BasePanel {

        public constructor() {
            super();
            this.skinName = "skins.PopupAppraisalWindow";
            this.addEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public createCompleteEvent(event: eui.UIEvent): void {
            this.removeEventListener(eui.UIEvent.CREATION_COMPLETE, this.createCompleteEvent, this);
        }

        public result: any;
        public result2: any;

        public setData(data: Array<any>) {
            console.log(data)
            this.result = {
                source: data[0].source,
                name: data[0].name,
                resultRes: "",
                resultLabel: "",
            }
            this.result2 = null;
            if (data[0].result == "真") {
                this.result.resultRes = "true";
            } 
            else if (data[0].result == "假") {
                this.result.resultRes = "false";
            }
            else {
                this.result.resultLabel = data[0].result;
            }
            if(data.length > 1) {
                this.result2 = {
                    source: data[1].source,
                    name: data[1].name,
                    resultRes: "",
                    resultLabel: "",
                }
                if (data[1].result == "真") {
                    this.result.resultRes = "true";
                } 
                else if (data[1].result == "假") {
                    this.result.resultRes = "false";
                }
                else {
                    this.result.resultLabel = data[1].result;
                }
            }
        }

        public partAdded(partName: string, instance: any): void {
            super.partAdded(partName, instance);
        }
    }
}