import { colors } from 'assets'
import { useKeyboardService } from 'custom-components'
import React, { FC, useCallback } from 'react'
import { GestureResponderEvent, StyleSheet, TouchableOpacity } from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'
import { NavigationService, scaler } from 'utils'
interface BackButtonProps {
    onPress?: (e?: GestureResponderEvent) => void
    marginVertical?: number
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

    const { onPress = onPressDefault, marginVertical } = props

    // console.log("IsKeyboard", isKeyboard)


    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, {
            paddingVertical: marginVertical ?? scaler(10),

        }]} >
            <Entypo size={scaler(18)} name={'chevron-thin-left'} color={colors.colorBlack} />
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