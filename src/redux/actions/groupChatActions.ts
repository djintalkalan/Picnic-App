import ActionTypes from "app-store/action-types"

export const getGroupChat = (payload: any) => ({
    type: ActionTypes.GET_GROUP_CHAT,
    payload
})

export const setActiveGroup = (payload: any) => ({
    type: ActionTypes.SET_ACTIVE_GROUP,
    payload
})

export const setChatInGroup = (payload: { groupId: string, chats: Array<any>, message_id?: string }) => ({
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



export const updateChatInGroupSuccess = (payload: { groupId: string, resourceId: any, message: any }) => ({
    type: ActionTypes.UPDATE_CHAT_IN_GROUP_SUCCESS,
    payload
})


export const deleteChatInGroupSuccess = (payload: { groupId: string, resourceId: any }) => ({
    type: ActionTypes.DELETE_CHAT_IN_GROUP_SUCCESS,
    payload
})

export const refreshChatInGroup = (payload: { groupId: string, chats: Array<any> }) => ({
    type: ActionTypes.REFRESH_CHAT_IN_GROUP,
    payload
})

export const likeUnlikeMessage = (payload: { message_id: string, is_like: '1' | '0' }) => ({
    type: ActionTypes.LIKE_UNLIKE_MESSAGE,
    payload
})

export const likeUnlikeMessageSuccess = (payload: { groupId: string, message_id: string, is_like: '1' | '0' }) => ({
    type: ActionTypes.LIKE_UNLIKE_MESSAGE_SUCCESS,
    payload
})


