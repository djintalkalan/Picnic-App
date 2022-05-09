/**
 * @format
 */
import Intercom from '@intercom/intercom-react-native';
import notifee, { EventType } from "@notifee/react-native";
import analytics, { firebase } from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';
import React from 'react';
import { AppRegistry } from 'react-native';
import 'react-native-gesture-handler';
import invokeApp from 'react-native-invoke-app';
import { config } from 'src/api/config';
import App from 'src/App';
import { onMessageReceived, onNotificationOpened } from 'src/notification/FirebaseNotification';
import { name as appName } from './app.json';
import './ReactotronConfig';
Intercom.setInAppMessageVisibility("GONE")

// if (!__DEV__) {
firebase.analytics().setAnalyticsCollectionEnabled(true).then(() => {
    console.log("Firebase Analytics Enabled");
});

analytics().getAppInstanceId().then((id) => {
    console.log("Instance Id is ", id)
});
// }

console.log("config.REACTOTRON_STATUS", config.REACTOTRON_STATUS)


notifee.onBackgroundEvent(async ({ type, detail }) => {
    switch (type) {
        case EventType.PRESS:
            invokeApp();
            detail?.notification && onNotificationOpened(detail?.notification)
            break;
    }
});

messaging().setBackgroundMessageHandler(async (m) => await onMessageReceived(m, true));


const HeadlessCheck = ({ isHeadless }) => {

    if (isHeadless) {
        // App has been launched in the background by iOS, ignore
        return null;
    }

    return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);