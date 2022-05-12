
import analytics, { firebase } from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

export const AnalyticService = {
    init: async () => {
        firebase.analytics().setAnalyticsCollectionEnabled(true).then(() => console.log("Firebase Analytics Enabled"))
        const instanceId = await analytics().getAppInstanceId()
        console.log("Instance Id is ", instanceId)
        return instanceId
    },

    setUserData: async (userData: any, type?: 1 | 2) => {
        await analytics().setUserId(userData?._id)
        await analytics().setUserProperties({
            username: userData?.username,
            fullName: userData?.first_name + (userData?.last_name ? (" " + userData?.last_name) : ""),
            email: userData?.email
        })
        if (type) {
            const fn = type == 1 ? analytics().logLogin : analytics().logSignUp
            await fn({ method: Platform.OS + "-app" })
            return
        }
    },
    clearUserData: async () => {
        await analytics().setUserId(null)
        await analytics().setUserProperties({
            username: null,
            fullName: null,
            email: null
        })
    },
    logScreenView: async (currentRouteName: string) => {
        await analytics().logScreenView({
            screen_name: getAnalyticScreenName(currentRouteName),
            screen_class: currentRouteName,
        });
    },
    logShare: async (id: string, type: string, method: string = "") => {
        // console.log("id", id);
        // console.log("type", type);
        // console.log("method", method);

        await analytics().logShare({
            content_type: type,
            item_id: id,
            method: method || ""
        })
    }
}


const getAnalyticScreenName = (routeName: string) => {
    console.log("routeName", routeName);

    switch (routeName) {
        case "HomeEventTab":
            return "EventList at Home"
        case "HomeGroupTab":
            return "GroupList at Home"
        case "ProfileScreen":
            return "Profile"
        case "GooglePlacesTextInput":
            return "SearchLocation"
        case "ProfileUpcomingEvents":
            return "User's UpcomingEvents"
        case "ProfilePastEvents":
            return "User's PastEvents"
        case "UpcomingEventsChat":
            return "Upcoming Event in Chat Screen"
        case "ProfileGroups":
            return "User's Groups"
        case "PrivacyScreen":
            return "Review"
        case "MuteGroupTab":
            return "Muted Groups"
        case "MuteEventTab":
            return "Muted Events"
        case "EventChats":
            return "Event Chat"
        case "Chats":
            return "Group Chat"
        default:
            return routeName
    }

}