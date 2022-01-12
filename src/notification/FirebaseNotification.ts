
// import PushNotification from "react-native-push-notification";
import notifee, { AndroidImportance } from "@notifee/react-native";
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
        const event_type = notification?.data?.eventType
        const event_id = notification?.data?.eventId
        if (event_type && event_id) {
            switch (event_type?.toLowerCase()) {
                case "appointment":
                case "appointment_cancel":
                case "appointment_reschedule":
                case "appointment_reminder":
                    NavigationService.push('BookingComplete', { appId: event_id, type: 'notification' })
                    break;
                case "treatment_instruction":
                    NavigationService.push("InstructionDetail", { id: event_id, type: 'notification' })
                    break;
                case "questionnaire":
                    NavigationService.push("PreAppointmentQuestionnaire", { id: event_id, type: 'notification' })
                    break;
                case 'appointment_questionnarie':
                    NavigationService.push("NewAppointmentQuestionnaire", { id: event_id, type: 'notification' })
                    break;
                case "anti_ectoparasite":
                case "deworming":
                    if (notification?.data?.body.includes("click here to book")) {
                        NavigationService.navigate("AppointmentsTab", {
                            screen: 'AddAppointment',
                            initial: false,
                        })
                        break;
                    }
                    NavigationService.push('DewormingRecord', { id: event_id, type: 'notification' })
                    break;
                case "invoice":
                    NavigationService.push('InvoiceDetails', { invoiceID: event_id, type: 'notification' })
                    break;
                case "vaccination":
                    if (notification?.data?.body.includes("click here to book")) {
                        NavigationService.navigate("AppointmentsTab", {
                            screen: 'AddAppointment',
                            initial: false,
                        })
                        break;
                    }
                    NavigationService.push('VaccinationRecord', { id: event_id, type: 'notification' })
                    break;
                case "feedback":
                    NavigationService.push("Feedback", { id: event_id, type: 'notification' })
                    break;
                case "visit":
                    NavigationService.push("TreatmentRecord", { pet_visit_id: event_id, type: 'notification' })
                    break;
                case "article":
                    NavigationService.push("Article", { id: event_id, type: 'notification' })
                    break;
                default:
                    break;
            }
        }
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
    const { title, body } = message?.data ?? {};
    notifee.displayNotification({
        title, body, data: message?.data,
        android: {
            channelId: CHANNEL_NAME,
        },
        ios: {
            sound: 'default',
        }

    });
}

messaging().setBackgroundMessageHandler(onMessageReceived);


export default FirebaseNotification