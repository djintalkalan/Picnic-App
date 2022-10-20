import { _partnerReferrals, _paypalTrackSeller } from 'api';
import { colors } from 'assets/Colors';
import { Button, MyHeader } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { useDatabase } from 'database/Database';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { NavigationService, scaler } from 'utils';

type FormType = {
  payment_api_username: string;
  payment_api_password: string;
  payment_api_signature: string;
  payment_email: string;
};

const PaypalDetails: FC = () => {
  const dispatch = useDispatch();
  const { handleSubmit, control, formState: { errors, isValid }, setValue, } = useForm<FormType>({});
  const [userData] = useDatabase('userData');
  const [actionUrl, setActionUrl] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  console.log('userData =>', userData);

  useEffect(() => {
    try {
      if (userData?.paypal_merchant_id) {
        _paypalTrackSeller({ seller_merchant: userData?.paypal_merchant_id, }).then(res => {
          if (res.status === 200) {
            // setAuthorized(res?.data?.tracking_id === userData?._id);
            setAuthorized(true);
          }
        });
      } else {
        _partnerReferrals().then(res => {
          console.log(
            'here is the result of the partner referrals ->',
            res?.data?.links,
          );
          const action_url = res?.data?.links.find(
            (link: any) => link.rel === 'action_url',
          );
          console.log('and the action url is ====>', action_url.href);
          setActionUrl(action_url.href);
        });
      }
    } catch {
      (e: any) => console.log(e);
    }
  }, [userData?._id, userData?.paypal_merchant_id]);


  const payPalConnect = useCallback(() => {
    NavigationService.navigate('PaypalConnect', { actionUrl, userData });
  }, [actionUrl, userData]);

  const payPalDisconnect = useCallback(() => { }, []);

  return (
    <SafeAreaViewWithStatusBar style={styles.container}>
      <MyHeader title={Language.paypal_details} backEnabled />
      <View style={{ marginHorizontal: scaler(15), flex: 1 }}>
        <View style={{ width: '100%', paddingTop: scaler(15), flex: 1 }}>
          <Button
            onPress={payPalConnect}
            title={
              authorized ? Language.paypal_authorized : Language.paypal_connect
            }
            disabled={!actionUrl || authorized}
          />
        </View>
      </View>
    </SafeAreaViewWithStatusBar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.colorWhite,
  },
});

export default PaypalDetails;