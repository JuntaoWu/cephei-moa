namespace moa {

    export class TextImage extends eui.Group {

        private textImageData: Array<egret.DisplayObject>;
        private components: Array<eui.Component> = [];

        constructor(content: string = "") {
            super();
            this.content = content;
        }

        /**
         * content
         */
        private _content: string;
        public get content(): string {
            return this._content;
        }
        public set content(v: string) {
            this._content = v;
            this.initialize();
        }

        /**
         * size
         */
        private _size = 30;
        public get size(): number {
            return this._size;
        }
        public set size(val: number) {
            this._size = val;
        }

        /**
         * width
         */
        private _width: number;
        public get width() {
            return this._width;
        }
        public set width(val) {
            this._width = val;
            this.invalidate();
        }

        /**
         * maxWidth
         */
        private _maxWidth: number;
        public get maxWidth(): number {
            return this._maxWidth;
        }
        public set maxWidth(val: number) {
            this._maxWidth = val;
            if (this.width === undefined || this.width > val) {
                this.width = val;
                this.invalidate();
            }
        }

        /**
         * lineSpacing
         */
        private _lineSpacing = 15;
        public get lineSpacing(): number {
            return this._lineSpacing;
        }
        public set lineSpacing(val: number) {
            if (this._lineSpacing === val) {
                return;
            }
            this._lineSpacing = val;
            this.invalidate();
        }

        private _textColor: number = 0x000000;
        public get textColor() {
            return this._textColor;
        }
        public set textColor(val) {
            this._textColor = val;
            this.invalidate();
        }

        private _linkColor: number = 0x09bab4;
        public get linkColor(): number {
            return this._linkColor;
        }
        public set linkColor(v: number) {
            this._linkColor = v;
        }

        private initialize() {
            const regexp = /<img [^>]*src=['"]([^'"]+)[^>]*>/gim;
            let match = regexp.exec(this.content);
            let previousIndex = 0;
            let elements = [];
            while (match) {
                elements.push({ type: "text", value: this.content.slice(previousIndex, match.index) });
                elements.push({ type: "image", value: match[1] });
                previousIndex = match.index + match[0].length;
                match = regexp.exec(this.content);
            }
            elements.push({ type: "text", value: this.content.slice(previousIndex) });

            const parsedElements = elements.map(element => {
                if (element.type == "text") {
                    const label = new eui.Label();
                    const textElements = new egret.HtmlTextParser().parser(element.value);
                    label.textFlow = textElements;
                    label.wordWrap = true;
                    return label;
                }
                else {
                    const image = new eui.Image(element.value);
                    return image;
                }
            });

            this.textImageData = parsedElements;

            this.init();
        }

        public validateNow() {
            this.init();
            this.invalidateFlag = false;
        }

        private init() {
            this.removeChildren();
            if (!this.textImageData || this.textImageData.length == 0) {
                this.width = this.height = 0;
                return;
            }
            this.components = [];
            this.textImageData.forEach((component: eui.Component) => {
                if (typeof component == 'object') {
                    this.components.push(component);
                    if (!component['watch']) {
                        egret.is(component, 'eui.Image') && component.once(egret.Event.COMPLETE, this.invalidate, this);
                        eui.Watcher.watch(component, ['width'], this.invalidate, this);
                        eui.Watcher.watch(component, ['height'], this.invalidate, this);
                        component['watch'] = true;
                    }
                }
            });

            let x = 0;
            let y = 0;
            this.components.forEach((component: eui.Component) => {
                if (egret.is(component, 'eui.Label')) {
                    if ((component as any).textArr.some(text => text && text.style && text.style.href)) {
                        // hyperlink:
                        (component as any as eui.Label).textColor = this.linkColor;
                        (component as any).textArr.filter(text => text && text.style && text.style.href).forEach(text => {
                            if (/^event:/.test(text.style.href)) {
                                // todo: this matches egret.TextEvent.LINK -> event:text pattern.
                            }
                            else {
                                text.style.href = 'event:' + text.style.href;
                            }
                            text.style.underline = true;
                        });
                    }
                    else {
                        (component as any as eui.Label).textColor = this.textColor;
                    }
                }

                if (this.maxWidth !== undefined && (!component.maxWidth || component.maxWidth > this.maxWidth)) {
                    component.maxWidth = this.maxWidth;
                }

                component.x = x;
                component.y = y;

                y += component.height + this.lineSpacing;

                component.addEventListener(egret.TextEvent.LINK, this.textLink, this);
                this.addChild(component);
            });
        }

        private invalidateFlag: boolean = false;
        private invalidate(e?: egret.Event): void {
            if (this.invalidateFlag) {
                return;
            }
            this.invalidateFlag = true;
            this.once(egret.Event.ENTER_FRAME, () => {
                this.init();
                this.invalidateFlag = false;
            }, this);
        }

        private textLink(event: egret.TextEvent) {
            console.log("event.text:", event.text);
            if (/^http/.test(event.text)) {
                if (platform.name == "wxgame") {  // note this is for wxgame/miniProgram only.
                    platform.showModal(`请复制该链接并在外部浏览器打开\r\n${event.text}`, '复制').then(async res => {
                        platform.setClipboardData(event.text).then(() => {
                            platform.showToast('复制成功');
                        });
                    });
                }
                else if (platform.name == "native") {
                    window.open(event.text);
                }
                else {
                    window.open(event.text);
                }
            }
            else {
                let pair = event.text.split(":");
                return this[pair[0]] && this[pair[0]].call(this, pair[1]);
            }
        }

        private showToast(args: string) {
            platform.showToast(args);
        }
    }
}