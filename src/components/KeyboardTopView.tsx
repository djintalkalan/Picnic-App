import React, { FC, PropsWithChildren, useMemo } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { useKeyboardService } from './KeyboardService';

interface KeyboardTopViewProps {
    style?: ViewStyle,
}

export const KeyboardTopView: FC<PropsWithChildren<KeyboardTopViewProps>> = (props) => {
    const { isKeyboard, keyboardHeight } = useKeyboardService()
    const styles = useMemo(() => StyleSheet.create({
        container: {
            width: '100%',
            ...StyleSheet.flatten(props?.style ?? {}),
            position: isKeyboard ? 'absolute' : 'relative',
            bottom: (Platform.OS == 'ios' ? keyboardHeight : 0),
            // backgroundColor: 'red'
        }
    }), [isKeyboard, props?.style])

    return (
        <View style={styles.container} >
            {props.children}
        </View>
    )
}

export const KeyboardHideView: FC<PropsWithChildren<KeyboardTopViewProps>> = (props) => {
    const { isKeyboard, } = useKeyboardService()
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