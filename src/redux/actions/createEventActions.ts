import ActionTypes from "app-store/action-types";

export const resetCreateEvent = () => ({
    type: ActionTypes.RESET_CREATE_EVENT_DATA,
})

export const setCreateEvent = (payload: any) => ({
    type: ActionTypes.SET_CREATE_EVENT_DATA,
    payload
})

export const updateCreateEvent = (payload: any) => ({
    type: ActionTypes.UPDATE_CREATE_EVENT_DATA,
    payload
})