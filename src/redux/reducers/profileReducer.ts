import ActionTypes, { action } from "app-store/action-types";
import { IResourceType } from "app-store/actions";

export interface INotificationSettings { message: number, group_message: number, event_creation: number, event_of_interests: number, is_notification_enabled: number }
export interface IPrivacyState { events: number, users: number, groups: number, posts: number }
export interface IPrivacyData { blockedUsers: Array<any>, mutedGroups: Array<any>, mutedEvents: Array<any>, mutedPosts: Array<any> }
export interface IUserEventsGroups { upcoming: Array<any>, past: Array<any>, groups: Array<any> }

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

const initialUserEventsGroupsState: IUserEventsGroups = {
    upcoming: [],
    past: [],
    groups: [],
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
        case ActionTypes.REMOVE_BLOCKED_MEMBER:
            return { ...state, users: (state?.users || 1) - 1 }
        case ActionTypes.RESET_STATE_ON_LOGIN:
        case ActionTypes.RESET_STATE_ON_LOGOUT:
            return initialPrivacyState
        default:
            return state
    }
}

export const privacyDataReducer = (state: IPrivacyData = initialPrivacyData, action: action): IPrivacyData => {
    const { type, data }: { type: IResourceType, data: any } = action?.payload ?? {}
    let updateKey: 'mutedGroups' | 'mutedPosts' | 'mutedEvents' = "mutedPosts"
    switch (type) {
        case "message":
            updateKey = "mutedPosts"
            break;
        case "event":
            updateKey = "mutedEvents"
            break;
        case "group":
            updateKey = "mutedGroups"
            break;
    }

    switch (action.type) {
        case ActionTypes.SET_BLOCKED_MEMBERS:
            return { ...state, blockedUsers: action?.payload }
        case ActionTypes.REMOVE_BLOCKED_MEMBER:
            return { ...state, blockedUsers: state.blockedUsers.filter(_ => _.blocked_user_id != action.payload) }
        case ActionTypes.SET_MUTED_EVENTS:
            return { ...state, mutedEvents: action?.payload }
        case ActionTypes.SET_MUTED_GROUPS:
            return { ...state, mutedGroups: action?.payload }
        case ActionTypes.SET_MUTED_POSTS:
            return { ...state, mutedPosts: action?.payload }
        case ActionTypes.SET_MUTED_RESOURCE:
            return { ...state, [updateKey]: data }
        case ActionTypes.REMOVE_MUTED_RESOURCE:
            // console.log("updateKey", action?.payload, updateKey, { ...state, [updateKey]: state?.[updateKey]?.filter(_ => (_?.resource_id ?? _?.muted_event_id) != data) })
            return { ...state, [updateKey]: state?.[updateKey]?.filter(_ => (_?.resource_id ?? _?.muted_event_id ?? _?.muted_message_id) != data) }
        case ActionTypes.ADD_MUTED_RESOURCE:
            return { ...state, [updateKey]: [...state?.[updateKey], ...data] }
        case ActionTypes.RESET_STATE_ON_LOGIN:
        case ActionTypes.RESET_STATE_ON_LOGOUT:
            return initialPrivacyData
        default:
            return state
    }
}

export const userEventGroupReducer = (state: IUserEventsGroups = initialUserEventsGroupsState, action: action): IUserEventsGroups => {
    switch (action.type) {
        case ActionTypes.SET_USER_GROUPS:
            return { ...state, groups: action?.payload }
        case ActionTypes.DELETE_GROUP_SUCCESS:
            return { ...state, groups: state?.groups.filter(_ => _._id != action?.payload) }
        case ActionTypes.SET_USER_UPCOMING_PAST_EVENTS:
            return { ...state, [action?.payload?.type]: action?.payload?.data }
        case ActionTypes.DELETE_EVENT_SUCCESS:
            return {
                ...state,
                upcoming: state?.upcoming.filter(_ => _._id != action?.payload),
                past: state?.upcoming.filter(_ => _._id != action?.payload),
            }
        case ActionTypes.RESET_STATE_ON_LOGIN:
        case ActionTypes.RESET_STATE_ON_LOGOUT:
            return initialUserEventsGroupsState

        default:
            return state
    }
}


