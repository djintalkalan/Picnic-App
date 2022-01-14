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

        case ActionTypes.SET_EVENT_DETAIL:
            const i = state?.allEvents.findIndex(_ => _?._id == action?.payload?.eventId)
            if (i > -1) {
                const newState = { ...state }
                newState.allEvents[i] = {
                    ...newState?.allEvents[i],
                    // ...action?.payload?.data?.event,
                    total_sold_tickets: action?.payload?.data?.event?.total_sold_tickets,
                    is_event_pinned_by_me: action?.payload?.data?.event?.is_event_pinned_by_me,
                    is_ticket_purchased_by_me: action?.payload?.data?.event?.is_ticket_purchased_by_me,
                    is_event_admin: action?.payload?.data?.event?.is_event_admin,
                }
                return newState
            }
            return state;
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
