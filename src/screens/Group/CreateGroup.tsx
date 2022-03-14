import { createGroup, uploadFile } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Button, defaultLocation, FixedDropdown, MyHeader, TextInput } from 'custom-components'
import { capitalize } from 'lodash'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Image, Keyboard, StyleSheet, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import Database, { ILocation } from 'src/database/Database'
import Language from 'src/language/Language'
import { getImageUrl, getShortAddress, NavigationService, ProfileImagePickerOptions, scaler } from 'utils'


type FormType = {
  name: string
  purpose: string
  location: string
  about: string
}

const DropDownData = ["Personal", "Professional", "Charitable"]

const CreateGroup: FC<any> = (props) => {
  const { group } = props?.route?.params ?? {}
  const uploadedImage = useRef("")
  const dispatch = useDispatch()
  const [profileImage, setProfileImage] = useState<any>()
  const locationRef = useRef<ILocation>(__DEV__ ? defaultLocation : null);
  const locationInputRef = useRef<RNTextInput>(null);
  const [isDropdown, setDropdown] = useState(false)
  const { control, handleSubmit, getValues, setValue, formState: { errors }, setError } = useForm<FormType>({
    defaultValues: __DEV__ ? {
      name: "Test Group",
      purpose: "Personal",
      location: "Sahibzada Ajit Singh Nagar, Punjab, India"
    } : {},
    mode: 'onChange'
  })

  const onSubmit = useCallback(() => handleSubmit(data => {
    if (!uploadedImage.current && profileImage?.path) {
      dispatch(uploadFile({
        image: profileImage,
        onSuccess: (url) => {
          console.log("URL is ", url)
          uploadedImage.current = url
          callCreateGroupApi(data);
        },
        prefixType: 'groups'
      }))
    } else {
      callCreateGroupApi(data);
    }
  })(), [profileImage]);

  useEffect(() => {
    if (group) {
      console.log(group)
      locationRef.current = {
        latitude: group?.location?.coordinates[1],
        longitude: group?.location?.coordinates[0],
        address: {
          main_text: getShortAddress(group?.address, group?.state, group?.city),
          secondary_text: group?.city + ", " + group?.state + ", " + group?.country
        },
        otherData: {
          city: group?.city,
          state: group?.state,
          country: group?.country
        }
      }
      setValue('about', group?.details)
      setValue('location', group?.address)
      setValue('name', group?.name)
      setValue('purpose', capitalize(group?.category ?? ""))
      if (group?.image) {
        setProfileImage({ uri: getImageUrl(group?.image, { type: 'groups', width: scaler(100) }) })
      } else {
        setProfileImage(null)
      }
    }
  }, [group])

  const callCreateGroupApi = useCallback((data) => {
    const { latitude, longitude, address, otherData } = locationRef?.current ?? {}
    let payload = {
      _id: group?._id,
      name: data?.name?.trim(),
      category: data?.purpose?.toLowerCase(),
      short_description: data?.about,
      details: data?.about,
      image: uploadedImage.current || undefined,
      address: address?.main_text + ", " + address?.secondary_text,
      city: otherData?.city,
      state: otherData?.state,
      country: otherData?.country,
      location: {
        type: 'Point',
        coordinates: [
          longitude,
          latitude
        ]
      }
    }
    dispatch(createGroup({
      data: payload, onSuccess: () => {
        Database.setSelectedLocation(Database.getStoredValue('selectedLocation'))
      }
    }))
  }, [])

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
        uploadedImage.current = ""
        setProfileImage(image)
      }).catch(e => {
        console.log(e)
      });
    }, 200);

  }, [])

  return (
    <SafeAreaView style={styles.container} >

      <MyHeader title={group ? Language.update_group : Language.create_group} />
      <ScrollView nestedScrollEnabled keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ alignItems: 'center', }} >
        <View>
          <View style={styles.imageContainer} >
            <Image onError={(err) => {
              setProfileImage(Images.ic_group_placeholder)
            }} style={styles.image} source={
              profileImage ? profileImage?.path ? { uri: profileImage?.path } : profileImage :
                Images.ic_group_placeholder
            } />
          </View>
          <TouchableOpacity onPress={pickImage} style={styles.cameraButton} >
            <Image style={styles.image} source={Images.ic_camera} />
          </TouchableOpacity>
        </View>
        <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(15) }} >
          <TextInput
            onFocus={() => setDropdown(false)}
            containerStyle={{ flex: 1, marginEnd: scaler(4), }}
            placeholder={Language.group_name}
            borderColor={colors.colorTextInputBackground}
            backgroundColor={colors.colorTextInputBackground}
            name={'name'}
            rules={{
              validate: (v: string) => {
                if (!v.trim()) {
                  return Language.group_name_required
                }
                if (v?.length < 3)
                  return Language.min_characters_group_name
              }
            }}
            required={Language.group_name_required}
            control={control}
            errors={errors}
          />
          <View style={{ flex: 1, width: '100%' }} >
            <TextInput
              onFocus={() => setDropdown(false)}
              containerStyle={{ flex: 1, marginEnd: scaler(4), }}
              placeholder={Language.group_purpose}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'purpose'}
              icon={Images.ic_arrow_dropdown}
              onPress={() => {
                Keyboard.dismiss()
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
                    setValue("location", location?.otherData?.city + (location?.otherData?.state ? (", " + location?.otherData?.state) : "") + (location?.otherData?.country ? (", " + location?.otherData?.country) : ""), { shouldValidate: true })
                    locationInputRef?.current?.setNativeProps({
                      selection: {
                        start: 0,
                        end: 0
                      }
                    })
                  }

                })
                setDropdown(false)
              }}
              required={Language.group_location_required}
              control={control}
              errors={errors}
            />

            <TextInput
              onFocus={() => setDropdown(false)}
              placeholder={Language.write_something_about_group}
              name={'about'}
              multiline
              limit={400}
              style={{ minHeight: scaler(80), textAlignVertical: 'top' }}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              control={control}
              errors={errors}
            />
          </View>

          <Button disabled={calculateButtonDisability()} containerStyle={{ marginTop: scaler(20) }}
            title={group ? Language.update_group : Language.create_group}
            onPress={onSubmit} />

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