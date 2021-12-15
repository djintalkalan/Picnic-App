import ActionTypes, { action } from "app-store/action-types";
import { IResourceType } from "app-store/actions";

export interface INotificationSettings { message: number, group_message: number, event_creation: number, event_of_interests: number, is_notification_enabled: number }
export interface IPrivacyState { events: number, users: number, groups: number, posts: number }
export interface IPrivacyData { blockedUsers: Array<any>, mutedGroups: Array<any>, mutedEvents: Array<any>, mutedPosts: Array<any> }

const initialNotificationSettings: INotificationSettings = {
    message: 0,
    group_message: 0,
    event_creation: 0,
    event_of_interests: 0,
    is_notification_enabled: 0
}

const initialPrivacyState: IPrivacyState = {
    events: 0,
    users: 0,
    groups: 0,
    posts: 0
}

const initialPrivacyData: IPrivacyData = {
    blockedUsers: [],
    mutedGroups: [],
    mutedEvents: [],
    mutedPosts: []
}

export const notificationSettingsReducer = (state: INotificationSettings = initialNotificationSettings, action: action) => {
    switch (action.type) {
        case ActionTypes.SET_NOTIFICATION_SETTINGS:
            return action.payload
        default:
            return state
    }
}

export const privacyStateReducer = (state: IPrivacyState = initialPrivacyState, action: action): IPrivacyState => {
    switch (action.type) {
        case ActionTypes.SET_PRIVACY_STATE:
            return action.payload
        default:
            return state
    }
}

export const privacyDataReducer = (state: IPrivacyData = initialPrivacyData, action: action): IPrivacyData => {
    let newState = { ...state }
    const { type, data }: { type: IResourceType, data: Array<any> } = action?.payload ?? {}
    switch (action.type) {
        case ActionTypes.SET_BLOCKED_MEMBERS:
            return { ...state, blockedUsers: action?.payload }
        case ActionTypes.REMOVE_BLOCKED_MEMBER:
            return { ...state, blockedUsers: state.blockedUsers.filter(_ => _._id != action.payload) }
        case ActionTypes.SET_MUTED_EVENTS:
            return { ...state, mutedEvents: action?.payload }
        case ActionTypes.SET_MUTED_GROUPS:
            return { ...state, mutedGroups: action?.payload }
        case ActionTypes.SET_MUTED_POSTS:
            return { ...state, mutedPosts: action?.payload }
        case ActionTypes.SET_MUTED_RESOURCE:
            switch (type) {
                case "message":
                    return { ...state, mutedPosts: data }
                case "event":
                    return { ...state, mutedEvents: data }
                case "group":
                    return { ...state, mutedGroups: data }
                default:
                    break;
            }
            console.log("Changed State is ", state, data, type)
            return newState
        case ActionTypes.ADD_MUTED_RESOURCE:
            switch (type) {
                case "message":
                    return { ...state, mutedPosts: [...state?.mutedPosts, ...data] }
                case "event":
                    return { ...state, mutedEvents: [...state?.mutedEvents, ...data] }
                case "group":
                    return { ...state, mutedGroups: [...state?.mutedGroups, ...data] }
                default:
                    break;
            }
            return newState
        default:
            return state
    }
}


