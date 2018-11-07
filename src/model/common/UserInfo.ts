
module game {
    export class UserInfo {
        public wxgameOpenId?: string;
        public nativeOpenId?: string;
        public unionId?: string;

        public avatarUrl?: string;
        public city?: string;
        public country?: string;
        public gender?: number;
        public language?: string;
        public nickName?: string;
        public province?: string;

        public gameRecords?: MyStats;

        public encryptedData?: string;
        public iv?: string;
    }
}