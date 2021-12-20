import ActionTypes, { action } from "app-store/action-types";

export interface IGroupReducer {
    allGroups: Array<any>,
    groupDetail: IGroupDetail,
    myGroups:Array<any>,
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
    myGroups:[]
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
        case ActionTypes.SET_GROUP_DETAIL:
            return { ...state, groupDetail: action?.payload ? { ...state?.groupDetail, ...action?.payload } : initialGroupDetailState }
        case ActionTypes.UPDATE_GROUP_DETAIL:
            return { ...state, groupDetail: { ...state?.groupDetail, group: { ...state?.groupDetail?.group, ...action?.payload } } }
        case ActionTypes.SET_GROUP_MEMBERS:
            return { ...state, groupDetail: { ...state?.groupDetail, groupMembers: action?.payload } }
        case ActionTypes.REMOVE_GROUP_MEMBER_SUCCESS:
            return { ...state, groupDetail: { ...state?.groupDetail, groupMembers: state?.groupDetail?.groupMembers?.filter(_ => _.user_id != action?.payload) } }
        default:
            return state
    }
}


