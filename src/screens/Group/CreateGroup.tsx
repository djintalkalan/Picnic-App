import { Picker } from '@react-native-picker/picker'
import { createGroup, uploadFile } from 'app-store/actions'
import { colors, Fonts, Images } from 'assets'
import { Button, CheckBox, defaultLocation, FixedDropdown, MyHeader, Text, TextInput, useKeyboardService } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { round } from 'lodash'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Dimensions, Image, Keyboard, Platform, StatusBar, StyleSheet, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch } from 'react-redux'
import { ILocation } from 'src/database/Database'
import Language from 'src/language/Language'
import { formattedAddressToString, getFormattedAddress2, getImageUrl, NavigationService, scaler, _hidePopUpAlert, _hideTouchAlert, _showPopUpAlert, _showTouchAlert } from 'utils'
import ImagePickerUtils from 'utils/ImagePickerUtils'

let n = 87.5
const frequencies: Array<string> = []
while (n <= 108.1) {
  frequencies.push(n.toFixed(1))
  n = round(n + 0.1, 1)
}

type FormType = {
  name: string
  purpose: string
  location: string
  about: string
  radio_frequency: string
}

const DropDownData = ["personal", "professional", "charitable"]
const { height, width } = Dimensions.get('screen')

const CreateGroup: FC<any> = (props) => {
  const { group } = props?.route?.params ?? {}
  const isBroadcastGroup = props?.route?.params?.is_broadcast_group || group?.is_broadcast_group == 1
  const uploadedImage = useRef("")
  const dispatch = useDispatch()
  const [profileImage, setProfileImage] = useState<any>()
  const locationRef = useRef<ILocation | null>(__DEV__ ? defaultLocation : null);
  const locationInputRef = useRef<RNTextInput>(null);
  const [isDropdown, setDropdown] = useState(false)
  const [isPublicGroup, setPublicGroup] = useState(false);
  const [pinLocation, setPinLocation] = useState(false);
  const { control, handleSubmit, getValues, setValue, formState: { errors, isValid }, setError } = useForm<FormType>({
    defaultValues: __DEV__ ? {
      name: "Test Group",
      purpose: "personal",
      location: "Sahibzada Ajit Singh Nagar, Punjab, India"
    } : {},
    mode: 'onChange'
  })
  const keyboardValues = useKeyboardService()
  const pickerRef = useRef<Picker<string>>(null)



  useEffect(() => {
    if (group) {
      const addressObj = getFormattedAddress2(group?.address, group?.city, group?.state, group?.country)

      console.log(group)
      locationRef.current = (group?.location?.coordinates[0] && group?.location?.coordinates[1]) ? {
        latitude: group?.location?.coordinates[1],
        longitude: group?.location?.coordinates[0],
        address: addressObj,
        otherData: {
          city: group?.city,
          state: group?.state,
          country: group?.country
        }
      } : null
      setValue('about', group?.details)
      setValue('location', group?.address)
      setValue('name', group?.name)
      setValue('radio_frequency', group?.radio_frequency)
      setValue('purpose', group?.category ?? "", { shouldValidate: true })
      setPinLocation(group?.is_direction == '1')
      setPublicGroup(group?.can_anyone_host_events == '1');
      if (group?.image) {
        setProfileImage({ uri: getImageUrl(group?.image, { type: 'groups', width: scaler(100) }) })
      } else {
        setProfileImage(null)
      }
      locationInputRef?.current?.setNativeProps && locationInputRef?.current?.setNativeProps({
        selection: {
          start: 0,
          end: 0
        }
      })
    }
  }, [group])

  const callCreateGroupApi = useCallback((data) => {
    const { latitude, longitude, address, otherData } = locationRef?.current ?? {}

    let payload = {
      _id: group?._id,
      name: data?.name?.trim(),
      category: data?.purpose?.toLowerCase(),
      short_description: data?.about?.trim(),
      details: data?.about?.trim(),
      radio_frequency: data?.radio_frequency,
      image: uploadedImage.current || undefined,
      address: formattedAddressToString(address),
      city: otherData?.city,
      state: otherData?.state,
      country: otherData?.country,
      is_direction: pinLocation ? '1' : '0',
      can_anyone_host_events: isPublicGroup ? '1' : '0',
      is_broadcast_group: isBroadcastGroup ? '1' : '0',
      location: {
        type: 'Point',
        coordinates: [
          longitude,
          latitude
        ]
      }
    }
    dispatch(createGroup({
      data: payload
    }))
  }, [pinLocation, isPublicGroup, isBroadcastGroup])

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
  })(), [profileImage, callCreateGroupApi]);

  const pickImage = useCallback(() => {
    setTimeout(() => {
      ImagePickerUtils.openImagePicker('PROFILE_IMAGE_PICKER_OPTIONS').then((image) => {
        console.log(image);
        uploadedImage.current = ""
        setProfileImage(image)
      }).catch(e => {
        console.log(e)
      });
    }, 200);

  }, [])

  const CustomView = useCallback((props) => {
    const [v, setV] = useState(getValues("radio_frequency")?.toString() || "")
    useEffect(() => {
      setValue("radio_frequency", v)
    }, [v])
    return <View style={[{ width: '100%', }, props?.hidden ? { width: 0, height: 0, position: 'absolute', zIndex: -10 } : {}]} >
      <Picker
        ref={pickerRef}
        style={{ fontFamily: Fonts.regular, color: colors.colorBlackText }}
        selectedValue={v}
        prompt={Language.radio_freq}
        mode={'dialog'}
        onValueChange={(value) => {
          setV(value)
        }}
      >
        <Picker.Item style={{ fontFamily: Fonts.regular, color: colors.colorBlackText }} value={""} label={Language.select} />
        {frequencies.map((_, i) => {
          return <Picker.Item style={{ fontFamily: Fonts.regular, color: colors.colorBlackText }} key={i} value={_} label={_} />
        })}
      </Picker>
    </View>
  }, [])

  const showPurposeDropDown = useCallback((e) => {
    Keyboard.dismiss()
    setTimeout(() => {
      purposeRef.current?.measureInWindow((x, y, w, h) => {
        _showTouchAlert({
          placementStyle: {
            top: y + h + scaler(15) + (StatusBar.currentHeight || 0),
            left: x
          },
          transparent: true,
          alertComponent: () => {
            return <FixedDropdown
              visible={true}
              relative
              containerStyle={{ width: w }}
              data={DropDownData.map((_, i) => ({ id: i, data: _, title: (Language as any)?.[_] }))}
              onSelect={(data) => {
                setValue("purpose", data?.data, { shouldValidate: true })
                _hideTouchAlert()
              }}
            />
          }
        })
      })
    }, Platform.OS == 'android' ? 50 : 0);

  }, [])
  const purposeRef = useRef<RNTextInput>()
  return (
    <SafeAreaViewWithStatusBar style={styles.container} >
      <MyHeader title={group ? (isBroadcastGroup ? Language.update_broadcast : Language.update_group) : (isBroadcastGroup ? Language.start_a_broadcast : Language.create_group)} />
      <ScrollView enableResetScrollToCoords={false} nestedScrollEnabled keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ alignItems: 'center', }} >
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
              ref={purposeRef}
              onFocus={() => setDropdown(false)}
              containerStyle={{ flex: 1, marginEnd: scaler(4), }}
              placeholder={Language.group_purpose}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'purpose'}
              format={(_: string) => ((Language as any)?.[_])}
              icon={Images.ic_arrow_dropdown}
              onPress={(e) => {
                showPurposeDropDown(e)
              }}
              required={Language.group_purpose_required}
              control={control}
              errors={errors}
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
                    // setValue("location", location?.otherData?.city + (location?.otherData?.state ? (", " + location?.otherData?.state) : "") + (location?.otherData?.country ? (", " + location?.otherData?.country) : ""), { shouldValidate: true })
                    setValue("location", location?.address?.main_text + (location?.address?.secondary_text ? (", " + location?.address?.secondary_text) : ""), { shouldValidate: true })
                    locationInputRef?.current?.setNativeProps && locationInputRef?.current?.setNativeProps({
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



            <TouchableOpacity style={styles.eventView} onPress={() => setPinLocation(!pinLocation)}>
              <CheckBox checked={pinLocation} />
              <Text style={{ marginLeft: scaler(5), fontSize: scaler(13), fontWeight: '400' }}>
                {Language.add_location_to_chat}
              </Text>
            </TouchableOpacity>


            {Platform.OS == 'android' &&
              <CustomView hidden={true} />}
            <TextInput
              onFocus={() => setDropdown(false)}
              onPress={() => {
                if (Platform.OS == 'ios')
                  _showPopUpAlert({
                    title: Language.radio_freq,
                    customView: CustomView,
                    cancelButtonText: null,
                    buttonText: Language.done,
                    onPressButton: _hidePopUpAlert
                  })
                else {
                  pickerRef?.current?.focus();
                }
              }}
              containerStyle={{ flex: 1, marginEnd: scaler(4), }}
              placeholder={Language.radio_freq}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              returnKeyType={'done'}
              keyboardType={'decimal-pad'}
              name={'radio_frequency'}
              rules={{
                validate: (v: string) => {
                  v = v?.trim()
                  try {
                    if ((v?.includes(".") && (v?.indexOf(".") != v?.lastIndexOf(".") || v?.lastIndexOf(".") == v?.length - 1) || (v.split(".")?.[1]?.trim()?.length > 2))) {
                      return Language.invalid_radio_freq
                    }
                  }
                  catch (e) {

                  }
                }
              }}
              control={control}
              errors={errors}
            />

            <TextInput
              onFocus={() => setDropdown(false)}
              placeholder={Language.write_something_about_group}
              name={'about'}
              multiline
              keyboardValues={keyboardValues}
              limit={400}
              style={{ minHeight: scaler(80), textAlignVertical: 'top' }}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              control={control}
              errors={errors}
            />
          </View>

          <TouchableOpacity style={styles.eventView} onPress={() => setPublicGroup(!isPublicGroup)}>
            <CheckBox checked={isPublicGroup} />
            <Text style={{ marginLeft: scaler(5), fontSize: scaler(13), fontWeight: '400' }}>
              {Language.allow_everyone_to_host_event}
            </Text>
          </TouchableOpacity>

          <Button disabled={!isValid} containerStyle={{ marginTop: scaler(20) }}
            title={group ? (isBroadcastGroup ? Language.update_broadcast : Language.update_group) : (isBroadcastGroup ? Language.start_a_broadcast : Language.create_group)}
            onPress={onSubmit} />

        </View>
      </ScrollView>
    </SafeAreaViewWithStatusBar >
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
  eventView: {
    marginTop: scaler(12),
    flexDirection: 'row',
    marginLeft: scaler(5),
  },

})