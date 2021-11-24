import OtpInputs from '@twotalltotems/react-native-otp-input'
import { verifyOtp } from 'app-store/actions'
import { colors, Images } from 'assets'
import { BackButton, Button, KeyboardHideView, KeyboardTopView, Text } from 'custom-components'
import { validateNumber } from 'custom-components/TextInput/rules'
import React, { FC, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import Language from 'src/language/Language'
import { NavigationService, scaler, _showErrorMessage } from 'utils'
const VerifyOTP: FC<any> = (props) => {
    const [otp, setOtp] = useState("")
    const dispatch = useDispatch()

    const disabled = !(otp?.trim()?.length == 4 && validateNumber(otp?.trim()))
    return (
        <SafeAreaView style={styles.container} >
            <BackButton />
            <View style={{ flex: 1, marginTop: scaler(40), alignItems: 'center', }} >
                <Image source={Images.ic_email_illustrator} style={{ height: scaler(100), marginLeft: scaler(20), resizeMode: 'contain', marginBottom: scaler(20) }} />
                <Text style={styles.check} > {Language.check_your_mail}</Text>
                <Text style={styles.weHave} > {Language.we_have_sent_you}</Text>

                <OtpInputs
                    pinCount={4}
                    autoFocusOnLoad={false}
                    style={{ width: '60%', marginTop: scaler(30), height: scaler(40), alignSelf: 'center' }}
                    codeInputFieldStyle={styles.underlineStyleBase}
                    codeInputHighlightStyle={styles.underlineStyleHighLighted}
                    onCodeChanged={(code) => {
                        setOtp(code.trim().toString())
                    }}
                />

            </View>

            <KeyboardTopView style={{ paddingHorizontal: scaler(20), paddingBottom: scaler(20) }} >
                <Button disabled={disabled} title={Language.verify_otp} onPress={() => {
                    if (otp.trim().length == 4 && validateNumber(otp.trim())) {
                        dispatch(verifyOtp({
                            otp: otp,
                            email: props?.route?.params?.email
                        }))
                    } else {
                        _showErrorMessage(Language.invalid_otp)
                    }

                }} />

            </KeyboardTopView>

            <KeyboardHideView>
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: '13%', paddingBottom: scaler(50) }} >
                    <Text style={styles.didYouNot} >{Language.did_you_not_receive}
                        <Text onPress={() => {
                            NavigationService.goBack()
                        }} style={[styles.didYouNot, { color: colors.colorPrimary }]} > {Language.try_another_email}</Text></Text>
                </View>
            </KeyboardHideView>



        </SafeAreaView>
    )
}

export default VerifyOTP

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
    },
    didYouNot: {
        fontWeight: '400',
        fontSize: scaler(13),
        color: colors.colorPlaceholder,
        textAlign: 'center'
    },
    check: {
        color: colors.colorBlack,
        fontWeight: '600',
        fontSize: scaler(16),
        textAlign: 'center'
    },
    weHave: {
        color: colors.colorPlaceholder,
        fontWeight: '400',
        fontSize: scaler(12),
        textAlign: 'center'
    },
    underlineStyleBase: {
        width: scaler(35),
        height: scaler(40),
        borderRadius: scaler(4),
        borderWidth: 1,
        fontSize: scaler(18),
        borderColor: colors.colorD,
        color: colors.colorPlaceholder
    },

    underlineStyleHighLighted: {
        borderColor: colors.colorPrimary,
        color: colors.colorPlaceholder
    },
})
