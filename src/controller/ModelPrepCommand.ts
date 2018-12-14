

namespace moa {

    export class ModelPrepCommand extends puremvc.SimpleCommand implements puremvc.ICommand {

        public constructor() {
            super();
        }
        public execute(notification: puremvc.INotification): void {
            this.facade().registerProxy(new AccountProxy());
            this.facade().registerProxy(new GameProxy());
            this.facade().registerProxy(new ClubProxy());
            this.facade().registerProxy(new NoticeProxy());
        }
    }
}