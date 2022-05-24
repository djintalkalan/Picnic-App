import { colors } from 'assets/Colors';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { scaler } from 'utils';


interface ToggleButtonProps {
    active: boolean,
    onChange: (active: boolean) => void,

}
export const Switch = (props: ToggleButtonProps) => {
    const varStyle = useMemo(() => StyleSheet.create({
        buttonStyle: {
            height: scaler(20),
            width: scaler(40),
            backgroundColor: props.active ? colors.colorPrimary : '#D5D7D6',
            borderRadius: scaler(20),
            alignItems: props.active ? 'flex-end' : 'flex-start',
            justifyContent: 'center',
            padding: scaler(3)
        }
    }), [props.active])
    return (
        <TouchableOpacity activeOpacity={0.7} onPress={() => {
            props?.onChange(!props.active)
        }} style={varStyle.buttonStyle}>
            <View style={styles.circle} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    circle: { height: scaler(15.5), width: scaler(15.5), backgroundColor: colors.colorWhite, borderRadius: scaler(9) }
})

export default Switch

