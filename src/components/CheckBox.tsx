import { colors } from "assets/Colors";
import React, { FC, useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Octicons';
import { scaler } from "utils";
interface CheckBoxProps {
    checked: boolean,
    setChecked: (b: boolean) => void
    size?: number
}

export const CheckBox: FC<CheckBoxProps> = (props) => {
    const { checked, setChecked, size = scaler(17) } = props

    const styles = useMemo(() => StyleSheet.create({
        container: {
            width: size,
            height: size,
            borderRadius: scaler(3),
            borderWidth: checked ? scaler(1) : scaler(1.5),
            borderColor: checked ? colors.colorPrimary : '#858B95',
            backgroundColor: checked ? colors.colorPrimary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center'
        }

    }), [checked, size])
    return (
        <TouchableOpacity
            onPress={() => setChecked(!checked)}
            style={styles.container} >
            {checked &&
                <Ionicons size={size - scaler(3)} color={colors.colorWhite} name={'check'} />
            }

        </TouchableOpacity>
    )
}