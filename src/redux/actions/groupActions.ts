import ActionTypes from "app-store/action-types";

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

