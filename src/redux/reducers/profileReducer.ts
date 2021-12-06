import ActionTypes, { action } from "app-store/action-types";

const initialNotificationSettings = {
    message: 0,
    group_message: 0,
    event_creation: 0,
    event_of_interests: 0,
    is_notification_enabled: 0
}

export const notificationSettingsReducer = (state = initialNotificationSettings, action: action) => {
    switch (action.type) {
        case ActionTypes.SET_NOTIFICATION_SETTINGS:
            return action.payload
        default:
            return state
    }
}


