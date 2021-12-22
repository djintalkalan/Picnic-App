import ActionTypes from "app-store/action-types";
export type IResourceType = 'event' | 'group' | 'message' | 'user'
export const createGroup = (payload: any) => ({
    type: ActionTypes.CREATE_GROUP,
    payload
})

export const updateGroup = (payload: any) => ({
    type: ActionTypes.UPDATE_GROUP,
    payload
})


export const deleteGroup = (payload: any) => ({
    type: ActionTypes.DELETE_GROUP,
    payload
})

export const deleteGroupSuccess = (payload: any) => ({
    type: ActionTypes.DELETE_GROUP_SUCCESS,
    payload
})



export const joinGroup = (payload: any) => ({
    type: ActionTypes.JOIN_GROUP,
    payload
})

export const leaveGroup = (payload: any) => ({
    type: ActionTypes.LEAVE_GROUP,
    payload
})

export const getGroupDetail = (payload: any) => ({
    type: ActionTypes.GET_GROUP_DETAIL,
    payload
})

export const setGroupDetail = (payload: any) => ({
    type: ActionTypes.SET_GROUP_DETAIL,
    payload
})

export const updateGroupDetail = (payload: any) => ({
    type: ActionTypes.UPDATE_GROUP_DETAIL,
    payload
})

export const getGroupMembers = (payload: any) => ({
    type: ActionTypes.GET_GROUP_MEMBERS,
    payload
})

export const setGroupMembers = (payload: Array<any>) => ({
    type: ActionTypes.SET_GROUP_MEMBERS,
    payload
})

export const removeGroupMember = (payload: any) => ({
    type: ActionTypes.REMOVE_GROUP_MEMBER,
    payload
})

export const removeGroupMemberSuccess = (payload: any) => ({
    type: ActionTypes.REMOVE_GROUP_MEMBER_SUCCESS,
    payload
})



export const getAllGroups = (payload: any) => ({
    type: ActionTypes.GET_ALL_GROUPS,
    payload
})

export const getGroupChat = (payload: any) => ({
    type: ActionTypes.GET_GROUP_CHAT,
    payload
})

export const addInGroup = (payload: Array<any>) => ({
    type: ActionTypes.ADD_IN_GROUPS,
    payload
})

export const setAllGroups = (payload: Array<any>) => ({
    type: ActionTypes.SET_ALL_GROUPS,
    payload
})

export const joinGroupSuccess = (payload: Array<any>) => ({
    type: ActionTypes.JOIN_GROUP_SUCCESS,
    payload
})

export const leaveGroupSuccess = (payload: Array<any>) => ({
    type: ActionTypes.LEAVE_GROUP_SUCCESS,
    payload
})

export const getMutedReportedCount = (payload?: any) => ({
    type: ActionTypes.GET_MUTED_REPORTED_COUNT,
    payload
})

export const getMutedResources = (payload?: { resource_type: IResourceType, page: number, onSuccess: (data: any) => void }) => ({
    type: ActionTypes.GET_MUTED_RESOURCES,
    payload
})

export const getBlockedMembers = (payload?: { onSuccess: (data: any) => void, page: number, }) => ({
    type: ActionTypes.GET_BLOCKED_MEMBERS,
    payload
})

export const blockUnblockResource = (payload: { data: { resource_id: string, resource_type: IResourceType, is_blocked: '1' | '0' }, onSuccess?: (res: any) => void }) => ({
    type: ActionTypes.BLOCK_UNBLOCK_RESOURCE,
    payload
})

export const muteUnmuteResource = (payload: { data: { resource_id: string, resource_type: IResourceType, is_mute: "1" | "0" }, onSuccess?: (res: any) => void }) => ({
    type: ActionTypes.MUTE_UNMUTE_RESOURCE,
    payload
})

export const reportResource = (payload?: { resource_id: string, resource_type: IResourceType }) => ({
    type: ActionTypes.REPORT_RESOURCE,
    payload
})

export const getMyEvents = (payload: { groupId: string, type: 'upcoming' | 'past', text?: string }) => ({
    type: ActionTypes.GET_MY_EVENTS,
    payload
})




