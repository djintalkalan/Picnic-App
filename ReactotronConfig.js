import Reactotron from 'reactotron-react-native';
import { config } from 'src/api/config';

if (__DEV__ && config.REACTOTRON_STATUS) {
    Reactotron
        //   .setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
        .configure() // controls connection & communication settings
        .useReactNative() // add all built-in react native plugins
        .connect() // let's connect!
    console.log = Reactotron.log
    console.warn = Reactotron.warn
    console.error = Reactotron.error
    console.log('Reactotron Configured');
} else {
    console.log('Running without Reactotron');
}

