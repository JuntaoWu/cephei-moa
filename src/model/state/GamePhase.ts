
module game {

    export enum GamePhase {
        Preparing = 1,  // 选座准备阶段
        Ready = 2,  // 选座完成，等待房主确认开始(房主可以开始录入身份)
        Input = 3,  // 录入身份
        FirstRound = 4, // 第一轮
    }

}