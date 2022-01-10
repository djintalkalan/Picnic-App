import ActionTypes, { action } from "app-store/action-types";
import { unionBy } from "lodash";

export interface IGroupChatReducer {
    groups: IGroups
}

interface IGroups {
    [key: string]: IGroupChat
}

interface IGroupChat {
    chats: Array<any>
}

const initialGroupChatState: IGroupChatReducer = {
    groups: {

    }
}

export const groupChatReducer = (state: IGroupChatReducer = initialGroupChatState, action: action): IGroupChatReducer => {
    const { groupId } = action?.payload ?? {}
    switch (action.type) {
        case ActionTypes.SET_CHAT_IN_GROUP:
            const newState = { ...state }
            if (!newState?.groups?.[groupId]) {
                newState.groups[groupId] = {
                    chats: [],
                }
            }
            if (action?.payload?.message_id) {

                // newState.groups[groupId].chats = unionBy(action?.payload?.chats, newState.groups[groupId]?.chats, "_id")
                //     .sort((a, b) => { return (new Date(b?.created_at)).getTime() - new Date(a?.created_at).getTime() });
                newState.groups[groupId].chats = unionBy(newState.groups[groupId]?.chats, action?.payload?.chats, "_id")

            } else
                newState.groups[groupId].chats = unionBy(action?.payload?.chats, newState.groups[groupId]?.chats, "_id")
            return newState
        case ActionTypes.REFRESH_CHAT_IN_GROUP:
            const refreshChatState = state
            if (!refreshChatState.groups[groupId]) {
                refreshChatState.groups[groupId].chats = []
            }
            refreshChatState.groups[groupId].chats = action?.payload?.chats
            return refreshChatState
        case ActionTypes.ADD_CHAT_IN_GROUP:
            const addChatState = { ...state }
            if (!addChatState.groups[groupId]) {
                addChatState.groups[groupId].chats = []
            }
            addChatState.groups[groupId].chats.push(action?.payload?.chat)
            return addChatState
        case ActionTypes.LIKE_UNLIKE_MESSAGE_SUCCESS:
            let likeState = { ...state }
            if (!likeState.groups[groupId]) {
                likeState.groups[groupId].chats = []
            }
            likeState.groups[groupId].chats = (state.groups?.[groupId]?.chats ?? []).map((_) => {
                if (action?.payload?.message_id == _._id)
                    return {
                        ..._,
                        is_message_liked_by_me: action?.payload?.is_like == '1' ? true : false,
                        message_total_likes_count: _?.message_total_likes_count + (action?.payload?.is_like == '1' ? 1 : -1)
                    }
                else {
                    return _
                }
            })
            return likeState

        case ActionTypes.UPDATE_CHAT_IN_GROUP:
            const updateChatState = { ...state }
            if (!updateChatState.groups[groupId]) {
                updateChatState.groups[groupId].chats = []
            }
            updateChatState.groups[groupId].chats = (state.groups?.[groupId]?.chats ?? []).map((_) => {
                if (action?.payload?.chat?._id == _._id)
                    return { ..._, ...action?.payload?.chat }
                else {
                    return _
                }
            })
            return updateChatState

        case ActionTypes.DELETE_CHAT_IN_GROUP_SUCCESS:
            if (state.groups[groupId]) {
                console.log("DELETE_CHAT_IN_GROUP_SUCCESS", action?.payload);
                const i = state.groups?.[groupId]?.chats?.findIndex(_ => _?._id == action?.payload?.resourceId)
                if (i > -1) {
                    const newState = { ...state }
                    newState.groups?.[groupId]?.chats.splice(i, 1)
                    console.log("newState", newState);
                    return newState
                }
            }
            return state

        case ActionTypes.UPDATE_CHAT_IN_GROUP_SUCCESS:
            if (state.groups[groupId]) {
                console.log("UPDATE_CHAT_IN_GROUP_SUCCESS", action?.payload);
                const i = state.groups?.[groupId]?.chats?.findIndex(_ => _?._id == action?.payload?.resourceId)
                if (i > -1) {
                    const newState = { ...state }
                    newState.groups[groupId].chats[i] = action?.payload?.message
                    console.log("newState", newState);
                    return newState
                }
            }
            return state
        default:
            return state
    }
}


