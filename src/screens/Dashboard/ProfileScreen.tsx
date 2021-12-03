import { colors } from 'assets/Colors'
import { Images } from 'assets/Images'
import { Card, MyHeader, PhoneInput, Text, TextInput } from 'custom-components'
import { EmailValidations } from 'custom-components/TextInput/rules'
import React, { FC, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Image, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import Language from 'src/language/Language'
import { scaler } from 'utils'

type FormType = {
    about: string
    firstName: string
    lastName: string
    phone: string
    phone_dialCode: string
    city: string
}

const ProfileScreen: FC<any> = (props) => {

    const source = useMemo(() => {
        return Images.ic_profile_image
    }, [])

    const { control, handleSubmit, getValues, setValue, setError, formState: { errors } } = useForm<FormType>({
        defaultValues: {
            // about: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. ",
            // // about: "",
            // firstName: "Deepak",
            // lastName: "Jaglan",
            // phone: "9588558818",
            // phone_dialCode: '+91',
            // city: "Jind"

        },
        mode: 'onChange'
    })



    return (
        <SafeAreaView style={styles.container} >

            <MyHeader title={Language.profile} />

            <ScrollView contentContainerStyle={{ alignItems: 'center', }} >

                <View>
                    <View style={styles.imageContainer} >
                        <Image style={styles.image} source={source} />
                    </View>

                    <TouchableOpacity style={styles.cameraButton} >
                        <Image style={styles.image} source={Images.ic_camera} />
                    </TouchableOpacity>
                </View>

                <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(20) }} >

                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }} >

                        <TextInput
                            containerStyle={{ flex: 1, marginEnd: scaler(4), }}
                            placeholder={Language.first_name}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            name={'firstName'}
                            required={true}
                            control={control}
                            errors={errors}
                        />

                        <TextInput
                            containerStyle={{ flex: 1, marginStart: scaler(4) }}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            placeholder={Language.last_name}
                            name={'lastName'}
                            required={true}
                            control={control}
                            errors={errors}
                        />

                    </View>

                    <TextInput
                        placeholder={Language.username}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'username'}
                        control={control}
                        errors={errors}
                    />

                    <TextInput
                        placeholder={Language.email}
                        name={'email'}
                        required={true}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        keyboardType={'email-address'}
                        rules={EmailValidations}
                        control={control}
                        errors={errors}
                    />

                    <TextInput
                        placeholder={Language.birthday}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'dob'}
                        control={control}
                        errors={errors}
                    />

                    <TextInput
                        placeholder={Language.location}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'location'}
                        control={control}
                        errors={errors}
                    />

                    <PhoneInput
                        name={'phone'}
                        placeholder={Language.phone}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        controlObject={{ control, getValues, setValue, setError }}
                        defaultCountry={'IN'}
                        required
                        errors={errors}
                    />

                    <TextInput
                        placeholder={Language.about}
                        name={'about'}
                        multiline
                        style={{ minHeight: scaler(80) }}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        control={control}
                        errors={errors}
                    />

                </View>

            </ScrollView>

            {/* <CardContent title={Language.phoneNumber} content="+1 234 543 657" /> */}

        </SafeAreaView>
    )
}

export default ProfileScreen

const CardContent = (props: { title: string, content: string, style?: ViewStyle }) => (<Card
    style={[styles.cardStyle, { ...props?.style }]}
    cardElevation={1}
    cornerRadius={scaler(15)}
    cardMaxElevation={2}   >
    <Text style={styles.about} >{props?.title}</Text>
    <Text style={styles.aboutContent} >{props?.content}</Text>

</Card>
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    },
    profile: {
        fontWeight: '600',
        color: colors.colorBlack,
        fontSize: scaler(18)
    },
    image: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain',
    },
    changeProfile: {
        fontWeight: '500',
        color: colors.colorPrimary,
        fontSize: scaler(13)
    },
    about: {
        fontWeight: '500',
        color: colors.colorGreyText,
        fontSize: scaler(10)
    },
    aboutContent: {
        fontWeight: '400',
        color: colors.colorBlack,
        fontSize: scaler(12)
    },
    cardStyle: {
        width: '86%',
        backgroundColor: colors.colorWhite,
        marginHorizontal: '7%',
        marginTop: scaler(12),
        padding: scaler(10)
    },
    cameraButton: {
        position: 'absolute',
        overflow: 'hidden',
        borderRadius: scaler(20),
        borderWidth: scaler(1),
        borderColor: '#F6F6F7',
        height: scaler(35),
        width: scaler(35),
        end: 2,
        bottom: 2,
        padding: scaler(4),
        zIndex: 10,
        backgroundColor: colors.colorWhite
    },
    imageContainer: {
        overflow: 'hidden',
        borderRadius: scaler(50),
        borderWidth: scaler(4),
        borderColor: '#F6F6F7',
        height: scaler(100),
        width: scaler(100)
    }
})
