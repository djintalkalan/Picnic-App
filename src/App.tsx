import { persistor, store } from 'app-store/store';
import { colors } from 'assets';
import { Loader } from 'custom-components';
import { LocationServiceProvider } from 'custom-components/LocationService';
import { VideoProvider } from 'custom-components/VideoProvider';
import React, { FC, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Database from './database/Database';
import MyNavigationContainer from './routes/MyNavigationContainer';

if (__DEV__) {
    FastImage.clearMemoryCache()
    FastImage.clearDiskCache()
}

const App: FC = () => {
    useEffect(() => {

        Database.setMultipleValues({
            // selectedLocation: null,
            // currentLocation: null,
            // recentSearches: null
        })
    }, [])
    return (
        <GestureHandlerRootView style={styles.container} >
            <LocationServiceProvider>
                <VideoProvider>
                    <Provider store={store}>
                        <PersistGate persistor={persistor}>
                            <MyNavigationContainer />
                            <Loader />
                        </PersistGate>
                    </Provider>
                </VideoProvider>
            </LocationServiceProvider>
        </GestureHandlerRootView>
    )
}


export default (App)

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.colorWhite }
})
