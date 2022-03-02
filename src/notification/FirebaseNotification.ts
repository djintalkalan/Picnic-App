
// import PushNotification from "react-native-push-notification";
import notifee, { AndroidDefaults, AndroidImportance, EventType, Notification } from "@notifee/react-native";
import dynamicLinks, { FirebaseDynamicLinksTypes } from '@react-native-firebase/dynamic-links';
import messaging from '@react-native-firebase/messaging';
import { store } from "app-store";
import { setActiveEvent, setActiveGroup } from "app-store/actions";
import Database, { useDatabase } from 'database/Database';
import { Dispatch, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getDetailsFromDynamicUrl, NavigationService, WaitTill } from 'utils';

const CHANNEL_NAME = "high-priority"

notifee.createChannel({
    id: CHANNEL_NAME,
    name: CHANNEL_NAME,
    lights: true,
    vibration: true,
    sound: 'default',
    importance: AndroidImportance.HIGH,
})

notifee.createChannel({
    id: "upload",
    name: "upload",
    lights: true,
    vibration: false,
    sound: 'default',
    importance: AndroidImportance.HIGH,
})

let isFirstTime = true

let dispatch: Dispatch<any>

const FirebaseNotification = () => {
    const [isLogin] = useDatabase<boolean>("isLogin");
    const [firebaseToken, setFirebaseToken] = useDatabase<string>('firebaseToken');

    dispatch = useDispatch()


    const checkPermission = useCallback(async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            messaging().getToken().then(token => {
                console.log("Token", token)
                setFirebaseToken(token)
                // messaging().registerDeviceForRemoteMessages()
            }).catch(e => {
                console.log("error in getting token", e);

            })
        }
    }, [])


    const createNotificationListeners = useCallback(() => {
        const messageSubs = messaging().onMessage(onMessageReceived);
        const foregroundSubs = notifee.onForegroundEvent(({ type, detail }) => {
            switch (type) {
                case EventType.PRESS:
                    detail?.notification && onNotificationOpened(detail?.notification)
                    break;
            }
        });
        return () => {
            messageSubs();
            foregroundSubs();
        };
    }, [isLogin])

    useEffect(() => {
        dynamicLinks()
            .getInitialLink()
            .then(handleLink);
        const removeLinkSubscription = dynamicLinks().onLink(handleLink);
        return () => {
            removeLinkSubscription()
        }
    }, [])

    useEffect(() => {
        checkPermission();
        const removeSubscription = createNotificationListeners()
        setTimeout(() => {
            isFirstTime = false
        }, 1500);
        return () => {
            removeSubscription()
        }
    }, [isLogin])
}

export const onNotificationOpened = (notification: Notification) => {
    navigateToPages(notification)
}

const navigateToPages = async (notification: any) => {
    if (isFirstTime) {
        await WaitTill(1500)
    }
    let { message: data } = notification?.data ?? {};
    if (data) {
        if (typeof data == 'string') {
            data = JSON.parse(data)
        }
        console.log("data is ", data);

        if (data?.group || data?.event) {
            dispatch && dispatch((data?.group ? setActiveGroup : setActiveEvent)(data?.group ?? data?.event))
            NavigationService.closeAndPush(data?.group ? "GroupChatScreen" : "EventChats", { id: data?.resource_id })
        }
    }
}

const handleLink = async (link: FirebaseDynamicLinksTypes.DynamicLink | null) => {
    console.log("Link is ", link);
    if (link && link.url) {
        const { id, type } = getDetailsFromDynamicUrl(link.url)
        if (id && type) {
            NavigationService.navigate("Home");
            switch (type) {
                case "group-detail":
                    const group = store?.getState()?.group?.allGroups.find(_ => _._id == id) ?? { _id: id }
                    dispatch(setActiveGroup(group))
                    setTimeout(() => {
                        NavigationService.navigate("GroupChatScreen", { id })
                    }, 0);
                    break;

                case "event-detail":
                    const event = store?.getState()?.event?.allEvents?.find(_ => _._id == id) ?? { _id: id }
                    dispatch(setActiveEvent(event))
                    setTimeout(() => {
                        NavigationService.navigate("EventDetail", { id })
                    }, 0);
                    break;

                default:
                    break;
            }
        }
    }
}

export const onMessageReceived = async (message: any, isBackground: boolean = false) => {
    if (isBackground)
        console.log("Background Firebase Message ", message)
    else
        console.log("Firebase Message ", message)
    const isLogin = Database.getStoredValue("isLogin");
    if (isLogin) {
        showNotification(message, isBackground)
    }
}

const showNotification = (message: any, isBackground: boolean) => {
    let { title, body, message: data } = message?.data ?? {};
    if (data) {
        if (typeof data == 'string') {
            data = JSON.parse(data)
        }
        console.log("data is ", data);

        if (data?.group || data?.event) {
            const { name, params } = NavigationService?.getCurrentScreen() ?? {}
            if (!isBackground && (params?.id == data?.resource_id &&
                (data?.group && (name == "GroupChatScreen" || name == "Chats")) ||
                (data?.event && name == "EventChats")
            )
            ) {

            } else {
                let body = data?.message
                switch (data?.message_type) {
                    case "image":
                        body = 'Image message arrived'
                        break
                    case "file":
                        body = 'Video message arrived'
                        break
                    case "contact":
                        body = 'Contact shared'
                        break
                    case "location":
                        body = 'Location shared'
                        break
                }
                notifee.displayNotification({
                    subtitle: (data?.group || data?.event)?.name,
                    body,
                    title: data?.user?.display_name,
                    data: { title, body, message: JSON.stringify(data) },
                    android: {
                        channelId: CHANNEL_NAME,
                        sound: 'default',
                        // category: AndroidCategory.ALARM,
                        defaults: [AndroidDefaults.ALL]
                    },
                    ios: {
                        sound: 'default',
                    }
                });
            }
        }
    }


}


export default FirebaseNotification