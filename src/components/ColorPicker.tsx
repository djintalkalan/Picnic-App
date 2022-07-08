import { colors } from 'assets/Colors';
import React, { FC } from 'react';
import { ColorValue, DeviceEventEmitter, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Language from 'src/language/Language';
import { scaler, _hideTouchAlert } from 'utils';
import { CHAT_BACKGROUND_COLORS, DEFAULT_CHAT_BACKGROUND, UPDATE_COLOR_EVENT } from 'utils/Constants';
import { Text } from './Text';

const { width } = Dimensions.get('screen')

interface ColorPickerProps {
    selectedColor?: ColorValue;
    onSelectColor?: (color: ColorValue) => void
}
const onSelectColorDefault = (color: ColorValue) => {
    DeviceEventEmitter.emit(UPDATE_COLOR_EVENT, color)
    _hideTouchAlert()
}
const ColorPicker: FC<ColorPickerProps> = ({ selectedColor, onSelectColor = onSelectColorDefault }) => {
    return (
        <View style={styles.colorContainer}>
            {CHAT_BACKGROUND_COLORS?.map(_ =>
                <TouchableOpacity
                    style={[selectedColor == _ ? styles.selectedColorView : styles.colorView, { backgroundColor: _, }]}
                    onPress={() => onSelectColor(_)}
                />)}
            <TouchableOpacity style={selectedColor != DEFAULT_CHAT_BACKGROUND ? styles.defaultColor : styles.selectedDefaultColor}
                onPress={() => onSelectColor(DEFAULT_CHAT_BACKGROUND)}>
                <Text>{Language.default_background}</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    colorContainer: {
        flexDirection: 'row',
        padding: scaler(5),
        // flex: 1,
        flexWrap: 'wrap',
        marginHorizontal: -scaler(2.5),
        backgroundColor: colors.colorWhite,
        width: scaler(220),
        borderRadius: scaler(5),

    },
    defaultColor: {
        height: scaler(60),
        flex: 1,
        borderRadius: scaler(5),
        backgroundColor: DEFAULT_CHAT_BACKGROUND,
        margin: scaler(5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedDefaultColor: {
        height: scaler(60),
        flex: 1,
        borderRadius: scaler(5),
        backgroundColor: DEFAULT_CHAT_BACKGROUND,
        borderWidth: scaler(1.5),
        borderColor: colors.colorPrimary,
        margin: scaler(5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorView: {
        height: scaler(60),
        width: scaler(60),
        borderRadius: scaler(5),
        margin: scaler(5)
    },
    selectedColorView: {
        height: scaler(60),
        width: scaler(60),
        borderRadius: scaler(5),
        borderWidth: scaler(1.5),
        borderColor: colors.colorPrimary,
        margin: scaler(5)
    },
})

export default ColorPicker;