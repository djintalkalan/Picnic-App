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
    is_group_joined: any,
    groupMembers: Array<any>
    upcomingEvents: Array<any>
}
const initialGroupDetailState: IGroupDetail = {
    group: null,
    is_group_joined: 0,
    groupMembers: [],
    upcomingEvents: []
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
            return { ...state, allGroups: state?.allGroups.filter(_ => _._id != action?.payload) }
        case ActionTypes.JOIN_GROUP_SUCCESS:
            return { ...state, allGroups: state.allGroups.map(_ => (_._id == action?.payload ? { ..._, is_group_member: true } : _)) }
        case ActionTypes.LEAVE_GROUP_SUCCESS:
            return { ...state, allGroups: state.allGroups.map(_ => (_._id == action?.payload ? { ..._, is_group_member: false } : _)) }
        case ActionTypes.ADD_IN_GROUPS:
            return { ...state, allGroups: [...state.allGroups, ...action?.payload] }
        default:
            return state
    }
}

export const groupDetailReducer = (state: IGroupDetailReducer = {}, action: action): IGroupDetailReducer => {
    switch (action.type) {
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
            return { ...state, [action?.payload?.groupId]: { ...state?.[action?.payload?.groupId], groupMembers: state?.[action?.payload?.groupId]?.groupMembers?.filter(_ => _.user_id != action?.payload?.data) } }
        case ActionTypes.SET_UPCOMING_EVENTS:
            if (!state?.[action?.payload?.groupId]) {
                state[action?.payload?.groupId] = initialGroupDetailState
            }
            return { ...state, [action?.payload?.groupId]: { ...state?.[action?.payload?.groupId], upcomingEvents: action?.payload?.data } }
        default:
            return state
    }
}

export const activeGroupReducer = (state: any = null, action: action): any => {
    switch (action.type) {
        case ActionTypes.SET_ACTIVE_GROUP:
            return action?.payload
        default:
            return state
    }
}

