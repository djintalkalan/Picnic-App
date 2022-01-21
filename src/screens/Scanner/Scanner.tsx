import { useFocusEffect } from '@react-navigation/native'
import { verifyQrCode } from 'app-store/actions'
import { useStatusBar } from 'custom-components'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, InteractionManager, StyleSheet } from 'react-native'
import { RNCamera } from 'react-native-camera'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import { NavigationService, _showWarningMessage } from 'utils'
import ScannerUi from './ScannerUi'
const { height, width } = Dimensions.get('screen')

const Scanner: FC<any> = (props) => {
    const scannerRef = useRef<QRCodeScanner>(null)
    const dispatch = useDispatch()

    const onRead = useCallback((e) => {
        console.log("Event", JSON.stringify(e.data));
        scannerRef.current?.disable()
        setQrScanning(false)
        if (e.data && e.data?.startsWith("picnic-groups")) {
            // setTimeout(() => {
            //     scannerRef.current?.enable()
            // }, 1000);
            const code = e.data?.replace("picnic-groups", "")
            dispatch(verifyQrCode({
                data: {
                    resource_id: props?.route?.params?.id,
                    ticket_id: code
                },
                onSuccess: (b: boolean) => {
                    if (b) {
                        NavigationService.navigate("CheckedIn")
                    } else {
                        setTimeout(() => {
                            scannerRef.current?.enable()
                            setQrScanning(true)
                        }, 2500);
                    }
                }
            }))
        } else {
            _showWarningMessage("Invalid QR Code")
            setTimeout(() => {
                scannerRef.current?.enable()
                setQrScanning(true)
            }, 3000);
        }
    }, [])



    const [isQrScanning, setQrScanning] = useState(false)
    const [isCameraShow, setCameraShow] = useState(false)

    useEffect(() => {
        InteractionManager.runAfterInteractions(async () => {
            setQrScanning(true)
            setTimeout(() => {
                setCameraShow(true)
            }, 200);
        })
    }, [])

    const { popStatusBarStyle, pushStatusBarStyle } = useStatusBar()

    useFocusEffect(useCallback(() => {
        pushStatusBarStyle({ backgroundColor: 'rgba(6,29,50,0.7)', barStyle: 'light-content' })
        return popStatusBarStyle
    }, []))

    return (
        <SafeAreaView style={styles.container} >
            {isCameraShow &&
                <QRCodeScanner
                    ref={scannerRef}
                    onRead={onRead}
                    fadeIn
                    // containerStyle={{ flex: 1 }}
                    cameraStyle={{ height: height, width: width }}
                    reactivate
                    reactivateTimeout={2000}
                    vibrate={true}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                />}
            <ScannerUi setQrScanning={setQrScanning} isQrScanning={isQrScanning} />
        </SafeAreaView>
    )
}

export default Scanner

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
    }
})