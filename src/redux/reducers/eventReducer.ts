import ActionTypes, { action } from "app-store/action-types";

export interface IEventReducer {
    allEvents: Array<any>,
    eventDetail: IEventDetail,
    allCurrencies: Array<any>,
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
    eventDetail: initialEventDetailState,
    allCurrencies: [],
}


export const eventReducer = (state: IEventReducer = initialEventState, action: action): IEventReducer => {
    switch (action.type) {
        case ActionTypes.SET_ALL_CURRENCIES:
            return { ...state, allCurrencies: action?.payload }
        case ActionTypes.SET_ALL_EVENTS:
            return { ...state, allEvents: action?.payload }
        case ActionTypes.DELETE_EVENT_SUCCESS:
            return { ...state, allEvents: state?.allEvents.filter(_ => _._id != action?.payload) }
        case ActionTypes.JOIN_EVENT_SUCCESS:
            return { ...state, allEvents: state.allEvents.map(_ => (_._id == action?.payload ? { ..._, is_event_member: true } : _)) }
        case ActionTypes.LEAVE_EVENT_SUCCESS:
            return { ...state, allEvents: state.allEvents.map(_ => (_._id == action?.payload ? { ..._, is_event_member: false } : _)) }
        case ActionTypes.ADD_IN_EVENTS:
            return { ...state, allEvents: [...state.allEvents, ...action?.payload] }
        case ActionTypes.SET_EVENT_DETAIL:
            return { ...state, eventDetail: action?.payload ? { ...state?.eventDetail, ...action?.payload } : initialEventDetailState }
        case ActionTypes.UPDATE_EVENT_DETAIL:
            return { ...state, eventDetail: { ...state?.eventDetail, event: { ...state?.eventDetail?.event, ...action?.payload } } }
        // case ActionTypes.SET_GROUP_MEMBERS:
        //     return { ...state, groupDetail: { ...state?.groupDetail, groupMembers: action?.payload } }
        // case ActionTypes.REMOVE_GROUP_MEMBER_SUCCESS:
        //     return { ...state, groupDetail: { ...state?.groupDetail, groupMembers: state?.groupDetail?.groupMembers?.filter(_ => _.user_id != action?.payload) } }
        default:
            return state
    }
}


