import ActionTypes, { action } from "app-store/action-types";
export interface IEventReducer {
    allEvents: Array<any>,
}
export interface IEventDetailReducer {
    [key: string]: IEventDetail
}
export interface IEventDetail {
    event: any,
    is_event_joined: any,
    eventMembersCheckedIn: Array<any>
    eventMembersNotCheckedIn: Array<any>
}
const initialEventDetailState = {
    event: null,
    is_event_joined: 0,
    eventMembersCheckedIn: [],
    eventMembersNotCheckedIn: []
}
const initialEventState = {
    allEvents: [],
}
export const eventReducer = (state: IEventReducer = initialEventState, action: action): IEventReducer => {
    switch (action.type) {
        case ActionTypes.SET_ALL_EVENTS:
            return { ...state, allEvents: action?.payload }
        case ActionTypes.DELETE_EVENT_SUCCESS:
            if (action.payload?.groupId) {
                return { ...state, allEvents: state?.allEvents.filter(_ => _.group_id != action.payload?.groupId) }
            }
            return { ...state, allEvents: state?.allEvents.filter(_ => _._id != action?.payload) }
        case ActionTypes.JOIN_EVENT_SUCCESS:
            return { ...state, allEvents: state.allEvents.map(_ => (_._id == action?.payload ? { ..._, is_event_member: true } : _)) }
        case ActionTypes.PIN_EVENT_SUCCESS:
            return { ...state, allEvents: state.allEvents.map(_ => (_._id == action?.payload ? { ..._, is_event_pinned_by_me: !_.is_event_pinned_by_me } : _)) }
        case ActionTypes.LEAVE_EVENT_SUCCESS:
            return { ...state, allEvents: state.allEvents.map(_ => (_._id == action?.payload ? { ..._, is_event_member: false } : _)) }
        case ActionTypes.ADD_IN_EVENTS:
            return { ...state, allEvents: [...state.allEvents, ...action?.payload] }
        case ActionTypes.SET_EVENT_DETAIL:
            const i = state?.allEvents.findIndex(_ => _?._id == action?.payload?.eventId)
            if (i > -1) {
                const newState = { ...state }
                newState.allEvents[i] = {
                    ...newState?.allEvents[i],
                    // ...action?.payload?.data?.event,
                    is_event_member: action?.payload?.data?.event?.is_event_member,
                    total_sold_tickets: action?.payload?.data?.event?.total_sold_tickets,
                    is_event_pinned_by_me: action?.payload?.data?.event?.is_event_pinned_by_me,
                    is_ticket_purchased_by_me: action?.payload?.data?.event?.is_ticket_purchased_by_me,
                    is_event_admin: action?.payload?.data?.event?.is_event_admin,
                }
                return newState
            }
            return state;
        case ActionTypes.RESET_STATE_ON_LOGIN:
        case ActionTypes.RESET_STATE_ON_LOGOUT:
            return initialEventState
        default:
            return state
    }
}
export const eventDetailReducer = (state: IEventDetailReducer = {}, action: action): IEventDetailReducer => {
    switch (action.type) {
        case ActionTypes.JOIN_EVENT_SUCCESS:
            if (state?.[action?.payload]) {
                const newSt = { ...state, [action.payload]: { ...state[action?.payload], event: { ...state[action?.payload].event, is_event_member: true } } }
                return newSt
            }
            return state
        case ActionTypes.LEAVE_EVENT_SUCCESS:
            if (state?.[action?.payload]) {
                return { ...state, [action.payload]: { ...state[action?.payload], event: { ...state[action?.payload].event, is_event_member: false } } }
            }
            return state
        case ActionTypes.PIN_EVENT_SUCCESS:
            if (state?.[action?.payload]) {
                return { ...state, [action.payload]: { ...state[action?.payload], event: { ...state[action?.payload].event, is_event_pinned_by_me: !state[action?.payload].event?.is_event_pinned_by_me } } }
            }
            return state
        case ActionTypes.SET_EVENT_DETAIL:
            if (!state?.[action?.payload?.eventId]) {
                state[action?.payload?.eventId] = initialEventDetailState
            }
            return { ...state, [action?.payload?.eventId]: { ...state?.[action?.payload?.eventId], ...action?.payload?.data } }
        case ActionTypes.UPDATE_EVENT_DETAIL:
            if (!state?.[action?.payload?.eventId]) {
                state[action?.payload?.eventId] = initialEventDetailState
            }
            return { ...state, [action?.payload?.eventId]: { ...state?.[action?.payload?.eventId], event: { ...state?.[action?.payload?.eventId]?.event, ...action?.payload?.data } } }
        case ActionTypes.SET_EVENT_MEMBERS:
            if (!state?.[action?.payload?.eventId]) {
                state[action?.payload?.eventId] = initialEventDetailState
            }
            return { ...state, [action?.payload?.eventId]: { ...state?.[action?.payload?.eventId], ...action?.payload?.data } }
        case ActionTypes.REMOVE_EVENT_MEMBER_SUCCESS:
            if (!state?.[action?.payload?.eventId]) {
                state[action?.payload?.eventId] = initialEventDetailState
            }
            return {
                ...state, [action?.payload?.eventId]: {
                    ...state?.[action?.payload?.eventId],
                    eventMembersCheckedIn: state?.[action?.payload?.eventId]?.eventMembersCheckedIn?.filter(_ => _.user_id != action?.payload?.data),
                    eventMembersNotCheckedIn: state?.[action?.payload?.eventId]?.eventMembersNotCheckedIn?.filter(_ => _.user_id != action?.payload?.data)
                }
            }
        case ActionTypes.RESET_STATE_ON_LOGIN:
        case ActionTypes.RESET_STATE_ON_LOGOUT:
            return {}
        case ActionTypes.SET_CHAT_BACKGROUND_SUCCESS:
            if (state?.[action?.payload?.resource_id] && action?.payload?.resource_type == 'event') {
                return { ...state, [action.payload?.resource_id]: { ...state[action?.payload?.resource_id], event: { ...state[action?.payload?.resource_id].event, background_color: action?.payload?.background_color } } }
            }
            return state
        default:
            return state
    }
}
export const activeEventReducer = (state: any = null, action: action): any => {
    switch (action.type) {
        case ActionTypes.SET_ACTIVE_EVENT:
            return action?.payload
        case ActionTypes.RESET_STATE_ON_LOGIN:
        case ActionTypes.RESET_STATE_ON_LOGOUT:
            return null
        default:
            return state
    }
}

interface CurserPagination {
    q: string
    _id: string
    limit: number
    total: number
}
export interface IEventForCheckInReducer {
    pagination: CurserPagination,
    events: any[]

}

const initialCursorPagination: CurserPagination = {
    q: "",
    _id: "",
    limit: 20,
    total: -1
}

const initialCheckInState: IEventForCheckInReducer = {
    pagination: initialCursorPagination,
    events: []
}

export const eventForCheckInReducer = (state: IEventForCheckInReducer = { ...initialCheckInState }, action: action): IEventForCheckInReducer => {
    switch (action.type) {
        case ActionTypes.ON_FETCH_EVENT_FOR_CHECK_IN:
            return action?.payload
        case ActionTypes.RESET_STATE_ON_LOGIN:
        case ActionTypes.RESET_STATE_ON_LOGOUT:
            return { ...initialCheckInState }
        default:
            return state
    }
}
