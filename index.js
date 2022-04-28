/**
 * @format
 */
import Intercom from '@intercom/intercom-react-native';
import notifee, { EventType } from "@notifee/react-native";
import messaging from '@react-native-firebase/messaging';
import React from 'react';
import { AppRegistry } from 'react-native';
import 'react-native-gesture-handler';
import invokeApp from 'react-native-invoke-app';
import Reactotron from 'reactotron-react-native';
import { config } from 'src/api/config';
import App from 'src/App';
import { onMessageReceived, onNotificationOpened } from 'src/notification/FirebaseNotification';
import { name as appName } from './app.json';

Intercom.setInAppMessageVisibility("GONE")


console.log("config.REACTOTRON_STATUS", config.REACTOTRON_STATUS)
if (__DEV__ && config.REACTOTRON_STATUS == true) {
    import('./ReactotronConfig').then(() => {
        console.log = Reactotron.log
        console.warn = Reactotron.warn
        console.error = Reactotron.error
        console.log('Reactotron Configured');
    })
} else {
    console.log('Running without Reactotron');
}

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