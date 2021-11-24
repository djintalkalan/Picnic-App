import { colors } from 'assets/Colors'
import { Images } from 'assets/Images'
import { BackButton, Card, PhoneInput, Text, TextInput } from 'custom-components'
import React, { FC, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Image, StyleSheet, View, ViewStyle } from 'react-native'
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
        return Images.ic_delete_user
    }, [])

    const { control, handleSubmit, getValues, setValue, setError, formState: { errors } } = useForm<FormType>({
        defaultValues: {
            about: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. ",
            // about: "",
            firstName: "Deepak",
            lastName: "Jaglan",
            phone: "9588558818",
            phone_dialCode: '+91',
            city: "Jind"

        },
        mode: 'onChange'
    })



    return (
        <SafeAreaView style={styles.container} >
            <BackButton />

            <Text style={styles.profile} >{Language.profile}</Text>

            <Image style={styles.image} source={source} />

            <Text onPress={() => {
                alert("hi")
            }} style={styles.changeProfile} >{Language.changeProfilePhoto}</Text>

            <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(20) }} >
                <TextInput
                    placeholder={Language.about}
                    name={'about'}
                    multiline
                    control={control}
                    errors={errors}
                />

                <TextInput
                    placeholder={Language.first_name}
                    name={'firstName'}
                    required={true}
                    control={control}
                    errors={errors}
                />

                <TextInput
                    placeholder={Language.last_name}
                    name={'lastName'}
                    required={true}
                    control={control}
                    errors={errors}
                />

                <TextInput
                    placeholder={Language.city}
                    name={'city'}
                    control={control}
                    errors={errors}
                />

                <PhoneInput
                    name={'phone'}
                    placeholder={Language.phone}
                    controlObject={{ control, getValues, setValue, setError }}
                    defaultCountry={'IN'}
                    required
                    errors={errors}
                />


            </View>

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
        alignItems: 'center',
        backgroundColor: colors.colorBackground
    },
    profile: {
        fontWeight: '600',
        color: colors.colorBlack,
        fontSize: scaler(18)
    },
    image: {
        height: scaler(100),
        aspectRatio: 1,
        resizeMode: 'contain',
        marginVertical: scaler(10)
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
    }
})
