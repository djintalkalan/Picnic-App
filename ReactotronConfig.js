import Reactotron from 'reactotron-react-native';
import { config } from 'src/api/config';

if (__DEV__ && config.REACTOTRON_STATUS) {
    Reactotron
        //   .setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
        .configure() // controls connection & communication settings
        .useReactNative() // add all built-in react native plugins
        .connect() // let's connect!

    const originalLog = console.log
    console.log = (message, ...optionalParams) => {
        originalLog(message, ...optionalParams);
        Reactotron.log(message, ...optionalParams)
    }

    const originalWarn = console.warn
    console.warn = (message, ...optionalParams) => {
        originalWarn(message, ...optionalParams);
        Reactotron.warn(message, ...optionalParams)
    }

    const originalError = console.error
    console.error = (message, ...optionalParams) => {
        originalError(message, ...optionalParams);
        Reactotron.error(message, ...optionalParams)
    }
    console.log('Reactotron Configured');
} else {
    console.log('Running without Reactotron');
}

