import { colors, Images } from 'assets';
import { Button, CheckBox, MyHeader, Stepper, Text, TextInput, useKeyboardService } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { useDatabase } from 'database';
import React, { FC, useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  StyleSheet,
  TextInput as RNInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Language from 'src/language/Language';
import { dateFormat, NavigationService, scaler, _showErrorMessage } from 'utils';

type FormType = {
  capacity: string;
  eventDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  additionalInfo: string;
};


type IEventDateTime = {
  selectedType: "eventDate" | 'endDate' | "startTime" | "endTime",
  eventDate: Date,
  endDate: Date,
  startTime: Date,
  endTime: Date,
}

const defaultTime = new Date(new Date(dateFormat(new Date(), "YYYY-MM-DD")).toISOString().slice(0, -1))

const initialDateTime: IEventDateTime = {
  selectedType: 'eventDate',
  eventDate: new Date(),
  endDate: new Date(),
  startTime: defaultTime,
  endTime: defaultTime,
}

const CreateEvent2: FC<any> = props => {
  const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(false);
  const [isMultidayEvent, setIsMultidayEvent] = useState(false);
  const uploadedImage = useRef('');
  const keyboardValues = useKeyboardService()

  const eventPriceInputRef = useRef<RNInput>(null)
  const additionalInfoInputRef = useRef<RNInput>(null)
  const capacityInputRef = useRef<RNInput>(null)
  const eventDateTime = useRef<IEventDateTime>(initialDateTime);

  const [userData] = useDatabase("userData")

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const {
    control,
    getValues,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>({
    mode: 'onChange',
  });

  const bodyData = props?.route?.params

  const calculateButtonDisability = useCallback(() => {
    if (!getValues('eventDate') ||
      !getValues('startTime') ||
      (errors && (errors.eventDate || errors.startTime || errors.capacity))
    ) {
      return true;
    }
    return false;
  }, [errors]);

  const openDatePicker = useCallback((type: "eventDate" | "startTime" | "endTime" | "endDate") => {
    eventDateTime.current.selectedType = type
    setDatePickerVisibility(true);
    eventPriceInputRef.current?.blur()
    additionalInfoInputRef.current?.blur()
    capacityInputRef.current?.blur()
  }, []);

  const getMinDate = useCallback(() => {
    const { startTime, endTime, eventDate, selectedType, endDate } = eventDateTime.current

    switch (selectedType) {
      case "eventDate":
        return new Date();
      case "endDate":
        return new Date();
      case "startTime":
        return undefined
      // if (eventDate && currentDateString == eventDateString) {
      //   return new Date()
      // } else {
      //   return undefined
      // }
      case "endTime":
        return undefined

        if (startTime) {
          return startTime
        } else {
          return undefined
          // if (eventDate && dateFormat(eventDate, "DD-MM-YYYY") == dateFormat(new Date(), "DD-MM-YYYY")) {
          //   return new Date()
          // } else {
          //   return undefined
          // }
        }
      default:
        break;
    }

  }, [])

  const onPressSubmit = useCallback(() => handleSubmit((data) => {
    const { endTime, endDate } = data
    const { startTime: startTimeDate, endTime: endTimeDate, endDate: endEventDate, eventDate } = eventDateTime.current
    const currentDate = new Date()
    if (startTimeDate <= currentDate) {
      _showErrorMessage(Language.start_time_invalid)
      return
    }
    if (endDate && dateFormat(endEventDate, 'YYYYMMDD') <= dateFormat(eventDate, 'YYYYMMDD')) {
      _showErrorMessage(Language.end_date_greater_than_start_date)
      return
    }
    if (endTime && !isMultidayEvent && endTimeDate <= startTimeDate) {
      _showErrorMessage(Language.end_time_invalid)
      return
    }

    NavigationService.navigate('CreateEvent3',
      {
        data: {
          ...data, ...bodyData,
          eventDateTime: eventDateTime.current,
          image: uploadedImage?.current,
          isUnlimitedCapacity,
          isMultidayEvent
        }
      })
    //   :
    //  undefined
  })(), [userData, isUnlimitedCapacity, isMultidayEvent])

  return (
    <SafeAreaViewWithStatusBar style={styles.container}>
      <MyHeader title={Language.host_an_event} />
      <ScrollView nestedScrollEnabled keyboardShouldPersistTaps={'handled'}>
        <Stepper step={2} totalSteps={4} paddingHorizontal={scaler(20)} />
        <View style={styles.eventView}>
          <TouchableOpacity onPress={() => {
            setIsUnlimitedCapacity((b) => {
              if (!b) {
                clearErrors('capacity')
                setValue('capacity', "")
              }
              return !b
            })
          }} style={{ flexDirection: 'row' }}>
            <CheckBox
              checked={isUnlimitedCapacity}
              setChecked={(b) => {
                if (b) {
                  clearErrors('capacity')
                  setValue('capacity', "")
                }
                setIsUnlimitedCapacity(b)
              }}
            />
            <Text style={{ marginLeft: scaler(8), marginRight: scaler(18), fontSize: scaler(14) }}>
              {Language.unlimited_capacity}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(15), }}>
          <TextInput
            containerStyle={{ flex: 1, marginEnd: scaler(4) }}
            placeholder={Language.capacity}
            ref={capacityInputRef}
            borderColor={colors.colorTextInputBackground}
            backgroundColor={colors.colorTextInputBackground}
            name={'capacity'}
            maxLength={5}
            rules={{
              validate: (v: string) => {
                if (!isUnlimitedCapacity && parseInt(v) == 0) {
                  return Language.invalid_capacity
                }
              }
            }}
            keyboardType={'number-pad'}
            disabled={isUnlimitedCapacity ? true : false}
            required={
              isUnlimitedCapacity ? undefined : Language.capacity_required
            }
            control={control}
            errors={errors}
          />
          <TouchableOpacity onPress={() => {
            setIsMultidayEvent((b) => {
              eventDateTime.current = initialDateTime
              setValue('eventDate', "")
              setValue('startTime', "")
              setValue('endTime', "")
              setValue('endDate', "")
              clearErrors('eventDate')
              clearErrors('startTime')
              clearErrors('endTime')
              clearErrors('endDate')
              return !b
            })
          }} style={{ flexDirection: 'row', marginTop: scaler(20), marginVertical: scaler(10) }}>
            <CheckBox checked={isMultidayEvent}
            />
            <Text style={{ marginLeft: scaler(8), fontSize: scaler(14) }}>{Language.multiday_event}</Text>
          </TouchableOpacity>

          <View style={{ flex: 1, width: '100%' }} >
            <View style={{ flexDirection: isMultidayEvent ? 'row' : undefined }}>
              <TextInput
                containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                placeholder={isMultidayEvent ? Language.start_date : Language.select_date}
                borderColor={colors.colorTextInputBackground}
                backgroundColor={colors.colorTextInputBackground}
                style={{ fontSize: scaler(13) }}
                name={'eventDate'}
                onPress={() => (openDatePicker("eventDate"))}
                required={Language.date_required}
                icon={Images.ic_calender}
                iconSize={scaler(20)}
                control={control}
                errors={errors} />

              <TextInput
                containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                placeholder={isMultidayEvent ? Language.start_time : Language.select_start_time}
                borderColor={colors.colorTextInputBackground}
                backgroundColor={colors.colorTextInputBackground}
                name={'startTime'}
                iconSize={scaler(18)}
                required={Language.start_time_required}
                onPress={() => (openDatePicker("startTime"))}
                icon={Images.ic_clock}
                control={control}
                errors={errors} />
            </View>
            <View style={{ flexDirection: isMultidayEvent ? 'row' : undefined }}>
              {isMultidayEvent ? <TextInput
                containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                placeholder={Language.end_date}
                borderColor={colors.colorTextInputBackground}
                backgroundColor={colors.colorTextInputBackground}
                style={{ fontSize: scaler(13) }}
                name={'endDate'}
                onPress={() => (openDatePicker("endDate"))}
                required={Language.date_required}
                icon={Images.ic_calender}
                iconSize={scaler(20)}
                control={control}
                errors={errors} /> : undefined}
              <TextInput
                containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                placeholder={isMultidayEvent ? Language.end_time : Language.select_end_time + ' (' + Language.optional + ")"}
                borderColor={colors.colorTextInputBackground}
                backgroundColor={colors.colorTextInputBackground}
                name={'endTime'}
                required={isMultidayEvent ? Language.end_date_required : false}
                onPress={() => (openDatePicker("endTime"))}
                iconSize={scaler(18)}
                icon={Images.ic_clock}
                control={control}
                errors={errors} />
            </View>

            <TextInput
              placeholder={Language.write_additional_information_about_event}
              name={'additionalInfo'}
              ref={additionalInfoInputRef}
              multiline
              limit={2000}
              keyboardValues={keyboardValues}
              style={{ minHeight: scaler(80), textAlignVertical: 'top' }}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              control={control}
              errors={errors}
            />
            <Button
              disabled={calculateButtonDisability()}
              containerStyle={{ marginTop: scaler(20) }}
              title={Language.next}
              onPress={onPressSubmit}
            />
          </View>
        </View>
        <DateTimePickerModal
          style={{ zIndex: 20 }}
          isVisible={isDatePickerVisible}
          minimumDate={getMinDate()}
          mode={(eventDateTime.current?.selectedType?.includes('Date')) ? 'date' : "time"}
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
              {Language.confirm}
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
                {Language.close}
              </Text>
            </View>
          )}
          date={eventDateTime.current?.[eventDateTime.current?.selectedType]}

          //  eventDateTime.current?.[startTime]
          //   //   maximumDate={sub(new Date(), {
          //     years: 15,
          //   })}
          onConfirm={(cDate: Date) => {
            const { selectedType, eventDate } = eventDateTime.current
            const date = selectedType?.includes('Date') ? cDate : new Date(eventDate?.getFullYear(), eventDate.getMonth(), eventDate?.getDate(), cDate?.getHours(), cDate?.getMinutes(), cDate?.getSeconds());
            // const utcDate = new Date(eventDate?.getFullYear(), eventDate.getUTCMonth(), eventDate?.getUTCDate(), cDate?.getUTCHours(), cDate?.getUTCMinutes(), cDate?.getUTCSeconds());
            // console.log(" eventDate", eventDate);
            // console.log(" Date", date);
            // console.log(" utcDate", date);
            // console.log("new Date", new Date());

            eventDateTime.current = { ...eventDateTime?.current, [selectedType]: date };
            let hour = ((date?.getHours()) % 12 || 12) > 9 ? ((date?.getHours()) % 12 || 12) : '0' + ((date?.getHours()) % 12 || 12);
            let min = date?.getMinutes() > 9 ? date?.getMinutes() : '0' + date?.getMinutes();
            let isAMPM = date?.getHours() >= 12 ? 'PM' : 'AM'
            if (selectedType == 'eventDate' || selectedType == 'endDate') {
              console.log('date selected', date);

              setValue(selectedType, dateFormat(date, 'MMM DD, YYYY'), {
                shouldValidate: true,
              });
              if (!isMultidayEvent) {
                setValue('startTime', "")
                setValue('endTime', "")
              }
            }
            else {
              if (!isMultidayEvent)
                setValue('endTime', "");
              setValue(selectedType, hour + ':' + min + ' ' + isAMPM, { shouldValidate: true })
            }
            if (getValues('endTime')) {
              setTimeout(() => {
                additionalInfoInputRef.current?.focus()
              }, 500);
            }
            setDatePickerVisibility(false);
          }}
          onCancel={() => {
            setDatePickerVisibility(false);
          }}
        />
      </ScrollView>
    </SafeAreaViewWithStatusBar>
  );
};

export default CreateEvent2;

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
    alignItems: 'center',
    flex: 1
  },
});
