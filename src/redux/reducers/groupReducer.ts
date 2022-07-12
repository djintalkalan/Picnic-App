import ActionTypes, { action } from "app-store/action-types";

export interface IGroupReducer {
    allGroups: Array<any>,
    myGroups: Array<any>,
}

export interface IGroupDetailReducer {
    [key: string]: IGroupDetail
}

export interface IGroupDetail {
    group: any,
    groupMembers: Array<any>
    upcomingEvents: Array<any>
    pastEvents: Array<any>
}
const initialGroupDetailState: IGroupDetail = {
    group: null,
    groupMembers: [],
    upcomingEvents: [],
    pastEvents: [],
}

const initialGroupState = {
    allGroups: [],
    myGroups: [],
}


export const groupReducer = (state: IGroupReducer = initialGroupState, action: action): IGroupReducer => {
    switch (action.type) {
        case ActionTypes.SET_ALL_GROUPS:
            return { ...state, allGroups: action?.payload }
        case ActionTypes.SET_MY_GROUPS:
            return { ...state, myGroups: action?.payload }
        case ActionTypes.DELETE_GROUP_SUCCESS:
            return {
                ...state,
                allGroups: state?.allGroups.filter(_ => _._id != action?.payload),
                myGroups: state?.myGroups?.filter(_ => _._id != action?.payload)
            }
        case ActionTypes.JOIN_GROUP_SUCCESS:
            return { ...state, allGroups: state.allGroups.map(_ => (_._id == action?.payload ? { ..._, is_group_member: true } : _)) }
        case ActionTypes.LEAVE_GROUP_SUCCESS:
            return { ...state, allGroups: state.allGroups.map(_ => (_._id == action?.payload ? { ..._, is_group_member: false } : _)) }
        case ActionTypes.ADD_IN_GROUPS:
            return { ...state, allGroups: [...state.allGroups, ...action?.payload] }
        case ActionTypes.SET_GROUP_DETAIL:
            const i = state?.allGroups.findIndex(_ => _?._id == action?.payload?.groupId)
            if (i > -1) {
                const newState = { ...state }
                newState.allGroups[i] = {
                    ...newState?.allGroups[i],
                    ...action?.payload?.data?.group
                }
                return newState
            }
            return state;
        case ActionTypes.RESET_STATE_ON_LOGIN:
        case ActionTypes.RESET_STATE_ON_LOGOUT:
            return initialGroupState
        default:
            return state
    }
}

export const groupDetailReducer = (state: IGroupDetailReducer = {}, action: action): IGroupDetailReducer => {
    switch (action.type) {
        case ActionTypes.JOIN_GROUP_SUCCESS:
            if (state?.[action?.payload]) {
                return { ...state, [action.payload]: { ...state[action?.payload], group: { ...state[action?.payload].group, is_group_member: true } } }
            }
            return state
        case ActionTypes.LEAVE_GROUP_SUCCESS:
            if (state?.[action?.payload]) {
                return { ...state, [action.payload]: { ...state[action?.payload], group: { ...state[action?.payload].group, is_group_member: false } } }
            }
            return state
        case ActionTypes.SET_GROUP_DETAIL:
            if (!state?.[action?.payload?.groupId]) {
                state[action?.payload?.groupId] = initialGroupDetailState
            }
            return { ...state, [action?.payload?.groupId]: { ...state?.[action?.payload?.groupId], ...action?.payload?.data } }
        case ActionTypes.UPDATE_GROUP_DETAIL:
            if (!state?.[action?.payload?.groupId]) {
                state[action?.payload?.groupId] = initialGroupDetailState
            }
            return { ...state, [action?.payload?.groupId]: { ...state?.[action?.payload?.groupId], group: { ...state?.[action?.payload?.groupId]?.group, ...action?.payload?.data } } }
        case ActionTypes.SET_GROUP_MEMBERS:
            if (!state?.[action?.payload?.groupId]) {
                state[action?.payload?.groupId] = initialGroupDetailState
            }
            return { ...state, [action?.payload?.groupId]: { ...state?.[action?.payload?.groupId], groupMembers: action?.payload?.data } }
        case ActionTypes.REMOVE_GROUP_MEMBER_SUCCESS:
            if (!state?.[action?.payload?.groupId]) {
                state[action?.payload?.groupId] = initialGroupDetailState
            }
            if (state[action?.payload?.groupId]?.groupMembers?.length)
                return { ...state, [action?.payload?.groupId]: { ...state?.[action?.payload?.groupId], groupMembers: state?.[action?.payload?.groupId]?.groupMembers?.filter(_ => _.user_id != action?.payload?.data) } }
            return state
        case ActionTypes.SET_UPCOMING_EVENTS:
        case ActionTypes.SET_PAST_EVENTS:
            if (!state?.[action?.payload?.groupId]) {
                state[action?.payload?.groupId] = initialGroupDetailState
            }
            return {
                ...state, [action?.payload?.groupId]: {
                    ...state?.[action?.payload?.groupId],
                    [action.type == ActionTypes.SET_UPCOMING_EVENTS ? "upcomingEvents" : "pastEvents"]: action?.payload?.data
                }
            }
        case ActionTypes.RESET_STATE_ON_LOGIN:
        case ActionTypes.RESET_STATE_ON_LOGOUT:
            return {}
        case ActionTypes.SET_GROUP_CHAT_BACKGROUND_SUCCESS:
            if (state?.[action?.payload?.resource_id] && action?.payload?.resourceType == 'group') {
                return { ...state, [action?.payload?.resource_id]: { ...state[action?.payload?.resource_id], group: { ...state[action?.payload?.resource_id].group, background_color: action?.payload?.background_color } } }
            }
            return state
        default:
            return state
    }
}

export const activeGroupReducer = (state: any = null, action: action): any => {
    switch (action.type) {
        case ActionTypes.SET_ACTIVE_GROUP:
            return action?.payload
        case ActionTypes.RESET_STATE_ON_LOGIN:
        case ActionTypes.RESET_STATE_ON_LOGOUT:
            return null
        default:
            return state
    }
}

