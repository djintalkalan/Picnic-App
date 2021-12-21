import {colors, Images} from 'assets';
import React, {FC, useCallback, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {KeyboardAwareScrollView as ScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {dateFormat, NavigationService, scaler, _showPopUpAlert} from 'utils';
import Language from 'src/language/Language';
import { Button, CheckBox, FixedDropdown, MyHeader,  Stepper, Text, TextInput } from 'custom-components';
import Database, { useDatabase } from 'database';
import { createEvent } from 'app-store/actions';
import { useDispatch } from 'react-redux';

type FormType = {
  capacity: string;
  ticketPrice: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  additionalInfo: string;
  currency: string;
};

const DropDownData = [{title:'USD',value:'usd'},{title:'EUR',value:'eur'},{title:'GBP',value:'gbp'},{title:'COP',value:'cop'}];

type IEventDateTime =  {
  selectedType:"eventDate"|"startTime"|"endTime",
    eventDate: Date,
    startTime: Date,
    endTime: Date,
}

const Event2: FC<any> = props => {
  const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(false);
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const [isDropdown, setDropdown] = useState(false);
  const dispatch = useDispatch();
  const eventDateTime = useRef<IEventDateTime>({
    selectedType:'eventDate',
    eventDate: new Date(),
    startTime: new Date(),
    endTime:new Date()
  });
  const [userData] = useDatabase("userData")

  console.log('userData123', props?.route?.params);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const {
    control,
    getValues,
    setValue,
    clearErrors,
    handleSubmit,
    formState: {errors},
  } = useForm<FormType>({
    mode: 'onChange',defaultValues:{'currency':'USD'}
  });

  const bodyData=props?.route?.parama

  const callCreateEventApi = useCallback(data => {
    const {latitude, longitude, address} =
      bodyData?.location ?? {};
    let payload = {
      image:bodyData?.eventImage,
      name: bodyData?.eventName,
      group_id: bodyData?.myGroup?.id,
      is_online_event:bodyData?.isOnlineEvent ? '1' :'0',
      short_description: bodyData?.aboutEvent,
      address: data?.location,
      city: address?.city,
      state: address?.state,
      country: address?.country,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      capacity_type: isUnlimitedCapacity ? 'unlimited':"limited",
      capacity: data?.capacity,
      is_free_event: isFreeEvent ? '1':"0",
      event_fees: data?.ticketPrice,
      event_date: data?.eventDate,
      event_start_time: data?.startTime,
      event_end_time:data?.endTime,
      details: data?.additionalInfo,
      event_currency: data?.currency,
      payment_method: "paypal",
      payment_email: "mukesh@yopmail.com",
      event_refund_policy: "sf t g ty hyj yj yj "
    };
    dispatch(
      createEvent({
        data: payload,
        onSuccess: () => {
          Database.setSelectedLocation(
            Database.getStoredValue('selectedLocation'),
          );
        },
      }),
    );
  }, []);

  const calculateButtonDisability = useCallback(() => {
    if (!getValues('eventDate') ||
        // ((!getValues('ticketPrice')&& !isFreeEvent)) ||
        // (!getValues('capacity')&&!isUnlimitedCapacity) ||
        !getValues('currency') ||
        !getValues('startTime') ||
      (errors && (errors.eventDate || errors.ticketPrice || errors.currency  || errors.startTime || errors.capacity))
    ) {
      return true;
  }
    return false;
  }, [errors, isUnlimitedCapacity, isFreeEvent]);

  const openDatePicker = useCallback((type:"eventDate"|"startTime"|"endTime") => {
    eventDateTime.current.selectedType=type
    setDatePickerVisibility(true);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MyHeader title={Language.host_an_event} />
      <ScrollView nestedScrollEnabled keyboardShouldPersistTaps={'handled'}>
      <Stepper step={2} totalSteps={4} paddingHorizontal={scaler(20)} />
        <View style={styles.eventView}>
          <TouchableOpacity onPress={()=>setIsUnlimitedCapacity(!isUnlimitedCapacity)} style={{flexDirection:'row'}}>
            <CheckBox
              checked={isUnlimitedCapacity}
              setChecked={(b) => {
                if (b) {
                clearErrors('capacity')
                  setValue('capacity',"")
                }
                setIsUnlimitedCapacity(b)
              }}
            />
            <Text style={{marginLeft: scaler(8), marginRight: scaler(18),fontSize:scaler(14)}}>
              {Language.umlimited_capacity}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=> setIsFreeEvent(!isFreeEvent)} style={{flexDirection:'row'}}>
            <CheckBox checked={isFreeEvent}
              setChecked={(b) => {
                if (b) {
                  clearErrors('ticketPrice')
                    setValue('ticketPrice',"")
                  }
                setIsFreeEvent(b)
              }}
             />
              <Text style={{ marginLeft: scaler(8), fontSize: scaler(14) }}>{Language.free_event}</Text>
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
            placeholder={Language.capacity}
            borderColor={colors.colorTextInputBackground}
            backgroundColor={colors.colorTextInputBackground}
            name={'capacity'}
            keyboardType={'number-pad'}
            disabled={isUnlimitedCapacity?true:false}
            required={
              isUnlimitedCapacity ? undefined : Language.capacity_required
            }
            control={control}
            errors={errors}
          />

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', zIndex:10}}>
            <View>
            <TextInput
            containerStyle={{marginEnd: scaler(4)}}
            borderColor={colors.colorTextInputBackground}
            backgroundColor={colors.colorTextInputBackground}
            name={'currency'}
            disabled={isFreeEvent ? true : false}
            icon={Images.ic_arrow_dropdown}
            onChangeText={(text) => {
                  
            }}
            required={isFreeEvent ? undefined : Language.event_name_required}
                  control={control}
                  iconContainerStyle={{end:scaler(4)}}
            onPress={()=>{setDropdown(_=>!_)}}
            errors={errors}
          />
          <FixedDropdown
              visible={isDropdown}
              data={DropDownData.map((_, i) => ({id: i, data: _, title: _?.title}))}
              onSelect={data => {
                setDropdown(false);
                setValue('currency', data?.title, {shouldValidate: true});
              }}
              />
              </View>
            <TextInput
              containerStyle={{flex: 1, marginEnd: scaler(4)}}
              placeholder={
                Language.event_ticket_price + ' (' + Language.per_person + ')'
              }
              style={{paddingLeft:scaler(20)}}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'ticketPrice'}
              keyboardType={'number-pad'}
              disabled={isFreeEvent?true:false}
              iconSize={scaler(18)}
              icon={Images.ic_ticket}
              required={
                isFreeEvent ? undefined : Language.ticket_price_required
              }
              control={control}
              errors={errors}
            />
          </View>
            <TextInput
              containerStyle={{flex: 1, marginEnd: scaler(4)}}
              placeholder={Language.select_date}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              style={{fontSize: scaler(13)}}
              name={'eventDate'}
              onPress={()=>(openDatePicker("eventDate"))}
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
              iconSize={scaler(18)}
              required={Language.start_time_required}
              onPress={()=>(openDatePicker("startTime"))}
              icon={Images.ic_clock}
              control={control}
              errors={errors}
            />
            <TextInput
              containerStyle={{flex: 1, marginEnd: scaler(4)}}
              placeholder={Language.select_end_time+' ('+Language.optional+")"}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'endTime'}
              onPress={()=>(openDatePicker("endTime"))}
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
          <Button
            disabled={calculateButtonDisability()}
            containerStyle={{marginTop: scaler(20)}}
            title={Language.next}
            onPress={handleSubmit(() => {
              userData?.is_premium ? NavigationService.navigate('Event3') :
              // isFreeEvent ?
              _showPopUpAlert({
                message: Language.join_now_to_access_payment_processing,
                buttonText: Language.join_now,
                cancelButtonText: Language.no_thanks_create_my_event,
                onPressButton: handleSubmit( (defaultValues) => {
                  callCreateEventApi(defaultValues)
                }),
                onPressCancel: () => {
                  
                }
              }) 
            //   :
            //  undefined
            })}
          />
        </View>
        <DateTimePickerModal
          themeVariant={'light'}
          style={{ zIndex: 20 }}
          isVisible={isDatePickerVisible}
          mode={(eventDateTime.current?.selectedType=='eventDate') ? 'date' : "time"}
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
          date={eventDateTime.current?.[eventDateTime.current?.selectedType]}

        //  eventDateTime.current?.[startTime]
          //   maximumDate={sub(new Date(), {
          //     years: 15,
          //   })}
          onConfirm={(date: Date) => {
            const {selectedType} =eventDateTime.current
            eventDateTime.current = { ...eventDateTime?.current, [selectedType]: date };
            let hour = ((date?.getHours())%12||12) > 9 ?((date?.getHours())%12||12) : '0'+((date?.getHours())%12||12);
            let min = date?.getMinutes() > 9 ? date?.getMinutes() : '0' + date?.getMinutes();
            let isAMPM = date?.getHours() > 12 ? 'PM' : 'AM'
            if (selectedType == 'eventDate') {
              setValue('eventDate', dateFormat(date, 'MMM DD, YYYY'), {
                shouldValidate: true,
              });
            } else {
              setValue(selectedType,hour+':'+min+' '+isAMPM,{shouldValidate:true})
            }
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
    alignItems: 'center',
    flex:1
  },
});
