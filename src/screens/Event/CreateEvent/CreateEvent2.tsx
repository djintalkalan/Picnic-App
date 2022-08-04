import { updateCreateEvent } from 'app-store/actions/createEventActions';
import { store } from 'app-store/store';
import { colors, Images } from 'assets';
import { Button, CheckBox, MyHeader, Stepper, Text, TextInput, useKeyboardService } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { useDatabase } from 'database';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dimensions,
  StyleSheet,
  TextInput as RNInput, TextInput as RNTextInput, TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { dateFormat, NavigationService, scaler, stringToDate, _showErrorMessage } from 'utils';

type FormType = {
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
  const eventDateRef = useRef<RNTextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const dispatch = useDispatch();
  const [, forceRender] = useState(false);
  const [isMultidayEvent, setIsMultidayEvent] = useState(false);
  const keyboardValues = useKeyboardService()
  const eventPriceInputRef = useRef<RNInput>(null)
  const additionalInfoInputRef = useRef<RNInput>(null)
  const eventDateTime = useRef<IEventDateTime>(initialDateTime);
  const [userData] = useDatabase("userData")
  const { current: event } = useRef(store.getState().createEventState)

  useEffect(() => {
    setEventValues()
  }, [])

  const setEventValues = useCallback(() => {
    if (event?.is_copied_event != '1') {
      eventDateTime.current = {
        eventDate: event?.event_date ? new Date(event?.event_start_date_time) : new Date(),
        startTime: event?.event_date ? new Date(event?.event_start_date_time) : defaultTime,
        endDate: event?.event_end_date ? new Date(event?.event_end_date_time) : new Date(),
        endTime: event?.event_end_time ? new Date(event?.event_end_date_time) : defaultTime,
        selectedType: 'eventDate',
      }
      setValue('eventDate', event?.event_date ? dateFormat(eventDateTime.current.eventDate, 'MMM DD, YYYY') : '')
      setValue('endDate', event?.event_end_date ? dateFormat(eventDateTime.current.endDate, 'MMM DD, YYYY') : '')
      setValue('startTime', event?.event_date ? dateFormat(eventDateTime.current.startTime, 'hh:mm A') : '')
      setValue('endTime', event?.event_end_time ? dateFormat(eventDateTime.current.endTime, 'hh:mm A') : '')
    } else {
      setValue('eventDate', '')
      setValue('endDate', '')
      setValue('startTime', '')
      setValue('endTime', '')

      if (eventDateRef.current) {
        eventDateRef.current?.measureInWindow((x, y) => {
          console.log("eventDateRef", x, y);

          scrollViewRef?.current?.scrollToPosition(x, y - (Dimensions.get('screen').height / 3), true)
          setTimeout(() => {
            (openDatePicker("eventDate"))
          }, 1000)
        })
      }

    }

    console.log(event);
    setValue('additionalInfo', event?.details || "")
    setIsMultidayEvent(event?.is_multi_day_event == 1 ? true : false)
    forceRender(_ => !_)
  }, [])

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
    shouldFocusError: false
  });

  const calculateButtonDisability = useCallback(() => {
    if (!getValues('eventDate') ||
      !getValues('startTime') ||
      (errors && (errors.eventDate || errors.startTime))
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

    const payload: any = {
      is_multi_day_event: isMultidayEvent ? '1' : '0',
      event_date: dateFormat(eventDate, "YYYY-MM-DD"),
      event_end_date: isMultidayEvent ? dateFormat(endEventDate, "YYYY-MM-DD") : '',
      event_start_time: dateFormat(startTimeDate, "HH:mm:ss"),
      event_end_time: data.endTime ? dateFormat(endTimeDate, "HH:mm") : "",
      details: data.additionalInfo
    }
    payload.event_start_date_time = stringToDate(payload?.event_date + " " + payload?.event_start_time)
    payload.event_end_date_time = isMultidayEvent ?
      stringToDate(payload?.event_end_date + " " + payload?.event_end_time) :
      stringToDate(payload?.event_date + " 23:59")
    dispatch(updateCreateEvent(payload))
    NavigationService.navigate('CreateEvent3')

  })(), [userData, isMultidayEvent])


  return (
    <SafeAreaViewWithStatusBar style={styles.container}>
      <MyHeader title={event?._id ? event?.is_copied_event != '0' ? Language.copy_event : Language.edit_event : Language.host_an_event} />
      <ScrollView enableResetScrollToCoords={false} ref={scrollViewRef} nestedScrollEnabled keyboardShouldPersistTaps={'handled'}>
        <Stepper step={2} totalSteps={4} paddingHorizontal={scaler(20)} />
        <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(15), }}>
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
                ref={eventDateRef}
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
              } else {
                setValue(selectedType == 'endDate' ? 'endTime' : "startTime", "")
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
});
