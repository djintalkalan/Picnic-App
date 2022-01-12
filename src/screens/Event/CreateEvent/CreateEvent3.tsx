import { createEvent, uploadFile } from 'app-store/actions';
import { colors, Images } from 'assets';
import { Button, MyHeader, Stepper, Text, TextInput } from 'custom-components';
import Database from 'database/Database';
import React, { FC, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Image,
  StyleSheet,
  View
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { dateFormat, scaler } from 'utils';

type FormType = {
  paypalId: string;
  policy: string;
};

const CreateEvent3: FC<any> = props => {
  const [isPayByCash, setIsPayByCash] = useState(false)
  const [isPayByPaypal, setIsPayByPaypal] = useState(false)
  const dispatch = useDispatch()
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormType>({
    mode: 'onChange',
  });
  const eventDetail = props?.route?.params;

  console.log('data is', props?.route?.params)

  const onSubmit = useCallback(
    (data) => {
      if (!eventDetail?.image && eventDetail?.screen1Data?.eventImage?.path) {
        dispatch(
          uploadFile({
            image: eventDetail?.screen1Data?.eventImage,
            onSuccess: url => {
              console.log('URL is ', url);
              eventDetail.image = url;
              callCreateEventApi(data, isPayByPaypal, isPayByCash);
            },
            prefixType: 'events',
          }),
        );
      } else {
        callCreateEventApi(data, isPayByPaypal, isPayByCash);
      }
    },
    [props, isPayByPaypal, isPayByCash],
  );


  const callCreateEventApi = useCallback((data, isPayByPaypal, isPayByCash) => {
    const { latitude, longitude, address, otherData } =
      eventDetail?.screen1Data?.location ?? {};

    const { startTime, endTime, eventDate } = eventDetail?.eventDateTime
    let payload = {
      image: eventDetail?.image,
      name: eventDetail?.screen1Data?.eventName,
      group_id: eventDetail?.screen1Data?.myGroup?.id,
      is_online_event: eventDetail?.screen1Data?.isOnlineEvent ? '1' : '0',
      short_description: eventDetail?.screen1Data?.aboutEvent,
      address: address?.main_text + ', ' + address?.secondary_text,
      city: otherData?.city,
      state: otherData?.state,
      country: otherData?.country,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      capacity_type: eventDetail?.capacity ? 'unlimited' : 'limited',
      capacity: eventDetail?.screen2Data?.capacity,
      is_free_event: '0',
      event_fees: eventDetail?.screen2Data?.ticketPrice,
      event_date: dateFormat(eventDate, "YYYY-MM-DD"),
      event_start_time: dateFormat(startTime, "HH:mm:ss"),
      event_end_time: data?.endTime ? dateFormat(endTime, "HH:mm") : "",
      details: eventDetail?.screen2Data?.additionalInfo,
      event_currency: eventDetail?.screen2Data?.currency.toLowerCase(),
      payment_method: isPayByCash && isPayByPaypal ? ['cash', 'paypal'] : isPayByPaypal ? ['paypal'] : ['cash'],
      payment_email: data?.paypalId,
      event_refund_policy: data?.policy
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
    if (
      (isPayByPaypal &&
        (!getValues('paypalId') ||
          !getValues('policy'))) ||
      (errors &&
        (errors.paypalId ||
          errors.policy))
    ) {
      return true;
    }

    return false;
  }, [errors]);

  return (
    <SafeAreaView style={styles.container}>
      <MyHeader title={Language.host_an_event} />
      <ScrollView nestedScrollEnabled keyboardShouldPersistTaps={'handled'}>
        <Stepper step={3} totalSteps={4} paddingHorizontal={scaler(20)} />

        <View style={styles.eventView}>
          <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500' }}>
            {Language.select_payment_options}
          </Text>
          <TouchableOpacity style={styles.payView} onPress={() => setIsPayByCash(!isPayByCash)}>
            <Image source={Images.ic_empty_wallet} style={{ height: scaler(16), width: scaler(19) }} />
            <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{Language.pay_by_cash}</Text>
            <MaterialIcons name={isPayByCash ? 'check-circle' : 'radio-button-unchecked'} size={scaler(20)} color={colors.colorPrimary} />
          </TouchableOpacity>
          <View style={{ height: scaler(1), width: '95%', backgroundColor: '#EBEBEB', alignSelf: 'center' }} />
          <TouchableOpacity style={styles.payView} onPress={() => setIsPayByPaypal(!isPayByPaypal)}>
            <Image source={Images.ic_paypal} style={{ height: scaler(16), width: scaler(19) }} />
            <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{Language.pay_by_paypal}</Text>
            <MaterialIcons name={isPayByPaypal ? 'check-circle' : 'radio-button-unchecked'} size={scaler(20)} color={colors.colorPrimary} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: '100%',
            paddingHorizontal: scaler(20),
            paddingVertical: scaler(15),
          }}>
          {isPayByPaypal ?
            <TextInput
              containerStyle={{ flex: 1, marginEnd: scaler(4) }}
              placeholder={Language.paypal_id}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'paypalId'}
              required={
                Language.paypal_id_required
              }
              control={control}
              errors={errors}
            /> : undefined
          }
          <View style={{ flex: 1, width: '100%' }}>
            <TextInput
              placeholder={Language.write_refund_policy}
              name={'policy'}
              multiline
              style={{ minHeight: scaler(200), textAlignVertical: 'top' }}
              limit={1000}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              control={control}
              errors={errors}
            />
          </View>

          <Button
            disabled={calculateButtonDisability()}
            containerStyle={{ marginTop: scaler(20) }}
            title={Language.next}
            onPress={handleSubmit((data) => onSubmit(data))}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
    marginTop: scaler(25),
    marginHorizontal: scaler(15),
  },
  payView: {
    flexDirection: 'row',
    marginVertical: scaler(16),
    alignItems: 'center',
    marginHorizontal: scaler(5)
  }
});
