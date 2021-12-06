/**
 * @format
 */

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

AppRegistry.registerComponent(appName, () => App);
