import { colors, Fonts } from 'assets';
import { Text } from 'custom-components';
import { ICountry } from 'dj-intl-phone-input/src/Countries';
import { IntlPhoneInput, IOnChangeText, NewIntlPhoneInputProps } from 'dj-intl-phone-input/src/NewIntlPhoneInput';
import { capitalize } from 'lodash';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Control, Controller, FieldErrors, FieldValues, RegisterOptions, UseFormClearErrors, UseFormGetValues, UseFormSetError, UseFormSetFocus, UseFormSetValue } from 'react-hook-form';
import { ColorValue, GestureResponderEvent, Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Language from 'src/language/Language';
import { scaler } from 'utils';


export interface IVerified {
    dialCode: string,
    phoneNumber: string
}

type UseFormReturn<TFieldValues extends FieldValues = FieldValues, TContext extends object = object> = {
    getValues: UseFormGetValues<TFieldValues>;
    setError: UseFormSetError<TFieldValues>;
    clearErrors?: UseFormClearErrors<TFieldValues>;
    setValue: UseFormSetValue<TFieldValues>;
    control: Control<TFieldValues, TContext>;
    setFocus?: UseFormSetFocus<TFieldValues>;
};

interface InputPhoneProps extends NewIntlPhoneInputProps {
    title?: string
    required?: boolean
    disabled?: boolean
    containerStyle?: ViewStyle
    name: string
    placeholder?: string
    style?: ViewStyle
    height?: number
    controlObject: UseFormReturn<any, any>
    icon?: ImageSourcePropType
    iconMargin?: number
    verifiedData?: IVerifiedData | null,
    onChangeVerified?: (data: IVerifiedData) => void
    extraList?: Array<IVerified>
    fontFamily?: "black" | "blackItalic" | "bold" | "boldItalic" | "extraBold" | "extraBoldItalic" | "extraLight" | "extraLightItalic" | "italic" | "light" | "lightItalic" | "medium" | "mediumItalic" | "regular" | "semiBold" | "semiBoldItalic" | "thin" | "thinItalic"
    onPress?: (e?: GestureResponderEvent) => void
    value?: string
    errors?: FieldErrors
    backgroundColor?: ColorValue
    borderColor?: ColorValue
    rules?: Exclude<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
    countryCode?: string
}

interface IVerifiedData {
    dialCode: string
    phoneNumber: string
}

export const PhoneInput = forwardRef((props: InputPhoneProps, ref) => {

    const [isFocused, setFocused] = useState(false)
    const [toggle, setToggle] = useState(false)
    const { style, borderColor = "#E9E9E9", backgroundColor = colors.colorWhite, iconMargin, icon, fontFamily = "regular", errors, controlObject: { getValues, setError, setValue, control }, title, placeholder, required, name = "", rules, onChangeText, onPress, height = scaler(24), value, containerStyle, disabled, ...rest } = props
    const currentDataRef = useRef<IOnChangeText>({
        dialCode: "",
        unmaskedPhoneNumber: "",
        phoneNumber: "",
        isVerified: true,
        // @ts-ignore
        selectedCountry: props?.countryCode ? {
            code: props?.countryCode
        } : null
    })
    const styles = useMemo(() => {

        return StyleSheet.create({
            textInputStyle: {
                paddingRight: scaler(5),
                fontSize: scaler(13),
                fontFamily: Fonts?.[fontFamily],
                // flex: 1,
                paddingLeft: scaler(10),
                height: height,
                color: colors.colorBlack,
                // backgroundColor: 'red',
                ...StyleSheet.flatten(style)
            },
            containerStyle: {
                overflow: 'hidden',
                marginTop: scaler(5),
                ...StyleSheet.flatten(containerStyle)
            },
            phoneInputStyle: {
                backgroundColor
            }
        })

    }, [style, height, containerStyle, fontFamily])

    ref = {
        current: {
            currentData
                : currentDataRef.current
        }
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress || disabled}
            style={styles.containerStyle} >
            <View pointerEvents={(onPress || disabled) ? 'none' : undefined}
                style={{
                    justifyContent: 'center',
                    minHeight: scaler(50),
                    borderColor: (errors && errors[name]) ? colors.colorRed : isFocused ? colors.colorPrimary : borderColor,
                    backgroundColor: backgroundColor,
                    padding: scaler(2),
                    paddingVertical: scaler(10),
                    marginTop: scaler(5),
                    // shadowOffset: { width: 0, height: 1 },
                    // shadowRadius: scaler(1),
                    // elevation: 2,
                    borderWidth: scaler(1.2),
                    borderRadius: scaler(8),
                }} >
                <Controller control={control}
                    name={name + "_dialCode"}
                    //@ts-ignore
                    render={(data) => {
                        return null
                    }}
                />

                <Controller control={control}
                    name={name + "_countryCode"}
                    //@ts-ignore
                    render={(data) => {
                        return null
                    }}
                />

                <Controller control={control}
                    name={name + "_fixedValue"}
                    //@ts-ignore
                    render={(data) => {
                        return null
                    }}
                />

                <Controller control={control}
                    name={name}
                    rules={{
                        required: required, ...rules, validate: (v) => {
                            return currentDataRef?.current?.isVerified || (!required && !v) || "Invalid Phone"
                        }
                    }}
                    defaultValue=""
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            {/* {value || isFocused ?
                                <Text type={fontFamily} style={{ color: colors?.colorGreyText, paddingLeft: scaler(10) }}>
                                    {title || placeholder}
                                </Text> : null} */}
                            <IntlPhoneInput
                                sortBy='dialCode'
                                filterInputStyleContainer={{ elevation: 0 }}
                                containerStyle={styles.phoneInputStyle}
                                onChangeCountry={(c: ICountry) => {
                                    const { fixedValue, code } = c
                                    if (getValues(name + "_countryCode") != code)
                                        setValue(name + "_countryCode", code)
                                    if (getValues(name + "_fixedValue") != fixedValue)
                                        setValue(name + "_fixedValue", fixedValue)
                                }}
                                onChangeText={(data: IOnChangeText) => {
                                    const { dialCode, unmaskedPhoneNumber, phoneNumber, isVerified, selectedCountry } = data
                                    currentDataRef.current = data
                                    if (getValues(name + "_dialCode") != dialCode)
                                        setValue(name + "_dialCode", dialCode)

                                    onChange(phoneNumber)
                                }}
                                maskPlaceholder
                                inputProps={{
                                    onFocus: () => {
                                        setFocused(true)
                                    },
                                    onBlur: (e) => {
                                        setFocused(false)
                                        onBlur()
                                    },
                                    value: value,
                                    placeholder: props.placeholder
                                }}
                                defaultCountryCode={(currentDataRef?.current?.selectedCountry?.code?.toString() || getValues(name + "_countryCode")?.toString()) || 'US'}
                                dialCodeTextStyle={{}}
                                placeholderTextColor={colors.colorGreyText}
                                filterText={props.filterText}
                                filterInputStyle={{ fontFamily: Fonts.regular }}
                                modalCountryItemCountryNameStyle={{ fontFamily: Fonts.regular }}
                                //@ts-ignore
                                modalCountryItemCountryDialCodeStyle={{ fontFamily: Fonts.regular }}
                                closeText={'Close'}
                                closeTextStyle={{ fontFamily: Fonts.regular }}
                                flagStyle={{ fontSize: scaler(18), paddingRight: scaler(5) }}
                                selectedPhone={value || ''}
                            />
                            {icon ? <Image source={icon}
                                // tintColor={colors.colorBlack}
                                style={{
                                    height: scaler(20), width: scaler(20), resizeMode: 'contain',
                                    position: "absolute", end: iconMargin ?? scaler(5), alignSelf: 'center'
                                }} /> : null}
                        </>
                    )}
                />
            </View>
            {(errors && errors[name]) && <Text type={fontFamily} style={{
                paddingLeft: scaler(5),
                paddingVertical: scaler(4),
                color: colors.colorRed,
                fontSize: scaler(10),
            }}>
                {errors?.[name]?.message || (capitalize(name) + " " + Language.is_required)}
            </Text>}
        </TouchableOpacity>

    );
});
