import { colors } from "assets";
import * as React from "react";
import { ColorValue, GestureResponderEvent, StyleProp, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { scaler } from "utils";
import { Text } from "./Text";

interface ButtonProps {
    disabled?: boolean
    onPress?: (event: GestureResponderEvent) => void;
    buttonStyle?: StyleProp<ViewStyle>;
    containerStyle?: ViewStyle;
    center?: boolean;
    backgroundColor?: ColorValue
    width?: number | string;
    minWidth?: number | string
    title: string;
    type?: 'bold' | 'light' | 'regular' | 'medium'
    fontColor?: ColorValue;
    radius?: number;
    fontSize?: number
    paddingVertical?: number
    paddingHorizontal?: number
    pointerEvents?: 'none'
    textStyle?: TextStyle
}

export const Button = (props: ButtonProps) => {
    const { disabled = false, onPress, textStyle, containerStyle, center, radius, backgroundColor, width, title, type = 'medium', fontColor = colors.colorWhite, buttonStyle, fontSize = scaler(14), minWidth, paddingHorizontal, paddingVertical } = props

    const styles = React.useMemo(() => {
        let container = {}
        if (center) {
            container = { width: '100%', alignItems: 'center' }
        }
        return StyleSheet.create({
            contentContainerStyle: {
                marginVertical: scaler(5),
                paddingHorizontal: scaler(5),
                ...container,
                ...StyleSheet.flatten(containerStyle) // Object.assign({}, ...(Array.isArray(containerStyle) ? containerStyle : [containerStyle]))
            },

            buttonStyle: {
                borderRadius: radius ?? scaler(10),
                backgroundColor: disabled ? colors?.colorGreyText : backgroundColor ?? colors?.colorPrimary,
                minWidth: minWidth == null ? undefined : minWidth ?? scaler(120),
                width: width ?? undefined,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: paddingVertical ?? scaler(15),
                paddingHorizontal: paddingHorizontal ?? scaler(15),
                ...StyleSheet.flatten(buttonStyle) //Object.assign({}, ...(Array.isArray(buttonStyle) ? buttonStyle : [buttonStyle]))

            },
            textStyle: {
                fontSize,
                color: fontColor,
                fontWeight: '500',
                ...StyleSheet.flatten(textStyle) //Object.assign({}, ...(Array.isArray(textStyle) ? textStyle : [textStyle]))

            }
        })
    }, [containerStyle, textStyle, fontColor, fontSize, center, width, buttonStyle, backgroundColor, paddingHorizontal, radius, paddingVertical, minWidth, disabled]);
    return (
        <View pointerEvents={props.pointerEvents} style={styles.contentContainerStyle}>
            <TouchableOpacity disabled={disabled}
                onPress={onPress ? (e) => {
                    requestAnimationFrame(() => {
                        onPress(e);
                    });
                }
                    : undefined
                }
                style={styles.buttonStyle}>
                <Text style={styles.textStyle} type={type} >{title}</Text>
            </TouchableOpacity>
        </View>
    );
}


export default Button