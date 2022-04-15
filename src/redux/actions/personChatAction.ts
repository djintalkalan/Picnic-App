import ActionTypes from "app-store/action-types"

export const getPersonChat = (payload: any) => ({
    type: ActionTypes.GET_PERSON_CHAT,
    payload
})

export const setChatInPerson = (payload: { chatRoomId: string, chats: Array<any>, message_id?: string }) => ({
    type: ActionTypes.SET_CHAT_IN_PERSON,
    payload
})

export const addChatInPerson = (payload: { chatRoomId: string, chat: any }) => ({
    type: ActionTypes.ADD_CHAT_IN_PERSON,
    payload
})

export const updateChatInPerson = (payload: { chatRoomId: string, chat: any }) => ({
    type: ActionTypes.UPDATE_CHAT_IN_PERSON,
    payload
})



export const updateChatInPersonSuccess = (payload: { chatRoomId: string, resourceId: any, message: any }) => ({
    type: ActionTypes.UPDATE_CHAT_IN_PERSON_SUCCESS,
    payload
})


export const deleteChatInPersonSuccess = (payload: { chatRoomId: string, resourceId: any }) => ({
    type: ActionTypes.DELETE_CHAT_IN_PERSON_SUCCESS,
    payload
})

export const refreshChatInPerson = (payload: { chatRoomId: string, chats: Array<any> }) => ({
    type: ActionTypes.REFRESH_CHAT_IN_PERSON,
    payload
})


