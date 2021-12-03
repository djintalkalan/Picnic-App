import { colors } from 'assets'
import { Text, useKeyboardService } from 'custom-components'
import React, { FC, useCallback } from 'react'
import { GestureResponderEvent, StyleSheet, TouchableOpacity, View } from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'
import { NavigationService, scaler } from 'utils'
interface MyHeaderProps {
    onPress?: (e?: GestureResponderEvent) => void
    title: string
    backEnabled?: boolean
}

export const MyHeader: FC<MyHeaderProps> = (props) => {
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

    const { onPress = onPressDefault, backEnabled = true, title } = props



    return (
        <View style={styles.container} >
            {backEnabled &&
                <TouchableOpacity onPress={onPress} style={[styles.button, {
                }]} >
                    <Entypo size={scaler(18)} name={'chevron-thin-left'} color={colors.colorBlack} />
                </TouchableOpacity>}
            <Text style={styles.title} >{title}</Text>
        </View>

    )
}

const styles = StyleSheet.create({
    textStyle: {
        fontSize: scaler(15),
        color: colors.colorPrimary
    },
    button: {
        marginHorizontal: scaler(15),
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