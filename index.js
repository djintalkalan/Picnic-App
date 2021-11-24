/**
 * @format
 */

import { AppRegistry } from 'react-native';
import 'react-native-gesture-handler';
import Reactotron from 'reactotron-react-native';
import { config } from 'src/api/config';
import App from 'src/App';
import { name as appName } from './app.json';
if (__DEV__ && JSON.parse(config.REACTOTRON_STATUS)) {
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
