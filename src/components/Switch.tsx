import { colors } from 'assets/Colors';
import React from 'react';
import SwitchAnimated, { SwitchProps as SwitchAnimatedProps } from 'rn-switch-animated';
import { scaler } from 'utils';
// import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface SwitchProps extends Omit<SwitchAnimatedProps, 'inactiveColor' | 'activeColor'> {
    activeColor?: string
    inactiveColor?: string
}

export const Switch = ({
    inactiveColor = '#D5D7D6',
    activeColor = colors.colorPrimary,
    size = scaler(40),
    animationSpeed = 120,
    ...props
}: SwitchProps) => {
    // const varStyle = StyleSheet.create({
    //     buttonStyle: {
    //         height: scaler(20),
    //         width: scaler(40),
    //         backgroundColor: props.value ? colors.colorPrimary : '#D5D7D6',
    //         borderRadius: scaler(20),
    //         alignItems: props.value ? 'flex-end' : 'flex-start',
    //         justifyContent: 'center',
    //         padding: scaler(3)
    //     }
    // })
    // return (
    //     <TouchableOpacity activeOpacity={0.7} onPress={() => {
    //         props?.onChange(!props.value)
    //     }} style={varStyle.buttonStyle}>
    //         <View style={styles.circle} />
    //     </TouchableOpacity>
    // )

    return (<SwitchAnimated
        activeColor={activeColor}
        inactiveColor={inactiveColor}
        size={size}
        animationSpeed={animationSpeed}
        {...props}
    />)
}




// const styles = StyleSheet.create({
//     circle: { height: scaler(15.5), width: scaler(15.5), backgroundColor: colors.colorWhite, borderRadius: scaler(9) }
// })

export default Switch

