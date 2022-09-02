import ActionTypes from "app-store/action-types";


export const getMyGroups = () => ({
    type: ActionTypes.GET_MY_GROUPS,
})

export const setMyGroups = (payload: Array<any>) => ({
    type: ActionTypes.SET_MY_GROUPS,
    payload
})

export const getAllCurrencies = () => ({
    type: ActionTypes.GET_ALL_CURRENCIES,
})

export const createEvent = (payload?: any) => ({
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

export const pinEvent = (payload: any) => ({
    type: ActionTypes.PIN_EVENT,
    payload
})

export const pinEventSuccess = (payload: any) => ({
    type: ActionTypes.PIN_EVENT_SUCCESS,
    payload
})

export const joinEvent = (payload: any) => ({
    type: ActionTypes.JOIN_EVENT,
    payload
})

export const joinEventSuccess = (payload: any) => ({
    type: ActionTypes.JOIN_EVENT_SUCCESS,
    payload
})

export const leaveEvent = (payload: any) => ({
    type: ActionTypes.LEAVE_EVENT,
    payload
})

export const leaveEventSuccess = (payload: any) => ({
    type: ActionTypes.LEAVE_EVENT_SUCCESS,
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

export const getEventDetail = (payload: any) => ({
    type: ActionTypes.GET_EVENT_DETAIL,
    payload
})

export const getEditEventDetail = (payload: any) => ({
    type: ActionTypes.GET_EDIT_EVENT_DETAIL,
    payload
})

export const setEventDetail = (payload: { eventId: string, data: any }) => ({
    type: ActionTypes.SET_EVENT_DETAIL,
    payload
})

export const updateEventDetail = (payload: any) => ({
    type: ActionTypes.UPDATE_EVENT_DETAIL,
    payload
})

export const getEventMembers = (payload: any) => ({
    type: ActionTypes.GET_EVENT_MEMBERS,
    payload
})

export const setEventMembers = (payload:
    { eventId: string, data: { eventMembersCheckedIn: Array<any>, eventMembersNotCheckedIn: Array<any> } }) => ({
        type: ActionTypes.SET_EVENT_MEMBERS,
        payload
    })

export const removeEventMember = (payload: any) => ({
    type: ActionTypes.REMOVE_EVENT_MEMBER,
    payload
})

export const removeEventMemberSuccess = (payload: any) => ({
    type: ActionTypes.REMOVE_EVENT_MEMBER_SUCCESS,
    payload
})

export const setActiveEvent = (payload: any) => ({
    type: ActionTypes.SET_ACTIVE_EVENT,
    payload
})

export const verifyQrCode = (payload: any) => ({
    type: ActionTypes.VERIFY_QR_CODE,
    payload
})

export const capturePayment = (payload: any) => ({
    type: ActionTypes.CAPTURE_PAYMENT,
    payload
})


export const authorizePayment = (payload: any) => ({
    type: ActionTypes.AUTHORIZE_PAYMENT,
    payload
})

export const getEventsForCheckIn = (payload: any) => ({
    type: ActionTypes.GET_EVENTS_FOR_CHECK_IN,
    payload
})

export const onFetchEventsForCheckIn = (payload: any) => ({
    type: ActionTypes.ON_FETCH_EVENT_FOR_CHECK_IN,
    payload
})










