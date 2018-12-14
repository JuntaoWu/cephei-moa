namespace moa {
    export class TextImage extends eui.Group {
        public templet: egret.TextField
        constructor(protected _TextImageData: Array<any> = []) {
            super();
            this.init()
        }
        set TextImageData(val: Array<any>) { this._TextImageData = val; this.init(); }
        get TextImageData() { return this._TextImageData }
        _size = 36
        /**设置文字字体大小 */
        set size(val: number) {
            this._size = val
        }
        get size(): number {
            return this._size
        }
        private _width: number;
        /**设置宽度 */
        set width(val) { this._width = val; this.invalidate(); }
        get width() { return this._width };


        private _verticalAlign = egret.VerticalAlign.MIDDLE;
        /**设置vercatical */
        set verticalAlign(val) { this._verticalAlign = val; this.invalidate(); }
        get verticalAlign() { return this._verticalAlign };

        _maxWidth: number
        /**设置组件的最大宽度 */
        set maxWidth(val: number) {
            this._maxWidth = val
            if (this.templet.width > val) {
                this.width = val
                this.invalidate()
            }
        }
        get maxWidth(): number {
            return this._maxWidth
        }
        private _lineSpacing = 0
        /**设置组件的行间距 */
        set lineSpacing(val: number) {
            if (this._lineSpacing === val) return
            this._lineSpacing = val
            this.invalidate()
        }
        get lineSpacing(): number {
            return this._lineSpacing
        }
        /**立即计算布局 */
        validateNow() {
            this.init()
            this.invalidate_Flag = false
        }
        /**组件的每行高度 */
        lineHeightArray: Array<number> = []
        components: any[] = []
        protected init() {
            this.removeChildren()
            if (this._TextImageData.length == 0) {
                this.width = this.height = 0
                return
            }
            // 保存组件,清除事件绑定
            this.components = []
            this._TextImageData.forEach((component: eui.Component) => {
                if (typeof component == 'object') {
                    this.components.push(component)
                    if (!component['watch']) {
                        egret.is(component, 'eui.Image') && component.once(egret.Event.ADDED, this.invalidate, this)
                        eui.Watcher.watch(component, ['width'], this.invalidate, this)
                        eui.Watcher.watch(component, ['height'], this.invalidate, this)
                        component['watch'] = true
                    }
                }
            })
            let textFlow = this._TextImageData.map(text =>
                typeof text === "string" || egret.is(text, 'eui.Label')
                    ? { type: egret.is(text, 'eui.Label') ? "label" : "string", text: egret.is(text, 'eui.Label') ? text.text : text }
                    : { type: "image", text: ' ', style: { size: text.width } }
            )
            let TextField: egret.TextField = this.templet = new egret.TextField();
            TextField.size = this.size;
            TextField.lineSpacing = 0;
            TextField.width = this.width
            TextField.textFlow = textFlow
            TextField.height = TextField.height

            this.height = 0
            this.lineHeightArray = []

            let componentTestIndex = 0 //测量高度的组件序号
            let componentIndex = 0 //布局的组件序号
            TextField['linesArr'].forEach((item, lines) => {
                console.log('item=>', item)
                //获取最大高度
                let maxheight = item.height || this.size;
                //组件序号
                item.elements.forEach((element) => {
                    if (element.type != "string") {
                        let c = this.components[componentTestIndex++]
                        maxheight = Math.max(maxheight, c.height)
                    }
                })
                maxheight = this._lineSpacing + maxheight
                this.lineHeightArray.push(maxheight)

                //开始布局
                let x = 0
                item.elements.forEach(element => {
                    let component;
                    if (element.type != "string") {
                        component = this.components[componentIndex++];
                        component.x = x;
                        component.y = this.height + (maxheight - component.height) / 2;
                    }
                    else {
                        component = new egret.TextField()
                        component.x = x
                        component.size = this.size
                        component.text = element.text
                        component.width = element.width
                        component.textColor = this._textColor
                        component.height = maxheight
                        component.y = this.height
                        component.verticalAlign = this._verticalAlign;
                    }
                    x += component.width;
                    this.addChild(component);
                });
                this.height += maxheight
            })
            this._width = this.templet.width

        }
        _textColor: number = 0x000000
        set textColor(val) {
            this._textColor = val
            this.invalidate()
        }
        get textColor() {
            return this._textColor
        }



        /**失效验证 */
        private invalidate_Flag: boolean = false
        private invalidate(e?: egret.Event): void {
            if (this.invalidate_Flag) {
                return
            }
            this.invalidate_Flag = true
            this.once(egret.Event.ENTER_FRAME, () => {
                this.init()
                this.invalidate_Flag = false
            }, this);
        }
    }
}