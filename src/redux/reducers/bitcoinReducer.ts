import ActionTypes, { action } from "app-store/action-types";


//@ts-ignore
const initialBitcoinState: IBitcoinReducer = {}

export interface IBitcoinReducer {
    btcAmount: number;
    usdAmount: number;
    lnInvoice: string;
}


export const bitcoinReducer = (state: IBitcoinReducer = initialBitcoinState, action: action): IBitcoinReducer => {
    switch (action.type) {
        case ActionTypes.SET_SEND_BITCOIN_DATA:
            return { ...action.payload }
        case ActionTypes.UPDATE_SEND_BITCOIN_DATA:
            return { ...state, ...action.payload }
        default:
            return state
    }
}