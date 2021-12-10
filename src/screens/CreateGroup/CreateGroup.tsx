import { _mediaUpload } from 'api'
import { createGroup, setLoadingAction } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Button, FixedDropdown, MyHeader, TextInput } from 'custom-components'
import React, { FC, useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Image, StyleSheet, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import { ILocation } from 'src/database/Database'
import Language from 'src/language/Language'
import { NavigationService, ProfileImagePickerOptions, scaler } from 'utils'


type FormType = {
    name: string
    purpose: string
    location: string
    about: string
}

const DropDownData = ["Personal", "Professional", "Charitable"]

const CreateGroup: FC = () => {

    const uploadImage = useRef("")

    const dispatch = useDispatch()
    const isValidEmail = useRef(false)
    const [isEditEnabled, setEditEnabled] = useState(true)
    const [profileImage, setProfileImage] = useState<any>()
    const locationRef = useRef<ILocation>();
    const locationInputRef = useRef<RNTextInput>(null);
    const [isDropdown, setDropdown] = useState(false)
    const { control, handleSubmit, getValues, setValue, formState: { errors }, setError } = useForm<FormType>({
        defaultValues: {
            // email: "deepakq@testings.com",
            // password: "Dj@123456",
            // confirmPassword: "Dj@123456"
        },
        mode: 'onChange'
    })

    const onSubmit = useCallback(() => handleSubmit(async data => {
        const { latitude, longitude, address, otherData } = locationRef?.current ?? {}
        if (!uploadImage.current && profileImage?.path) {
            let formData = new FormData()
            formData.append('type', "groups");
            let uri = profileImage?.path;
            let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length);
            let image = {
                uri: uri,
                name: filename,
                type: 'image/jpeg',
            };
            formData.append('file', image);
            try {
                dispatch(setLoadingAction(true))
                let res = await _mediaUpload(formData)
                dispatch(setLoadingAction(false))
                console.log(res, "res")
                if (res?.data) {
                    uploadImage.current = res?.data?.file
                }
            }
            catch (e) {
                console.log(e)
                dispatch(setLoadingAction(false))
            }

        }

        let payload = {
            name: data?.name,
            category: data?.purpose?.toLowerCase(),
            short_description: data?.about,
            details: data?.about,
            image: uploadImage.current,
            address: data?.location,
            city: otherData?.city,
            state: otherData?.state,
            country: otherData?.country,
            location: {
                type: 'Point',
                coordinates: [
                    latitude,
                    longitude
                ]
            }
        }
        dispatch(createGroup(payload))
    })(), [profileImage]);

    const calculateButtonDisability = useCallback(() => {
        if (!getValues('name') || !getValues('purpose') || !getValues('location')
            || (errors && (errors.name || errors.purpose || errors.location)))
            return true
        return false
    }, [errors])

    const pickImage = useCallback(() => {
        setTimeout(() => {
            ImagePicker.openPicker(ProfileImagePickerOptions).then((image) => {
                console.log(image);
                uploadImage.current = ""
                setProfileImage(image)
            }).catch(e => {
                console.log(e)
            });
        }, 200);

    }, [])


    return (
        <SafeAreaView style={styles.container} >

            <MyHeader title={Language.create_group} />
            <ScrollView keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ alignItems: 'center', }} >
                <View>
                    <View style={styles.imageContainer} >
                        <Image onError={(err) => {
                            setProfileImage(Images.ic_home_profile)
                        }} style={styles.image} source={
                            profileImage ? profileImage?.path ? { uri: profileImage?.path } : profileImage :
                                Images.ic_home_profile
                        } />
                    </View>
                    {isEditEnabled ? <TouchableOpacity onPress={pickImage} style={styles.cameraButton} >
                        <Image style={styles.image} source={Images.ic_camera} />
                    </TouchableOpacity> : null}
                </View>
                <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(15) }} >
                    <TextInput
                        containerStyle={{ flex: 1, marginEnd: scaler(4), }}
                        placeholder={Language.group_name}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'name'}
                        required={Language.group_name_required}
                        control={control}
                        errors={errors}
                    />
                    <View style={{ flex: 1, width: '100%' }} >
                        <TextInput
                            containerStyle={{ flex: 1, marginEnd: scaler(4), }}
                            placeholder={Language.group_purpose}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            name={'purpose'}
                            icon={Images.ic_arrow_dropdown}
                            onPress={() => {
                                setDropdown(!isDropdown)
                            }}
                            required={Language.group_purpose_required}
                            control={control}
                            errors={errors}
                        />
                        <FixedDropdown
                            visible={isDropdown}
                            data={DropDownData.map((_, i) => ({ id: i, data: _, title: _ }))}
                            onSelect={(data) => {
                                setDropdown(false)
                                setValue("purpose", data?.title, { shouldValidate: true })

                            }}

                        />

                        <TextInput
                            containerStyle={{ flex: 1, marginEnd: scaler(4), }}
                            placeholder={Language.select_location}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            name={'location'}
                            ref={locationInputRef}
                            icon={Images.ic_gps}
                            onPress={() => {
                                NavigationService.navigate("SelectLocation", {
                                    prevSelectedLocation: locationRef.current,
                                    onSelectLocation: (location: ILocation) => {
                                        locationRef.current = location;
                                        setValue("location", location?.address?.main_text + ", " + location?.address?.secondary_text, { shouldValidate: true })
                                        locationInputRef?.current?.setNativeProps({
                                            selection: {
                                                start: 0,
                                                end: 0
                                            }
                                        })
                                    }

                                })
                            }}
                            required={Language.group_location_required}
                            control={control}
                            errors={errors}
                        />

                        <TextInput
                            placeholder={Language.write_something_about_group}
                            name={'about'}
                            multiline
                            style={{ minHeight: scaler(80), textAlignVertical: 'top' }}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            control={control}
                            errors={errors}
                        />
                    </View>

                    <Button disabled={calculateButtonDisability()} containerStyle={{ marginTop: scaler(20) }} title={Language.create_group} onPress={onSubmit} />

                </View>
            </ScrollView>
        </SafeAreaView >
    )
}

export default CreateGroup

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center'
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
        // borderWidth: scaler(4),
        // borderColor: '#F6F6F7',
        height: scaler(100),
        width: scaler(100)
    },
    image: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain',
    },

})