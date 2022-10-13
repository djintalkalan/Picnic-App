import { colors, Images } from 'assets'
import { useKeyboardService } from 'custom-components'
import React, { FC, useCallback } from 'react'
import { ColorValue, GestureResponderEvent, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { NavigationService, scaler } from 'utils'
interface BackButtonProps {
    onPress?: (e?: GestureResponderEvent) => void
    marginVertical?: number
    backgroundColor?: ColorValue
}


export const BackButton: FC<BackButtonProps> = (props) => {
    const { isKeyboard, dismissKeyboard } = useKeyboardService()

    const onPressDefault = useCallback(
        () => {
            if (isKeyboard) {
                dismissKeyboard()
            } else
                NavigationService.goBack()
        },
        [isKeyboard],
    )

    const { onPress = onPressDefault, marginVertical, backgroundColor } = props

    // console.log("IsKeyboard", isKeyboard)


    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, {
            paddingVertical: marginVertical ?? scaler(10),
            backgroundColor: backgroundColor
        }]} >
            <Image source={Images.ic_left} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(30), resizeMode: 'contain' }} />
            {/* <Text style={styles.textStyle} >{Language.back}</Text> */}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    textStyle: {
        fontSize: scaler(15),
        color: colors.colorPrimary
    },
    button: {
        alignSelf: 'baseline',
        flexDirection: 'row',
        paddingHorizontal: scaler(15),
        alignItems: 'center'
    }
})