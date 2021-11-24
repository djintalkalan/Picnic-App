import { colors, Fonts } from "assets";
import { capitalize } from "lodash";
import React, { FC, forwardRef, RefAttributes, useMemo, useState } from "react";
import { Control, Controller, FieldErrors, RegisterOptions } from "react-hook-form";
import { GestureResponderEvent, Image, StyleSheet, TextInput as RNTextInput, TextInputProps as RNTextInputProps, TouchableOpacity, View, ViewStyle } from "react-native";
import Language from "src/language/Language";
import { scaler } from "utils";
import { Text } from "../Text";

interface TextInputProps extends RNTextInputProps {
    fontFamily?: "black" | "blackItalic" | "bold" | "boldItalic" | "extraBold" | "extraBoldItalic" | "extraLight" | "extraLightItalic" | "italic" | "light" | "lightItalic" | "medium" | "mediumItalic" | "regular" | "semiBold" | "semiBoldItalic" | "thin" | "thinItalic"
    containerStyle?: ViewStyle
    disabled?: boolean
    onPress?: (e?: GestureResponderEvent) => void
    onPressIcon?: (e?: GestureResponderEvent) => void
    value?: string
    title?: string
    height?: number
    control?: Control<any>
    required?: boolean
    icon?: ImageSourcePropType
    iconSize?: number
    name?: string
    iconPosition?: 'left' | 'right',
    errors?: FieldErrors
    rules?: Exclude<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
}


export const TextInput: FC<TextInputProps & RefAttributes<any>> = forwardRef((props, ref) => {

    const [isFocused, setFocused] = useState(false)
    const { style, iconSize = scaler(22), iconPosition = 'right', onPressIcon, multiline, fontFamily = "regular", icon, errors, control, title, required, name = "", rules, onChangeText, onPress, height = scaler(24), value, containerStyle, disabled, ...rest } = props

    const styles = useMemo(() => {

        return StyleSheet.create({
            textInputStyle: {
                paddingRight: scaler(5),
                fontSize: scaler(13),
                fontFamily: Fonts?.[fontFamily],
                // flex: 1,
                paddingLeft: scaler(10),
                // backgroundColor: 'red',
                height: !multiline ? height : 'auto',
                minHeight: multiline ? height + scaler(4) : undefined,
                color: colors.colorBlack,
                // backgroundColor: 'red',
                ...Object.assign({}, ...(Array.isArray(style) ? style : [style])),
                paddingVertical: 0,
                width: '100%',

            },
            containerStyle: {
                overflow: 'hidden',
                marginTop: scaler(5),
                padding: scaler(2),
                ...Object.assign({}, ...(Array.isArray(containerStyle) ? containerStyle : [containerStyle])),
            }
        })

    }, [style, height, containerStyle, fontFamily])

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress || disabled}
            style={styles.containerStyle} >
            <View
                // onLayout={(e) => {
                //     console.log("Parent ", e.nativeEvent.layout)
                // }}
                pointerEvents={(onPress || disabled) ? 'none' : undefined}
                style={{
                    justifyContent: 'center',
                    minHeight: scaler(50),
                    borderColor: (errors && errors[name]) ? colors.colorRed : isFocused ? colors.colorPrimary : "#E9E9E9",
                    backgroundColor: colors.colorWhite,
                    // padding: scaler(2),
                    paddingVertical: scaler(10),
                    marginTop: scaler(5),
                    borderWidth: scaler(1.2),
                    borderRadius: scaler(8),
                    // shadowOffset: { width: 0, height: 1 },
                    // shadowRadius: scaler(1),
                    // elevation: 2,
                }} >

                {control ? <Controller control={control}
                    name={name}
                    rules={{ required: required, ...rules }}
                    defaultValue=""
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>

                            <RNTextInput {...rest}
                                ref={ref}
                                // onContentSizeChange={(e) => {
                                //     console.log(e.nativeEvent.contentSize)
                                // }}
                                style={[styles.textInputStyle]}
                                placeholderTextColor={colors.colorGreyText}
                                // placeholder={!isFocused ? placeholder : ""}
                                allowFontScaling={false}
                                value={value}
                                multiline={multiline}
                                autoCorrect={false}
                                onFocus={() => {
                                    setFocused(true)
                                }}
                                onBlur={(e) => {
                                    setFocused(false)
                                    onBlur()
                                }}
                                onChangeText={text => {
                                    onChange(text);
                                    if (onChangeText) onChangeText(text);
                                }}
                            />
                            {icon && iconPosition == 'right' ?
                                <TouchableOpacity disabled={!onPressIcon} onPress={onPressIcon} activeOpacity={0.7} style={{ position: 'absolute', end: scaler(15), justifyContent: 'center' }} >
                                    <Image style={{ height: iconSize, width: iconSize }} source={icon} />
                                </TouchableOpacity>
                                : null}
                        </>
                    )}
                /> :
                    <>
                        {/* {value || isFocused ?
                            <Text type={fontFamily} style={{ color: colors?.colorGreyText, paddingLeft: scaler(10) }}>
                                {title || placeholder}
                            </Text> : null} */}
                        <RNTextInput {...rest}
                            ref={ref}
                            style={styles.textInputStyle}
                            value={value}
                            multiline={multiline}
                            // placeholder={!isFocused ? placeholder : ""}
                            onFocus={(e) => {
                                setFocused(true)
                                rest?.onFocus && rest?.onFocus(e)
                            }}
                            onBlur={(e) => {
                                setFocused(false)
                                rest?.onBlur && rest?.onBlur(e)
                            }}
                            placeholderTextColor={colors.colorGreyText}
                            onChangeText={text => {
                                if (onChangeText) onChangeText(text);
                            }}
                        />
                    </>}
            </View>
            {/* {console.log("errors", errors)} */}
            {(errors && errors[name]) && <Text type={fontFamily} style={{
                paddingLeft: scaler(5),
                paddingVertical: scaler(4),
                color: colors.colorRed,
                fontSize: scaler(10),
            }}>
                {errors?.[name]?.message || (capitalize(name) + " " + Language.is_required)}
            </Text>}
        </TouchableOpacity>
    )
})