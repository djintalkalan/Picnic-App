import ActionTypes from "app-store/action-types"

export const getGroupChat = (payload: any) => ({
    type: ActionTypes.GET_GROUP_CHAT,
    payload
})

export const setActiveGroup = (payload: any) => ({
    type: ActionTypes.SET_ACTIVE_GROUP,
    payload
})

export const setChatInGroup = (payload: { groupId: string, chats: Array<any> }) => ({
    type: ActionTypes.SET_CHAT_IN_GROUP,
    payload
})

export const addChatInGroup = (payload: { groupId: string, chat: any }) => ({
    type: ActionTypes.ADD_CHAT_IN_GROUP,
    payload
})

export const updateChatInGroup = (payload: { groupId: string, chat: any }) => ({
    type: ActionTypes.UPDATE_CHAT_IN_GROUP,
    payload
})

export const refreshChatInGroup = (payload: { groupId: string, chats: Array<any> }) => ({
    type: ActionTypes.REFRESH_CHAT_IN_GROUP,
    payload
})

