import OtpInputs from '@twotalltotems/react-native-otp-input'
import { verifyOtp } from 'app-store/actions'
import { colors, Images } from 'assets'
import { BackButton, Button, Text } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { validateNumber } from 'custom-components/TextInput/rules'
import React, { FC, useState } from 'react'
import { Dimensions, Image, StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch } from 'react-redux'
import Language from 'src/language/Language'
import { NavigationService, scaler, _showErrorMessage } from 'utils'
const VerifyOTP: FC<any> = (props) => {
    const [otp, setOtp] = useState("")
    const dispatch = useDispatch()

    const disabled = !(otp?.trim()?.length == 4 && validateNumber(otp?.trim()))
    return (
        <SafeAreaViewWithStatusBar style={styles.container} >
            <BackButton />
            <ScrollView contentContainerStyle={{ flex: 1, paddingHorizontal: scaler(20) }} >

                <Text style={styles.heading} >{Language.enter_verification_code}</Text>
                <Text style={styles.content} >{Language.enter_otp_sent}</Text>

                <OtpInputs
                    pinCount={4}
                    autoFocusOnLoad={false}
                    style={{ width: '100%', marginVertical: scaler(20), height: scaler(50), alignSelf: 'center' }}
                    codeInputFieldStyle={styles.underlineStyleBase}
                    codeInputHighlightStyle={styles.underlineStyleHighLighted}
                    secureTextEntry={true}
                    onCodeChanged={(code) => {
                        setOtp(code.trim().toString())
                    }}
                />

                <Button disabled={disabled} title={Language.verify} onPress={() => {
                    if (otp.trim().length == 4 && validateNumber(otp.trim())) {
                        dispatch(verifyOtp({
                            otp: otp,
                            email: props?.route?.params?.email
                        }))
                    } else {
                        _showErrorMessage(Language.invalid_otp)
                    }

                }} />



                <Image source={Images.ic_email_illustrator} style={{ flex: 1, resizeMode: 'contain', width: '100%', marginVertical: scaler(20) }} />

            </ScrollView>

            <View style={{ marginVertical: scaler(20), marginHorizontal: '10%' }} >
                <Text style={styles.check} >{Language.check_your_mail}</Text>
                <Text style={styles.weHave} >{Language.we_have_sent_you}</Text>
            </View>

            <Text style={styles.didYouNot} >{Language.did_you_not_receive}
                <Text onPress={() => {
                    NavigationService.goBack()
                }} style={[styles.didYouNot, { color: colors.colorPrimary }]} > {Language.try_another_email}</Text></Text>

        </SafeAreaViewWithStatusBar>
    )
}

export default VerifyOTP

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        height: Dimensions.get('screen').height - scaler(30),
        backgroundColor: colors.colorWhite,
    },
    didYouNot: {
        fontWeight: '400',
        fontSize: scaler(13),
        color: colors.colorPlaceholder,
        marginHorizontal: "13%",
        marginVertical: scaler(20),
        textAlign: 'center'
    },
    check: {
        color: colors.colorBlack,
        fontWeight: '600',
        fontSize: scaler(20),
        textAlign: 'center'
    },
    weHave: {
        color: colors.colorPlaceholder,
        fontWeight: '400',
        fontSize: scaler(14),
        textAlign: 'center'
    },
    underlineStyleBase: {
        width: (Dimensions.get('screen').width - (90)) / 4,// scaler(35),
        height: scaler(50),
        borderRadius: scaler(7),
        borderWidth: 1,
        fontSize: scaler(18),
        borderColor: colors.colorD,
        color: colors.colorPlaceholder
    },

    underlineStyleHighLighted: {
        borderColor: colors.colorPrimary,
        color: colors.colorPlaceholder
    },
    heading: {
        fontSize: scaler(18),
        marginTop: scaler(20),
        // marginHorizontal: scaler(5),
        fontWeight: '600',
    },
    content: {
        fontSize: scaler(12),
        marginTop: scaler(5),
        marginBottom: scaler(10),
        fontWeight: '400',
        // marginHorizontal: scaler(5),
        color: colors.colorPlaceholder
    },
})
