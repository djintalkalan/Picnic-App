import { resetPassword } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Text, TextInput } from 'custom-components'
import { BackButton } from 'custom-components/BackButton'
import Button from 'custom-components/Button'
import { PasswordValidations } from 'custom-components/TextInput/rules'
import React, { FC, useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import Language from 'src/language/Language'
import { scaler } from 'utils'

type FormType = {
    password: string
    confirmPassword: string
}

const CreateNewPassword: FC<any> = (props) => {
    const [isSecure1, setSecure1] = useState(true)
    const [isSecure2, setSecure2] = useState(true)
    const { control, handleSubmit, getValues, formState: { errors, } } = useForm<FormType>({
        defaultValues: {

        },
        mode: 'onChange'
    })
    const dispatch = useDispatch()
    const onSubmit = useCallback(() => handleSubmit(data => {
        dispatch(resetPassword({
            password: data?.password,
            ...props?.route?.params
        }))
    })(), []);

    const passwordRef = useRef()
    const confirmPasswordRef = useRef()

    const calculateButtonDisability = useCallback(() => {
        if (!getValues('confirmPassword') || !getValues('password') || (errors && (errors.confirmPassword || errors.password)))
            return true
        return false
    }, [errors])

    return (
        <SafeAreaView style={styles.container} >
            <BackButton />



            <View style={{ flex: 1, width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(5) }} >
                <Text style={styles.heading} >{Language.create_new_password}</Text>
                <Text style={styles.content} >{Language.create_new_password_text}</Text>

                <TextInput
                    ref={passwordRef}
                    placeholder={Language.password}
                    rules={PasswordValidations}
                    name={'password'}
                    onPressIcon={() => setSecure1(!isSecure1)}
                    secureTextEntry={isSecure1}
                    icon={isSecure1 ? Images.ic_eye_open : Images.ic_eye_closed}
                    iconSize={scaler(18)}
                    required={true}
                    control={control}
                    errors={errors}
                />

                <TextInput disabled containerStyle={{ height: 0 }} />

                <TextInput
                    ref={confirmPasswordRef}
                    placeholder={Language.confirm_password}
                    name={'confirmPassword'}
                    rules={{
                        ...PasswordValidations,
                        validate: (confirmPassword: string) => {
                            if (confirmPassword != getValues('password')) return Language.both_pass_same
                            return true
                        }
                    }}
                    onPressIcon={() => setSecure2(!isSecure2)}
                    secureTextEntry={isSecure2}
                    icon={isSecure2 ? Images.ic_eye_open : Images.ic_eye_closed}
                    iconSize={scaler(18)}
                    required={true}
                    control={control}
                    errors={errors}
                />
                <Button disabled={calculateButtonDisability()} containerStyle={{ marginTop: scaler(25) }} textStyle={{ textTransform: 'capitalize' }} title={Language.reset_password} onPress={onSubmit} />

            </View>
        </SafeAreaView>
    )
}

export default CreateNewPassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center'
    },
    heading: {
        fontSize: scaler(18),
        marginTop: scaler(10),
        // marginHorizontal: scaler(5),
        fontWeight: '600',
    },
    content: {
        fontSize: scaler(13),
        marginTop: scaler(5),
        marginBottom: scaler(10),
        fontWeight: '400',
        // marginHorizontal: scaler(5),
        color: colors.colorPlaceholder
    },
})