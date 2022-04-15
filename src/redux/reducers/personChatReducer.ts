import ActionTypes, { action } from "app-store/action-types";
import { unionBy } from "lodash";

export interface IPersonChatReducer {
    chatRooms: IChatRooms
}

interface IChatRooms {
    [key: string]: IPersonChat
}

interface IPersonChat {
    chats: Array<any>
}

const initialPersonChatState: IPersonChatReducer = {
    chatRooms: {

    }
}

export const personChatReducer = (state: IPersonChatReducer = initialPersonChatState, action: action): IPersonChatReducer => {
    const { chatRoomId } = action?.payload ?? {}
    switch (action.type) {
        case ActionTypes.SET_CHAT_IN_PERSON:
            const newState = { ...state }
            if (!newState?.chatRooms?.[chatRoomId]) {
                newState.chatRooms[chatRoomId] = {
                    chats: [],
                }
            }
            if (action?.payload?.message_id) {

                // newState.chatRooms[chatRoomId].chats = unionBy(action?.payload?.chats, newState.chatRooms[chatRoomId]?.chats, "_id")
                //     .sort((a, b) => { return (new Date(b?.created_at)).getTime() - new Date(a?.created_at).getTime() });
                newState.chatRooms[chatRoomId].chats = unionBy(newState.chatRooms[chatRoomId]?.chats, action?.payload?.chats, "_id")

            } else
                newState.chatRooms[chatRoomId].chats = unionBy(action?.payload?.chats, newState.chatRooms[chatRoomId]?.chats, "_id")
            console.log("newState", newState);

            return newState
        case ActionTypes.REFRESH_CHAT_IN_PERSON:
            const refreshChatState = { ...state }
            if (!refreshChatState.chatRooms?.[chatRoomId]) {
                refreshChatState.chatRooms[chatRoomId] = {
                    chats: [],
                }
            }
            refreshChatState.chatRooms[chatRoomId].chats = action?.payload?.chats
            return refreshChatState
        case ActionTypes.ADD_CHAT_IN_PERSON:
            const addChatState = { ...state }
            if (!addChatState.chatRooms[chatRoomId]) {
                addChatState.chatRooms[chatRoomId].chats = []
            }
            addChatState.chatRooms[chatRoomId].chats.push(action?.payload?.chat)
            return addChatState
        case ActionTypes.UPDATE_CHAT_IN_PERSON:
            const updateChatState = { ...state }
            if (!updateChatState.chatRooms[chatRoomId]) {
                updateChatState.chatRooms[chatRoomId].chats = []
            }
            updateChatState.chatRooms[chatRoomId].chats = (state.chatRooms?.[chatRoomId]?.chats ?? []).map((_) => {
                if (action?.payload?.chat?._id == _._id)
                    return action?.payload?.chat
                else {
                    return _
                }
            })
            return updateChatState

        case ActionTypes.DELETE_CHAT_IN_PERSON_SUCCESS:
            if (state.chatRooms[chatRoomId]) {
                const i = state.chatRooms?.[chatRoomId]?.chats?.findIndex(_ => _?._id == action?.payload?.resourceId)
                if (i > -1) {
                    const newState = { ...state }
                    newState.chatRooms?.[chatRoomId]?.chats.splice(i, 1)
                    return newState
                }
            }
            return state

        case ActionTypes.UPDATE_CHAT_IN_PERSON_SUCCESS:
            if (state.chatRooms[chatRoomId]) {
                console.log("UPDATE_CHAT_IN_PERSON_SUCCESS", action?.payload);
                const i = state.chatRooms?.[chatRoomId]?.chats?.findIndex(_ => _?._id == action?.payload?.resourceId)
                if (i > -1) {
                    const newState = { ...state }
                    newState.chatRooms[chatRoomId].chats[i] = action?.payload?.message
                    console.log("newState", newState);
                    return newState
                }
            }
            return state
        default:
            return state
    }
}


