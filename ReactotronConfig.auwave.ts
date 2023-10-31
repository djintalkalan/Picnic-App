import { NativeModules } from 'react-native';
import { config } from 'src/api/config';

let Reactotron: any

// if (__DEV__) {
//     Reactotron = require('reactotron-react-native').default;
//     if (config.TERMINAL_CONSOLES) {
//         var originalLog = console.log
//         var originalWarn = console.warn
//         var originalError = console.error
//     } else {
//         console.log = function () { }
//         console.error = console.log
//         console.warn = console.log
//     }

//     if (config.REACTOTRON_CONSOLES) {
//         const scriptHostname = NativeModules?.SourceCode?.scriptURL?.split('://')[1].split(':')[0];
//         setTimeout(() => {
//             console.log("Reactotron configured at IP: " + scriptHostname);
//         }, 0);

//         const reactotronConfig = Reactotron
//             //   .setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
//             .configure({ host: scriptHostname }) // controls connection & communication settings
//         if (config.DEBUG_REDUX) {

//             const { reactotronRedux } = require('reactotron-redux');
//             const sagaPlugin = require('reactotron-redux-saga');
//             reactotronConfig.use(sagaPlugin())
//             reactotronConfig.use(reactotronRedux())
//         }
//         reactotronConfig.useReactNative({
//             asyncStorage: false, // there are more options to the async storage.
//             networking: {
//                 // optionally, you can turn it off with false.
//                 ignoreUrls: /symbolicate/,
//             },
//             editor: false, // there are more options to editor
//             overlay: false
//         }) // add all built-in react native plugins
//         reactotronConfig.connect()


//         if (config.TERMINAL_CONSOLES) {
//             console.log = (message, ...optionalParams) => {
//                 originalLog(message, ...optionalParams);
//                 Reactotron.log(message, ...optionalParams)
//             }
//             console.warn = (message, ...optionalParams) => {
//                 originalWarn(message, ...optionalParams);
//                 Reactotron.warn(message, ...optionalParams)
//             }
//             console.error = (message, ...optionalParams) => {
//                 originalError(message, ...optionalParams);
//                 Reactotron.error(message, ...optionalParams)
//             }
//         } else {
//             console.log = Reactotron.log
//             console.error = Reactotron.error
//             console.warn = Reactotron.warn
//         }
//     }
// } else {
//     console.log = () => { }
//     console.error = console.log
//     console.warn = console.log
// }

export default Reactotron