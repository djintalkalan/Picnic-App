import { colors, Images } from 'assets';
import { Button, CheckBox, FixedDropdown, MyHeader, Stepper, Text, TextInput, useKeyboardService } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import Switch from 'custom-components/Switch';
import { useDatabase } from 'database';
import React, { FC, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  StyleSheet, TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { scaler } from 'utils';

type FormType = {
  currency: string;
  ticketPrice: string;
  ticketType: string;
  donationDescription: string;
};

const DropDownData = ['USD', 'EUR', 'GBP'];
const TicketTypeData = [{ text: 'Single ticket', value: 'single' }, { text: 'Multi tickets', value: 'multiple' }]

const CreateEvent3: FC<any> = props => {
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const uploadedImage = useRef('');
  const selectedTicketType = useRef<string>()
  const [isDropdown, setDropdown] = useState(false);
  const [isTicketTypeDropdown, setIsTicketTypeDropdown] = useState(false);
  const [isDonatioAccepted, setIsDonationAccepted] = useState(false)
  const dispatch = useDispatch();
  const keyboardValues = useKeyboardService()

  const [userData] = useDatabase("userData")

  const {
    control,
    getValues,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>({
    mode: 'onChange', defaultValues: { 'currency': 'USD', ticketType: TicketTypeData[0].text }
  });

  const bodyData = props?.route?.params

  const ticketTypeArray = useMemo(() => {
    if (isFreeEvent) {
      return [TicketTypeData[0]].map((_, i) => ({ id: i, data: _, title: _.text }))
    }
    else
      return TicketTypeData.map((_, i) => ({ id: i, data: _, title: _.text }))
  }, [isFreeEvent])

  // const onSubmit = useCallback(
  //   (data) => {
  //     if (!uploadedImage.current && bodyData?.eventImage?.path) {
  //       dispatch(
  //         uploadFile({
  //           image: bodyData?.eventImage,
  //           onSuccess: url => {
  //             uploadedImage.current = url;
  //             callCreateEventApi(data, isFreeEvent, isUnlimitedCapacity);
  //           },
  //           prefixType: 'events',
  //         }),
  //       );
  //     } else {
  //       callCreateEventApi(data, isFreeEvent, isUnlimitedCapacity);
  //     }
  //   },
  //   [bodyData?.eventImage, isFreeEvent, isUnlimitedCapacity],
  // );


  // const callCreateEventApi = useCallback((data, isFreeEvent, isUnlimitedCapacity) => {
  //   const { latitude, longitude, address, otherData } =
  //     bodyData?.location ?? {};

  //   const { startTime, endTime, eventDate } = eventDateTime.current
  //   let payload = {
  //     image: uploadedImage?.current,
  //     name: bodyData?.eventName,
  //     group_id: bodyData?.myGroup?.id,
  //     is_online_event: bodyData?.isOnlineEvent ? '1' : '0',
  //     short_description: bodyData?.aboutEvent,
  //     address: address?.main_text + (((address?.main_text && address?.secondary_text ? ", " : "") + address?.secondary_text)?.trim() || ""),
  //     city: otherData?.city,
  //     state: otherData?.state,
  //     country: otherData?.country,
  //     location: {
  //       type: 'Point',
  //       coordinates: [longitude, latitude],
  //     },
  //     capacity_type: isUnlimitedCapacity ? 'unlimited' : 'limited',
  //     capacity: data?.capacity,
  //     is_free_event: isFreeEvent ? '1' : '0',
  //     event_fees: round(parseFloat(data?.ticketPrice), 2),
  //     event_date: dateFormat(eventDate, "YYYY-MM-DD"),
  //     event_start_time: dateFormat(startTime, "HH:mm:ss"),
  //     event_end_time: data?.endTime ? dateFormat(endTime, "HH:mm") : "",
  //     details: data?.additionalInfo,
  //     event_currency: data?.currency.toLowerCase(),
  //     payment_method: [],
  //     payment_email: "",
  //     event_refund_policy: ""
  //   };
  //   dispatch(
  //     createEvent({
  //       data: payload,
  //       onSuccess: () => {
  //         Database.setSelectedLocation(Database.getStoredValue<ILocation>('selectedLocation'));
  //       },
  //     }),
  //   );
  // }, []);

  // const calculateButtonDisability = useCallback(() => {
  //   if (!getValues('eventDate') ||
  //     // ((!getValues('ticketPrice')&& !isFreeEvent)) ||
  //     // (!getValues('capacity')&&!isUnlimitedCapacity) ||
  //     !getValues('startTime') ||
  //     (errors && (errors.eventDate || errors.startTime || errors.capacity))
  //   ) {
  //     return true;
  //   }
  //   return false;
  // }, [errors]);


  // const onPressSubmit = useCallback(() => handleSubmit((data) => {
  //   const { endTime, endDate } = data
  //   const { startTime: startTimeDate, endTime: endTimeDate, endDate: endEventDate, eventDate } = eventDateTime.current
  //   const currentDate = new Date()
  //   if (startTimeDate <= currentDate) {
  //     _showErrorMessage(Language.start_time_invalid)
  //     return
  //   }
  //   if (endTime && endTimeDate <= startTimeDate) {
  //     _showErrorMessage(Language.end_time_invalid)
  //     return
  //   }

  //   if (endDate && endEventDate <= eventDate) {
  //     _showErrorMessage(Language.end_date_greater_than_start_date)
  //     return
  //   }

  //   // !userData?.is_premium ?
  //   //   _showPopUpAlert({
  //   //     message: isFreeEvent ? Language.join_now_the_picnic_premium : Language.join_now_to_access_payment_processing,
  //   //     buttonText: Language.join_now,
  //   //     onPressButton: () => {
  //   //       NavigationService.navigate("Subscription", {
  //   //         onSubscription: onSubmit, data: {
  //   //           ...data, ...bodyData,
  //   //           eventDateTime: eventDateTime.current,
  //   //           image: uploadedImage?.current,
  //   //           isUnlimitedCapacity: isUnlimitedCapacity,
  //   //           isFreeEvent: isFreeEvent
  //   //         }
  //   //       });
  //   //       _hidePopUpAlert()
  //   //     },
  //   //     cancelButtonText: Language.no_thanks_create_my_event,
  //   //     onPressCancel: () => { isFreeEvent ? onSubmit(data) : _showErrorMessage('You need subscription for a paid event.') }
  //   //   }) :
  //   //   isFreeEvent ?
  //   //     onSubmit(data)
  //   //     :
  //   NavigationService.navigate('CreateEvent3',
  //     {
  //       data: {
  //         ...data, ...bodyData,
  //         eventDateTime: eventDateTime.current,
  //         image: uploadedImage?.current,
  //         isUnlimitedCapacity: isUnlimitedCapacity
  //       }
  //     })
  //   //   :
  //   //  undefined
  // })(), [userData, isFreeEvent, isUnlimitedCapacity])

  return (
    <SafeAreaViewWithStatusBar style={styles.container}>
      <MyHeader title={Language.host_an_event} />
      <View style={{ flex: 1 }}>
        <ScrollView nestedScrollEnabled keyboardShouldPersistTaps={'handled'}>
          <Stepper step={3} totalSteps={4} paddingHorizontal={scaler(20)} />
          <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(15), }}>
            <TouchableOpacity onPress={() => {
              setIsFreeEvent((b) => {
                if (!b) {
                  // clearErrors('ticketPrice')
                  // setValue('ticketPrice', "")
                  selectedTicketType.current = TicketTypeData[0].value
                  setValue('ticketType', TicketTypeData[0].text);
                }
                return !b
              })
            }} style={{ flexDirection: 'row', marginTop: scaler(20), marginVertical: scaler(10) }}>
              <CheckBox checked={isFreeEvent}

              />
              <Text style={{ marginLeft: scaler(8), fontSize: scaler(14) }}>{Language.free_event}</Text>
            </TouchableOpacity>


            <View style={{ flex: 1, width: '100%' }} >
              <TextInput
                containerStyle={{ marginEnd: scaler(4), width: '100%' }}
                borderColor={colors.colorTextInputBackground}
                backgroundColor={colors.colorTextInputBackground}
                name={'ticketType'}
                icon={Images.ic_arrow_dropdown}
                onChangeText={(text) => {

                }}
                // required={isFreeEvent ? undefined : Language.event_name_required}
                control={control}
                iconContainerStyle={{ end: scaler(4) }}
                onPress={() => { setIsTicketTypeDropdown(_ => !_) }}
                errors={errors}
              />
              <FixedDropdown
                containerStyle={{ width: '100%' }}
                visible={isTicketTypeDropdown}
                data={ticketTypeArray}
                onSelect={data => {
                  selectedTicketType.current = data?.data?.value
                  setValue('ticketType', data?.title, { shouldValidate: true });
                  setIsTicketTypeDropdown(false);
                }}
              />
              {isFreeEvent ?
                <View>
                  <View style={{ flexDirection: 'row', marginTop: scaler(30), flex: 1 }}>
                    <Switch active={isDonatioAccepted} onChange={() => { setIsDonationAccepted(!isDonatioAccepted) }} />
                    <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '400' }}>{Language.accept_donation}</Text>
                  </View>
                  {isDonatioAccepted ?
                    <View style={{ flex: 1, width: '100%', marginTop: scaler(10) }} >
                      <TextInput
                        containerStyle={{ marginEnd: scaler(4), width: '100%' }}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'currency'}
                        icon={Images.ic_arrow_dropdown}
                        onChangeText={(text) => {

                        }}
                        required={isFreeEvent ? undefined : Language.event_name_required}
                        control={control}
                        iconContainerStyle={{ end: scaler(4) }}
                        onPress={() => { setDropdown(_ => !_) }}
                        errors={errors}
                      />
                      <FixedDropdown
                        containerStyle={{ width: '100%' }}
                        visible={isDropdown}
                        data={DropDownData.map((_, i) => ({ id: i, data: _, title: _ }))}
                        onSelect={data => {
                          setDropdown(false);
                          setValue('currency', data?.title, { shouldValidate: true });
                        }}
                      />
                      <TextInput
                        placeholder={Language.donation_description}
                        name={'donationDescription'}
                        multiline
                        limit={2000}
                        keyboardValues={keyboardValues}
                        style={{ minHeight: scaler(80), textAlignVertical: 'top' }}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        control={control}
                        errors={errors}
                      />
                    </View>

                    : undefined}
                </View>
                :
                <View style={{ flex: 1, width: '100%' }} >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <TextInput
                      containerStyle={{ marginEnd: scaler(4), width: '30%' }}
                      borderColor={colors.colorTextInputBackground}
                      backgroundColor={colors.colorTextInputBackground}
                      name={'currency'}
                      disabled={isFreeEvent ? true : false}
                      icon={Images.ic_arrow_dropdown}
                      onChangeText={(text) => {

                      }}
                      required={isFreeEvent ? undefined : Language.event_name_required}
                      control={control}
                      iconContainerStyle={{ end: scaler(4) }}
                      onPress={() => { setDropdown(_ => !_) }}
                      errors={errors}
                    />
                    <TextInput
                      containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                      placeholder={
                        Language.event_ticket_price + ' (' + Language.per_person + ')'
                      }
                      style={{ paddingLeft: scaler(20) }}
                      borderColor={colors.colorTextInputBackground}
                      backgroundColor={colors.colorTextInputBackground}
                      name={'ticketPrice'}
                      keyboardType={'decimal-pad'}
                      disabled={isFreeEvent ? true : false}
                      iconSize={scaler(18)}
                      icon={Images.ic_ticket}
                      rules={{
                        validate: (v: string) => {
                          v = v?.trim()
                          if (parseFloat(v) > 9999.99) {
                            return Language.event_max_price
                          }
                          try {
                            if (parseFloat(v) == 0 || (v?.includes(".") && (v?.indexOf(".") != v?.lastIndexOf(".") || v?.lastIndexOf(".") == v?.length - 1) || (v.split(".")?.[1]?.trim()?.length > 2))) {
                              return Language.invalid_ticket_price
                            }
                          }
                          catch (e) { }

                        }
                      }}
                      required={
                        isFreeEvent ? undefined : Language.ticket_price_required
                      }
                      control={control}
                      errors={errors}
                    />
                  </View>
                  <FixedDropdown
                    containerStyle={{ width: '28%' }}
                    visible={isDropdown}
                    data={DropDownData.map((_, i) => ({ id: i, data: _, title: _ }))}
                    onSelect={data => {
                      setDropdown(false);
                      setValue('currency', data?.title, { shouldValidate: true });
                    }}
                  />
                </View>
              }
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={{ marginHorizontal: scaler(15) }}>
        <Button
          // disabled={calculateButtonDisability()}
          containerStyle={{ marginTop: scaler(20) }}
          title={Language.next}
          onPress={() => { }}
        />
      </View>
    </SafeAreaViewWithStatusBar>
  );
};

export default CreateEvent3;

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
