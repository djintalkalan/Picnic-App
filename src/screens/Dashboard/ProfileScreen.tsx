import { getProfile, updateProfile, uploadFile } from 'app-store/actions'
import { colors } from 'assets/Colors'
import { Images } from 'assets/Images'
import { Button, KeyboardHideView, MyHeader, PhoneInput, Text, TextInput } from 'custom-components'
import { EmailValidations } from 'custom-components/TextInput/rules'
import { sub } from 'date-fns'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view'
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import Database, { useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { dateFormat, getImageUrl, ProfileImagePickerOptions, scaler, stringToDate } from 'utils'

type FormType = {
    about: string
    firstName: string
    lastName: string
    phone: string
    phone_dialCode: string
    city: string
    username: string
    email: string
    dob: string
    location: string

}

const ProfileScreen: FC<any> = (props) => {

    const dispatch = useDispatch()

    // const 
    const birthDate = useRef<Date>(new Date())



    // const [isEditEnabled, setEditEnabled] = useState(props?.route?.params?.isEditEnabled)
    const [isEditEnabled, setEditEnabled] = useState(true)
    const [profileImage, setProfileImage] = useState<any>()
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);


    const [userData] = useDatabase<any>("userData")

    const { control, handleSubmit, getValues, clearErrors, setValue, setError, formState: { errors } } = useForm<FormType>({
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


    useEffect(() => {
        dispatch(getProfile())
    }, [])

    useEffect(() => {
        setProfileData(userData)
    }, [userData])

    const pickImage = useCallback(() => {
        setTimeout(() => {
            ImagePicker.openPicker(ProfileImagePickerOptions).then((image) => {
                console.log(image);
                setProfileImage(image)
            }).catch(e => {
                console.log(e)
            });
        }, 200);

    }, [])


    const setProfileData = useCallback((userData: any) => {
        console.log("getImageUrl('users', scaler(100), scaler(100))", getImageUrl(userData?.image, { type: 'users', width: scaler(100) }))
        const { first_name, image, last_name, email, username, dial_code, phone_number, dob, bio } = userData
        setValue("firstName", first_name)
        setValue("lastName", last_name)
        setValue("about", bio)
        setValue("username", username)
        setValue("email", email)
        if (dob) {
            birthDate.current = stringToDate(dob, "YYYY-MM-DD", "-")
            setValue("dob", dateFormat(birthDate.current, "MMM DD, YYYY"))
        }
        setValue("phone", phone_number)
        setValue("phone_dialCode", dial_code)
        setValue("location", first_name)
    }, [])

    const callUpdateApi = useCallback((data: any, imageFile?: string) => {
        dispatch(updateProfile({
            first_name: data?.firstName,
            last_name: data?.lastName,
            username: data?.username,
            dial_code: data?.phone_dialCode,
            phone_number: data?.phone,
            bio: data?.about,
            // dob: dateFormat(birthDate.current, "YYYY-MM-DD"),
            image: imageFile,
        }))
    }, [])

    return (
        <SafeAreaView style={styles.container} >


            <MyHeader
                // onPress={() => {
                //     if (isEditEnabled) {
                //         setEditEnabled(false)
                //         setProfileData(userData)
                //         setProfileImage(null)
                //         clearErrors("email")
                //         clearErrors("dob")

                //     } else NavigationService.goBack()
                // }}
                title={isEditEnabled ? Language.edit_profile : Language.profile} />
            {/* <View> */}

            <ScrollView extraScrollHeight={40} keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ alignItems: 'center', }} >

                <View>
                    <View style={styles.imageContainer} >
                        <Image onError={(err) => {
                            setProfileImage(Images.ic_home_profile)
                        }} style={styles.image} source={
                            profileImage ? profileImage?.path ? { uri: profileImage?.path } : profileImage :
                                userData?.image ? { uri: getImageUrl(userData?.image, { type: 'users', width: scaler(60) }) } :
                                    Images.ic_home_profile
                        } />
                    </View>
                    {isEditEnabled ? <TouchableOpacity onPress={pickImage} style={styles.cameraButton} >
                        <Image style={styles.image} source={Images.ic_camera} />
                    </TouchableOpacity> : null}
                </View>

                <View pointerEvents={isEditEnabled ? "auto" : 'none'} style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(20) }} >

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
                        onPress={() => setError('email', { message: 'Contact support to change your email address' })}
                        style={{ color: "rgba(6, 29, 50, 0.4)" }}
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
                        onPress={() => setError('dob', { message: 'Contact support to change your date of birth' })}
                        style={{ color: "rgba(6, 29, 50, 0.4)" }}

                        required={true}
                        // icon={Images.ic_calender}

                        iconSize={scaler(20)}
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
                        defaultCountry={Database.DefaultCountry}
                        required
                        errors={errors}
                    />

                    <TextInput
                        placeholder={Language.tell_us_about}
                        name={'about'}
                        multiline
                        limit={400}
                        style={{ minHeight: scaler(80), maxHeight: scaler(160), textAlignVertical: 'top' }}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        control={control}
                        errors={errors}
                    />

                </View>

            </ScrollView>
            <DateTimePickerModal
                themeVariant={'light'}
                style={{ zIndex: 20 }}
                isVisible={isDatePickerVisible}
                mode="date"
                customConfirmButtonIOS={(props) => (
                    <Text onPress={props.onPress} style={{ fontWeight: '500', fontSize: scaler(18), color: colors.colorPrimary, textAlign: 'center', padding: scaler(10) }} >Confirm
                    </Text>
                )}
                customCancelButtonIOS={(props) => (
                    <View style={{ padding: scaler(7), backgroundColor: 'white', borderRadius: scaler(10), marginBottom: scaler(10) }} >
                        <Text onPress={props.onPress} style={{ fontWeight: '500', fontSize: scaler(18), color: colors.colorBlack, textAlign: 'center', padding: scaler(5) }} >Cancel</Text>
                    </View>
                )}
                date={birthDate.current}
                maximumDate={sub(new Date(), {
                    years: 15,
                })}
                onConfirm={(date: Date) => {
                    birthDate.current = date
                    setValue("dob", dateFormat(date, "MMM DD, YYYY"), { shouldValidate: true })
                    setDatePickerVisibility(false);
                }}
                onCancel={() => {
                    setDatePickerVisibility(false);
                }}
            />
            {/* </View> */}

            <KeyboardHideView>
                <Button onPress={() => {
                    if (isEditEnabled) {
                        handleSubmit(async (data) => {
                            if (profileImage?.path) {
                                dispatch(uploadFile({
                                    image: profileImage,
                                    onSuccess: (url) => {
                                        console.log("URL is ", url)
                                        callUpdateApi(data, url);
                                    },
                                    prefixType: 'users'
                                }))
                            }
                            else {
                                callUpdateApi(data);
                            }
                        })()
                    } else {
                        setEditEnabled(true)
                    }
                }} containerStyle={{ marginTop: 0, marginBottom: scaler(10), marginHorizontal: scaler(15) }} title={isEditEnabled ? "Save" : "Edit"} />

                {/* <CardContent title={Language.phoneNumber} content="+1 234 543 657" /> */}
            </KeyboardHideView>

        </SafeAreaView>
    )
}

export default ProfileScreen

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
