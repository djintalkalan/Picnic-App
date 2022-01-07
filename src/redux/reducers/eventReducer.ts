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
    eventMembers: Array<any>
}
const initialEventDetailState = {
    event: null,
    is_event_joined: 0,
    eventMembers: []
}

const initialEventState = {
    allEvents: [],
}


export const eventReducer = (state: IEventReducer = initialEventState, action: action): IEventReducer => {
    switch (action.type) {
        case ActionTypes.SET_ALL_EVENTS:
            return { ...state, allEvents: action?.payload }
        case ActionTypes.DELETE_EVENT_SUCCESS:
            return { ...state, allEvents: state?.allEvents.filter(_ => _._id != action?.payload) }
        case ActionTypes.JOIN_EVENT_SUCCESS:
            return { ...state, allEvents: state.allEvents.map(_ => (_._id == action?.payload ? { ..._, is_event_member: true } : _)) }
        case ActionTypes.PIN_EVENT_SUCCESS:
            return { ...state, allEvents: state.allEvents.map(_ => (_._id == action?.payload ? { ..._, is_event_pinned_by_me: !_.is_event_pinned_by_me } : _)) }
        case ActionTypes.LEAVE_EVENT_SUCCESS:
            return { ...state, allEvents: state.allEvents.map(_ => (_._id == action?.payload ? { ..._, is_event_member: false } : _)) }
        case ActionTypes.ADD_IN_EVENTS:
            return { ...state, allEvents: [...state.allEvents, ...action?.payload] }
        default:
            return state
    }
}

export const eventDetailReducer = (state: IEventDetailReducer = {}, action: action): IEventDetailReducer => {
    switch (action.type) {
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
            return { ...state, [action?.payload?.eventId]: { ...state?.[action?.payload?.eventId], eventMembers: action?.payload?.data } }
        case ActionTypes.REMOVE_EVENT_MEMBER_SUCCESS:
            if (!state?.[action?.payload?.eventId]) {
                state[action?.payload?.eventId] = initialEventDetailState
            }
            return { ...state, [action?.payload?.eventId]: { ...state?.[action?.payload?.eventId], eventMembers: state?.[action?.payload?.eventId]?.eventMembers?.filter(_ => _.user_id != action?.payload?.data) } }
        default:
            return state
    }
}

export const activeEventReducer = (state: any = null, action: action): any => {
    switch (action.type) {
        case ActionTypes.SET_ACTIVE_EVENT:
            return action?.payload
        default:
            return state
    }
}
