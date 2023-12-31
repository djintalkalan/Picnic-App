import { capturePayment, getEventDetail, joinEventSuccess, setLoadingAction } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { MyHeader } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, StyleSheet } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { EMIT_JOIN_ROOM, SocketService } from 'socket';
import Language from 'src/language/Language';
import { getQueryVariables, NavigationService, _showErrorMessage, _showSuccessMessage } from 'utils';

const Payment: FC<any> = (props) => {

    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            return props?.route?.params?.data?.payment_method == 'card'
        })
        return sub?.remove
    }, [])

    const closed = useRef(false)
    const [paymentClosed, setPaymentClosed] = useState(false)
    const webViewRef = useRef<WebView>(null);

    const [url, setUrl] = useState(props?.route?.params?.data?.res?.url)
    const dispatch = useDispatch()
    const onNavigationStateChange = useCallback((e: WebViewNavigation) => {
        // console.log("URL is ", e?.url);
        // console.log("EVENT is ", e);
        dispatch(setLoadingAction(e?.loading))
        if (!closed?.current && (e?.url?.includes("payment-success") || e?.url?.includes("payment-error"))) {
            webViewRef?.current?.stopLoading();
            dispatch(setLoadingAction(false))
            closed.current = true
            setPaymentClosed(true)
            if (e?.url?.includes("payment-success")) {
                if (props?.route?.params?.data?.payment_method == 'card') {
                    _showSuccessMessage(Language.event_reserved)
                    SocketService.emit(EMIT_JOIN_ROOM, {
                        resource_id: props?.route?.params?.data?.resource_id
                    })
                    dispatch(joinEventSuccess(props?.route?.params?.data?.resource_id))
                    dispatch(getEventDetail(props?.route?.params?.data?.resource_id))
                    NavigationService.navigate('EventDetail')
                    return
                }
                dispatch(capturePayment({ ...props?.route?.params?.data, ...getQueryVariables(e?.url) }))
            } else {
                NavigationService.goBack()
                _showErrorMessage(Language.payment_unsuccessful)
            }
        }
        else if (!closed?.current) {
            dispatch(setLoadingAction(e?.loading))
        }
    }, [])

    return (
        <SafeAreaViewWithStatusBar style={{ flex: 1, backgroundColor: colors.colorWhite }} >
            <MyHeader title={props?.route?.params?.data?.payment_method == 'card' ? Language?.credit_card_details : Language?.paypal} backEnabled={props?.route?.params?.data?.payment_method != 'card'} />
            {!paymentClosed ? <WebView
                javaScriptEnabled
                incognito={!__DEV__}
                ref={webViewRef}
                setDisplayZoomControls
                onNavigationStateChange={onNavigationStateChange}
                source={{ uri: url }}
                scalesPageToFit={Platform.OS === 'ios'} /> : null}
        </SafeAreaViewWithStatusBar>
    );
};

export default Payment;

const styles = StyleSheet.create({

})
