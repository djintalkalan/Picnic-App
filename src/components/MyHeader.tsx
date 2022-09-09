import { colors } from 'assets'
import { Text, useKeyboardService } from 'custom-components'
import React, { FC, useCallback } from 'react'
import { GestureResponderEvent, Image, ImageURISource, StyleSheet, TouchableOpacity, View } from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'
import Language from 'src/language/Language'
import { NavigationService, scaler } from 'utils'
interface MyHeaderProps {
    onPress?: (e?: GestureResponderEvent) => void
    title: string
    backEnabled?: boolean
    rightIcon?: ImageURISource,
    onPressRight?: (e?: GestureResponderEvent) => void
    scanText?: boolean
}

export const MyHeader: FC<MyHeaderProps> = (props) => {
    const { isKeyboard, dismissKeyboard } = useKeyboardService()
    const onPressDefault = useCallback(
        () => {
            if (isKeyboard) {
                dismissKeyboard()
            } else if (props?.onPress) {
                props?.onPress()
            } else
                NavigationService.goBack()
        },
        [isKeyboard, props?.onPress],
    )

    const { backEnabled = true, title, onPressRight, rightIcon, scanText = false } = props



    return (
        <View style={[styles.container, scanText ? { justifyContent: 'flex-start', paddingHorizontal: scaler(42) } : {}]} >
            {backEnabled &&
                <TouchableOpacity onPress={onPressDefault} style={[styles.button, {
                }]} >
                    <Entypo size={scaler(18)} name={'chevron-thin-left'} color={colors.colorBlack} />
                </TouchableOpacity>}
            <Text style={styles.title} >{title}</Text>
            {rightIcon &&
                <TouchableOpacity onPress={onPressRight} style={[styles.button, {
                    left: undefined, right: 0,
                    flexDirection: 'row'
                }]} >
                    {scanText ? <View>
                        <Text style={{ textAlign: 'center', fontSize: scaler(11), marginEnd: scaler(10), color: colors.colorPrimary }} >{Language.tap_to_scan}</Text>
                        <Text style={{ textAlign: 'center', fontSize: scaler(11), marginEnd: scaler(10), color: colors.colorPrimary }} >{Language.qr_code}</Text>
                    </View> : null}
                    <Image source={rightIcon} style={{ height: scaler(22), width: scaler(22), resizeMode: 'contain' }} />
                </TouchableOpacity>}
        </View>

    )
}

const styles = StyleSheet.create({
    textStyle: {
        fontSize: scaler(15),
        color: colors.colorPrimary
    },
    button: {
        paddingHorizontal: scaler(15),
        // backgroundColor: 'red',
        position: 'absolute',
        left: 0, height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontWeight: '600',
        color: colors.colorBlackText,
        fontSize: scaler(16)
    },
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scaler(10)
    }
})