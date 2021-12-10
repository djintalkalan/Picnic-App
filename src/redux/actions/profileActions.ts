import ActionTypes from "app-store/action-types";
import { INotificationSettings, IPrivacyState } from "app-store/reducers";

export const setNotificationSettings = (payload: INotificationSettings) => ({
    type: ActionTypes.SET_NOTIFICATION_SETTINGS,
    payload
})

export const setPrivacyState = (payload: IPrivacyState) => ({
    type: ActionTypes.SET_PRIVACY_STATE,
    payload
})


export const setMutedGroups = (payload: Array<any>) => ({
    type: ActionTypes.SET_MUTED_GROUPS,
    payload
})

export const setMutedEvents = (payload: Array<any>) => ({
    type: ActionTypes.SET_MUTED_EVENTS,
    payload
})

export const setMutedPosts = (payload: Array<any>) => ({
    type: ActionTypes.SET_MUTED_POSTS,
    payload
})

export const setBlockedMembers = (payload: Array<any>) => ({
    type: ActionTypes.SET_BLOCKED_MEMBERS,
    payload
})

export const removeFromBlockedMember = (payload: string) => ({
    type: ActionTypes.REMOVE_BLOCKED_MEMBER,
    payload
})