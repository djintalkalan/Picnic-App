import { config, _updatePaypalMerchantId } from 'api';
import { setLoadingAction } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { MyHeader } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import Database from 'database';
import React, { FC, useCallback, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { NavigationService } from 'utils';
import Language from '../../language/Language';

const PaypalDisconnect: FC<any> = ({ route }) => {
  const closed = useRef(false);
  const formSubmittedRef = useRef(false)
  const totalChecked = useRef(0)
  const dispatch = useDispatch();

  const onNavigationStateChange = useCallback(
    (e: WebViewNavigation) => {
      console.log("e", e);

      dispatch(setLoadingAction(e?.loading));
      if (Platform.OS == 'ios') {
        if (e?.url?.endsWith('businessprofile/partner/consents/' + config.PAYPAL_PARTNER_ACCOUNT_ID)) {
          formSubmittedRef.current = true
        }
        if (formSubmittedRef.current && e?.url?.endsWith('businessprofile/partner/consents') && e?.navigationType == 'formsubmit' && e?.title == 'Manage permissions') {
          if (!closed?.current) {
            closed.current = true;
            NavigationService.goBack();
            return
            _updatePaypalMerchantId({ paypal_merchant_id: null })
              .then(res => {
                if (res?.status === 200) {
                  // _showSuccessMessage(res?.message);
                  Database.setUserData({ ...Database.getStoredValue('userData'), paypal_merchant_id: undefined })
                  NavigationService.goBack();
                }
                dispatch(setLoadingAction(false));
              })
              .catch(() => {
                dispatch(setLoadingAction(false));
              });
          } else if (!closed?.current) {
            dispatch(setLoadingAction(e?.loading));
          }
        }
      } else {
        if (e?.url?.endsWith('businessprofile/partner/consents')) {
          totalChecked.current += 1
        } else {
          totalChecked.current = 0
        }
        console.log("totalChecked.current", totalChecked.current);

        if (totalChecked.current > 3) {
          NavigationService.goBack();
          return
          _updatePaypalMerchantId({ paypal_merchant_id: null })
            .then(res => {
              if (res?.status === 200) {
                // _showSuccessMessage(res?.message);
                Database.setUserData({ ...Database.getStoredValue('userData'), paypal_merchant_id: undefined })
                NavigationService.goBack();
              }
              dispatch(setLoadingAction(false));
            })
            .catch(() => {
              dispatch(setLoadingAction(false));
            });
        }
      }
    },
    [dispatch, route?.params?.userData?._id],
  );

  const actionUrl = config.PAYPAL_DISCONNECT_URL;

  return (
    <SafeAreaViewWithStatusBar style={styles.container}>
      <MyHeader title={Language.disconnect_from_paypal} />
      <WebView
        javaScriptEnabled={true}
        setDisplayZoomControls
        source={{
          uri: `${actionUrl}`,
        }}
        incognito={!__DEV__}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowUniversalAccessFromFileURLs={true}
        onNavigationStateChange={onNavigationStateChange}
      />
    </SafeAreaViewWithStatusBar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.colorWhite,
  },
});

export default PaypalDisconnect;
