import ActionTypes, { action } from "app-store/action-types";
import { unionBy } from "lodash";

export interface IEventChatReducer {
    events: IEvents
}

interface IEvents {
    [key: string]: IEventChat
}

interface IEventChat {
    chats: Array<any>
}

const initialEventChatState: IEventChatReducer = {
    events: {

    }
}

export const eventChatReducer = (state: IEventChatReducer = initialEventChatState, action: action): IEventChatReducer => {
    const { eventId } = action?.payload ?? {}
    switch (action.type) {
        case ActionTypes.SET_CHAT_IN_EVENT:
            const newState = { ...state }
            if (!newState?.events?.[eventId]) {
                newState.events[eventId] = {
                    chats: [],
                }
            }
            if (action?.payload?.message_id) {

                // newState.events[eventId].chats = unionBy(action?.payload?.chats, newState.events[eventId]?.chats, "_id")
                //     .sort((a, b) => { return (new Date(b?.created_at)).getTime() - new Date(a?.created_at).getTime() });
                newState.events[eventId].chats = unionBy(newState.events[eventId]?.chats, action?.payload?.chats, "_id")

            } else
                newState.events[eventId].chats = unionBy(action?.payload?.chats, newState.events[eventId]?.chats, "_id")
            return newState
        case ActionTypes.REFRESH_CHAT_IN_EVENT:
            const refreshChatState = state
            if (!refreshChatState.events[eventId]) {
                refreshChatState.events[eventId].chats = []
            }
            refreshChatState.events[eventId].chats = action?.payload?.chats
            return refreshChatState
        case ActionTypes.ADD_CHAT_IN_EVENT:
            const addChatState = { ...state }
            if (!addChatState.events[eventId]) {
                addChatState.events[eventId].chats = []
            }
            addChatState.events[eventId].chats.push(action?.payload?.chat)
            return addChatState
        case ActionTypes.UPDATE_CHAT_IN_EVENT:
            const updateChatState = { ...state }
            if (!updateChatState.events[eventId]) {
                updateChatState.events[eventId].chats = []
            }
            updateChatState.events[eventId].chats = (state.events?.[eventId]?.chats ?? []).map((_) => {
                if (action?.payload?.chat?._id == _._id)
                    return { ..._, ...action?.payload?.chat }
                else {
                    return _
                }
            })
            return updateChatState

        case ActionTypes.DELETE_CHAT_IN_EVENT_SUCCESS:
            if (state.events[eventId]) {
                console.log("DELETE_CHAT_IN_EVENT_SUCCESS", action?.payload);
                const i = state.events?.[eventId]?.chats?.findIndex(_ => _?._id == action?.payload?.resourceId)
                if (i > -1) {
                    const newState = { ...state }
                    newState.events?.[eventId]?.chats.splice(i, 1)
                    console.log("newState", newState);
                    return newState
                }
            }
            return state

        case ActionTypes.UPDATE_CHAT_IN_EVENT_SUCCESS:
            if (state.events[eventId]) {
                console.log("UPDATE_CHAT_IN_EVENT_SUCCESS", action?.payload);
                const i = state.events?.[eventId]?.chats?.findIndex(_ => _?._id == action?.payload?.resourceId)
                if (i > -1) {
                    const newState = { ...state }
                    newState.events[eventId].chats[i] = action?.payload?.message
                    console.log("newState", newState);
                    return newState
                }
            }
            return state
        default:
            return state
    }
}


