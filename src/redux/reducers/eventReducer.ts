import ActionTypes, { action } from "app-store/action-types";

export interface IEventReducer {
    allEvents: Array<any>,
}

// export interface IGroupDetail {
//     group: any,
//     is_group_joined: any,
//     groupMembers: Array<any>
// }
// const initialGroupDetailState = {
//     event: null,
//     is_group_joined: 0,
//     EVENTMembers: []
// }

const initialEventState = {
    allEvents: [],
}


export const eventReducer = (state: IEventReducer = initialEventState, action: action): IEventReducer => {
    switch (action.type) {
        case ActionTypes.SET_ALL_EVENTS:
            return { ...state, allEvents: action?.payload }
        // case ActionTypes.SET_MY_EVENTS:
        //         return { ...state, myEvents: action?.payload }
        case ActionTypes.DELETE_EVENT_SUCCESS:
            return { ...state, allEvents: state?.allEvents.filter(_ => _._id != action?.payload) }
        case ActionTypes.JOIN_EVENT_SUCCESS:
            return { ...state, allEvents: state.allEvents.map(_ => (_._id == action?.payload ? { ..._, is_event_member: true } : _)) }
        case ActionTypes.LEAVE_EVENT_SUCCESS:
            return { ...state, allEvents: state.allEvents.map(_ => (_._id == action?.payload ? { ..._, is_event_member: false } : _)) }
        case ActionTypes.ADD_IN_EVENTS:
            return { ...state, allEvents: [...state.allEvents, ...action?.payload] }
        // case ActionTypes.SET_GROUP_DETAIL:
        //     return { ...state, groupDetail: action?.payload ? { ...state?.groupDetail, ...action?.payload } : initialGroupDetailState }
        // case ActionTypes.UPDATE_GROUP_DETAIL:
        //     return { ...state, groupDetail: { ...state?.groupDetail, group: { ...state?.groupDetail?.group, ...action?.payload } } }
        // case ActionTypes.SET_GROUP_MEMBERS:
        //     return { ...state, groupDetail: { ...state?.groupDetail, groupMembers: action?.payload } }
        // case ActionTypes.REMOVE_GROUP_MEMBER_SUCCESS:
        //     return { ...state, groupDetail: { ...state?.groupDetail, groupMembers: state?.groupDetail?.groupMembers?.filter(_ => _.user_id != action?.payload) } }
        default:
            return state
    }
}


