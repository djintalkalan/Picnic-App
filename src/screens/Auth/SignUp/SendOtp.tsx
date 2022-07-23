import { checkEmail, setLoadingAction } from 'app-store/actions';
import { colors, Images } from 'assets';
import { Button, Stepper, Text, TextInput } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { EmailValidations, validateEmail } from 'custom-components/TextInput/rules';
import React, { FC, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Image, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { NavigationService, scaler } from 'utils';

type FormType = {
    email: string;
};

const SendOtp: FC = () => {
    const dispatch = useDispatch();

    const {
        control,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors },
        setError,
    } = useForm<FormType>({
        defaultValues: __DEV__ ? {
            email: "abcdefg@yopmail.com",
        } : {},
        mode: 'onChange',
    });

    const onSubmit = useCallback(
        () =>
            handleSubmit(data => {
                try {
                    dispatch(setLoadingAction(false))
                    NavigationService.navigate("SignUp1", { email: data?.email?.trim()?.toLowerCase() })
                    // _sendOtp({ email: data?.email?.trim()?.toLowerCase() }).then((res) => {
                    //     dispatch(setLoadingAction(false))
                    //     if (res?.status == 200) {
                    //         _showSuccessMessage(res?.message)
                    //         NavigationService.navigate('VerifyOtp', { isSignUp: true, ...data });
                    //     }
                    //     else {
                    //         _showErrorMessage(res?.message)
                    //     }
                    // }).catch(e => {
                    //     console.log(e)
                    //     dispatch(setLoadingAction(false))
                    // })
                } catch { (e: any) => console.log(e) }
            })(),
        [],
    );

    const buttonDisability = useMemo(() => {
        if (
            !getValues('email') ||
            (errors && errors.email)
        )
            return true;
        return false;
    }, [errors?.email?.message]);

    const onBlurEmail = useCallback(() => {
        if (validateEmail(getValues('email'))) {
            dispatch(
                checkEmail({
                    email: getValues('email'),
                    onSuccess: (errorMessage: string) => {
                        if (errorMessage) {
                            setError('email', { message: errorMessage });
                        } else {
                            onSubmit();
                        }
                    },
                }),
            );
        }
    }, []);

    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <Stepper step={1} totalSteps={4} />
            <ScrollView enableResetScrollToCoords={false} keyboardShouldPersistTaps={'handled'}>
                <View
                    style={{
                        width: '100%',
                        paddingHorizontal: scaler(20),
                        paddingVertical: scaler(15),
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.welcomeStyle}>{Language.lets_get_started}</Text>
                        <Image source={Images.ic_logo_name} style={styles.icon} />
                    </View>
                    <TextInput
                        title={Language.email}
                        autoCapitalize={'none'}
                        placeholder={Language.enter_email_or_password}
                        name={'email'}
                        keyboardType={'email-address'}
                        required={true}
                        onChangeText={(text: string) => { }}
                        // onBlur={onBlurEmail}
                        rules={{
                            ...EmailValidations,
                            validate: (v) => {
                                if (v?.toLowerCase() != v)
                                    setValue("email", v?.toLowerCase())
                                return true
                            }
                        }}
                        control={control}
                        errors={errors}
                    />

                    <Button
                        disabled={buttonDisability}
                        containerStyle={{ marginTop: scaler(20) }}
                        title={Language.next}
                        onPress={onBlurEmail}
                    />

                    <Text style={styles.notAMember}>
                        {Language.already_a_member}{' '}
                        <Text
                            onPress={() => {
                                NavigationService.navigate('Login');
                            }}
                            style={[styles.notAMember, { color: colors.colorPrimary }]}>
                            {Language.log_in}
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaViewWithStatusBar>
    );
};

export default SendOtp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center',
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
        color: colors.colorGreyText,
    },
    iAccept: {
        alignSelf: 'center',
        fontWeight: '500',
        fontSize: scaler(15),
        marginLeft: scaler(10),
        color: colors.colorGreyText,
    },
});
