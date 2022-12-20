import { config } from 'api';
import { colors } from 'assets';
import { Text } from 'custom-components';
import { round, toNumber } from 'lodash';
import React, { Fragment, useCallback, useEffect, useReducer } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import CodePush from 'react-native-code-push';
import { Bar as ProgressBar } from 'react-native-progress';
import { scaler } from 'utils';
const { width } = Dimensions.get('screen')

const reducer = (state: { isDialogVisible: boolean, percent: number, status: string, message: string }, { type, payload }: { type: string, payload?: any }) => {
    switch (type) {
        case "SET_DIALOG_VISIBILITY":
            return { ...state, isDialogVisible: payload || false }
        case "SET_PERCENTAGE":
            return { ...state, ...payload }
        case "SET_MESSAGE":
            return { ...state, payload }
        default:
            return state
    }
}
export const useCodePushDialog = (time: number = 2000) => {

    useEffect(() => {
        !__DEV__ && setTimeout(() => {
            getCodePushUpdate()
        }, time);
    }, [time])


    const [{ isDialogVisible, status, percent, message }, dispatch] = useReducer(reducer, {
        isDialogVisible: false,
        percent: 0,
        status: "",
        message: "Downloading update"
    })


    const getCodePushUpdate = useCallback(() => {
        const isDev = config.APP_TYPE == 'dev'
        let codePushOptions = {
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
        // console.log("codePushOptions", codePushOptions);

        CodePush.sync(codePushOptions, (status) => {
            console.log("STATUS", status);
            switch (status) {
                case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                    console.log("Checking for updates.");
                    break;
                case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                    console.log("Downloading package.");
                    dispatch({ type: 'SET_MESSAGE', payload: "Downloading update" })
                    if (isDev)
                        dispatch({ type: 'SET_DIALOG_VISIBILITY', payload: true })
                    break;
                case CodePush.SyncStatus.INSTALLING_UPDATE:
                    console.log("Installing update.");
                    dispatch({
                        type: 'SET_MESSAGE', payload: "Installing update"
                    })
                    break;
                case CodePush.SyncStatus.UP_TO_DATE:
                    console.log("Up-to-date.");
                    dispatch({ type: 'SET_DIALOG_VISIBILITY' })
                    break;
                case CodePush.SyncStatus.UPDATE_INSTALLED: // Once package has been installed
                    // DO SOME MAGIC SHIT
                    console.log("UPDATE_INSTALLED");
                    dispatch({ type: 'SET_DIALOG_VISIBILITY' })
                    // Hide "downloading" modal
                    break;
            }
        }, ({ receivedBytes, totalBytes }) => {
            /* Update download modal progress */
            console.log(receivedBytes + "/" + totalBytes,);

            if (!isDev && !__DEV__) {
                return
            }

            const percent = round(receivedBytes / totalBytes * 100, 2) || 0
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

            const status = `${loaded} ${stringText} /${total} ${stringText}` || ''// (loaded+"/"+total+stringText)

            // console.log("percent", percent);
            // console.log("loaded", loaded);
            // console.log("total", total);
            // console.log("divider", divider);
            console.log("status", status);
            // console.log("stringText", stringText);

            dispatch({ type: 'SET_PERCENTAGE', payload: { percent, status } })

        });
    }, [])

    return isDialogVisible ? (<TouchableOpacity activeOpacity={1} style={styles.container} >
        <View style={styles.card} >
            <Text style={styles.updateText} >Update available</Text>
            <View style={styles.percentRow} >
                <Text style={styles.percentText} >{percent + "%"}</Text>
                <Text style={styles.statusText} >{status}</Text>
            </View>
            <ProgressBar
                width={width / 1.5}
                height={scaler(10)} animated
                indeterminateAnimationDuration={900}
                indeterminate={toNumber(percent) < 2 || toNumber(percent) == 100}
                useNativeDriver
                style={{ alignSelf: 'center', }}
                color={colors.colorPrimary}
                progress={toNumber(percent) / 100} />
            <View style={styles.messageView} >
                <Text style={styles.messageText} >{message}</Text>
            </View>
            <Text style={styles.lineText} >Please wait until we finish installing the available update. It won't take much time.</Text>
        </View>
    </TouchableOpacity>) : undefined
}

export const CodePushDialog = ({ time }: { time?: number }) => {
    const dialog = useCodePushDialog();
    return <Fragment>
        {dialog}
    </Fragment>
}

// const withUpdateDialog = (App: any, time?: number) => {
//     return (props: any) => {
//         const dialog = useCodePushDialog(time)
//         return (<>
//             <App {...props} />
//             {dialog}
//         </>)
//     }
// }

// export const CodePushWithUpdateDialog = (App: React.Component<any, any, any> | React.FC<any>, time?: number) => {
//     return CodePush({ checkFrequency: CodePush.CheckFrequency.MANUAL })(withUpdateDialog(App))
// }
// export default CodePush({ checkFrequency: CodePush.CheckFrequency.MANUAL })

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#00000080',
        flex: 1, position: 'absolute',
        justifyContent: 'flex-end',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    card: {
        alignContent: 'center', justifyContent: 'center',
        paddingVertical: scaler(15),
        backgroundColor: 'white',
        elevation: 5,
        marginHorizontal: scaler(5),
        borderTopLeftRadius: scaler(10),
        borderTopRightRadius: scaler(10)
    },
    updateText: {
        paddingBottom: scaler(10),
        fontWeight: '500', textAlign: 'center',
        color: 'black', fontSize: scaler(18)
    },
    percentRow: {
        alignSelf: 'center',
        alignItems: 'center', flexDirection: 'row',
        width: width / 1.5, paddingHorizontal: scaler(5),
        justifyContent: 'space-between'
    },
    percentText: {
        fontSize: scaler(12),
        fontWeight: '500', color: "#7D7F85",
        marginBottom: scaler(5)
    },
    statusText: {
        fontSize: scaler(12),
        fontWeight: '400',
        color: "#7D7F85", marginBottom: scaler(5)
    },
    messageView: {
        alignSelf: 'center',
        alignItems: 'center', flexDirection: 'row',
        width: width / 1.5, paddingHorizontal: scaler(5),
        justifyContent: 'center'
    },
    messageText: {
        fontSize: scaler(14),
        fontWeight: '500',
        color: 'black',
        marginTop: scaler(10)
    },
    lineText: {
        paddingVertical: scaler(15),
        paddingHorizontal: scaler(10),
        fontWeight: '500', textAlign: 'center',
        color: "#7D7F85", fontSize: scaler(12)
    }


})