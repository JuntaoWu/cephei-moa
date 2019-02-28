

namespace moa {

    export class SettingProxy extends puremvc.Proxy implements puremvc.IProxy {
        public static NAME: string = "SettingProxy";

		public static PREFERENCE_UPDATE: string = "preference_update";

        public constructor() {
            super(SettingProxy.NAME);
        }

    }
}