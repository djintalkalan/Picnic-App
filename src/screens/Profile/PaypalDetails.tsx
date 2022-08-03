import { colors } from 'assets/Colors';
import { Button, MyHeader, TextInput } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import React, { FC, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { scaler } from 'utils';


type FormType = {
    apiUserName: string;
    apiPassword: string;
    apiSignature: string;
};

const PaypalDetails: FC = () => {

    const dispatch = useDispatch()
    const { control, formState: { errors }, getValues } = useForm<FormType>({
        mode: 'onChange',
    });

    const calculateButtonDisability = useCallback(() => {
        if (!getValues('apiPassword') ||
            !getValues('apiSignature') ||
            !getValues('apiUserName')
            // || (errors.apiPassword || errors.apiSignature || errors.apiUserName)
        ) {
            return true;
        }
        return false;
    }, []);


    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <MyHeader title={Language.paypal_details} backEnabled />
            <View style={{ marginHorizontal: scaler(15), flex: 1 }}>
                <View style={{ width: '100%', paddingTop: scaler(15), flex: 1 }}>
                    <TextInput
                        containerStyle={{ marginEnd: scaler(4) }}
                        placeholder={Language.api_username}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'apiUserName'}
                        required={Language.api_username_required}
                        control={control}
                        errors={errors} />
                    <TextInput
                        containerStyle={{ marginEnd: scaler(4) }}
                        placeholder={Language.api_password}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'apiPassword'}
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
                        name={'apiSignature'}
                        required={Language.api_signature_required}
                        control={control}
                        errors={errors} />
                </View>
                <Button title={Language.submit} disabled={calculateButtonDisability()} />
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