import ActionTypes, { action } from "app-store/action-types";

export interface IHomeReducer {
    searchedEvents: Array<any> | null,
    searchedGroups: Array<any> | null,
}

const initialHomeData = {
    searchedEvents: null,
    searchedGroups: null,
}

export const homeReducer = (state: IHomeReducer = initialHomeData, action: action): IHomeReducer => {
    const key = action?.payload?.type == 'events' ? 'searchedEvents' : 'searchedGroups'
    switch (action?.type) {
        case ActionTypes.SET_SEARCHED_DATA:
            if (!action?.payload?.data && !state[key]) {
                return state
            }
            return { searchedGroups: null, searchedEvents: null, [key]: action?.payload?.data }
        case ActionTypes.JOIN_GROUP_SUCCESS:
            return { ...state, searchedGroups: state.searchedGroups?.map(_ => (_._id == action?.payload ? { ..._, is_group_member: true } : _)) || null }
        case ActionTypes.LEAVE_GROUP_SUCCESS:
            return { ...state, searchedGroups: state.searchedGroups?.map(_ => (_._id == action?.payload ? { ..._, is_group_member: false } : _)) || null }
        case ActionTypes.JOIN_EVENT_SUCCESS:
            return { ...state, searchedEvents: state.searchedEvents?.map(_ => (_._id == action?.payload ? { ..._, is_event_member: true } : _)) || null }
        case ActionTypes.LEAVE_EVENT_SUCCESS:
            return { ...state, searchedEvents: state.searchedEvents?.map(_ => (_._id == action?.payload ? { ..._, is_event_member: false } : _)) || null }
        default:
            return state
    }

}