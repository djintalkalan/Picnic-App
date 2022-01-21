import React, { FC, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';

const Payment: FC<any> = (props) => {
    console.log("props", props);

    const onNavigationStateChange = useCallback((e: WebViewNavigation) => {

    }, [])
    return (
        <SafeAreaView style={{ flex: 1 }} >
            <WebView
                onNavigationStateChange={onNavigationStateChange}
                source={{ uri: 'https://infinite.red' }}
                style={{ marginTop: 20 }}
            />
        </SafeAreaView>
    );
};

export default Payment;

const styles = StyleSheet.create({

})
