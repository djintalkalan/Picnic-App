import { useFocusEffect } from '@react-navigation/native';
import { _getMerchantInfo, _paypalTrackSeller } from 'api';
import { setLoadingAction } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { Button, MyHeader, Text, TextInput } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import Database from 'database/Database';
import React, { FC, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import CryptoJS from "react-native-crypto-js";
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { NavigationService, scaler, _hidePopUpAlert, _showPopUpAlert } from 'utils';

type FormType = {
  payment_api_username: string;
  payment_api_password: string;
  payment_api_signature: string;
  payment_email: string;
};

const { width } = Dimensions.get('screen')

const authorizedImageWidth = width / 2.5
const authorizedImageHeight = (authorizedImageWidth * 334) / 456

const connectImageWidth = width - scaler(30)
const connectImageHeight = (connectImageWidth * 509) / 1149

const PaypalDetails: FC<any> = (props) => {
  const dispatch = useDispatch();
  const { handleSubmit, control, formState: { errors, isValid }, setValue, } = useForm<FormType>({});
  const [actionUrl, setActionUrl] = useState(false);
  const [isCredentialsConfigured, setCredentialsConfigured] = useState<boolean | undefined>();
  const [authorized, setAuthorized] = useState<string>("");

  const payPalConnect = useCallback(() => {
    NavigationService.navigate('PaypalConnect', {
      actionUrl, userData: Database.getStoredValue('userData'), onSuccess: () => {
        if (props?.route?.params?.onSuccess) {
          props?.route?.params?.onSuccess()
          props?.navigation.goBack();
        }
      }
    });
  }, [actionUrl]);

  const getSellerData = useCallback(() => {
    (async () => {
      let authorized = ''
      let action_url: any = {}
      const userData = Database.getStoredValue('userData')
      try {
        dispatch(setLoadingAction(true))
        await _paypalTrackSeller().then(res => {
          if (res.status === 200) {
            if (res?.data?.links) {
              action_url = res?.data?.links.find((link: any) => link.rel === 'action_url');
              setActionUrl(action_url?.href);
              setAuthorized('');
            } else {
              authorized = res?.data?.merchant_id
              if (authorized && !userData?.paypal_merchant_id) {
                Database.setUserData({ ...userData, paypal_merchant_id: authorized })
              }
              setAuthorized(authorized);
            }
          }
        });
        await _getMerchantInfo().then(res => {
          if (res?.status == 200) {
            const token = res?.data?.token
            const bytes = CryptoJS.AES.decrypt(token, userData?._id);
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            setValue('payment_api_password', decryptedData?.payment_api_password)
            setValue('payment_api_signature', decryptedData?.payment_api_signature)
            setValue('payment_api_username', decryptedData?.payment_api_username)
            setValue('payment_email', decryptedData?.payment_email)
            if (Object.values(decryptedData).reduce((p: any, c: any) => ((c || "")?.trim() ? ((p || 0) + 1) : p), 0) == 4) {
              setValue('payment_email', decryptedData?.payment_email, { shouldValidate: true })
            }
            if (!userData?.paypal_merchant_logs?.length && (decryptedData?.payment_api_username || decryptedData?.payment_api_signature || decryptedData?.payment_api_password)) {
              setCredentialsConfigured(true)
              if (!authorized) {
                _showPopUpAlert({
                  message: Language.need_to_connect_paypal,
                  buttonText: Language.yes_connect,
                  onPressCancel: NavigationService.goBack,
                  onPressButton: () => {
                    NavigationService.replace('PaypalConnect', { actionUrl: action_url?.href, userData });
                    _hidePopUpAlert()
                  }
                })
              }
            } else {
              setCredentialsConfigured(false)
            }
          }
        }
        ).catch(e => console.log(e))
      } catch {
        (e: any) => console.log(e);
      }
      dispatch(setLoadingAction(false))
    })()
  }, [])

  useFocusEffect(getSellerData);


  const payPalDisconnect = useCallback(() => {
    NavigationService.navigate('PaypalDisconnect')
  }, []);

  if (isCredentialsConfigured && !authorized)
    return (
      <SafeAreaViewWithStatusBar style={styles.container}>
        <MyHeader title={Language.paypal_details} backEnabled />
        <View style={{ marginHorizontal: scaler(15), flex: 1 }}>
          <View style={{ width: '100%', paddingTop: scaler(15), flex: 1 }}>
            <TextInput
              containerStyle={{ marginEnd: scaler(4) }}
              placeholder={Language.paypal_id}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'payment_email'}
              autoCapitalize={'none'}
              autoCorrect={false}
              disabled
              // required={Language.paypal_id_required}
              // rules={EmailValidations}
              control={control}
              errors={errors} />
            <TextInput
              containerStyle={{ marginEnd: scaler(4) }}
              placeholder={Language.api_username}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'payment_api_username'}
              // required={Language.api_username_required}
              control={control}
              disabled
              errors={errors} />
            <TextInput
              containerStyle={{ marginEnd: scaler(4) }}
              placeholder={Language.api_password}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'payment_api_password'}
              disabled
              // onPressIcon={() => setSecure(!isSecure)}
              autoCapitalize={'none'}
              // required={Language.api_password_required}
              control={control}
              errors={errors} />
            <TextInput
              containerStyle={{ marginEnd: scaler(4) }}
              placeholder={Language.api_signature}
              borderColor={colors.colorTextInputBackground}
              backgroundColor={colors.colorTextInputBackground}
              name={'payment_api_signature'}
              disabled
              // required={Language.api_signature_required}
              control={control}
              errors={errors} />
          </View>
        </View>
      </SafeAreaViewWithStatusBar>
    )
  if (isCredentialsConfigured != undefined)
    return (
      <SafeAreaViewWithStatusBar style={styles.container}>
        <MyHeader title={Language.paypal_details} backEnabled />
        <View style={{ marginHorizontal: scaler(15), flex: 1 }}>
          <View style={{ width: '100%', paddingTop: scaler(15), flex: 1 }}>
            {authorized ?
              <>
                <View style={{ marginTop: authorizedImageHeight / 1.8 }} >
                  <View style={styles.connectedBorder} >
                    <Text style={styles.text}>{Language.paypal_connected_successfully}</Text>
                    <Text style={[styles.merchantText, { color: colors.colorBlackText }]}>{Language.merchant_id + " : "}<Text style={styles.merchantText}>{authorized}</Text></Text>
                  </View>
                  <Image style={styles.connectedImage} source={Images.ic_paypal_connected} />
                </View>
                <Button containerStyle={{ marginTop: scaler(30) }} title='Disconnect' onPress={payPalDisconnect} />
              </>
              :
              <View style={{ flex: 1 }} >
                <Image style={styles.connectImage} source={Images.ic_paypal_connect} />
                <Text style={[styles.text, { alignSelf: 'center', paddingVertical: scaler(20), maxWidth: width / 1.2 }]}>{Language.connect_paypal_and_automate}</Text>

                <Button onPress={payPalConnect} containerStyle={{ flex: 1, justifyContent: 'flex-end' }} title={Language.connect} />

              </View>
            }
          </View>
        </View>
      </SafeAreaViewWithStatusBar>
    );
  return <SafeAreaViewWithStatusBar style={styles.container}>
    <MyHeader title={Language.paypal_details} backEnabled />
  </SafeAreaViewWithStatusBar>
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.colorWhite,
  },
  connectedBorder: {
    width: '100%', alignItems: 'center', justifyContent: 'center',
    borderColor: colors.colorPrimary, borderWidth: 1,
    borderRadius: scaler(10),
  },
  text: {
    fontSize: scaler(15.5),
    paddingVertical: authorizedImageHeight / 1.8,
    maxWidth: width / 1.5,
    textAlign: 'center'
  },
  merchantText: {
    position: 'absolute',
    fontSize: scaler(15.5),
    textAlign: 'center',
    alignSelf: 'center',
    color: colors.colorPrimary,
    bottom: (authorizedImageHeight / 3.8)
  },
  connectedImage: {
    width: authorizedImageWidth,
    height: authorizedImageHeight,
    resizeMode: 'contain',
    top: -authorizedImageHeight / 2,
    alignSelf: 'center',
    position: 'absolute',
  },
  connectImage: {
    width: connectImageWidth,
    height: connectImageHeight,
    resizeMode: 'contain',
  }
});

export default PaypalDetails;