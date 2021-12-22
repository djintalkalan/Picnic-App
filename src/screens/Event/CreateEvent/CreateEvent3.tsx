import { colors, Images } from 'assets';
import { Button, MyHeader, Stepper, Text, TextInput } from 'custom-components';
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
import Language from 'src/language/Language';
import { scaler } from 'utils';

type FormType = {
  id: string;
  policy: string;
};

const CreateEvent3: FC<any> = props => {
  const [isPayByCash, setIsPayByCash] = useState(false)
  const [isPayByPaypal, setIsPayByPaypal] = useState(false)
  const {
    control,
    getValues,
    formState: { errors },
  } = useForm<FormType>({
    mode: 'onChange',
  });

  const calculateButtonDisability = useCallback(() => {
    if (
      (isPayByPaypal &&
        (!getValues('id') ||
          !getValues('policy'))) ||
      (errors &&
        (errors.id ||
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
              name={'id'}
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
          // onPress={onSubmit}
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
  payView: { flexDirection: 'row', marginVertical: scaler(16), alignItems: 'center', marginHorizontal: scaler(5) }
});
