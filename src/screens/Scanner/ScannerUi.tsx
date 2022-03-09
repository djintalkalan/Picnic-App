import { colors, Images } from 'assets'
import React, { memo, useLayoutEffect } from 'react'
import { Animated, Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { NavigationService, scaler } from 'utils'
const { height, width } = Dimensions.get('screen')

const gradientColors = [colors.colorPrimary, "rgba(74, 211, 149, 0.4)", 'transparent']
const ScannerUi = (props: { isQrScanning: boolean, setQrScanning: any }) => {

    const animated = new Animated.Value(0);
    const duration = 1500;

    useLayoutEffect(() => {
        let animation: Animated.CompositeAnimation
        if (props?.isQrScanning) {
            animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(animated, {
                        toValue: (width / 1.5) - scaler(13),
                        duration: duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animated, {
                        toValue: 0,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                ]),
            );
            animation && animation?.start()
        }
        return () => animation && animation?.stop()
    }, [props?.isQrScanning]);


    return (
        <View style={styles.container}>
            <View style={[styles.background, { alignItems: 'flex-end', }]} >

                <TouchableOpacity onPress={() => {
                    props?.setQrScanning(false)
                    setTimeout(() => {
                        NavigationService.goBack()
                    }, 200);
                }} style={{ margin: scaler(20), backgroundColor: colors.colorWhite, height: scaler(30), width: scaler(30), borderRadius: scaler(20), alignItems: 'center', justifyContent: 'center' }} >
                    <Ionicons name={'close'} color={colors.colorBlack} size={scaler(20)} />
                </TouchableOpacity>
                <View style={{ width: '100%' }} >
                    <Text></Text>
                </View>
            </View>


            <View style={{ width: '100%', flexDirection: 'row' }} >
                <View style={styles.background} />

                <ImageBackground source={Images.ic_scanner_corner} style={{ height: width / 1.5, aspectRatio: 1, }} >
                    <Animated.View style={[{ transform: [{ translateY: animated }] }]} >
                        <LinearGradient colors={gradientColors} style={styles.linearGradient} />
                    </Animated.View>
                </ImageBackground>
                <View style={styles.background} />

            </View>

            <View style={styles.background} />


        </View>
    )
}

export default memo(ScannerUi)

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        flex: 1, width: width,
        zIndex: 20, height: height,
    },
    linearGradient: {
        height: scaler(15),
        width: '100%'
    },
    background: { flex: 1, backgroundColor: 'rgba(6,29,50,0.7)' }
})
