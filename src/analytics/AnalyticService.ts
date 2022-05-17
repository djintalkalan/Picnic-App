import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

const getAnalyticScreenName = (routeName: string) => {
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
        case "PersonChat":
            return "Admin Chat"
        default:
            return routeName
    }

}

const AnalyticService = {
    init: async () => {
        try {
            const instanceId = await analytics().getAppInstanceId()
            console.log("Instance Id is ", instanceId)
            return instanceId
        } catch (error) {
            console.log("Init Error", error)

        }

    },

    setUserData: async (userData: any, type?: 1 | 2) => {
        try {
            const analytic = analytics()
            await analytic.setUserId(userData?._id)
            await analytic.setUserProperties({
                username: userData?.username,
                fullName: userData?.first_name + (userData?.last_name ? (" " + userData?.last_name) : ""),
                email: userData?.email
            })
            type && await analytic[type == 1 ? 'logLogin' : "logSignUp"]({ method: `${Platform.OS}-app` })
        } catch (error) {
            console.log("Set UserData Error", error)
        }

    },
    clearUserData: async () => {
        try {
            await analytics().setUserId(null)
            await analytics().setUserProperties({
                username: null,
                fullName: null,
                email: null
            })
        } catch (error) {
            console.log("clear UserData Error", error)
        }
    },
    logScreenView: async (currentRouteName: string) => {
        try {
            await analytics().logScreenView({
                screen_name: getAnalyticScreenName(currentRouteName),
                screen_class: currentRouteName,
            });
        } catch (error) {
            console.log("Screen View Log Error", error)

        }

    },
    logShare: async (id: string, type: string, method: string = "") => {
        try {
            await analytics().logShare({
                content_type: type,
                item_id: id,
                method: method || ""
            })
        } catch (error) {
            console.log("Share Log Error", error)
        }
    }
}

export default AnalyticService