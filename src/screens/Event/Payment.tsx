import { capturePayment, setLoadingAction } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { MyHeader } from 'custom-components';
import React, { FC, useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { NavigationService } from 'utils';

const Payment: FC<any> = (props) => {
    console.log("props", props);

    const closed = useRef(false)

    const [url, setUrl] = useState(props?.route?.params?.data?.res?.url)
    const dispatch = useDispatch()
    const onNavigationStateChange = useCallback((e: WebViewNavigation) => {
        console.log("URL is ", e?.url);
        dispatch(setLoadingAction(e?.loading))
        if (!closed?.current && e?.url?.includes("compute.amazonaws.com/")) {
            closed.current = true
            NavigationService.goBack()
            dispatch(capturePayment(props?.route?.params?.data))
        }

    }, [])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.colorWhite }} >
            <MyHeader title='Payment' />
            <WebView
                javaScriptEnabled
                setDisplayZoomControls
                onNavigationStateChange={onNavigationStateChange}
                source={{ uri: url }}
                style={{}}
                // injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=0.5, maximum-scale=0.5, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
                injectedJavaScript={`
                const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
                if (!iOS) {
                  const meta = document.createElement('meta');
                  let initialScale = 1;
                  if(screen.width <= 800) {
                   initialScale = ((screen.width / window.innerWidth) + 0.1).toFixed(2);
                  }
                  const content = 'width=device-width, initial-scale=' + initialScale ;
                  meta.setAttribute('name', 'viewport');
                  meta.setAttribute('content', content);
                  document.getElementsByTagName('head')[0].appendChild(meta);
                }
              `}
                scalesPageToFit={Platform.OS === 'ios'} />
        </SafeAreaView>
    );
};

export default Payment;

const styles = StyleSheet.create({

})
