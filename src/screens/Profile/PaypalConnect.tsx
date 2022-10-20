import { _updatePaypalMerchantId } from 'api';
import { setLoadingAction } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { MyHeader } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import Database from 'database/Database';
import React, { FC, useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { NavigationService, _showSuccessMessage } from 'utils';
import Language from '../../language/Language';

const PaypalConnect: FC<any> = ({ route }) => {
  const closed = useRef(false);

  const dispatch = useDispatch();

  const onNavigationStateChange = useCallback(
    (e: WebViewNavigation) => {
      dispatch(setLoadingAction(e?.loading));
      if (e?.url?.includes('merchantIdInPayPal')) {
        const myUrl = new URL(e.url);
        const paypal_merchant_id = myUrl.searchParams.get('merchantIdInPayPal');
        if (!closed?.current && paypal_merchant_id) {
          closed.current = true;
          _updatePaypalMerchantId({ paypal_merchant_id })
            .then(res => {
              if (res?.status === 200) {
                _showSuccessMessage(res?.message);
                Database.setUserData({ ...Database.getStoredValue('userData'), paypal_merchant_id })
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

  const actionUrl = route?.params?.actionUrl;

  return (
    <SafeAreaViewWithStatusBar style={styles.container}>
      <MyHeader title={Language.paypal_details} backEnabled />
      <WebView
        javaScriptEnabled={true}
        setDisplayZoomControls
        source={{
          uri: `${actionUrl}`,
        }}
        incognito={true}
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

export default PaypalConnect;
