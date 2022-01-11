import ActionTypes from "app-store/action-types"

export const getEventChat = (payload: any) => ({
    type: ActionTypes.GET_EVENT_CHAT,
    payload
})

export const setChatInEvent = (payload: { eventId: string, chats: Array<any>, message_id?: string }) => ({
    type: ActionTypes.SET_CHAT_IN_EVENT,
    payload
})

export const addChatInEvent = (payload: { eventId: string, chat: any }) => ({
    type: ActionTypes.ADD_CHAT_IN_EVENT,
    payload
})

export const updateChatInEvent = (payload: { eventId: string, chat: any }) => ({
    type: ActionTypes.UPDATE_CHAT_IN_EVENT,
    payload
})



export const updateChatInEventSuccess = (payload: { eventId: string, resourceId: any, message: any }) => ({
    type: ActionTypes.UPDATE_CHAT_IN_EVENT_SUCCESS,
    payload
})


export const deleteChatInEventSuccess = (payload: { eventId: string, resourceId: any }) => ({
    type: ActionTypes.DELETE_CHAT_IN_EVENT_SUCCESS,
    payload
})

export const refreshChatInEvent = (payload: { eventId: string, chats: Array<any> }) => ({
    type: ActionTypes.REFRESH_CHAT_IN_EVENT,
    payload
})


