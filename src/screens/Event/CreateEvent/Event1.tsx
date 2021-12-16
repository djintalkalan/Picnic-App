import {createGroup, uploadFile} from 'app-store/actions';
import {colors, Images} from 'assets';
import {
  Button,
  CheckBox,
  FixedDropdown,
  MyHeader,
  Stepper,
  Text,
  TextInput,
} from 'custom-components';
import {capitalize} from 'lodash';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  Image,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {KeyboardAwareScrollView as ScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import Database, {ILocation} from 'src/database/Database';
import Language from 'src/language/Language';
import {
  getImageUrl,
  getShortAddress,
  NavigationService,
  ProfileImagePickerOptions,
  scaler,
} from 'utils';

type FormType = {
  name: string;
  selectGroup: string;
  location: string;
  about: string;
};

const DropDownData = ['Personal', 'Professional', 'Charitable'];

const Event1: FC<any> = props => {
  const uploadedImage = useRef('');
  const [profileImage, setProfileImage] = useState<any>();
  const locationRef = useRef<ILocation>();
  const locationInputRef = useRef<RNTextInput>(null);
  const [isOnlineEvent, setIsOnlineEvent] = useState(false);
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: {errors},
    setError,
  } = useForm<FormType>({
    defaultValues: {
      // email: "deepakq@testings.com",
      // password: "Dj@123456",
      // confirmPassword: "Dj@123456"
    },
    mode: 'onChange',
  });

  const calculateButtonDisability = useCallback(() => {
    if (
      !getValues('name') ||
      !getValues('location') ||
      (errors && (errors.name || errors.location))
    )
      return true;
    return false;
  }, [errors]);

  const pickImage = useCallback(() => {
    setTimeout(() => {
      ImagePicker.openPicker(ProfileImagePickerOptions)
        .then(image => {
          console.log(image);
          uploadedImage.current = '';
          setProfileImage(image);
        })
        .catch(e => {
          console.log(e);
        });
    }, 200);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MyHeader title={Language.host_an_event} />
      <Stepper step={1} totalSteps={4} paddingHorizontal={scaler(20)} />
      <ScrollView
        nestedScrollEnabled
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={{alignItems: 'center'}}>
        <View>
          <View style={styles.imageContainer}>
            <Image
              onError={err => {
                setProfileImage(Images.ic_group_placeholder);
              }}
              style={styles.image}
              source={
                profileImage
                  ? profileImage?.path
                    ? {uri: profileImage?.path}
                    : profileImage
                  : Images.ic_group_placeholder
              }
            />
          </View>
          <TouchableOpacity onPress={pickImage} style={styles.cameraButton}>
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
            containerStyle={{flex: 1, marginEnd: scaler(4)}}
            placeholder={Language.event_name}
            borderColor={colors.colorTextInputBackground}
            backgroundColor={colors.colorTextInputBackground}
            name={'name'}
            required={Language.event_name_required}
            control={control}
            errors={errors}
          />
          <View style={{flex: 1, width: '100%'}}>
            <TextInput
              containerStyle={{flex: 1, marginEnd: scaler(4)}}
              placeholder={Language.select_group}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'selectGroup'}
              icon={Images.ic_arrow_dropdown}
              //   onPress={() => {
              //     setDropdown(!isDropdown);
              //   }}
              required={Language.group_purpose_required}
              control={control}
              errors={errors}
            />
            {/* <FixedDropdown
              visible={isDropdown}
              data={DropDownData.map((_, i) => ({id: i, data: _, title: _}))}
              onSelect={data => {
                setDropdown(false);
                setValue('purpose', data?.title, {shouldValidate: true});
              }}
            /> */}
            <View style={styles.eventView}>
              <CheckBox checked={isOnlineEvent} setChecked={setIsOnlineEvent} />
              <Text style={{marginLeft: scaler(5)}}>
                {Language.online_event}
              </Text>
            </View>

            <TextInput
              containerStyle={{flex: 1, marginEnd: scaler(4)}}
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
                    setValue(
                      'location',
                      location?.address?.main_text +
                        ', ' +
                        location?.address?.secondary_text,
                      {shouldValidate: true},
                    );
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
              name={'about'}
              multiline
              style={{minHeight: scaler(80), textAlignVertical: 'top'}}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              control={control}
              errors={errors}
            />
          </View>

          <Button
            disabled={calculateButtonDisability()}
            containerStyle={{marginTop: scaler(20)}}
            title={Language.next}
            onPress={() => NavigationService.navigate('Event2')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Event1;

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
    bottom: 2,
    padding: scaler(4),
    zIndex: 10,
    backgroundColor: colors.colorWhite,
  },
  imageContainer: {
    overflow: 'hidden',
    borderRadius: scaler(50),
    // borderWidth: scaler(4),
    // borderColor: '#F6F6F7',
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
});
