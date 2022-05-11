
import analytics, { firebase } from '@react-native-firebase/analytics'
import { Platform } from 'react-native'
import { getAnalyticScreenName } from 'utils'

const init = async () => {
    firebase.analytics().setAnalyticsCollectionEnabled(true).then(() => console.log("Firebase Analytics Enabled"))
    const instanceId = await analytics().getAppInstanceId()
    console.log("Instance Id is ", instanceId)
    return instanceId
}

const setUserData = async (userData: any, type?: 1 | 2) => {
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
}

const clearUserData = async () => {
    await analytics().setUserId(null)
    await analytics().setUserProperties({
        username: null,
        fullName: null,
        email: null
    })
}

const logScreenView = async (currentRouteName: string) => {
    await analytics().logScreenView({
        screen_name: getAnalyticScreenName(currentRouteName),
        screen_class: currentRouteName,
    });
}

const logShare = async (id: string, type: string, method: string = "") => {
    console.log("id", id);
    console.log("type", type);
    console.log("method", method);

    await analytics().logShare({
        content_type: type,
        item_id: id,
        method: method || ""
    })
}

export const AnalyticsService = { init, setUserData, clearUserData, logScreenView, logShare }