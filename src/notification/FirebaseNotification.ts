
// import PushNotification from "react-native-push-notification";
import notifee, { AndroidColor, AndroidDefaults, AndroidGroupAlertBehavior, AndroidImportance, AndroidLaunchActivityFlag, EventType, Notification } from "@notifee/react-native";
import dynamicLinks, { FirebaseDynamicLinksTypes } from '@react-native-firebase/dynamic-links';
import messaging from '@react-native-firebase/messaging';
import { config } from "api";
import { store } from "app-store";
import { setActiveEvent, setActiveGroup } from "app-store/actions";
import Database, { useDatabase } from 'database';
import IntercomService from "intercom";
import { Dispatch, useCallback, useEffect } from 'react';
import { Platform } from "react-native";
import { useDispatch } from 'react-redux';
import { getDetailsFromDynamicUrl, getDisplayName, NavigationService, WaitTill } from 'utils';

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

export const useFirebaseNotifications = () => {
    const [isLogin] = useDatabase<boolean>("isLogin");

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
                Database.setFirebaseToken(token)
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
    console.log("isFirstTime", isFirstTime);

    if (isFirstTime) {
        await WaitTill(1500)
    }
    let { message: data } = notification?.data ?? {};
    if (data) {
        if (typeof data == 'string') {
            data = JSON.parse(data)
        }
        console.log("data is ", data);

        if (data?.receiver == 'intercom_sdk') {
            setTimeout(() => {
                IntercomService.openMessenger()
            }, 50);
            return
        }

        if (data?.group || data?.event) {
            dispatch && dispatch((data?.group ? setActiveGroup : setActiveEvent)(data?.group ?? data?.event))
            NavigationService.closeAndPush(data?.group ? "GroupChatScreen" : "EventChats", { id: data?.resource_id })
        }

        if (data?.chat_room_id) {
            const user = data?.users?.[data?.users?.[0]?._id == data?.user_id ? 0 : 1]
            NavigationService.closeAndPush("PersonChat", { person: user, chatRoomId: data?.chat_room_id })
        }
    }
}

const handleLink = async (link: FirebaseDynamicLinksTypes.DynamicLink | null) => {
    await WaitTill(600)
    console.log("Link is ", link);
    // console.log("Base Url is ", config.BASE_URL);
    if (link && link.url && link.url?.includes(config.BASE_URL)) {
        const { id, type } = getDetailsFromDynamicUrl(link.url)
        if (id && type) {
            // console.log("DetailsFromDynamicUrl", id, type);
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
    if (message?.data?.receiver == 'intercom_sdk') {
        showIntercomNotification(message?.data)
        return
    }
    const isLogin = Database.getStoredValue("isLogin");
    if (isLogin) {
        showNotification(message, isBackground)
    }
}

const showIntercomNotification = (data: any) => {
    console.log("Showing Intercom Notification", data);

    const { app_name, body, conversation_id, avatar_color, message, conversation_part_id, image_url } = data ?? {}
    notifee.displayNotification({
        body,
        title: "Picnic Support",
        data: { title: "Picnic Support", body, message: JSON.stringify(data) },
        android: {
            channelId: CHANNEL_NAME,
            sound: 'default',
            // category: AndroidCategory.ALARM,
            defaults: [AndroidDefaults.ALL],
            color: AndroidColor.WHITE,
            smallIcon: 'ic_stat_ic_notification',
            pressAction: {
                id: 'default',
                launchActivity: 'default',
                launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
            },
        },
        ios: {
            sound: 'default',
        }
    });
}

const showNotification = async (message: any, isBackground: boolean) => {
    let { title, body, message: data } = message?.data ?? {};
    if (data) {
        if (typeof data == 'string') {
            data = JSON.parse(data)
        }
        console.log("data is ", data);

        if (data?.chat_room_id) {
            const { name, params } = NavigationService?.getCurrentScreen() ?? {}
            if (!isBackground && (name == "PersonChat") && (params?.person?._id == data?.user_id)
            ) {

            } else {
                let body = data?.text
                switch (data?.message_type) {
                    case "image":
                        body = 'Image message arrived'
                        break
                    case "video":
                        body = 'Video message arrived'
                        break
                    case "contact":
                        body = 'Contact shared'
                        break
                    case "location":
                        body = 'Location shared'
                        break
                }
                const user = data?.users?.[data?.users?.[0]?._id == data?.user_id ? 0 : 1]
                if (Platform.OS == 'android')
                    await notifee.displayNotification({
                        id: data?.chat_room_id,
                        title: getDisplayName(user),
                        android: {
                            channelId: CHANNEL_NAME,
                            groupSummary: true,
                            groupId: data?.chat_room_id,
                            groupAlertBehavior: AndroidGroupAlertBehavior.CHILDREN,
                            color: AndroidColor.WHITE,
                            smallIcon: 'ic_stat_ic_notification',
                            pressAction: {
                                id: 'default',
                                launchActivity: 'default',
                                launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
                            },
                        },
                    });

                notifee.displayNotification({
                    // subtitle:getDisplayName(user),
                    body,
                    title: getDisplayName(user),
                    data: { title, body, message: JSON.stringify(data) },
                    android: {
                        channelId: CHANNEL_NAME,
                        sound: 'default',
                        // category: AndroidCategory.ALARM,
                        defaults: [AndroidDefaults.ALL],
                        groupId: data?.chat_room_id,
                        groupAlertBehavior: AndroidGroupAlertBehavior.CHILDREN,
                        color: AndroidColor.WHITE,
                        smallIcon: 'ic_stat_ic_notification',
                        pressAction: {
                            id: 'default',
                            launchActivity: 'default',
                            launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
                        },
                    },
                    ios: {
                        sound: 'default',
                    }
                });
            }
        }

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
                if (Platform.OS == 'android')
                    await notifee.displayNotification({
                        id: (data?.group || data?.event)?._id,
                        title: data?.user?.display_name,
                        subtitle: (data?.group || data?.event)?.name,
                        android: {
                            channelId: CHANNEL_NAME,
                            groupSummary: true,
                            groupId: (data?.group || data?.event)?._id,
                            groupAlertBehavior: AndroidGroupAlertBehavior.CHILDREN,
                            color: AndroidColor.WHITE,
                            smallIcon: 'ic_stat_ic_notification',
                            pressAction: {
                                id: 'default',
                                launchActivity: 'default',
                                launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
                            },
                        },
                    });

                notifee.displayNotification({
                    subtitle: (data?.group || data?.event)?.name,
                    body,
                    title: data?.user?.display_name,
                    data: { title, body, message: JSON.stringify(data) },
                    android: {
                        channelId: CHANNEL_NAME,
                        sound: 'default',
                        // category: AndroidCategory.ALARM,
                        defaults: [AndroidDefaults.ALL],
                        groupId: (data?.group || data?.event)?._id,
                        groupAlertBehavior: AndroidGroupAlertBehavior.CHILDREN,
                        color: AndroidColor.WHITE,
                        smallIcon: 'ic_stat_ic_notification',
                        pressAction: {
                            id: 'default',
                            launchActivity: 'default',
                            launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
                        },
                    },
                    ios: {
                        sound: 'default',
                    }
                });
            }
        }
    }


}