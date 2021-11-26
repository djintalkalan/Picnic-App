import { doSignUp } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Button, CheckBox, PhoneInput, Stepper, Text, TextInput } from 'custom-components'
import React, { FC, useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Image, Platform, StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import Language from 'src/language/Language'
import { scaler } from 'utils'

type FormType = {
    username: string
    phone: string
    phone_dialCode: string
}

const SignUp3: FC<any> = (props) => {

    const phoneRef = useRef()

    const [isTerms, setTerms] = useState(false)

    const { control, handleSubmit, getValues, setValue, setError, formState: { errors } } = useForm<FormType>({
        defaultValues: {
            // username: "deepaktesting1",
            // phone: "9588558818",
            // phone_dialCode: "+91"
        },
        mode: 'onChange'
    })
    const dispatch = useDispatch()
    const onSubmit = useCallback(() => handleSubmit(data => {
        console.log(data)
        dispatch(doSignUp({
            username: data?.username,
            dial_code: data?.phone ? data?.phone_dialCode : "",
            phone_number: data?.phone,
            register_platform: Platform.OS,
            ...props.route?.params,
        }))
    })(), []);

    // useEffect(() => {
    // setTimeout(() => {
    // setValue("phone_dialCode", "+92")
    // setValue("phone", "9588558818")
    // }, 2000);
    // }, [])

    const calculateButtonDisability = useCallback(() => {
        if (!isTerms
            ||
            (errors && (errors.username
                || errors.phone
            )))
            return true
        return false
    }, [errors, isTerms])

    return (
        <SafeAreaView style={styles.container} >

            <Stepper isBackButton step={3} totalSteps={3} />
            <ScrollView keyboardShouldPersistTaps={'handled'} >


                <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(15) }} >

                    <View style={{ flexDirection: 'row', alignItems: 'center', }} >
                        <Text style={styles.welcomeStyle} >{Language.optional_information}</Text>
                        <Image source={Images.ic_logo_name} style={styles.icon} />
                    </View>

                    <TextInput
                        placeholder={Language.username}
                        name={'username'}
                        style={{ fontSize: scaler(13) }}
                        control={control}
                        errors={errors}
                    />

                    <PhoneInput
                        name={'phone'}
                        ref={phoneRef}
                        title={Language.phone}
                        placeholder={"0000-000-000"}
                        controlObject={{ control, getValues, setValue, setError }}
                        defaultCountry={'US'}
                        errors={errors}
                    />

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(20), justifyContent: 'center' }} >
                        <CheckBox checked={isTerms} setChecked={setTerms} />
                        <Text
                            onPress={() => {
                                setTerms(_ => !_)
                            }}
                            style={styles.iAccept} >{Language.i_accept_the}
                            <Text
                                onPress={() => {

                                }}
                                style={[styles.iAccept, { color: colors.colorPrimary }]} > {Language.term_of_service}</Text> {Language.and} <Text
                                    onPress={() => {

                                    }} style={[styles.iAccept, { color: colors.colorPrimary }]} >{Language.privacy_policy}</Text>
                        </Text>
                    </View>

                    <Button disabled={calculateButtonDisability()} containerStyle={{ marginTop: scaler(25) }} title={Language.sign_up} onPress={onSubmit} />
                </View>
            </ScrollView>

        </SafeAreaView>
    )
}

export default SignUp3

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
        fontSize: scaler(12),
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