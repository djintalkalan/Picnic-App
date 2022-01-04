import ActionTypes, { action } from "app-store/action-types";
import { unionBy } from "lodash";

export interface IGroupChatReducer {
    groups: IGroups
    activeGroup: any
}

interface IGroups {
    [key: string]: IGroupChat
}

interface IGroupChat {
    chats: Array<any>
    detail: any
}

const initialGroupChatState: IGroupChatReducer = {
    groups: {

    },
    activeGroup: null
}

export const groupChatReducer = (state: IGroupChatReducer = initialGroupChatState, action: action): IGroupChatReducer => {
    const { groupId } = action?.payload ?? {}
    switch (action.type) {
        case ActionTypes.SET_ACTIVE_GROUP:
            return { ...state, activeGroup: action?.payload }
        case ActionTypes.SET_CHAT_IN_GROUP:
            const newState = { ...state }
            if (!newState?.groups?.[groupId]) {
                newState.groups[groupId] = {
                    chats: [],
                    detail: null
                }
            }
            newState.groups[groupId].chats = unionBy(action?.payload?.chats, newState.groups[groupId]?.chats, "_id")
            return newState
        case ActionTypes.REFRESH_CHAT_IN_GROUP:
            const refreshChatState = state
            if (!refreshChatState.groups[groupId]) {
                refreshChatState.groups[groupId].chats = [],
                    refreshChatState.groups[groupId].detail = null
            }
            refreshChatState.groups[groupId].chats = action?.payload?.chats
            return refreshChatState
        case ActionTypes.ADD_CHAT_IN_GROUP:
            const addChatState = { ...state }
            if (!addChatState.groups[groupId]) {
                addChatState.groups[groupId].chats = [],
                    addChatState.groups[groupId].detail = null
            }
            addChatState.groups[groupId].chats.push(action?.payload?.chat)
            return addChatState
        case ActionTypes.LIKE_UNLIKE_MESSAGE_SUCCESS:
            let likeState = { ...state }
            if (!likeState.groups[groupId]) {
                likeState.groups[groupId].chats = [],
                    likeState.groups[groupId].detail = null
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
                updateChatState.groups[groupId].chats = [],
                    updateChatState.groups[groupId].detail = null
            }
            updateChatState.groups[groupId].chats = (state.groups?.[groupId]?.chats ?? []).map((_) => {
                if (action?.payload?.chat?._id == _._id)
                    return { ..._, ...action?.payload?.chat }
                else {
                    return _
                }
            })
            return updateChatState
        default:
            return state
    }
}


