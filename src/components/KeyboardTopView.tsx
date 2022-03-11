import { useIsFocused } from '@react-navigation/native';
import React, { FC, useMemo } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { scaler } from 'utils';
import { useKeyboardService } from './KeyboardService';

interface KeyboardTopViewProps {
    style?: ViewStyle,
}

export const KeyboardTopView: FC<KeyboardTopViewProps> = (props) => {
    const isFocused = useIsFocused()
    const { isKeyboard, keyboardHeight } = useKeyboardService(isFocused)
    const styles = useMemo(() => StyleSheet.create({
        container: {
            width: '100%',
            ...StyleSheet.flatten(props?.style ?? {}),
            position: isKeyboard ? 'absolute' : 'relative',
            bottom: (Platform.OS == 'ios' ? keyboardHeight : 0) + scaler(0),
            // backgroundColor: 'red'
        }
    }), [isKeyboard, props?.style])

    return (
        <View style={styles.container} >
            {props.children}
        </View>
    )
}

export const KeyboardHideView: FC<KeyboardTopViewProps> = (props) => {
    const isFocused = useIsFocused()
    const { isKeyboard, } = useKeyboardService(isFocused)
    const styles = useMemo(() => StyleSheet.create({
        container: {
            width: '100%',
            ...StyleSheet.flatten(props?.style ?? {})
            // backgroundColor: 'red'
        }
    }), [isKeyboard, props?.style])

    return !isKeyboard ? (
        <View style={styles.container} >
            {props.children}
        </View>
    )
        : null
}