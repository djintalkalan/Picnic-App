import { _getMerchantInfo, _updatePaypalInfo } from 'api';
import { setLoadingAction } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { Button, MyHeader, TextInput } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { useDatabase } from 'database/Database';
import React, { FC, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import CryptoJS from "react-native-crypto-js";
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { NavigationService, scaler, _showSuccessMessage } from 'utils';


type FormType = {
    payment_api_username: string;
    payment_api_password: string;
    payment_api_signature: string;
    payment_email: string;
};

const PaypalDetails: FC = () => {

    const dispatch = useDispatch()
    const { handleSubmit, trigger, control, formState: { errors, isValid }, getValues, setValue } = useForm<FormType>({
        mode: 'onChange',
    });
    const [userData] = useDatabase("userData")

    useEffect(() => {
        try {
            _getMerchantInfo().then(
                res => {
                    if (res?.status == 200) {

                        const token = res?.data?.token
                        const bytes = CryptoJS.AES.decrypt(token, userData?._id);
                        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                        setValue('payment_api_password', decryptedData?.payment_api_password)
                        setValue('payment_api_signature', decryptedData?.payment_api_signature)
                        setValue('payment_api_username', decryptedData?.payment_api_username)
                        setValue('payment_email', decryptedData?.payment_email)
                        if (Object.values(decryptedData).reduce((p: any, c: any) => ((c || "")?.trim() ? ((p || 0) + 1) : p), 0) == 4) {
                            setValue('payment_email', decryptedData?.payment_email, { shouldValidate: true })
                        }
                    }
                }
            ).catch(e => console.log(e))
        }
        catch {
            (e: any) => console.log(e);
        }


    }, [])

    const _onSubmit = useCallback(() => handleSubmit((data) => {
        console.log("data", data);
        const token = CryptoJS.AES.encrypt(JSON.stringify(data), userData?._id).toString();

        console.log("token", token);
        dispatch(setLoadingAction(true))
        _updatePaypalInfo({ token }).then(res => {
            if (res?.status == 200) {
                _showSuccessMessage(res?.message)
                NavigationService.goBack()
            }
            dispatch(setLoadingAction(false))
        }).catch(() => {
            dispatch(setLoadingAction(false))

        })

    })(), [])

    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <MyHeader title={Language.paypal_details} backEnabled />
            <View style={{ marginHorizontal: scaler(15), flex: 1 }}>
                <View style={{ width: '100%', paddingTop: scaler(15), flex: 1 }}>
                    <TextInput
                        containerStyle={{ marginEnd: scaler(4) }}
                        placeholder={Language.paypal_id}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'payment_email'}
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        required={Language.paypal_id_required}
                        // rules={EmailValidations}
                        control={control}
                        errors={errors} />
                    <TextInput
                        containerStyle={{ marginEnd: scaler(4) }}
                        placeholder={Language.api_username}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'payment_api_username'}
                        required={Language.api_username_required}
                        control={control}
                        errors={errors} />
                    <TextInput
                        containerStyle={{ marginEnd: scaler(4) }}
                        placeholder={Language.api_password}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'payment_api_password'}
                        // onPressIcon={() => setSecure(!isSecure)}
                        autoCapitalize={'none'}
                        required={Language.api_password_required}
                        control={control}
                        errors={errors} />
                    <TextInput
                        containerStyle={{ marginEnd: scaler(4) }}
                        placeholder={Language.api_signature}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'payment_api_signature'}
                        required={Language.api_signature_required}
                        control={control}
                        errors={errors} />
                </View>
                <Button onPress={_onSubmit} title={Language.submit} disabled={!isValid} />
            </View>
        </SafeAreaViewWithStatusBar>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
    },
});

export default PaypalDetails;