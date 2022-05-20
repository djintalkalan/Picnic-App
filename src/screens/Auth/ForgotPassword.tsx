// import { useFocusEffect } from '@react-navigation/core'
import { forgotPassword } from 'app-store/actions'
import { colors } from 'assets'
import { Button, Text, TextInput } from 'custom-components'
import { BackButton } from 'custom-components/BackButton'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { EmailValidations } from 'custom-components/TextInput/rules'
import React, { FC, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'
import Language from 'src/language/Language'
import { scaler } from 'utils'

type FormType = {
    email: string
}

const ForgotPassword: FC = () => {

    const { control, handleSubmit, setValue, getValues, formState: { errors } } = useForm<FormType>({
        defaultValues: {
            // email: "deepak@shinewebservices.com",
        },
        mode: 'onChange'
    })

    const dispatch = useDispatch();

    const onSubmit = useCallback(() => handleSubmit(data => {
        dispatch(forgotPassword(data))

    })(), []);

    const usernameRef = useRef()

    const calculateButtonDisability = useCallback(() => {
        if (!getValues('email') || (errors && (errors.email)))
            return true
        return false
    }, [errors])


    return (
        <SafeAreaViewWithStatusBar style={styles.container} >
            <BackButton />

            <View style={{ flex: 1, width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(0) }} >

                <Text style={styles.heading} >{Language.forgot_password}</Text>
                <Text style={styles.content} >{Language.forgot_password_text}</Text>

                <TextInput
                    ref={usernameRef}
                    title={Language.email}
                    autoCapitalize={'none'}
                    placeholder={Language.enter_email_or_password}
                    name={'email'}
                    keyboardType={'email-address'}
                    style={{ fontSize: scaler(13) }}
                    required={true}
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
                    disabled={calculateButtonDisability()}
                    containerStyle={{ marginTop: scaler(25) }}
                    title={Language.submit} onPress={onSubmit} />

            </View>

        </SafeAreaViewWithStatusBar>
    )
}

export default ForgotPassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center'
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