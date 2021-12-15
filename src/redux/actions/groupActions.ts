import ActionTypes from "app-store/action-types";

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

export const getMutedReportedCount = (payload?: any) => ({
    type: ActionTypes.GET_MUTED_REPORTED_COUNT,
    payload
})

export const getMutedResources = (payload?: { resource_type: 'event' | 'group' | 'message', page: number, onSuccess: (data: any) => void }) => ({
    type: ActionTypes.GET_MUTED_RESOURCES,
    payload
})

export const getBlockedMembers = (payload?: { onSuccess: (data: any) => void, page: number, }) => ({
    type: ActionTypes.GET_BLOCKED_MEMBERS,
    payload
})

export const blockUnblockResource = (payload: { data: { resource_id: string, resource_type: "user", is_blocked: '1' | '0' }, onSuccess: (res: any) => void }) => ({
    type: ActionTypes.BLOCK_UNBLOCK_RESOURCE,
    payload
})

