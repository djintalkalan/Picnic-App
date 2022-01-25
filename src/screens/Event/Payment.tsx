import { capturePayment, setLoadingAction } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { MyHeader } from 'custom-components';
import React, { FC, useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { NavigationService, _showErrorMessage } from 'utils';

const Payment: FC<any> = (props) => {
    console.log("props", props);

    const closed = useRef(false)
    const [paymentClosed, setPaymentClosed] = useState(false)

    const [url, setUrl] = useState(props?.route?.params?.data?.res?.url)
    const dispatch = useDispatch()
    const onNavigationStateChange = useCallback((e: WebViewNavigation) => {
        // console.log("URL is ", e?.url);
        console.log("EVENT is ", e);
        dispatch(setLoadingAction(e?.loading))
        if (!closed?.current && e?.url?.includes("compute.amazonaws.com/")) {
            dispatch(setLoadingAction(false))
            closed.current = true
            setPaymentClosed(true)
            if (e?.url?.includes("payment-success")) {
                dispatch(capturePayment(props?.route?.params?.data))
            } else {
                NavigationService.goBack()
                _showErrorMessage("Payment Unsuccessful. Please try again")
            }
        }
        else if (!closed?.current) {
            dispatch(setLoadingAction(e?.loading))
        }

    }, [])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.colorWhite }} >
            <MyHeader title='Payment' />
            {!paymentClosed ? <WebView
                javaScriptEnabled
                setDisplayZoomControls
                onNavigationStateChange={onNavigationStateChange}
                source={{ uri: url }}
                scalesPageToFit={Platform.OS === 'ios'} /> : null}
        </SafeAreaView>
    );
};

export default Payment;

const styles = StyleSheet.create({

})
