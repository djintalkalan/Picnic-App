/**
 * @format
 */

import messaging from '@react-native-firebase/messaging';
import React from 'react';
import { AppRegistry } from 'react-native';
import 'react-native-gesture-handler';
import Reactotron from 'reactotron-react-native';
import { config } from 'src/api/config';
import App from 'src/App';
import { name as appName } from './app.json';

console.log("config.REACTOTRON_STATUS", config.REACTOTRON_STATUS)
if (__DEV__ && config.REACTOTRON_STATUS == 'true') {
    import('./ReactotronConfig').then(() => {
        console.log = Reactotron.log
        console.warn = Reactotron.warn
        console.error = Reactotron.error
        console.log('Reactotron Configured');
    })
} else {
    console.log('Running without Reactotron');
}

messaging().setBackgroundMessageHandler(async (remoteMessage) => {

    // if (Database.getStoredValue('isLogin')) {
    console.log("Background notifications", remoteMessage);
    // ToastAndroid.show("Background notifications", ToastAndroid.LONG)
});

const HeadlessCheck = ({ isHeadless }) => {

    if (isHeadless) {
        // App has been launched in the background by iOS, ignore
        return null;
    }

    return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);