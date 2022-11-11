import { _updatePaypalMerchantId } from 'api';
import { setLoadingAction } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { MyHeader } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import Database from 'database/Database';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { NavigationService } from 'utils';
import Language from '../../language/Language';

const PaypalDisconnect: FC<any> = ({ route }) => {
  const closed = useRef(false);
  const [isBackButtonDisabled, setBackButtonDisabled] = useState(false)
  const dispatch = useDispatch();
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      return isBackButtonDisabled
    })
    return sub?.remove
  }, [isBackButtonDisabled])

  const onNavigationStateChange = useCallback(
    (e: WebViewNavigation) => {
      dispatch(setLoadingAction(e?.loading));
      if (e?.url?.endsWith('businessprofile/partner/consents') && e?.navigationType == 'formsubmit' && e?.title == 'Manage permissions') {
        if (!closed?.current) {
          closed.current = true;
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
    },
    [dispatch, route?.params?.userData?._id],
  );

  const actionUrl = 'https://www.sandbox.paypal.com/businessprofile/partner/consents';

  return (
    <SafeAreaViewWithStatusBar style={styles.container}>
      <MyHeader title={Language.paypal_details} backEnabled={!isBackButtonDisabled} />
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
