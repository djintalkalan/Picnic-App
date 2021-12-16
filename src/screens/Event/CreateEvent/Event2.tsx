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
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  Image,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {sub} from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {KeyboardAwareScrollView as ScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import Database, {ILocation} from 'src/database/Database';
import Language from 'src/language/Language';
import {dateFormat, NavigationService, scaler} from 'utils';

type FormType = {
  capacity: string;
  ticketPrice: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  additionalInfo: string;
  currency: string;
};

const Event2: FC<any> = props => {
  const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(false);
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const eventDate = useRef<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
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
      (isUnlimitedCapacity &&
        (!getValues('ticketPrice') ||
          !getValues('eventDate') ||
          !getValues('startTime') ||
          !getValues('currency'))) ||
      (errors &&
        (errors.ticketPrice ||
          errors.eventDate ||
          errors.startTime ||
          errors.currency))
    ) {
      return true;
    } else if (
      (isFreeEvent &&
        (!getValues('eventDate') ||
          !getValues('capacity') ||
          !getValues('startTime'))) ||
      (errors && (errors.eventDate || errors.startTime || errors.capacity))
    ) {
      return true;
    }

    return false;
  }, [errors]);

  const openDatePicker = useCallback(() => {
    setDatePickerVisibility(true);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MyHeader title={Language.host_an_event} />
      <Stepper step={2} totalSteps={4} paddingHorizontal={scaler(20)} />
      <ScrollView nestedScrollEnabled keyboardShouldPersistTaps={'handled'}>
        <View style={styles.eventView}>
          <CheckBox
            checked={isUnlimitedCapacity}
            setChecked={setIsUnlimitedCapacity}
          />
          <Text style={{marginLeft: scaler(8), marginRight: scaler(18)}}>
            {Language.umlimited_capacity}
          </Text>
          <CheckBox checked={isFreeEvent} setChecked={setIsFreeEvent} />
          <Text style={{marginLeft: scaler(8)}}>{Language.free_event}</Text>
        </View>
        <View
          style={{
            width: '100%',
            paddingHorizontal: scaler(20),
            paddingVertical: scaler(15),
          }}>
          <TextInput
            containerStyle={{flex: 1, marginEnd: scaler(4)}}
            placeholder={Language.capacity}
            borderColor={colors.colorTextInputBackground}
            backgroundColor={colors.colorTextInputBackground}
            name={'capacity'}
            required={
              isUnlimitedCapacity ? undefined : Language.capacity_required
            }
            control={control}
            errors={errors}
          />
          <View style={{flex: 1, width: '100%'}}>
            <TextInput
              containerStyle={{flex: 1, marginEnd: scaler(4)}}
              placeholder={
                Language.event_ticket_price + ' (' + Language.per_person + ')'
              }
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'ticketPrice'}
              iconSize={scaler(18)}
              icon={Images.ic_ticket}
              //   onPress={() => {
              //     setDropdown(!isDropdown);
              //   }}
              required={
                isFreeEvent ? undefined : Language.ticket_price_required
              }
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

            <TextInput
              containerStyle={{flex: 1, marginEnd: scaler(4)}}
              placeholder={Language.select_date}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              style={{fontSize: scaler(13)}}
              name={'eventDate'}
              onPress={openDatePicker}
              required={Language.date_required}
              icon={Images.ic_calender}
              iconSize={scaler(20)}
              control={control}
              errors={errors}
            />

            <TextInput
              containerStyle={{flex: 1, marginEnd: scaler(4)}}
              placeholder={Language.select_start_time}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'startTime'}
              // required={Language.event_name_required}
              iconSize={scaler(18)}
              required={Language.start_time_required}
              icon={Images.ic_clock}
              control={control}
              errors={errors}
            />
            <TextInput
              containerStyle={{flex: 1, marginEnd: scaler(4)}}
              placeholder={Language.select_end_time}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'endTime'}
              // required={Language.event_name_required}
              iconSize={scaler(18)}
              icon={Images.ic_clock}
              control={control}
              errors={errors}
            />

            <TextInput
              placeholder={Language.write_additonal_information_about_event}
              name={'additionalInfo'}
              multiline
              style={{minHeight: scaler(80), textAlignVertical: 'top'}}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              control={control}
              errors={errors}
            />
          </View>
          <TextInput
            containerStyle={{flex: 1, marginEnd: scaler(4)}}
            placeholder={Language.select_currency}
            borderColor={colors.colorTextInputBackground}
            backgroundColor={colors.colorTextInputBackground}
            name={'currency'}
            icon={Images.ic_arrow_dropdown}
            required={isFreeEvent ? undefined : Language.event_name_required}
            control={control}
            errors={errors}
          />

          <Button
            disabled={calculateButtonDisability()}
            containerStyle={{marginTop: scaler(20)}}
            title={Language.next}
            // onPress={onSubmit}
          />
        </View>
        <DateTimePickerModal
          themeVariant={'light'}
          style={{zIndex: 20}}
          isVisible={isDatePickerVisible}
          mode="date"
          customConfirmButtonIOS={props => (
            <Text
              onPress={props.onPress}
              style={{
                fontWeight: '500',
                fontSize: scaler(18),
                color: colors.colorPrimary,
                textAlign: 'center',
                padding: scaler(10),
              }}>
              Confirm
            </Text>
          )}
          customCancelButtonIOS={props => (
            <View
              style={{
                padding: scaler(7),
                backgroundColor: 'white',
                borderRadius: scaler(10),
                marginBottom: scaler(10),
              }}>
              <Text
                onPress={props.onPress}
                style={{
                  fontWeight: '500',
                  fontSize: scaler(18),
                  color: colors.colorBlack,
                  textAlign: 'center',
                  padding: scaler(5),
                }}>
                Cancel
              </Text>
            </View>
          )}
          date={eventDate.current}
          //   maximumDate={sub(new Date(), {
          //     years: 15,
          //   })}
          onConfirm={(date: Date) => {
            eventDate.current = date;
            setValue('eventDate', dateFormat(date, 'MMM DD, YYYY'), {
              shouldValidate: true,
            });
            setDatePickerVisibility(false);
          }}
          onCancel={() => {
            setDatePickerVisibility(false);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Event2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.colorWhite,
    justifyContent: 'center',
  },

  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  eventView: {
    marginTop: scaler(20),
    flexDirection: 'row',
    marginHorizontal: scaler(25),
  },
});
