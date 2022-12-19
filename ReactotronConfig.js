import { NativeModules } from 'react-native';
import Reactotron from 'reactotron-react-native';
import { config } from 'src/api/config';

if (__DEV__) {
    if (config.TERMINAL_CONSOLES) {
        var originalLog = console.log
        var originalWarn = console.warn
        var originalError = console.error
    } else {
        console.log = function () { }
        console.error = console.log
        console.warn = console.log
    }

    if (config.REACTOTRON_CONSOLES) {
        const scriptHostname = NativeModules?.SourceCode?.scriptURL?.split('://')[1].split(':')[0];
        setTimeout(() => {
            console.log("Reactotron configured at IP: " + scriptHostname);
        }, 0);
        Reactotron
            //   .setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
            .configure({ host: scriptHostname }) // controls connection & communication settings
            .useReactNative() // add all built-in react native plugins
            .connect() // let's connect!
        if (config.TERMINAL_CONSOLES) {
            console.log = (message, ...optionalParams) => {
                originalLog(message, ...optionalParams);
                Reactotron.log(message, ...optionalParams)
            }
            console.warn = (message, ...optionalParams) => {
                originalWarn(message, ...optionalParams);
                Reactotron.warn(message, ...optionalParams)
            }
            console.error = (message, ...optionalParams) => {
                originalError(message, ...optionalParams);
                Reactotron.error(message, ...optionalParams)
            }
        } else {
            console.log = Reactotron.log
            console.error = Reactotron.error
            console.warn = Reactotron.warn
        }
    }
}

