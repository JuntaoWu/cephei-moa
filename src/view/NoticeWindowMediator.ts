

namespace moa {

    export class NoticeWindowMediator extends puremvc.Mediator implements puremvc.IMediator {
        public static NAME: string = "NoticeWindowMediator";

        private proxy: NoticeProxy;

        public constructor(viewComponent: any) {
            super(NoticeWindowMediator.NAME, viewComponent);
            super.initializeNotifier("ApplicationFacade");

            this.proxy = this.facade().retrieveProxy(NoticeProxy.NAME) as NoticeProxy;

            this.initData();
        }

        private async initData() {

            let notice = this.proxy.notice;

            if (!notice) {
                notice = await this.proxy.getNotice();

                // return if still no notice.
                if (!notice) {
                    return;
                }
            }

            await this.proxy.markAsRead();

            let noticeListData = notice.map(i => {
                return { ...i };
            });
            this.noticeWindow.noticeList.dataProvider = new eui.ArrayCollection(noticeListData);
            this.noticeWindow.noticeList.itemRenderer = NoticeItemRenderer;
        }

        private viewNotice(event: eui.ItemTapEvent) {
            const selectedItem = event.item;
            this.sendNotification(SceneCommand.SHOW_NOTICE_DETAIL, selectedItem);
        }

        public listNotificationInterests(): Array<any> {
            return [];
        }

        public handleNotification(notification: puremvc.INotification): void {
            var data: any = notification.getBody();
        }

        public get noticeWindow(): NoticeWindow {
            return <NoticeWindow><any>(this.viewComponent);
        }
    }
}