import { config, _getAppVersion } from 'api';
import { persistor, store } from 'app-store/store';
import { colors, Images } from 'assets';
import { Loader, Text } from 'custom-components';
import { LocationServiceProvider } from 'custom-components/LocationService';
import { VideoProvider } from 'custom-components/VideoProvider';
import { round, toNumber } from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Linking, LogBox, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import CodePush, { SyncOptions } from 'react-native-code-push';
import RNExitApp from 'react-native-exit-app';
import FastImage from 'react-native-fast-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Semver from 'semver';
import { scaler } from 'utils';
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
    const [showUpdateDialog, setShowUpdateDialog] = useState<boolean>(false);

    const getVersion = useCallback(() => {
        if (config.APP_TYPE != 'production') {
            setTimeout(() => {
                setGif(false)
            }, __DEV__ ? 0 : 3000);
            return
        }
        _getAppVersion().then((res: any) => {
            if (res && res.status == 200) {
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

    const [{ status, percent, message }, setProgress] = useState<any>({
        percent: 0, status: "", message: Language?.downloading_update
    });

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

        !__DEV__ && getCodePushUpdate()

    }, [])

    const getCodePushUpdate = useCallback(() => {
        const isDev = config.APP_TYPE == 'dev' || __DEV__
        let codePushOptions: SyncOptions = {
            deploymentKey: config.CODEPUSH_DEPLOY_KEY,
            // installMode: isDev ? CodePush.InstallMode.IMMEDIATE : CodePush.InstallMode.ON_NEXT_SUSPEND,
            // mandatoryInstallMode: isDev ? CodePush.InstallMode.IMMEDIATE : CodePush.InstallMode.ON_NEXT_SUSPEND,
            installMode: CodePush.InstallMode.IMMEDIATE,
            mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
            rollbackRetryOptions: {
                delayInHours: 0.016,
                maxRetryAttempts: 10000,
            }
            // updateDialog: {
            //     title: "An update is available!",
            // },
        }

        CodePush.sync(codePushOptions, (status) => {
            console.log("STATUS", status);
            switch (status) {
                case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                    console.log("Checking for updates.");
                    break;
                case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                    console.log("Downloading package.");
                    setProgress((_: any) => ({
                        ..._,
                        message: Language.downloading_update,
                    }))
                    if (isDev)
                        setShowUpdateDialog(true)
                    break;
                case CodePush.SyncStatus.INSTALLING_UPDATE:
                    console.log("Installing update.");
                    setProgress((_: any) => ({
                        ..._,
                        message: Language.installing_update,
                    }))
                    break;
                case CodePush.SyncStatus.UP_TO_DATE:
                    console.log("Up-to-date.");
                    setShowUpdateDialog(false)
                    break;
                case CodePush.SyncStatus.UPDATE_INSTALLED: // Once package has been installed
                    // DO SOME MAGIC SHIT
                    console.log("UPDATE_INSTALLED");
                    setShowUpdateDialog(false)
                    // Hide "downloading" modal
                    break;
            }
        }, ({ receivedBytes, totalBytes }) => {
            /* Update download modal progress */
            console.log(receivedBytes + "/" + totalBytes,);

            const percent = round(receivedBytes / totalBytes * 100, 2)
            let stringText = "Byte"
            let divider = 1
            if (totalBytes >= 1000000000) {
                stringText = "Gb"
                divider = 1000000000
            } else if (totalBytes >= 1000000) {
                stringText = "Mb"
                divider = 1000000
            } else if (totalBytes >= 1000) {
                stringText = "Kb"
                divider = 1000
            }

            const loaded = round((receivedBytes / divider), 2)
            const total = round((totalBytes / divider), 2)

            const status = `${loaded} ${stringText} /${total} ${stringText}`// (loaded+"/"+total+stringText)

            // console.log("percent", percent);
            // console.log("loaded", loaded);
            // console.log("total", total);
            // console.log("divider", divider);
            console.log("status", status);
            // console.log("stringText", stringText);

            setProgress((_: any) => ({
                ..._,
                percent: percent || 0,
                status: status || "",
            }))

        });
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

            {showUpdateDialog ? <TouchableOpacity activeOpacity={1} style={{ backgroundColor: '#00000080', flex: 1, position: 'absolute', justifyContent: 'flex-end', top: 0, bottom: 0, left: 0, right: 0, }} >
                <View style={{ alignContent: 'center', justifyContent: 'center', paddingVertical: scaler(15), backgroundColor: colors.colorWhite, elevation: 5, marginHorizontal: scaler(5), borderTopLeftRadius: scaler(10), borderTopRightRadius: scaler(10) }} >
                    <Text style={{ paddingBottom: scaler(10), fontWeight: '500', textAlign: 'center', color: colors.colorBlackText, fontSize: scaler(18) }} >{Language.update_available}</Text>
                    <View style={{ alignSelf: 'center', alignItems: 'center', flexDirection: 'row', width: width / 1.5, paddingHorizontal: scaler(5), justifyContent: 'space-between' }} >
                        <Text style={{ fontSize: scaler(12), fontWeight: '500', color: colors.colorPlaceholder, marginBottom: scaler(5) }} >{percent + "%"}</Text>
                        <Text style={{ fontSize: scaler(12), fontWeight: '400', color: colors.colorPlaceholder, marginBottom: scaler(5) }} >{status}</Text>
                    </View>

                    <Progress.Bar width={width / 1.5} height={scaler(10)} animated
                        indeterminateAnimationDuration={900}
                        indeterminate={toNumber(percent) < 2 || toNumber(percent) == 100}
                        useNativeDriver
                        style={{ alignSelf: 'center', }}
                        color={colors.colorPrimary}
                        progress={toNumber(percent) / 100} />
                    <View style={{ alignSelf: 'center', alignItems: 'center', flexDirection: 'row', width: width / 1.5, paddingHorizontal: scaler(5), justifyContent: 'center' }} >
                        <Text style={{ fontSize: scaler(14), fontWeight: '500', color: colors.colorBlackText, marginTop: scaler(10) }} >{message}</Text>
                    </View>

                    <Text style={{ paddingVertical: scaler(15), fontWeight: '500', textAlign: 'center', color: colors.colorPlaceholder, fontSize: scaler(12) }} >{Language.please_wait_to_update}</Text>

                </View>


            </TouchableOpacity> : null}

        </GestureHandlerRootView>
    )
}




export default CodePush({ checkFrequency: CodePush.CheckFrequency.MANUAL })(App)

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
