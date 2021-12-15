import ActionTypes, { action } from "app-store/action-types";

export interface IGroupReducer {
    allGroups: Array<any>,
    groupDetail: IGroupDetail,
}

export interface IGroupDetail {
    group: any,
    is_group_joined: any,
    groupMembers: Array<any>
}
const initialGroupDetailState = {
    group: null,
    is_group_joined: 0,
    groupMembers: []
}

const initialGroupState = {
    allGroups: [],
    groupDetail: initialGroupDetailState,
}


export const groupReducer = (state: IGroupReducer = initialGroupState, action: action): IGroupReducer => {
    switch (action.type) {
        case ActionTypes.SET_ALL_GROUPS:
            return { ...state, allGroups: action?.payload }
        case ActionTypes.ADD_IN_GROUPS:
            return { ...state, allGroups: [...state.allGroups, ...action?.payload] }
        case ActionTypes.SET_GROUP_DETAIL:
            return { ...state, groupDetail: action?.payload ? { ...state?.groupDetail, ...action?.payload } : initialGroupDetailState }
        case ActionTypes.SET_GROUP_MEMBERS:
            return { ...state, groupDetail: { ...state?.groupDetail, groupMembers: action?.payload } }
        default:
            return state
    }
}


