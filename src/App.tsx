import { config, _getAppVersion } from 'api';
import { persistor, store } from 'app-store/store';
import { colors, Images } from 'assets';
import { Loader, Text } from 'custom-components';
import { LocationServiceProvider } from 'custom-components/LocationService';
import { VideoProvider } from 'custom-components/VideoProvider';
import React, { FC, useCallback, useEffect } from 'react';
import { Alert, Dimensions, Image, Linking, LogBox, Platform, StatusBar, StyleSheet, View } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import RNExitApp from 'react-native-exit-app';
import FastImage from 'react-native-fast-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Semver from 'semver';
import { scaler } from 'utils';
import { CodePushDialog } from './codepush/CodePush';
import Database, { useOtherValues } from './database/Database';
import Language from './language/Language';
import MyNavigationContainer from './routes/MyNavigationContainer';
global.Buffer = require('buffer').Buffer;

if (__DEV__) {
    FastImage.clearMemoryCache()
    FastImage.clearDiskCache()
}
LogBox.ignoreAllLogs();
const { height, width } = Dimensions.get('screen')
Database.setOtherBool("showGif", true)
const App: FC = () => {

    const [showGif, setGif] = useOtherValues<boolean>("showGif", true);


    const getVersion = useCallback(() => {
        if (config.APP_TYPE != 'production') {
            setTimeout(() => {
                setGif(false)
            }, __DEV__ ? 0 : 3000);
            return
        }
        _getAppVersion().then((res: any) => {
            if (res && res?.status == 200) {
                let serverVersion = res?.data?.[Platform.OS]
                const currentVersion = (config.APP_VERSION)
                let isUpdateAvailable = Semver.compare(serverVersion, currentVersion)
                let forceUpdate = true
                if (isUpdateAvailable && res?.data?.versions) {
                    res?.data?.versions?.[Platform.OS].some(({ version, force_update, text }: any) => {
                        if (version == currentVersion) {
                            forceUpdate = force_update == 1 ? true : false
                            return true
                        }
                    })
                }
                // console.log("currentVersion", currentVersion);
                console.log("isUpdateAvailable", isUpdateAvailable);
                if (isUpdateAvailable == 1) {
                    setTimeout(() => {
                        setGif(false)
                        const buttons = []
                        if (!forceUpdate) {
                            buttons.push({
                                text: Language.close, onPress: () => {

                                }
                            })
                        }
                        buttons.push(
                            {
                                text: Language.update, onPress: () => {
                                    if (Platform.OS == 'android')
                                        Linking.openURL("https://play.google.com/store/apps/details?id=" + config.BUNDLE_ID_PACKAGE_NAME?.replace('dev', 'app'))
                                    else
                                        Linking.openURL('itms-apps://apps.apple.com/app/picnic-groups/id1561013758')
                                    setTimeout(() => {
                                        RNExitApp?.exitApp();
                                    }, 200)
                                }
                            }
                        )

                        Alert.alert(Language.update_available, forceUpdate ? Language.must_update_app : Language.we_recommend_you_to_update, buttons, { cancelable: !forceUpdate })
                    }, __DEV__ ? 0 : 3000);
                    return
                }
            }
            setTimeout(() => {
                setGif(false)
            }, __DEV__ ? 0 : 3000);
        }).catch((e: Error) => {
            console.log("error", e);
            if (e?.message?.includes("Network Error")) {
                setTimeout(() => {
                    getVersion()
                }, 7000);
                // Alert.alert(Language.connection_error, Language.internet_connection_seems_not, [
                //     {
                //         text: Language.try_again, onPress: () => {
                //             getVersion()
                //         }
                //     }
                // ], {
                //     cancelable: false
                // }
                // )
                return
            }
            setTimeout(() => {
                setGif(false)
            }, __DEV__ ? 0 : 3000);
        })
    }, [])

    useEffect(() => {
        RNBootSplash.hide({ fade: true });
        getVersion();
        setTimeout(() => {
            // setGif(false)
        }, 3200);
        Database.setMultipleValues({
            // selectedLocation: null,
            // currentLocation: null,
            // recentSearches: null
        })

    }, [])


    return (
        <GestureHandlerRootView style={styles.container} >
            {config.APP_TYPE != 'production' &&
                //@ts-ignore
                <View style={[styles[Platform.OS], styles[config.APP_TYPE]]} >
                    {/*@ts-ignore*/}
                    <Text style={styles[Platform.OS + 'Text']} >{config.APP_TYPE?.toUpperCase()}</Text>
                </View>
            }
            <LocationServiceProvider>
                <VideoProvider>
                    <Provider store={store}>
                        <PersistGate persistor={persistor}>
                            <MyNavigationContainer />
                            <Loader />
                        </PersistGate>
                    </Provider>
                </VideoProvider>
            </LocationServiceProvider>
            {showGif ? <View style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "#fbfbfb" }} >
                <StatusBar backgroundColor={"#fbfbfb"} />
                <Image style={{ height, width: width * 1.5, alignSelf: 'center', resizeMode: 'center' }} source={Images.ic_logo_gif} />
            </View> : null}
            <CodePushDialog time={0} />
        </GestureHandlerRootView>
    )
}

export default App

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.colorWhite },
    android: {
        position: 'absolute',
        width: scaler(100),
        left: -scaler(35),
        bottom: -scaler(5),
        paddingHorizontal: scaler(10),
        paddingBottom: scaler(12),
        paddingTop: scaler(3),
        transform: [{ rotate: '45deg' }],
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    ios: {
        position: 'absolute',
        width: scaler(100),
        left: -scaler(30),
        top: scaler(10),
        paddingHorizontal: scaler(10),
        paddingVertical: scaler(5),
        transform: [{ rotate: '-45deg' }],
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    dev: {
        backgroundColor: 'orange',
    },
    beta: {
        backgroundColor: 'red',
    },
    iosText: {
        fontWeight: '600',
        color: 'white',
        fontSize: scaler(14)
    },
    androidText: {
        fontWeight: '200',
        color: 'white',
        fontSize: scaler(10)
    }
})
