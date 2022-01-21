import { doLogin } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Button, Text, TextInput } from 'custom-components'
import { EmailValidations } from 'custom-components/TextInput/rules'
import React, { FC, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Image, Platform, StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import Language from 'src/language/Language'
import { NavigationService, scaler } from 'utils'

type LoginFormType = {
    email: string
    password: string
}

const Login: FC = () => {

    const [isSecure, setSecure] = useState(true)

    const { control, handleSubmit, getValues, formState: { errors } } = useForm<LoginFormType>({
        defaultValues: Platform.OS == 'ios' ? {
            // email: "mukeshkaushal2008@gmail.com",
            // password: "Mukesh@123",
            email: "sangeeta@shinewebservices.com",
            password: "Shine@2022",
        } : {
            email: "deepak@shinewebservices.com",
            password: "Deepak@123",

        },
        mode: 'onChange'
    })

    const dispatch = useDispatch()

    const onSubmit = useCallback(() => handleSubmit(data => {
        // _showPopUpAlert({
        //     title: "Success",
        //     image: Images.ic_delete_user,
        //     message: "User created successfully",
        //     buttonText: "Close",
        //     // isCloseButton: true
        // })
        dispatch(doLogin(data))
    })(), []);

    const calculateButtonDisability = useCallback(() => {
        if (!getValues('email') || !getValues('password') || (errors && (errors.email || errors.password)))
            return true
        return false
    }, [errors])

    return (
        <SafeAreaView style={styles.container} >
            <ScrollView contentContainerStyle={{ flex: 1 }} keyboardShouldPersistTaps={'handled'} >

                <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(20) }} >

                    <View style={{ marginTop: scaler(30), flexDirection: 'row', alignItems: 'center', }} >

                        <Text style={styles.welcomeStyle} >{Language.welcome_back}</Text>


                        <Image source={Images.ic_logo_name} style={styles.icon} />

                    </View>

                    <TextInput
                        title={Language.email}
                        placeholder={Language.enter_email_or_password}
                        name={'email'}
                        required={true}
                        // onChangeText={onVerify}
                        keyboardType={'email-address'}
                        rules={EmailValidations}
                        control={control}
                        errors={errors}
                    />

                    <TextInput
                        placeholder={Language.password}
                        style={{ fontSize: scaler(13) }}
                        name={'password'}
                        onPressIcon={() => setSecure(!isSecure)}
                        secureTextEntry={isSecure}
                        icon={isSecure ? Images.ic_eye_open : Images.ic_eye_closed}
                        iconSize={scaler(18)}
                        required={true}
                        // rules={PasswordValidations}
                        control={control}
                        errors={errors}
                    />

                    <Text onPress={() => {
                        NavigationService.navigate("ForgotPassword")
                    }} style={styles.forgotPassword} >{Language.forgot_your_password}</Text>

                    <Button disabled={calculateButtonDisability()} containerStyle={{ marginTop: scaler(20) }} title={Language.login} onPress={onSubmit} />

                    <Text style={styles.notAMember} >{Language.not_a_member}
                        <Text onPress={() => NavigationService.navigate("SignUp1")} style={[styles.notAMember, { color: colors.colorPrimary }]} > {Language.sign_up}</Text></Text>

                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default Login

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
    forgotPassword: {
        marginStart: scaler(15),
        fontWeight: '400',
        fontSize: scaler(13),
        alignSelf: 'flex-end',
        marginVertical: scaler(10),
        color: colors.colorPrimary

    },
    notAMember: {
        alignSelf: 'center',
        fontWeight: '400',
        fontSize: scaler(14),
        // marginVertical: scaler(20),
        marginTop: scaler(40),
        color: colors.colorGreyText
    }
})


// _showPopUpAlert({
//     title: "Success",
//     image: Images.ic_delete_user,
//     message: "User created successfully",
//     buttonText: "Close",
//     isCloseButton: true
// })