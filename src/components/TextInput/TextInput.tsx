import { colors, Fonts } from "assets";
import { KeyboardValues } from "custom-components/KeyboardService";
import { capitalize } from "lodash";
import React, { FC, forwardRef, RefAttributes, useMemo, useState } from "react";
import { Control, Controller, FieldErrors, RegisterOptions } from "react-hook-form";
import { Button, ColorValue, Dimensions, GestureResponderEvent, Image, ImageSourcePropType, InputAccessoryView, Keyboard, Platform, StyleProp, StyleSheet, TextInput as RNTextInput, TextInputProps as RNTextInputProps, TouchableOpacity, View, ViewStyle } from "react-native";
import Language from "src/language/Language";
import { scaler } from "utils";
import { Text } from "../Text";

interface TextInputProps extends RNTextInputProps {
    fontFamily?: "black" | "blackItalic" | "bold" | "boldItalic" | "extraBold" | "extraBoldItalic" | "extraLight" | "extraLightItalic" | "italic" | "light" | "lightItalic" | "medium" | "mediumItalic" | "regular" | "semiBold" | "semiBoldItalic" | "thin" | "thinItalic"
    containerStyle?: ViewStyle
    iconContainerStyle?: StyleProp<ViewStyle>
    disabled?: boolean
    onPress?: (e?: GestureResponderEvent) => void
    onPressIcon?: (e?: GestureResponderEvent) => void
    value?: string
    title?: string
    height?: number
    control?: Control<any>
    required?: boolean | string
    icon?: ImageSourcePropType
    iconSize?: number
    name?: string
    iconPosition?: 'left' | 'right',
    errors?: FieldErrors
    backgroundColor?: ColorValue
    limit?: number
    borderColor?: ColorValue
    rules?: Exclude<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
    keyboardValues?: KeyboardValues,
}


