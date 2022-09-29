import { config } from 'api';
import { RootState } from 'app-store';
import { getEditEventDetail, getMyGroups } from 'app-store/actions';
import { resetCreateEvent, updateCreateEvent } from 'app-store/actions/createEventActions';
import { colors, Images } from 'assets';
import { Button, CheckBox, FixedDropdown, MyHeader, Stepper, Text, TextInput, useKeyboardService } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { useVideoPlayer } from 'custom-components/VideoProvider';
import { ILocation } from 'database';
import { isArray, isEmpty, isEqual } from 'lodash';
import React, { FC, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dimensions, Image, StyleSheet, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import Language from 'src/language/Language';
import TZ from "tz-lookup";
import { formattedAddressToString, getFormattedAddress2, getImageUrl, NavigationService, scaler, _showErrorMessage } from 'utils';
import ImagePickerUtils from 'utils/ImagePickerUtils';

type FormType = {
  eventName: string;
  selectGroup: string;
  location: string;
  aboutEvent: string;
};

const videoProps = {
  forceJpg: true,
  compressImageQuality: 0.8,
  // loadingLabelText: Language.processing,
  enableRotationGesture: true,
  compressVideoPreset: "MediumQuality",
  mediaType: 'any'
}

const { width } = Dimensions.get('screen')

const CreateEvent1: FC<any> = props => {
  const { loadVideo } = useVideoPlayer()
  const [eventImage, setEventImage] = useState<any>();
  const locationRef: MutableRefObject<ILocation | null> = useRef(null);
  const locationInputRef = useRef<RNTextInput>(null);
  const selectedGroupRef = useRef<any>(null);
  const [isOnlineEvent, setIsOnlineEvent] = useState(false);
  const [isDropdown, setDropdown] = useState(false);
  const [pinLocation, setPinLocation] = useState(false);
  const keyboardValues = useKeyboardService()
  const [multiImageArray, setMultiImageArray] = useState<Array<any>>([])
  const eventId = props?.route?.params?.id || null
  const [isPublicEvent, setPublicEvent] = useState(false)

  const event = useSelector((state: RootState) => {
    return state?.createEventState
  })

  const isEditable = useSelector((state: RootState) => {
    return true//!(state?.eventDetails?.[eventId]?.event?.total_sold_tickets)
  }, isEqual)

  const loaded = useRef(false);


  const { myGroups } = useSelector((state: RootState) => ({
    myGroups: [...state?.group?.myGroups, {
      _id: -1,
      name: Language.post_in_local_groups,
      data: {},
      textStyle: { color: colors.colorPrimary }
    }]
  }))

  const dispatch = useDispatch();
  const {
    control,
    getValues,
    setValue,
    resetField,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormType>({
    mode: 'onChange',
    defaultValues: __DEV__ && !eventId ? {
      eventName: "Test Event",
      // location: "Sahibzada Ajit Singh Nagar, Punjab, India"
    } : {}
  });

  const pickImage = useCallback((isMultiImage: boolean) => {
    setTimeout(() => {
      const picker = isMultiImage ? ImagePickerUtils.openPickImageOrVideo : ImagePickerUtils.openImagePicker
      picker(isMultiImage ? 'MULTIPLE_IMAGE_PICKER_OPTIONS' : 'PROFILE_IMAGE_PICKER_OPTIONS', 10 - multiImageArray?.length,).then(image => {
        console.log("image", image);
        const maxSizeInMb = 100
        if (isMultiImage && isArray(image)) {
          const index = image?.findIndex(({ size }) => (size > maxSizeInMb * 1000000))
          if (index == -1) setMultiImageArray((_) => [..._, ...image])
          else _showErrorMessage(Language.formatString(Language.maximum_file_size_allowed, maxSizeInMb?.toString())?.toString())
        }
        else
          setEventImage(image);
      })
        .catch(e => {
          console.log(e);
        });
    }, 200);
  }, [multiImageArray?.length, ImagePickerUtils]);


  useEffect(() => {
    dispatch(getMyGroups())
    // dispatch(restorePurchase())
    if (eventId) {
      dispatch(getEditEventDetail(eventId))
    }

    const group = props?.route?.params?.group
    // console.log("group", group);
    if (group) {
      onSelectGroup(group, true)
    }

    return () => {
      dispatch(resetCreateEvent())
    }
  }, [])

  useEffect(() => {
    if (eventId && !isEmpty(event)) {
      setEventValues(event);
    }
  }, [event])


  useEffect(() => {
    if (!isEditable) {
      props?.navigation?.goBack();
    }
  }, [isEditable])




  const setEventValues = useCallback((event: any) => {
    if (loaded.current) return
    loaded.current = true
    let group = event?.event_group || {}
    if (event?.location?.coordinates && event?.address && (event?.city || event?.state || event?.country)) {
      const { location, address, city, state, country } = event || {}
      group = { ...group, location, address, city, state, country }
    }
    onSelectGroup(group, true)
    setMultiImageArray(event.event_images || [])

    // reset({
    //   eventName: event?.name,
    //   location: event?.address,
    //   selectGroup: event?.event_group?.name,
    //   aboutEvent: event?.short_description,
    // })

    setValue('eventName', event?.name)
    setValue('aboutEvent', event?.short_description)
    resetField('aboutEvent', { defaultValue: event?.short_description })
    setIsOnlineEvent(event?.is_online_event == 1 ? true : false)
    setPinLocation(event?.is_direction == 1 ? true : false)
    setPublicEvent(event?.can_anyone_host_events == 1)
    if (event?.image) {
      setEventImage({ uri: getImageUrl(event?.image, { type: 'events', width: scaler(100) }) })
    } else {
      setEventImage(null)
    }
  }, [])

  const next = useCallback(handleSubmit((data) => {
    console.log('multiImageArray', eventImage, multiImageArray)
    const { latitude, longitude, address, otherData } = locationRef.current ?? {};
    let event_timezone = ""
    if (latitude && longitude) {
      event_timezone = TZ(latitude, longitude);
    }

    const payload = {
      name: data.eventName?.trim(),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      event_timezone,
      address: formattedAddressToString(address),
      city: otherData?.city,
      state: otherData?.state,
      country: otherData?.country,
      is_online_event: isOnlineEvent ? '1' : '0',
      group_id: selectedGroupRef.current?.id ?? selectedGroupRef.current?._id,
      short_description: data?.aboutEvent,
      image: eventImage?.path ? eventImage : event?.image,
      event_images: multiImageArray,
      event_group: undefined,
      is_copied_event: props?.route?.params?.copy ?? (eventId ? "0" : undefined),
      is_direction: pinLocation ? '1' : '0',
      can_anyone_host_events: isPublicEvent ? '1' : '0'
    }
    dispatch(updateCreateEvent(payload))
    NavigationService.navigate('CreateEvent2')
  }), [event, isOnlineEvent, eventImage, multiImageArray, pinLocation, isPublicEvent])

  const onSelectGroup = useCallback((data, noUpdate = false) => {
    selectedGroupRef.current = data;
    setValue('selectGroup', data?.name, { shouldValidate: true });
    const { location, address = "", city, state, country } = data || {}
    const addressObject = getFormattedAddress2(address, city, state, country)
    locationRef.current = (location?.coordinates[0] && location?.coordinates[1]) ? {
      latitude: location?.coordinates[1],
      longitude: location?.coordinates[0],
      address: addressObject,
      otherData: {
        city: city,
        state: state,
        country: country
      }
    } : null
    setValue('location', address)
    locationInputRef?.current?.setNativeProps && locationInputRef?.current?.setNativeProps({
      selection: {
        start: 0,
        end: 0,
      },
    });
    if (!noUpdate) {
      setPublicEvent(data?.can_anyone_host_events == 1)
    }
    setDropdown(false);
  }, [])

  return (
    <SafeAreaViewWithStatusBar style={styles.container}>
      <MyHeader title={eventId ? props?.route?.params?.copy ? Language.copy_event : Language.edit_event : Language.host_an_event} />
      <ScrollView
        nestedScrollEnabled
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={{ alignItems: 'center' }}>
        <Stepper step={1} totalSteps={4} paddingHorizontal={scaler(20)} />
        <View>
          <View style={styles.imageContainer}>
            <Image
              onError={err => {
                setEventImage(Images.ic_event_placeholder);
              }}
              style={styles.image}
              source={
                eventImage
                  ? eventImage?.path
                    ? { uri: eventImage?.path }
                    : eventImage
                  : Images.ic_event_placeholder
              }
            />
          </View>
          <TouchableOpacity onPress={() => pickImage(false)} style={styles.cameraButton}>
            <Image style={styles.image} source={Images.ic_camera} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: '100%',
            paddingHorizontal: scaler(20),
            paddingVertical: scaler(15),
          }}>
          <TextInput
            containerStyle={{ flex: 1, marginEnd: scaler(4) }}
            placeholder={Language.event_name}
            borderColor={colors.colorTextInputBackground}
            backgroundColor={colors.colorTextInputBackground}
            name={'eventName'}
            rules={{
              validate: (v: string) => {
                if (!v.trim()) {
                  return Language.event_name_required
                }
                if (v?.length < 3)
                  return Language.min_characters_event_name
              }
            }}
            required={Language.event_name_required}
            control={control}
            errors={errors}
          />
          <View style={{ flex: 1, width: '100%' }}>
            <TextInput
              containerStyle={{ flex: 1, marginEnd: scaler(4) }}
              placeholder={Language.select_group}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'selectGroup'}
              required={Language.group_name_required}
              icon={Images.ic_arrow_dropdown}
              onPress={() => {
                setDropdown(!isDropdown);
              }}
              control={control}
              errors={errors}
            />
            <FixedDropdown
              maxHeight={scaler(250)}
              visible={isDropdown}
              data={myGroups.map((_, i) => ({ id: _?._id, data: _, title: _?.name, textStyle: _?.textStyle }))}
              onSelect={data => {
                if (data?.id < 0) {
                  NavigationService.navigate("SelectGroup", { onSelectGroup: onSelectGroup })
                  return
                }
                onSelectGroup(data?.data)
              }}
            />
            <TouchableOpacity style={styles.eventView} onPress={() => setIsOnlineEvent(!isOnlineEvent)}>
              <CheckBox checked={isOnlineEvent} setChecked={setIsOnlineEvent} />
              <Text style={{ marginLeft: scaler(5), fontSize: scaler(13), fontWeight: '400' }}>
                {Language.online_event}
              </Text>
            </TouchableOpacity>

            <TextInput
              containerStyle={{ flex: 1, marginEnd: scaler(4) }}
              placeholder={Language.select_location}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'location'}
              ref={locationInputRef}
              icon={Images.ic_gps}
              onPress={() => {
                NavigationService.navigate('SelectLocation', {
                  prevSelectedLocation: locationRef.current,
                  onSelectLocation: (location: ILocation) => {
                    locationRef.current = location;
                    // console.log("LOCATION:", location)
                    // setValue("location", location?.otherData?.city + (location?.otherData?.state ? (", " + location?.otherData?.state) : "") + (location?.otherData?.country ? (", " + location?.otherData?.country) : ""), { shouldValidate: true })
                    setValue("location", location?.address?.main_text + (location?.address?.secondary_text ? (", " + location?.address?.secondary_text) : ""), { shouldValidate: true })
                    locationInputRef?.current?.setNativeProps && locationInputRef?.current?.setNativeProps({
                      selection: {
                        start: 0,
                        end: 0,
                      },
                    });
                  },
                });
              }}
              required={Language.group_location_required}
              control={control}
              errors={errors}
            />

            <TouchableOpacity style={styles.eventView} onPress={() => setPinLocation(!pinLocation)}>
              <CheckBox checked={pinLocation} setChecked={setPinLocation} />
              <Text style={{ marginLeft: scaler(5), fontSize: scaler(13), fontWeight: '400' }}>
                {Language.add_location_to_chat}
              </Text>
            </TouchableOpacity>

            <TextInput
              placeholder={Language.write_something_about_event}
              name={'aboutEvent'}
              limit={2000}
              multiline
              keyboardValues={keyboardValues}
              style={{ minHeight: scaler(80), textAlignVertical: 'top' }}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              control={control}
              errors={errors}
            />
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: scaler(14), fontWeight: '500', marginVertical: scaler(15), flex: 1 }}>{Language.additional_photos} </Text>
              <Text style={{ fontSize: scaler(14), fontWeight: '500', marginVertical: scaler(15), color: colors.colorPlaceholder }}>{'(' + multiImageArray?.length + '/10)'} </Text>
            </View>
            <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap', marginHorizontal: -scaler(2.5) }}>
              {multiImageArray?.map((_, i) => {
                return (
                  <View key={i}>
                    <TouchableOpacity onPress={() => setMultiImageArray(_ => _.filter((_, index) => i != index))} style={styles.minusView}>
                      <Image source={Images.ic_delete_red} style={{ height: scaler(20), width: scaler(20) }} />
                    </TouchableOpacity>
                    {_.mime?.includes('video') || _?.type == 'video' ?
                      <TouchableOpacity style={[styles.multiImageView, { backgroundColor: colors.colorBlack, marginHorizontal: scaler(5), marginBottom: scaler(10) }]} onPress={() => loadVideo && loadVideo(_?.path ?? config.VIDEO_URL + _.name)}>
                        <Ionicons color={colors.colorGreyText} name="play-circle" size={scaler(35)} />
                      </TouchableOpacity> :
                      <Image style={{ height: scaler(90), width: (width - scaler(65)) / 3, borderRadius: scaler(5), marginHorizontal: scaler(5), marginBottom: scaler(10) }} source={{ uri: _?._id ? getImageUrl(_?.name, { type: 'events', width: scaler(100) }) : _?.path }} />
                    }
                  </View>
                )
              })}
              {multiImageArray?.length < 10 ? <TouchableOpacity style={styles.multiImageView} onPress={() => { pickImage(true) }}>
                <Entypo name='plus' size={scaler(40)} color={colors.colorWhite} />
              </TouchableOpacity> : null}
            </View>
          </View>

          <Button
            disabled={!selectedGroupRef.current || !isValid}
            containerStyle={{ marginTop: scaler(20) }}
            title={Language.next}
            onPress={next}
          />
        </View>
      </ScrollView>
    </SafeAreaViewWithStatusBar>
  );
};

export default CreateEvent1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.colorWhite,
    justifyContent: 'center',
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
    bottom: -5,
    padding: scaler(4),
    zIndex: 10,
    backgroundColor: colors.colorWhite,
  },
  imageContainer: {
    overflow: 'hidden',
    borderRadius: scaler(50),
    borderWidth: scaler(5),
    borderColor: '#EAEAEA',
    marginTop: scaler(20),
    height: scaler(100),
    width: scaler(100),
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
  multiImageView: {
    height: scaler(90),
    width: (width - scaler(65)) / 3,
    marginLeft: scaler(5),
    borderRadius: scaler(5),
    backgroundColor: colors.colorPrimary,
    alignItems: 'center',
    justifyContent: 'center'
  },

  minusView: {
    position: 'absolute',
    alignSelf: 'flex-end',
    top: scaler(-9),
    right: scaler(-3),
    zIndex: 1,
  }
});