import { checkEmail } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Button, Stepper, Text, TextInput } from 'custom-components'
import { ConfirmPasswordValidations, EmailValidations, PasswordValidations, validateEmail } from 'custom-components/TextInput/rules'
import React, { FC, useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Image, StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import Language from 'src/language/Language'
import { NavigationService, scaler, _showErrorMessage } from 'utils'


type FormType = {
    email: string
    password: string
    confirmPassword: string
}

const SignUp1: FC = () => {

    const dispatch = useDispatch()

    const [isTerms, setTerms] = useState(true)
    const [isSecure1, setSecure1] = useState(true)
    const [isSecure2, setSecure2] = useState(true)
    const isValidEmail = useRef(false)
    const { control, handleSubmit, getValues, formState: { errors }, setError } = useForm<FormType>({
        defaultValues: {
            // email: "deepakq@testings.com",
            // password: "Dj@123456",
            // confirmPassword: "Dj@123456"
        },
        mode: 'onChange'
    })

    const onSubmit = useCallback(() => handleSubmit(data => {
        if (isTerms) {
            const { confirmPassword, ...rest } = data
            NavigationService.navigate("SignUp2", rest)
        } else {
            _showErrorMessage(Language.please_accept_terms)
        }
    })(), [isTerms]);

    const calculateButtonDisability = useCallback(() => {
        if (!getValues('email') || !getValues('confirmPassword') || !getValues('password') || (errors && (errors.confirmPassword || errors.email || errors.password)))
            return true
        return false
    }, [errors])

    const onBlurEmail = useCallback(() => {
        if (validateEmail(getValues('email'))) {
            dispatch(checkEmail({
                email: getValues('email'), onSuccess: (errorMessage: string) => {
                    if (errorMessage) {
                        setError('email', { message: errorMessage })
                        isValidEmail.current = false
                    } else {
                        isValidEmail.current = true
                        onSubmit()
                    }
                }
            }))
        }
    }, [])

    return (
        <SafeAreaView style={styles.container} >

            <Stepper step={1} totalSteps={3} />
            <ScrollView keyboardShouldPersistTaps={'handled'} >

                <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(15) }} >

                    <View style={{ flexDirection: 'row', alignItems: 'center', }} >
                        <Text style={styles.welcomeStyle} >{Language.lets_get_started}</Text>
                        <Image source={Images.ic_logo_name} style={styles.icon} />
                    </View>
                    <TextInput
                        title={Language.email}
                        placeholder={Language.enter_email_or_password}
                        name={'email'}
                        keyboardType={'email-address'}
                        required={true}
                        onChangeText={(text: string) => {

                        }}
                        // onBlur={onBlurEmail}
                        rules={EmailValidations}
                        control={control}
                        errors={errors}
                    />

                    <TextInput
                        placeholder={Language.password}
                        name={'password'}
                        rules={PasswordValidations}
                        required={true}
                        control={control}
                        errors={errors}
                        onPressIcon={() => setSecure1(!isSecure1)}
                        secureTextEntry={isSecure1}
                        icon={isSecure1 ? Images.ic_eye_open : Images.ic_eye_closed}
                        iconSize={scaler(18)}
                    />

                    <TextInput containerStyle={{ height: 0, padding: 0, margin: 0 }} />

                    <TextInput
                        placeholder={Language.confirm_password}
                        name={'confirmPassword'}
                        rules={{
                            ...ConfirmPasswordValidations,
                            validate: (confirmPassword: string) => {
                                if (confirmPassword != getValues('password')) return Language.both_pass_same
                                return true
                            }
                        }}
                        required={true}
                        control={control}
                        errors={errors}
                        onPressIcon={() => setSecure2(!isSecure2)}
                        secureTextEntry={isSecure2}
                        icon={isSecure2 ? Images.ic_eye_open : Images.ic_eye_closed}
                        iconSize={scaler(18)}
                    />

                    {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(20), justifyContent: 'center' }} >
                        <CheckBox checked={isTerms} setChecked={setTerms} />
                        <Text
                            onPress={() => {
                                setTerms(_ => !_)
                            }}
                            style={styles.iAccept} >{Language.i_accept_the}
                            <Text
                                onPress={() => {

                                }}
                                style={[styles.iAccept, { color: colors.colorPrimary }]} > {Language.term_of_service}</Text>
                        </Text>
                    </View> */}



                    <Button disabled={calculateButtonDisability()} containerStyle={{ marginTop: scaler(20) }} title={Language.next} onPress={onBlurEmail} />

                    <Text style={styles.notAMember} >{Language.already_a_member} <Text onPress={() => {
                        NavigationService.navigate("Login")
                    }} style={[styles.notAMember, { color: colors.colorPrimary }]} >{Language.log_in}</Text></Text>

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignUp1

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
        marginTop: scaler(20),
        color: colors.colorGreyText
    },
    iAccept: {
        alignSelf: 'center',
        fontWeight: '500',
        fontSize: scaler(15),
        marginLeft: scaler(10),
        color: colors.colorGreyText
    }
})