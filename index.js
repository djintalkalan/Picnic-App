/**
 * @format
 */

// Polyfills required to use Intl with Hermes engine
import '@formatjs/intl-getcanonicallocales/polyfill';

import '@formatjs/intl-locale/polyfill';

import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/es';

import '@formatjs/intl-numberformat/polyfill';
import '@formatjs/intl-numberformat/locale-data/en'
import '@formatjs/intl-numberformat/locale-data/es'

import '@formatjs/intl-datetimeformat/polyfill'
import '@formatjs/intl-datetimeformat/locale-data/en' // locale-data for en
import '@formatjs/intl-datetimeformat/locale-data/es' // locale-data for en
import '@formatjs/intl-datetimeformat/add-all-tz' // Add ALL tz data

import notifee, { EventType } from "@notifee/react-native";
import messaging from '@react-native-firebase/messaging';
import React from 'react';
import { AppRegistry } from 'react-native';
import 'react-native-gesture-handler';
import "react-native-get-random-values";
import invokeApp from 'react-native-invoke-app';
import "react-native-url-polyfill/auto";
import App from 'src/App';
import { onMessageReceived, onNotificationOpened } from 'src/notification/FirebaseNotification';
import { name as appName } from './app.json';
import './ReactotronConfig';

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