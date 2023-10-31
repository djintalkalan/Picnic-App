

import ActionTypes from "app-store/action-types";

export const setSendBitcoinData = (payload: any) => ({
    type: ActionTypes.SET_SEND_BITCOIN_DATA,
    payload
})

export const updateSendBitcoinData = (payload: any) => ({
    type: ActionTypes.UPDATE_SEND_BITCOIN_DATA,
    payload
})