export const TextInput: FC<TextInputProps & RefAttributes<any>> = forwardRef((props, ref) => {

    const [isFocused, setFocused] = useState(false)
    const { iconContainerStyle, style, borderColor = "#E9E9E9", backgroundColor, limit, onFocus, onBlur, iconSize = scaler(22), iconPosition = 'right', onPressIcon, multiline, fontFamily = "regular", icon, errors, control, title, required, name = "", rules, onChangeText, onPress, height = scaler(24), value, containerStyle, disabled, ...rest } = props
    const openKeyboardAccessory = props?.keyboardValues?.openKeyboardAccessory
    const styles = useMemo(() => {

        return StyleSheet.create({
            textInputStyle: {
                paddingRight: icon ? scaler(40) : scaler(5),
                fontSize: scaler(13),
                fontFamily: Fonts?.[fontFamily],
                // flex: 1,
                paddingLeft: scaler(10),
                // backgroundColor: 'red',
                // height: !multiline ? height : 'auto',
                minHeight: multiline ? height + scaler(4) : undefined,
                color: colors.colorBlack,
                // backgroundColor: 'red',
                ...StyleSheet.flatten(style),
                paddingVertical: 0,
                width: '100%',

            },
            containerStyle: {
                overflow: 'hidden',
                marginTop: scaler(5),
                padding: scaler(2),
                ...StyleSheet.flatten(containerStyle)
            },
            accessory: {
                width: Dimensions.get('window').width,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                backgroundColor: '#F8F8F8',
                paddingHorizontal: scaler(8)
            },
            iconContainerStyle: {
                position: 'absolute', end: scaler(15), justifyContent: 'center',
                ...StyleSheet.flatten(iconContainerStyle)
            }
        })

    }, [style, height, containerStyle, fontFamily, icon])

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
                    borderColor: (errors && errors[name]) ? colors.colorRed : isFocused ? colors.colorPrimary : borderColor,
                    backgroundColor: backgroundColor ?? colors.colorWhite,
                    // padding: scaler(2),
                    paddingTop: scaler(10),
                    paddingBottom: (multiline && limit) ? scaler(25) : scaler(10),
                    marginTop: scaler(5),
                    borderWidth: scaler(1.2),
                    borderRadius: scaler(8)
                    // shadowOffset: { width: 0, height: 1 },
                    // shadowRadius: scaler(1),
                    // elevation: 2,
                }} >

                {control ? <Controller control={control}
                    name={name}
                    rules={{ required: required, ...rules }}
                    defaultValue=""
                    render={({ field: { onChange, onBlur: onBlurC, value } }) => (
                        <>
                            <RNTextInput {...rest}
                                ref={ref}
                                // onContentSizeChange={(e) => {
                                //     console.log(e.nativeEvent.contentSize)
                                // }}
                                style={[styles.textInputStyle]}
                                placeholderTextColor={colors.colorTextPlaceholder}
                                // placeholder={!isFocused ? placeholder : ""}
                                allowFontScaling={false}
                                value={value}
                                multiline={multiline}
                                autoCorrect={props?.autoCorrect ?? false}
                                spellCheck={props?.autoCorrect ?? false}
                                inputAccessoryViewID={multiline ? name : undefined}
                                maxLength={limit ?? props?.maxLength}
                                onFocus={(e) => {
                                    (multiline && Platform.OS == 'android') && openKeyboardAccessory && openKeyboardAccessory(
                                        <View style={styles.accessory}>
                                            <TouchableOpacity onPress={() => {
                                                Keyboard.dismiss()
                                            }} style={{ padding: scaler(8) }} >
                                                <Text style={{ fontWeight: '500', color: colors.colorPrimary, fontSize: scaler(14) }} >{Language.done}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                    setFocused(true)
                                    onFocus && onFocus(e)
                                }}
                                onBlur={(e) => {
                                    (multiline && Platform.OS == 'android') && openKeyboardAccessory && openKeyboardAccessory(null)
                                    setFocused(false)
                                    onBlurC()
                                    onBlur && onBlur(e)
                                }}
                                onChangeText={text => {
                                    onChange(text);
                                    if (onChangeText) onChangeText(text);
                                }}
                            />
                            {icon && iconPosition == 'right' ?
                                <TouchableOpacity disabled={!onPressIcon} onPress={onPressIcon} activeOpacity={0.7} style={styles?.iconContainerStyle} >
                                    <Image style={{ height: iconSize, width: iconSize }} source={icon} />
                                </TouchableOpacity>
                                : null}
                            {multiline && Platform.OS == 'ios' &&
                                <InputAccessoryView style={{ alignItems: 'flex-end' }} nativeID={name}   >
                                    <View style={styles.accessory}>
                                        <Button
                                            onPress={() => Keyboard.dismiss()}
                                            title="Done"
                                        />
                                    </View>
                                </InputAccessoryView>}
                            {multiline && limit && isFocused && <Text style={{ position: 'absolute', color: "#9A9A9A", fontSize: scaler(10), end: scaler(10), bottom: scaler(5) }} >{value?.length || 0}/{limit}</Text>}
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
                            inputAccessoryViewID={multiline ? name : undefined}
                            // placeholder={!isFocused ? placeholder : ""}
                            onFocus={(e) => {
                                (multiline && Platform.OS == 'android') && openKeyboardAccessory && openKeyboardAccessory(
                                    <View style={styles.accessory}>
                                        <TouchableOpacity style={{ padding: scaler(10) }} >
                                            <Text>{Language.done}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                                setFocused(true)
                                onFocus && onFocus(e)
                            }}
                            onBlur={(e) => {
                                (multiline && Platform.OS == 'android') && openKeyboardAccessory && openKeyboardAccessory(null)
                                setFocused(false)
                                onBlur && onBlur(e)
                            }}
                            placeholderTextColor={colors.colorGreyText}
                            onChangeText={text => {
                                if (onChangeText) onChangeText(text);
                            }}
                        />
                        {icon && iconPosition == 'right' ?
                            <TouchableOpacity disabled={!onPressIcon} onPress={onPressIcon} activeOpacity={0.7} style={{ position: 'absolute', end: scaler(15), justifyContent: 'center' }} >
                                <Image style={{ height: iconSize, width: iconSize }} source={icon} />
                            </TouchableOpacity>
                            : null}
                        {multiline && Platform.OS == 'ios' && <InputAccessoryView nativeID={name}   >
                            <View style={styles.accessory}>
                                <Button
                                    onPress={() => Keyboard.dismiss()}
                                    title="Done"
                                />
                            </View>
                        </InputAccessoryView>}
                        {multiline && limit && isFocused && <Text style={{ position: 'absolute', color: "#9A9A9A", fontSize: scaler(10), end: scaler(10), bottom: scaler(5) }} >{value?.length || 0}/{limit}</Text>}
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