import { config } from 'api'
import { doLogin } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Button, CheckBox, Text, TextInput } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { EmailValidations } from 'custom-components/TextInput/rules'
import { useVideoPlayer } from 'custom-components/VideoProvider'
import React, { FC, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch } from 'react-redux'
import Language from 'src/language/Language'
import UUIDService from 'src/uuid/UUIDService'
import { NavigationService, openLink, scaler } from 'utils'

type LoginFormType = {
    email: string
    password: string
}

const Login: FC = () => {
    const [isSecure, setSecure] = useState(true)
    const [isTerms, setTerms] = useState(__DEV__);
    const { loadVideo } = useVideoPlayer()

    const { control, handleSubmit, getValues, setValue, formState: { errors, isValid } } = useForm<LoginFormType>({
        defaultValues: __DEV__ ? Platform.OS == 'ios' ? {
            // email: "mukeshkaushal2008@gmail.com",
            // password: "Mukesh@123",
            // email: "sangeeta@shinewebservices.com",
            // password: "Shine@2022",
            // email: "sangeetakohar484@gmail.com",
            // password: "Sangu@123",
            email: config.APP_TYPE == 'dev' ? "sangeeta@shinewebservices.com" : "picnicshine@gmail.com",
            password: config.APP_TYPE == 'dev' ? "Shine@22" : "Shine@2015",
            // email: "deepakq@testings.com",
            // password: "Dj@123456",

        } : {
            // email: "deepakq@testings.com",
            //     password: "Dj@123456",
            email: config.APP_TYPE == 'dev' ? "deepak@shinewebservices.com" : "picnicshine@gmail.com",
            password: config.APP_TYPE == 'dev' ? "Deepak@123" : "Shine@2015",
        } : {},
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
        // loadVideo("http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4")
        dispatch(doLogin(data))
    })(), []);

    return (
        <SafeAreaViewWithStatusBar style={styles.container} >
            <ScrollView enableResetScrollToCoords={false} contentContainerStyle={{ flex: 1 }} keyboardShouldPersistTaps={'handled'} >

                <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(20) }} >

                    <View style={{ marginTop: scaler(30), flexDirection: 'row', alignItems: 'center', }} >

                        <Text style={styles.welcomeStyle} >{Language.welcome_back}</Text>

                        <Pressable onPress={UUIDService.showUUIDToast} ><Image source={Images.ic_logo_name} style={styles.icon} /></Pressable>

                    </View>

                    <TextInput
                        title={Language.email}
                        placeholder={Language.enter_email_or_password}
                        name={'email'}
                        autoCapitalize={'none'}
                        required={true}
                        // onChangeText={onVerify}
                        keyboardType={'email-address'}
                        rules={{
                            ...EmailValidations(),
                            validate: (v) => {
                                if (v?.toLowerCase() != v)
                                    setValue("email", v?.toLowerCase())
                                return true
                            }
                        }}
                        control={control}
                        errors={errors}
                    />

                    <TextInput
                        placeholder={Language.password}
                        style={{ fontSize: scaler(13) }}
                        name={'password'}
                        onPressIcon={() => setSecure(!isSecure)}
                        secureTextEntry={isSecure}
                        autoCapitalize={'none'}
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

                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: scaler(20),
                            justifyContent: 'center',
                        }}>
                        <CheckBox checked={isTerms} setChecked={setTerms} />
                        <Text
                            onPress={() => {
                                setTerms(_ => !_);
                            }}
                            style={styles.iAccept}>
                            {Language.i_accept_the}
                            <Text
                                onPress={() => {
                                    openLink(config.TERMS_URL)
                                }}
                                style={[styles.iAccept, { color: colors.colorPrimary }]}>
                                {' '}
                                {Language.term_of_service}
                            </Text>{' '}
                            {Language.and}{' '}
                            <Text
                                onPress={() => {
                                    openLink(config.PRIVACY_URL)
                                }}
                                style={[styles.iAccept, { color: colors.colorPrimary }]}>
                                {Language.privacy_policy}
                            </Text>
                        </Text>
                    </View>

                    <Button disabled={!isTerms || !isValid} containerStyle={{ marginTop: scaler(20) }} title={Language.login} onPress={onSubmit} />

                    <Text style={styles.notAMember} >{Language.not_a_member}
                        <Text onPress={() => NavigationService.navigate("SendOtp")} style={[styles.notAMember, { color: colors.colorPrimary }]} > {Language.sign_up}</Text></Text>

                </View>

            </ScrollView>
        </SafeAreaViewWithStatusBar>
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
    },

    iAccept: {
        alignSelf: 'center',
        fontWeight: '400',
        fontSize: scaler(12),
        marginLeft: scaler(10),
        color: colors.colorGreyText,
    },
})


// _showPopUpAlert({
//     title: "Success",
//     image: Images.ic_delete_user,
//     message: "User created successfully",
//     buttonText: "Close",
//     isCloseButton: true
// })