import ActionTypes from "app-store/action-types";


export const getMyGroups = () => ({
    type: ActionTypes.GET_MY_GROUPS,
})

export const setMyGroups = (payload: Array<any>) => ({
    type: ActionTypes.SET_MY_GROUPS,
    payload
})

export const createEvent = (payload: any) => ({
    type: ActionTypes.CREATE_EVENT,
    payload
})

export const updateEvent = (payload: any) => ({
    type: ActionTypes.UPDATE_EVENT,
    payload
})


export const deleteEvent = (payload: any) => ({
    type: ActionTypes.DELETE_EVENT,
    payload
})

export const deleteEventSuccess = (payload: any) => ({
    type: ActionTypes.DELETE_EVENT_SUCCESS,
    payload
})



export const joinEvent = (payload: any) => ({
    type: ActionTypes.JOIN_EVENT,
    payload
})

export const leaveEvent = (payload: any) => ({
    type: ActionTypes.LEAVE_EVENT,
    payload
})

export const getAllEvents = (payload: any) => ({
    type: ActionTypes.GET_ALL_EVENTS,
    payload
})

export const setAllEvents = (payload: Array<any>) => ({
    type: ActionTypes.SET_ALL_EVENTS,
    payload
})











