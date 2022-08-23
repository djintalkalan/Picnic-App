import { store } from 'app-store';
import { createEvent, setLoadingAction, uploadFileArray } from 'app-store/actions';
import { updateCreateEvent } from 'app-store/actions/createEventActions';
import { ICreateEventReducer } from 'app-store/reducers';
import { colors, Images } from 'assets';
import { Button, CheckBox, FixedDropdown, MyHeader, Stepper, Text, TextInput, useKeyboardService } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import Switch from 'custom-components/Switch';
import Database from 'database/Database';
import { add, differenceInMinutes } from 'date-fns';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  StyleSheet, TextInput as RNInput, TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useDispatch } from 'react-redux';
import Language, { useLanguage } from 'src/language/Language';
import { dateFormat, getFromZonedDate, getReadableDate, getReadableTime, getZonedDate, NavigationService, scaler, stringToDate, _hidePopUpAlert, _showErrorMessage, _showPopUpAlert } from 'utils';
const closeImage = AntDesign.getImageSourceSync("close", 50, colors.colorErrorRed)

type FormType = {
  currency: string;
  ticketPrice: string;
  ticketType: string;
  donationDescription: string;
  ticketPlans: Array<TicketType>
  capacity: string,
  cutoffDate?: Date | null,
  cutoffTime?: Date | null,
  noOfFreeTickets: string,
};
type TicketType = {
  ticketTitle: string,
  ticketPrice: string,
  currency: string,
  ticketDescription: string,
  isUnlimitedCapacity: boolean,
  capacity: string,
  cutoffDate?: Date | null,
  cutoffTime?: Date | null,
  noOfFreeTickets: string,
  status: number,
  plan_id: string
}
const emptyTicketType: TicketType = {
  ticketTitle: '',
  ticketPrice: '',
  currency: 'USD',
  ticketDescription: '',
  isUnlimitedCapacity: false,
  capacity: '',
  cutoffDate: null,
  cutoffTime: null,
  noOfFreeTickets: '',
  status: 1,
  plan_id: ""
}
const DropDownData = ['USD', 'EUR', 'GBP'];

const getCutoffDateTime = (event: ICreateEventReducer) => {
  try {
    console.log("event?.sales_ends_on", event?.sales_ends_on);

    if (event?.sales_ends_on)
      return getZonedDate(event?.timezone, event?.sales_ends_on)

    const startDate = stringToDate(event?.event_date + " " + event?.event_start_time)
    const endDate = event?.is_multi_day_event == 1 ?
      stringToDate(event?.event_end_date + " " + event?.event_end_time) :
      stringToDate(event?.event_date + " " + (event?.event_end_time || "23:59:00"))

    if (differenceInMinutes(endDate, startDate) > 60) {
      return add(startDate, { minutes: 60 })
    }
    return endDate


  } catch (e) {
    return null
  }

}

