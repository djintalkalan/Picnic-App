import { RootState } from 'app-store';
import { getMyGroups } from 'app-store/actions';
import { colors, Images } from 'assets';
import {
  Button,
  CheckBox,
  defaultLocation,
  FixedDropdown,
  MyHeader,
  Stepper,
  Text,
  TextInput,
  useKeyboardService
} from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { ILocation } from 'database';
import React, { FC, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dimensions,
  Image,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import { useDispatch, useSelector } from 'react-redux';
import Language from 'src/language/Language';
import {
  NavigationService,
  ProfileImagePickerOptions,
  scaler
} from 'utils';

type FormType = {
  eventName: string;
  selectGroup: string;
  location: string;
  aboutEvent: string;
};

const { width } = Dimensions.get('screen')

const CreateEvent1: FC<any> = props => {
  const uploadedImage = useRef('');
  const [eventImage, setEventImage] = useState<any>();
  const locationRef: MutableRefObject<ILocation | null> = useRef(__DEV__ ? defaultLocation : null);
  const locationInputRef = useRef<RNTextInput>(null);
  const selectedGroupRef = useRef<any>(null);
  const [isOnlineEvent, setIsOnlineEvent] = useState(false);
  const [isDropdown, setDropdown] = useState(false);
  const keyboardValues = useKeyboardService()
  const [multiImageArray, setMultiImageArray] = useState<Array<any>>([])

  const { myGroups } = useSelector((state: RootState) => ({
    myGroups: state?.group?.myGroups
  }))

  const dispatch = useDispatch();
  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>({
    mode: 'onChange',
    defaultValues: __DEV__ ? {
      eventName: "Test Event",
      location: "Sahibzada Ajit Singh Nagar, Punjab, India"
    } : {}
  });



  const calculateButtonDisability = useCallback(() => {
    if (
      !getValues('eventName') ||
      !getValues('location') ||
      !getValues('selectGroup') ||
      !selectedGroupRef.current ||
      (errors && (errors.eventName || errors.location))
    )
      return true;
    return false;
  }, [errors]);

  const pickImage = useCallback((isMultiImage: boolean) => {
    setTimeout(() => {
      ImagePicker.openPicker({ ...ProfileImagePickerOptions, multiple: isMultiImage })
        .then(image => {
          uploadedImage.current = '';
          if (isMultiImage) {
            setMultiImageArray((_) => [..._, ...image])
          }
          else
            setEventImage(image);
        })
        .catch(e => {
          console.log(e);
        });
    }, 200);
  }, []);
  console.log('multiImageArray', multiImageArray)

  useEffect(() => {
    dispatch(getMyGroups())
  }, [])

  return (
    <SafeAreaViewWithStatusBar style={styles.container}>
      <MyHeader title={Language.host_an_event} />
      <ScrollView
        nestedScrollEnabled
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={{ alignItems: 'center' }}>
        <Stepper step={1} totalSteps={3} paddingHorizontal={scaler(20)} />
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
              visible={isDropdown}
              data={myGroups.map((_, i) => ({ id: _?._id, data: _?.data, title: _?.name }))}
              onSelect={data => {
                setDropdown(false);
                selectedGroupRef.current = data;
                setValue('selectGroup', data?.title, { shouldValidate: true });
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
                    locationInputRef?.current?.setNativeProps({
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
              <Text style={{ fontSize: scaler(14), fontWeight: '500', marginVertical: scaler(15), flex: 1 }}>Additional Photos and Videos </Text>
              <Text style={{ fontSize: scaler(14), fontWeight: '500', marginVertical: scaler(15), color: colors.colorPlaceholder }}>{'(' + multiImageArray?.length + '/10)'} </Text>
            </View>
            <View style={{ flexDirection: 'row', flex: 1, display: 'flex', flexWrap: 'wrap', marginHorizontal: -scaler(2.5) }}>
              {multiImageArray?.map((_, i) => {
                return (
                  <View key={i}>
                    <AntDesign name={'minuscircle'} onPress={() => { }} color={'#EB5757'} size={scaler(20)} style={styles.minusView} />
                    <Image style={{ height: scaler(90), width: (width - scaler(65)) / 3, borderRadius: scaler(5), marginHorizontal: scaler(5), marginBottom: scaler(10) }} source={{ uri: _?.path }} />
                  </View>
                )
              })}
              <TouchableOpacity style={styles.multiImageView} onPress={() => { pickImage(true) }}>
                <Entypo name='plus' size={scaler(40)} color={colors.colorWhite} />
              </TouchableOpacity>
            </View>
          </View>

          <Button
            disabled={calculateButtonDisability()}
            containerStyle={{ marginTop: scaler(20) }}
            title={Language.next}
            onPress={
              handleSubmit(
                (defaultValues) => NavigationService.navigate('CreateEvent2',
                  {
                    eventName: defaultValues?.eventName, myGroup: selectedGroupRef.current, isOnlineEvent: isOnlineEvent,
                    location: locationRef.current, aboutEvent: defaultValues?.aboutEvent, eventImage: eventImage
                  }))}
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
    top: scaler(-11),
    right: scaler(-3),
    zIndex: 1
  }
});