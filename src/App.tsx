import { config, _getAppVersion } from 'api';
import { persistor, store } from 'app-store/store';
import { colors, Images } from 'assets';
import { Loader } from 'custom-components';
import { LocationServiceProvider } from 'custom-components/LocationService';
import { VideoProvider } from 'custom-components/VideoProvider';
import React, { FC, useCallback, useEffect } from 'react';
import { Alert, Dimensions, Image, Linking, LogBox, Platform, StyleSheet, View } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import FastImage from 'react-native-fast-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Semver from 'semver';
import Database, { useOtherValues } from './database/Database';
import Language from './language/Language';
import MyNavigationContainer from './routes/MyNavigationContainer';


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
        _getAppVersion().then((res: any) => {
            if (res && res.status == 200) {
                const serverVersion = res?.data?.[Platform.OS]
                const currentVersion = "0" ?? (Platform.OS == 'ios' ? config.APP_STORE_VERSION : config.ANDROID_VERSION_NAME)
                const isUpdateAvailable = Semver.compare(serverVersion, currentVersion)
                // console.log("currentVersion", currentVersion);
                console.log("isUpdateAvailable", isUpdateAvailable);
                if (isUpdateAvailable == 1) {
                    setTimeout(() => {
                        setGif(false)
                        Alert.alert(Language.update_available, Language.must_update_app, [
                            {
                                text: Language.update, onPress: () => {
                                    Platform.OS == 'android' ?
                                        Linking.openURL("http://play.google.com/store/apps/details?id=" + config.PACKAGE_NAME?.replace('test', 'app'))
                                        :
                                        Linking.openURL('itms-apps://apps.apple.com/us/app/picnic-groups/id1561013758')
                                    // RNExitApp?.exitApp();
                                }
                            }
                        ], {
                            cancelable: false
                        }
                        )
                    }, 3000);
                    return
                }
            }
            setTimeout(() => {
                setGif(false)
            }, 3000);
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
            }, 3000);
        })
    }, [])

    useEffect(() => {
        RNBootSplash.hide();
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
                <Image style={{ height, width: width * 1.5, alignSelf: 'center', resizeMode: 'center' }} source={Images.ic_logo_gif} />
            </View> : null}
        </GestureHandlerRootView>
    )
}


export default (App)

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.colorWhite }
})
