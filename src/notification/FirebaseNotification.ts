
// import PushNotification from "react-native-push-notification";
import notifee, { AndroidDefaults, AndroidImportance } from "@notifee/react-native";
import messaging from '@react-native-firebase/messaging';
import Database, { useDatabase } from 'database/Database';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { NavigationService, WaitTill } from 'utils';

const CHANNEL_NAME = "high-priority"

// PushNotification.configure({onNotification:})
// PushNotification.createChannel({ channelName: CHANNEL_NAME, playSound: true, vibrate: true, channelId: CHANNEL_NAME }, (b) => {
// })

notifee.createChannel({
    id: CHANNEL_NAME,
    name: CHANNEL_NAME,
    lights: false,
    vibration: true,
    sound: 'default',
    importance: AndroidImportance.HIGH,
})

const FirebaseNotification = () => {
    const isFirstTime = useRef(true)
    const [isLogin] = useDatabase<boolean>("isLogin");
    const [firebaseToken, setFirebaseToken] = useDatabase<string>('firebaseToken');

    const dispatch = useDispatch()

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
        return messaging().onMessage(onMessageReceived);
    }, [isLogin])

    useEffect(() => {
        checkPermission();
        const removeSubscription = createNotificationListeners()
        // PushNotification.configure({ onNotification: onNotificationOpened })
        setTimeout(() => {
            isFirstTime.current = false
        }, 1500);
        return () => {
            // if (removeSubscription) {
            removeSubscription()
            // }
            // PushNotification.unregister()
        }
    }, [isLogin])

    const onNotificationOpened = useCallback((notification) => {
        console.log("PushNotification OPen Received:", notification, "isLogin : ", isLogin);
        if (!isLogin) return
        navigateToPages(notification)
    }, [isLogin])

    const navigateToPages = async (notification: any) => {
        console.log(isFirstTime.current)
        if (isFirstTime.current) {
            await WaitTill(1500)
        }
        //    
    }

}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key: any, value: any) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};



export const onMessageReceived = async (message: any) => {
    console.log("message", message)
    const isLogin = Database.getStoredValue("isLogin");
    if (isLogin) {
        showNotification(message)
    }
}

const showNotification = (message: any) => {
    let { title, body, message: data } = message?.data ?? {};
    if (data) {
        if (typeof data == 'string') {
            data = JSON.parse(data)
        }
        console.log("data is ", data);

        if (data?.group || data?.event) {
            const { name, params } = NavigationService?.getCurrentScreen() ?? {}
            if ((data?.group && (name == "GroupChatScreen" || name == "Chats" || name == "UpcomingEventsChat")) ||
                (data?.event && name == "EventChats")
                && params?.id == data?.resource_id
            ) {

            } else {
                notifee.displayNotification({
                    subtitle: (data?.group || data?.event)?.name,
                    body: data?.message,
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

messaging().setBackgroundMessageHandler(onMessageReceived);


export default FirebaseNotification