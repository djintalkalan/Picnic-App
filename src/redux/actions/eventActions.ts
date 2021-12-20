import ActionTypes from "app-store/action-types";
export type IResourceType = 'event' | 'group' | 'message' | 'user'


export const getMyGroups = () => ({
    type: ActionTypes.GET_MY_GROUPS,
})

export const setMyGroups = (payload:Array<any>) => ({
    type: ActionTypes.SET_MY_GROUPS,
    payload
})











