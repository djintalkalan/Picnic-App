import { colors, Images } from 'assets'
import { Button, Stepper, Text, TextInput } from 'custom-components'
import { sub } from 'date-fns'
import React, { FC, useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Image, StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view'
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { SafeAreaView } from 'react-native-safe-area-context'
import Language from 'src/language/Language'
import { dateFormat, NavigationService, scaler } from 'utils'

type FormType = {
    firstName: string
    lastName: string
    dob: string
}

const SignUp2: FC<any> = (props) => {

    const birthDate = useRef<Date>(new Date())
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const { control, handleSubmit, getValues, setValue, formState: { errors } } = useForm<FormType>({
        defaultValues: {
            // firstName: "Deepak",
            // lastName: "Jaglan"
        },
        mode: 'onChange'
    })

    const onSubmit = useCallback(() => handleSubmit(data => {
        console.log(data)
        const { firstName, lastName } = data
        NavigationService.navigate("SignUp3", {
            first_name: firstName,
            last_name: lastName,
            dob: dateFormat(birthDate.current, "YYYY-MM-DD"),
            ...props?.route?.params,
        })
    })(), []);

    const openDatePicker = useCallback(() => {
        setDatePickerVisibility(true)
    }, [])

    const calculateButtonDisability = useCallback(() => {
        if (!getValues('firstName') || !getValues('lastName') || !getValues('dob') || (errors && (errors.firstName || errors.lastName || errors.dob)))
            return true
        return false
    }, [errors])

    return (
        <SafeAreaView style={styles.container} >

            <Stepper isBackButton step={2} totalSteps={3} />

            <ScrollView keyboardShouldPersistTaps={'handled'} >

                <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(15) }} >

                    <View style={{ flexDirection: 'row', alignItems: 'center', }} >
                        <Text style={styles.welcomeStyle} >{Language.just_the_basics}</Text>
                        <Image source={Images.ic_logo_name} style={styles.icon} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }} >

                        <TextInput
                            containerStyle={{ flex: 1, marginRight: scaler(5) }}
                            placeholder={Language.first_name}
                            name={'firstName'}
                            style={{ fontSize: scaler(13) }}
                            required={true}
                            control={control}
                            errors={errors}
                        />

                        <TextInput
                            containerStyle={{ flex: 1, marginLeft: scaler(5) }}
                            placeholder={Language.last_name}
                            style={{ fontSize: scaler(13) }}
                            name={'lastName'}
                            required={true}
                            control={control}
                            errors={errors}
                        />
                    </View>


                    <TextInput
                        containerStyle={{ flex: 1, marginRight: scaler(10) }}
                        placeholder={"MM-DD-YYYY"}
                        style={{ fontSize: scaler(13) }}
                        name={'dob'}
                        onPress={openDatePicker}
                        required={true}
                        icon={Images.ic_calender}
                        iconSize={scaler(20)}
                        control={control}
                        errors={errors}
                    />

                    {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(20), justifyContent: 'center' }} >
                        <Text style={styles.iAccept} >{Language.please_read_our} <Text
                            onPress={() => {

                            }}
                            style={[styles.iAccept, { color: colors.colorPrimary }]} >{Language.privacy_policy}</Text></Text>
                    </View> */}



                    <Button disabled={calculateButtonDisability()} containerStyle={{ marginTop: scaler(20) }} title={Language.next} onPress={onSubmit} />

                    {/* <Text style={styles.notAMember} >{Language.already_a_member} <Text onPress={() => {
                        NavigationService.navigate("Login")
                    }} style={[styles.notAMember, { color: colors.colorPrimary }]} >{Language.log_in}</Text></Text> */}

                </View>
            </ScrollView>
            <DateTimePickerModal
                themeVariant={'light'}
                style={{ zIndex: 20 }}
                isVisible={isDatePickerVisible}
                mode="date"
                customConfirmButtonIOS={(props) => (
                    <Text onPress={props.onPress} style={{ fontWeight: '500', fontSize: scaler(18), color: colors.colorPrimary, textAlign: 'center', padding: scaler(10) }} >Confirm
                    </Text>
                )}
                customCancelButtonIOS={(props) => (
                    <View style={{ padding: scaler(7), backgroundColor: 'white', borderRadius: scaler(10), marginBottom: scaler(10) }} >
                        <Text onPress={props.onPress} style={{ fontWeight: '500', fontSize: scaler(18), color: colors.colorBlack, textAlign: 'center', padding: scaler(5) }} >Cancel</Text>
                    </View>
                )}
                date={birthDate.current}
                maximumDate={sub(new Date(), {
                    years: 15,
                })}
                onConfirm={(date: Date) => {
                    birthDate.current = date
                    setValue("dob", dateFormat(date, "MM-DD-YYYY"), { shouldValidate: true })
                    setDatePickerVisibility(false);
                }}
                onCancel={() => {
                    setDatePickerVisibility(false);
                }}
            />
        </SafeAreaView>
    )
}

export default SignUp2

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center'
    },
    icon: {
        height: scaler(27),
        width: scaler(80),
        resizeMode: 'contain',
    },
    welcomeStyle: {
        flex: 1,
        fontSize: scaler(18),
        fontWeight: '600',
    },
    notAMember: {
        alignSelf: 'center',
        fontWeight: '400',
        fontSize: scaler(15),
        marginVertical: scaler(10),
        color: colors.colorGreyText
    },
    iAccept: {
        alignSelf: 'center',
        fontWeight: '400',
        fontSize: scaler(14),
        marginLeft: scaler(10),
        color: colors.colorGreyText
    },
    birthday: {
        fontWeight: '500',
        fontSize: scaler(13),
        marginTop: scaler(14),
        color: colors.colorGreyText
    }
})