const CreateEvent3: FC<any> = props => {
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const uploadedImage = useRef<string>('');
  const uploadedImageArray = useRef<Array<any>>([]);
  const ticketTypeRef = useRef<string>('single')
  const [isDropdown, setDropdown] = useState(false);
  const [multiTicketCurrencyIndex, setMultiTicketCurrencyIndex] = useState(-1);
  const [isTicketTypeDropdown, setIsTicketTypeDropdown] = useState(false);
  const capacityInputRef = useRef<RNInput>(null)
  const numberOfFreeInputRef = useRef<RNInput>(null)
  const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(false);
  const [isDonationAccepted, setIsDonationAccepted] = useState(false)
  const dispatch = useDispatch();
  const keyboardValues = useKeyboardService()
  const { current: event } = useRef(store.getState().createEventState)
  const [toggle, setToggle] = useState(true)
  const TicketTypeData = useMemo(() => ([{ text: Language.single_ticket, value: 'single' }, { text: Language.multiple_ticket, value: 'multiple' }])
    , [useLanguage()])

  const {
    control,
    setValue,
    handleSubmit,
    getValues,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<FormType>({
    mode: 'onChange', shouldFocusError: true, defaultValues: {
      ticketPlans: [{
        ...emptyTicketType,
        cutoffDate: getCutoffDateTime(event),
        cutoffTime: getCutoffDateTime(event),
      }],
      ticketType: TicketTypeData[0].text,
      currency: 'USD',
      cutoffDate: getCutoffDateTime(event),
      cutoffTime: getCutoffDateTime(event),
    }
  });

  // console.log("_formValues", control._formValues);
  // console.log("errors", control._formState.errors);
  // console.log("fields", control?._fields);


  const {
    fields: ticketPlans, append, prepend, remove, insert, update, replace
  } = useFieldArray({ name: 'ticketPlans', control: control, })

  useEffect(() => {
    setEventValues()
    // Database.setUserData({ ...Database.getStoredValue("userData"), is_premium: false })
  }, [])

  const setEventValues = useCallback(() => {

    const setDate = () => {
      setIsUnlimitedCapacity(event?.capacity_type == 'unlimited' ? true : false)
      setValue('capacity', (event?.capacity || "")?.toString())
    }

    if (event.is_free_event == 1) {

      setValue('donationDescription', event.donation_description);
      setIsDonationAccepted(event?.is_donation_enabled == 1);
      setValue('currency', event?.event_currency?.toUpperCase() || "USD")
      setDate()
      setValue('cutoffDate', getCutoffDateTime(event))
      setValue('cutoffTime', getCutoffDateTime(event))
    } else {
      if (event.ticket_type == 'multiple') {
        ticketTypeRef.current = TicketTypeData[1]?.value
        setValue('ticketType', TicketTypeData[1]?.text);
        replace(event.ticket_plans.map((_, i) => ({
          plan_id: _?._id,
          ticketTitle: _.name,
          ticketPrice: _?.amount?.toString(),
          currency: _.currency?.toUpperCase(),
          ticketDescription: _.description,
          status: (_?.status || 1),
          capacity: _.capacity?.toString(),
          cutoffDate: getCutoffDateTime({ ...event, sales_ends_on: _?.sales_ends_on }),
          cutoffTime: getCutoffDateTime({ ...event, sales_ends_on: _?.sales_ends_on }),
          isUnlimitedCapacity: _?.capacity_type == 'unlimited',
          noOfFreeTickets: _?.total_free_tickets?.toString() || "",
        })))
      } else {
        setValue('ticketType', TicketTypeData[0]?.text);
        setValue('ticketPrice', (event?.event_fees || "")?.toString())
        setValue('currency', event?.event_currency?.toUpperCase() || "USD")
        setValue('cutoffDate', getCutoffDateTime(event))
        setValue('cutoffTime', getCutoffDateTime(event))
        setValue('noOfFreeTickets', event?.total_free_tickets?.toString() || "")
        setDate()
      }
    }
    setIsFreeEvent(event?.is_free_event == 1 ? true : false)
    uploadedImage.current = event?.image?.path ? '' : event.image
  }, [])


  const ticketTypeArray = useMemo(() => {
    if (isFreeEvent) {
      return [TicketTypeData[0]].map((_, i) => ({ id: i, data: _, title: _.text }))
    }
    else
      return TicketTypeData.map((_, i) => ({ id: i, data: _, title: _.text }))
  }, [isFreeEvent])

  const addTicket = useCallback(() => {
    replace([
      {
        ...emptyTicketType, currency: getValues('ticketPlans')[0].currency,
        cutoffDate: getCutoffDateTime(event),
        cutoffTime: getCutoffDateTime(event),
      },
      ...getValues('ticketPlans')
    ])
    // insert(0, {
    //   ...emptyTicketType, currency: getValues('ticketPlans')[0].currency,
    //   cutoffDate: getCutoffDateTime(event),
    //   cutoffTime: getCutoffDateTime(event),
    // })
  }, [ticketPlans, event])

  const deleteTicket = useCallback((i: number, _: any) => {
    if (_?.plan_id) {
      update(i, { ..._, status: 2 })
    } else
      remove(i);
    // setTicketKey((new Date()).toISOString())
  }, [])

  const next = useCallback((payload: any) => {
    if (payload?.is_free_event == 1 && payload.is_donation_enabled == 1 || payload?.is_free_event == 0) {
      NavigationService.navigate('CreateEvent4')
    } else {
      let tempArray = event.event_images.filter(_ => !_?._id)
      if (event.image?.path || tempArray.length > 0) {
        dispatch(
          uploadFileArray({
            image: [...tempArray, ...(event.image?.path ? [{ ...event.image, isProfile: true }] : [])],
            onSuccess: (imageArray, profileImage) => {
              dispatch(setLoadingAction(false))
              if (profileImage)
                uploadedImage.current = profileImage
              uploadedImageArray.current = [...imageArray];
              const payload = {
                image: uploadedImage.current,
                event_images: [...event.event_images.filter(_ => _?._id), ...uploadedImageArray.current]
              }
              // dispatch(updateCreateEvent(payload))
              dispatch(updateCreateEvent(removePaymentKeys(payload)))
              setTimeout(() => {
                dispatch(createEvent())
              }, 0)
            },
            prefixType: 'events',
          }),
        )
      }
      else {
        dispatch(updateCreateEvent(removePaymentKeys(payload)))
        setTimeout(() => {
          dispatch(createEvent())
        }, 0)
      }
    }

  }, []);

  const onSubmit = useCallback(() => handleSubmit((data: FormType) => {
    console.log("data", data);

    const payload: any = {
      is_free_event: '0',
      is_donation_enabled: '0',
    }

    if (isFreeEvent) {
      payload.is_free_event = '1'
      payload.capacity_type = isUnlimitedCapacity ? 'unlimited' : 'limited'
      payload.capacity = data.capacity


      payload.sales_ends_on = data?.cutoffTime ? getFromZonedDate(event?.timezone, data?.cutoffTime)?.toISOString() : ''
      console.log(payload.sales_ends_on);

      if (isDonationAccepted) {
        payload.is_donation_enabled = '1'
        payload.donation_description = data.donationDescription
        payload.event_currency = data.currency?.toLowerCase()
      }
    } else {
      payload.ticket_type = ticketTypeRef.current
      payload.event_fees = 0
      payload.event_currency = data.currency?.toLowerCase()
      if (payload.ticket_type == 'multiple') {
        payload.ticket_plans = data.ticketPlans?.map(_ => {
          const sales_ends_on = _.cutoffTime ? getFromZonedDate(event?.timezone, _?.cutoffTime)?.toISOString() : ''

          return ({
            _id: _?.plan_id || undefined,
            name: _.ticketTitle,
            amount: _.ticketPrice,
            event_tax_rate: "0",
            event_tax_amount: "0",
            currency: _.currency?.toLowerCase(),
            description: _.ticketDescription,
            status: _.status == 2 ? 2 : undefined,
            sales_ends_on,
            total_free_tickets: _?.noOfFreeTickets || 0,
            capacity: _?.capacity,
            capacity_type: _?.isUnlimitedCapacity ? 'unlimited' : 'limited',
          })
        })
        payload.total_free_tickets = undefined
        payload.capacity_type = undefined
        payload.capacity = ''
        payload.sales_ends_on = ''
      } else {
        payload.event_fees = data.ticketPrice
        payload.ticket_plans = []
        payload.total_free_tickets = data.noOfFreeTickets || 0
        payload.capacity_type = isUnlimitedCapacity ? 'unlimited' : 'limited'
        payload.capacity = data.capacity
        payload.sales_ends_on = data?.cutoffTime ? getFromZonedDate(event?.timezone, data?.cutoffTime)?.toISOString() : ''

      }
    }

    console.log("payload", payload);

    dispatch(updateCreateEvent(payload))

    const userData = Database.getStoredValue("userData")

    if (!userData?.is_premium) {
      _showPopUpAlert({
        message: isFreeEvent ? Language.join_now_the_picnic_premium : Language.join_now_to_access_payment_processing,
        buttonText: Language.join_now,
        onPressButton: () => {
          NavigationService.navigate("Subscription", {
            onSubscription: () => {
              NavigationService.goBack();
              next(payload);
            },
          });
          _hidePopUpAlert()
        },
        cancelButtonText: Language.no_thanks_create_my_event,
        // onPressCancel: () => { isFreeEvent ? next(payload) : _showErrorMessage('You need subscription for a paid event.') }
        onPressCancel: () => { next(payload) }
      })
    } else next(payload)

  })(), [isFreeEvent, handleSubmit, isDonationAccepted, ticketPlans, isUnlimitedCapacity])

  const openDatePicker = useCallback((i: number, isTime: any = false) => {
    // eventDateTime.current.selectedType = type
    selectedIndexRef.current = (i)
    setDatePickerVisibility(isTime ? 'time' : 'date');
    // eventPriceInputRef.current?.blur()
    // additionalInfoInputRef.current?.blur()
  }, []);

  const [datePickerVisibility, setDatePickerVisibility] = useState<any>();
  const selectedIndexRef = useRef(0);
  // console.log("Date", ticketPlans[selectedIndex]);
  console.log("event", event);

  const datePickerRef = useRef<DateTimePickerModal>(null)

  const getMinDate = useCallback(() => {
    const currentDate = getZonedDate(event?.timezone);
    switch (datePickerVisibility) {
      case "date":
        return currentDate;
      default:
        return undefined
    }

  }, [datePickerVisibility])

  const getCurrentDate = () => {
    if (!datePickerVisibility) return undefined
    let dateString = `ticketPlans.${selectedIndexRef?.current}.cutoffDate`
    let timeString = `ticketPlans.${selectedIndexRef?.current}.cutoffTime`
    if (selectedIndexRef?.current < 0) {
      dateString = "cutoffDate"
      timeString = "cutoffTime"
    }
    //@ts-ignore
    return (datePickerVisibility == 'date') ? (getValues(dateString) || undefined) : getValues(timeString) || stringToDate(dateFormat(getValues(dateString), "YYYY-MM-DD"), "YYYY-MM-DD", "-")
  }

  return (
    <SafeAreaViewWithStatusBar style={styles.container}>
      <MyHeader title={event?._id ? event?.is_copied_event != '0' ? Language.copy_event : Language.edit_event : Language.host_an_event} />
      <View style={{ flex: 1 }}>
        <ScrollView enableResetScrollToCoords={false} nestedScrollEnabled keyboardShouldPersistTaps={'handled'}>
          <Stepper step={3} totalSteps={4} paddingHorizontal={scaler(20)} />
          <View style={{ width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(15), }}>

            <TouchableOpacity onPress={() => {
              setIsTicketTypeDropdown(false)
              setIsFreeEvent((b) => {
                if (!b) {
                  ticketTypeRef.current = TicketTypeData[0].value
                  setValue('ticketType', TicketTypeData[0].text);
                  // setValue('cutoffDate', undefined);
                  // setValue('cutoffTime', undefined);
                }
                return !b
              })
            }} style={{ flexDirection: 'row' }}>
              <CheckBox checked={isFreeEvent}

              />
              <Text style={{ marginLeft: scaler(8), fontSize: scaler(14) }}>{Language.free_event}</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, width: '100%', paddingBottom: scaler(10) }} >

              <TextInput
                containerStyle={{ marginEnd: scaler(4), width: '100%' }}
                borderColor={colors.colorTextInputBackground}
                backgroundColor={colors.colorTextInputBackground}
                name={'ticketType'}
                icon={!isFreeEvent ? Images.ic_arrow_dropdown : undefined}
                onChangeText={(text) => {

                }}
                style={{ color: isFreeEvent ? colors.colorGreyText : colors.colorBlack }}
                disabled={isFreeEvent ?? false}
                // required={isFreeEvent ? undefined : Language.event_name_required}
                control={control}
                iconContainerStyle={{ end: scaler(4) }}
                onPress={() => { setIsTicketTypeDropdown(_ => !_) }}
                errors={errors}

              />
              <FixedDropdown
                containerStyle={{ width: '100%', }}
                visible={isTicketTypeDropdown}
                data={ticketTypeArray}
                onSelect={data => {
                  ticketTypeRef.current = data?.data?.value
                  setValue('ticketType', data?.title, { shouldValidate: true });
                  // setValue('cutoffDate', undefined);
                  // setValue('cutoffTime', undefined);
                  setIsTicketTypeDropdown(false);
                }}
              />


              {ticketTypeRef.current == 'single' ?
                <>
                  <TouchableOpacity onPress={() => {
                    setIsUnlimitedCapacity((b) => {
                      if (!b) {
                        clearErrors('capacity')
                        setValue('capacity', "")
                      }
                      return !b
                    })
                  }} style={{ flexDirection: 'row', marginTop: scaler(20), }}>
                    <CheckBox checked={isUnlimitedCapacity} />
                    <Text style={{ marginLeft: scaler(8), marginRight: scaler(18), fontSize: scaler(14) }}>
                      {Language.unlimited_capacity}
                    </Text>
                  </TouchableOpacity>
                  {!isUnlimitedCapacity && <TextInput
                    containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                    placeholder={Language.capacity}
                    ref={capacityInputRef}
                    borderColor={colors.colorTextInputBackground}
                    backgroundColor={colors.colorTextInputBackground}
                    name={'capacity'}
                    returnKeyType={'done'}
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
                  />}
                </>
                : undefined}

              {ticketTypeRef.current == 'multiple' || isFreeEvent ? undefined :
                <>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <View style={{ marginEnd: scaler(4), width: '30%' }} >
                        <TextInput
                          containerStyle={{ width: '100%' }}
                          borderColor={colors.colorTextInputBackground}
                          backgroundColor={colors.colorTextInputBackground}
                          name={'currency'}
                          disabled={isFreeEvent ? true : false}
                          icon={Images.ic_arrow_dropdown}
                          onChangeText={(text) => {

                          }}
                          control={control}
                          iconContainerStyle={{ end: scaler(4) }}
                          onPress={() => { setDropdown(_ => !_) }}
                          errors={errors}
                        />
                        <FixedDropdown
                          containerStyle={{ width: '98%', position: 'relative', top: 0 }}
                          visible={isDropdown}
                          data={DropDownData.map((_, i) => ({ id: i, data: _, title: _ }))}
                          onSelect={data => {
                            setDropdown(false);
                            setValue('currency', data?.title, { shouldValidate: true });
                          }}
                        />
                      </View>
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
                        returnKeyType={'done'}
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

                  </View>

                  <TextInput
                    containerStyle={{ marginEnd: scaler(4) }}
                    placeholder={Language.number_of_free_tickets}
                    borderColor={colors.colorTextInputBackground}
                    backgroundColor={colors.colorTextInputBackground}
                    name={'noOfFreeTickets'}
                    returnKeyType={'done'}
                    maxLength={5}
                    rules={{
                      validate: (v: string) => {
                        if (!isUnlimitedCapacity && parseInt(v) > parseInt(getValues('capacity') || "0")) {
                          return Language.invalid_free_tickets
                        }
                      }
                    }}
                    keyboardType={'number-pad'}
                    control={control}
                    errors={errors}
                  />


                </>
              }




              {ticketTypeRef.current == 'multiple' ? undefined :
                <>

                  <Text style={{ marginTop: scaler(10), marginHorizontal: scaler(5) }} >{Language.cutoff_date_title}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TextInput
                      containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                      placeholder={Language.cutoff_date}
                      borderColor={colors.colorTextInputBackground}
                      backgroundColor={colors.colorTextInputBackground}
                      style={{ fontSize: scaler(13) }}
                      name={'cutoffDate'}
                      format={getReadableDate}
                      onPress={() => openDatePicker(-1)}
                      icon={getValues('cutoffDate') ? closeImage : Images.ic_calender}
                      onPressIcon={getValues('cutoffDate') ? () => {
                        setValue('cutoffDate', null)
                        setValue('cutoffTime', null)
                        setToggle(_ => !_)
                      } : undefined}
                      iconSize={scaler(20)}
                      control={control}
                      errors={errors} />
                    <TextInput
                      containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                      placeholder={Language.cutoff_time}
                      borderColor={colors.colorTextInputBackground}
                      backgroundColor={colors.colorTextInputBackground}
                      name={'cutoffTime'}
                      format={getReadableTime}
                      required={getValues('cutoffDate') ? Language.cutoff_time_required : false}
                      onPress={() => openDatePicker(-1, getValues('cutoffDate'))}
                      iconSize={scaler(18)}
                      icon={getValues('cutoffTime') ? closeImage : Images.ic_clock}
                      onPressIcon={getValues('cutoffTime') ? () => {
                        setValue('cutoffTime', null)
                        setToggle(_ => !_)
                      } : undefined}
                      control={control}
                      errors={errors} />
                  </View>
                </>
              }

              {/* ----------------------------------- free event flow started here -----------------------------------*/}

              {isFreeEvent ?
                <View>
                  <View style={{ flexDirection: 'row', marginTop: scaler(30), flex: 1 }}>
                    <Switch active={isDonationAccepted} onChange={() => { setValue('donationDescription', ''); setIsDonationAccepted(!isDonationAccepted) }} />
                    <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '400' }}>{Language.accept_donation}</Text>
                  </View>

                  {/* ----------------------------------- donation flow started here -----------------------------------*/}

                  {isDonationAccepted ?
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
                        required={Language.description_required}
                        control={control}
                        errors={errors}
                      />
                    </View>

                    : undefined}
                </View>
                :

                <View style={{ flex: 1, width: '100%' }} >
                  {ticketTypeRef.current == 'multiple' ?
                    <View style={{ marginTop: scaler(15) }}>
                      <Button title={Language.add_ticket} onPress={addTicket} />

                      {/* ----------------------------------- map function for total tickets started here -----------------------------------*/}

                      {ticketPlans?.map((_, i) => {
                        if (_?.status != 2)
                          return (
                            <View key={_.id} style={styles.ticketView}>
                              {ticketPlans.length > 1 ? <AntDesign name={'minuscircle'} onPress={() => deleteTicket(i, _)} color={'#EB5757'} size={scaler(25)} style={styles.minusView} /> : undefined}
                              <TextInput
                                placeholder={Language.ticket_title}
                                containerStyle={{ marginEnd: scaler(4), width: '100%' }}
                                borderColor={colors.colorTextInputBackground}
                                backgroundColor={colors.colorTextInputBackground}
                                name={`ticketPlans.${i}.ticketTitle`}
                                required={Language.title_required}
                                control={control}
                                errors={(errors?.ticketPlans as any)?.[i]}
                              />


                              <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                  <TextInput
                                    containerStyle={{ marginEnd: scaler(4), width: '30%' }}
                                    borderColor={colors.colorTextInputBackground}
                                    backgroundColor={colors.colorTextInputBackground}
                                    name={`ticketPlans.${i}.currency`}
                                    defaultValue={_.currency}
                                    disabled={isFreeEvent ? true : false}
                                    icon={Images.ic_arrow_dropdown}
                                    control={control}
                                    iconContainerStyle={{ end: scaler(4) }}
                                    onPress={() => { setMultiTicketCurrencyIndex(_ => (_ != -1 ? -1 : i)) }}
                                    errors={(errors?.ticketPlans as any)?.[i]}
                                  />
                                  <TextInput
                                    containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                                    placeholder={Language.ticket_price}
                                    returnKeyType={'done'}
                                    style={{ paddingLeft: scaler(20) }}
                                    borderColor={colors.colorTextInputBackground}
                                    backgroundColor={colors.colorTextInputBackground}
                                    name={`ticketPlans.${i}.ticketPrice`}
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
                                      Language.ticket_price_required
                                    }
                                    control={control}
                                    errors={(errors?.ticketPlans as any)?.[i]}
                                  />
                                </View>
                                <FixedDropdown
                                  containerStyle={{ width: '28%' }}
                                  visible={multiTicketCurrencyIndex == i}
                                  data={DropDownData.map((_, i) => ({ id: i, data: _, title: _ }))}
                                  onSelect={data => {
                                    setMultiTicketCurrencyIndex(-1);
                                    // const a = getValues('ticketPlans')[i]
                                    replace(getValues('ticketPlans').map(_ => ({ ..._, currency: data.title })))
                                    // update(i, { ...a, currency: data.title })
                                  }}
                                />

                                <TouchableOpacity onPress={() => {
                                  update(i, {
                                    ...getValues(`ticketPlans.${i}`),
                                    isUnlimitedCapacity: !getValues(`ticketPlans.${i}.isUnlimitedCapacity`)
                                  })
                                  setValue(`ticketPlans.${i}.capacity`, "")
                                  clearErrors(`ticketPlans.${i}.capacity`)

                                }} style={styles.capacityCheck}>
                                  <CheckBox checked={_?.isUnlimitedCapacity} />
                                  <Text style={{ marginLeft: scaler(8), fontSize: scaler(14) }}>
                                    {Language.unlimited_capacity}
                                  </Text>
                                </TouchableOpacity>
                                {_?.isUnlimitedCapacity ? undefined :
                                  <TextInput
                                    containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                                    placeholder={Language.capacity}
                                    borderColor={colors.colorTextInputBackground}
                                    backgroundColor={colors.colorTextInputBackground}
                                    name={`ticketPlans.${i}.capacity`}
                                    returnKeyType={'done'}
                                    maxLength={5}
                                    rules={{
                                      validate: (v: string) => {
                                        if (!getValues(`ticketPlans.${i}.isUnlimitedCapacity`)) {
                                          if (!v?.trim()) {
                                            return Language.capacity_required
                                          }
                                          if (parseInt(v) == 0) {
                                            return Language.invalid_capacity
                                          }
                                        }

                                      }
                                    }}
                                    keyboardType={'number-pad'}
                                    control={control}
                                    errors={(errors?.ticketPlans as any)?.[i]}
                                  />
                                }

                                <TextInput
                                  containerStyle={{ marginEnd: scaler(4) }}
                                  placeholder={Language.number_of_free_tickets}
                                  borderColor={colors.colorTextInputBackground}
                                  backgroundColor={colors.colorTextInputBackground}
                                  name={`ticketPlans.${i}.noOfFreeTickets`}
                                  returnKeyType={'done'}
                                  maxLength={5}
                                  rules={{
                                    validate: (v: string) => {
                                      if (!getValues(`ticketPlans.${i}.isUnlimitedCapacity`) && parseInt(v) > parseInt(getValues(`ticketPlans.${i}.capacity`) || "0")) {
                                        return Language.invalid_free_tickets
                                      }
                                    }
                                  }}
                                  keyboardType={'number-pad'}
                                  control={control}
                                  errors={(errors?.ticketPlans as any)?.[i]}
                                />

                                <Text style={{ marginTop: scaler(10), marginHorizontal: scaler(5) }} >{Language.cutoff_date_title}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                  <TextInput
                                    containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                                    placeholder={Language.cutoff_date}
                                    borderColor={colors.colorTextInputBackground}
                                    backgroundColor={colors.colorTextInputBackground}
                                    style={{ fontSize: scaler(13) }}
                                    name={`ticketPlans.${i}.cutoffDate`}
                                    format={getReadableDate}
                                    onPress={() => openDatePicker(i)}
                                    icon={getValues(`ticketPlans.${i}.cutoffDate`) ? closeImage : Images.ic_calender}
                                    iconSize={scaler(20)}
                                    control={control}
                                    onPressIcon={getValues(`ticketPlans.${i}.cutoffDate`) ? () => {
                                      update(i, {
                                        ...getValues(`ticketPlans.${i}`),
                                        cutoffDate: null,
                                        cutoffTime: null
                                      })
                                    } : undefined}
                                    errors={(errors?.ticketPlans as any)?.[i]} />
                                  <TextInput
                                    containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                                    placeholder={Language.cutoff_time}
                                    borderColor={colors.colorTextInputBackground}
                                    backgroundColor={colors.colorTextInputBackground}
                                    name={`ticketPlans.${i}.cutoffTime`}
                                    format={getReadableTime}
                                    onPress={() => openDatePicker(i, getValues(`ticketPlans.${i}.cutoffDate`))}
                                    iconSize={scaler(18)}
                                    required={getValues(`ticketPlans.${i}.cutoffDate`) ? Language.cutoff_time_required : false}
                                    icon={getValues(`ticketPlans.${i}.cutoffTime`) ? closeImage : Images.ic_clock}
                                    onPressIcon={_?.cutoffDate ? () => {
                                      update(i, {
                                        ...getValues(`ticketPlans.${i}`),
                                        cutoffTime: null
                                      })
                                    } : undefined}
                                    control={control}
                                    errors={(errors?.ticketPlans as any)?.[i]} />
                                </View>

                                <TextInput
                                  placeholder={Language.description}
                                  name={`ticketPlans.${i}.ticketDescription`}
                                  multiline
                                  limit={2000}
                                  keyboardValues={keyboardValues}
                                  style={{ minHeight: scaler(80), textAlignVertical: 'top' }}
                                  borderColor={colors.colorTextInputBackground}
                                  backgroundColor={colors.colorTextInputBackground}
                                  required={Language.description_required}
                                  control={control}
                                  errors={(errors?.ticketPlans as any)?.[i]}
                                />
                              </View>
                            </View>
                          )
                      })}

                    </View>
                    :
                    null}
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
          onPress={onSubmit}
        />
      </View>
      <DateTimePickerModal
        ref={datePickerRef}
        style={{ zIndex: 20 }}
        isVisible={datePickerVisibility ? true : false}
        minimumDate={getMinDate()}
        // maximumDate={stringToDate(event?.event_end_date + " " + (event?.event_end_time || "23:59"), "YYYY-MM-DD", "-")}
        mode={datePickerVisibility}
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
        //@ts-ignore
        date={getCurrentDate()}
        onConfirm={(cDate: Date) => {
          const cutoffDate = selectedIndexRef?.current < 0 ? getValues('cutoffDate') : ticketPlans[selectedIndexRef?.current].cutoffDate
          //@ts-ignore
          const date = datePickerVisibility == 'date' ? cDate : new Date(cutoffDate?.getFullYear(), cutoffDate.getMonth(), cutoffDate?.getDate(), cDate?.getHours(), cDate?.getMinutes(), cDate?.getSeconds());

          const updatedTicket = {
            ...getValues(`ticketPlans.${selectedIndexRef?.current}`),
            [datePickerVisibility == 'date' ? 'cutoffDate' : 'cutoffTime']: date
          }

          if (datePickerVisibility == 'date') {
            const eventEndDate = (event.event_end_date || event.event_date).replace(/-/g, "")
            const chosenDate = dateFormat(date, "YYYYMMDD")
            const thisDate = dateFormat(getZonedDate(event?.timezone), "YYYYMMDD")

            if (chosenDate > eventEndDate) {
              _showErrorMessage("Cutoff date should be less than event end date")
              return setDatePickerVisibility(null)
            }
            if (chosenDate < thisDate) {
              _showErrorMessage("Cutoff date should be greater than current date")
              return setDatePickerVisibility(null)
            }
            try {
              datePickerRef.current?.setState({
                currentDate: stringToDate(dateFormat(date, "YYYY-MM-DD"), "YYYY-MM-DD", "-")
              })
            }
            catch (e) {

            }
            updatedTicket.cutoffTime = null
          } else {
            const eventEndDate = getZonedDate(event?.timezone, event?.event_end_date_time)
            const chosenDate = date
            const thisDate = getZonedDate(event?.timezone);
            if (chosenDate > eventEndDate) {
              _showErrorMessage("Cutoff time should be less than event end time")
              return setDatePickerVisibility(null)
            }
            if (chosenDate < thisDate) {
              _showErrorMessage("Cutoff time should be greater than current time")
              return setDatePickerVisibility(null)
            }
          }

          if (selectedIndexRef?.current >= 0)
            update(selectedIndexRef?.current, updatedTicket)
          else
            setValue(datePickerVisibility == 'date' ? 'cutoffDate' : "cutoffTime", date)

          setDatePickerVisibility((_: any) => {
            if (_ == 'date') {
              setTimeout(() => {
                setDatePickerVisibility('time');
              }, 500);
            }
            return null
          })
        }}
        onCancel={() => {
          setDatePickerVisibility(null);
        }}
      />
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
  ticketView: {
    borderWidth: scaler(1),
    borderColor: colors.colorPrimary,
    borderStyle: 'dashed',
    paddingHorizontal: scaler(10),
    paddingBottom: scaler(10),
    marginVertical: scaler(15),
    borderRadius: scaler(2)
  },
  minusView: {
    position: 'absolute',
    alignSelf: 'flex-end',
    top: scaler(-12),
    right: scaler(-12)
  },
  capacityCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaler(5),
    marginLeft: scaler(5),
    marginTop: scaler(15)
  }
});

const removePaymentKeys = (payload: any) => {
  payload.ticket_type = ""
  payload.event_fees = ""
  payload.event_currency = ""
  payload.ticket_plans = []
  payload.payment_method = []
  payload.payment_email = ""
  payload.event_refund_policy = ""
  payload.event_tax_rate = "0"
  payload.event_tax_amount = ""
  return payload
}
