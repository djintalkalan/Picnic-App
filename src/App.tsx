import { persistor, store } from 'app-store/store';
import { colors } from 'assets';
import { Card, Loader, StatusBarProviderMemoized, Text } from 'custom-components';
import { KeyboardProvider } from 'custom-components/KeyboardService';
import { LocationServiceProvider } from 'custom-components/LocationService';
import { PopupAlert } from 'custom-components/PopupAlert';
import DropdownAlert from 'dj-react-native-dropdown-alert';
import React, { FC, useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { scaler } from 'utils';
import { DropDownHolder } from 'utils/DropdownHolder';
import { PopupAlertHolder } from 'utils/PopupAlertHolder';
import Database from './database/Database';
import MyNavigationContainer from './routes/MyNavigationContainer';
const successImageSrc = Ionicons.getImageSourceSync("ios-checkmark-circle-outline", 50, colors.colorWhite)
const App: FC = () => {
    useEffect(() => {
        Database.setMultipleValues({
            // selectedLocation: null,
            // currentLocation: null,
            // recentSearches: null
        })
    }, [])
    const getChildren = useCallback(() => {
        return <LocationServiceProvider>
            <Provider store={store}>
                <PersistGate persistor={persistor}>
                    <MyNavigationContainer />
                    <Loader />
                </PersistGate>
            </Provider>
            <DropdownAlertWithStatusBar />
            <PopupAlert ref={ref => PopupAlertHolder.setPopupAlert(ref)} />
        </LocationServiceProvider>
    }, [])
    return (
        <View style={styles.container} >
            <KeyboardProvider>
                <StatusBarProviderMemoized backgroundColor={colors.colorWhite} barStyle={'dark-content'} >
                    {getChildren()}
                </StatusBarProviderMemoized>
            </KeyboardProvider>
        </View>
    )
}


export default App


const DropdownAlertWithStatusBar = () => {
    return <DropdownAlert
        successImageSrc={successImageSrc}
        updateStatusBar={false}
        customAlert={(data) => {
            // console.log("data", data)
            let IconComponent = <Feather color={colors.colorWhite} size={scaler(22)} name={'check'} />
            let iconBackgroundColor = colors.colorPrimary

            switch (data?.type) {
                case "error":
                    IconComponent = <AntDesign color={colors.colorWhite} size={scaler(22)} name={'close'} />
                    iconBackgroundColor = "#cc3232"
                    break;

                case "info":
                    IconComponent = <Ionicons color={colors.colorWhite} size={scaler(22)} name={'information'} />
                    iconBackgroundColor = "#cd853f"
                    break;
            }
            return (
                <Card cornerRadius={scaler(40)} cardElevation={3} style={{ flexDirection: 'row', alignItems: 'center', padding: scaler(4), borderRadius: scaler(40), backgroundColor: 'white', width: '90%', marginHorizontal: '5%' }} >
                    <View style={{ alignItems: 'center', justifyContent: 'center', borderRadius: scaler(20), height: scaler(40), width: scaler(40), backgroundColor: iconBackgroundColor }}>
                        {IconComponent}
                    </View>
                    <Text style={{ flex: 1, fontWeight: '500', fontSize: scaler(14), paddingHorizontal: scaler(10), color: '#061D32' }} >{data?.message}</Text>
                </Card>
            )
        }}
        ref={ref => DropDownHolder.setDropDown(ref)} />
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.colorWhite }
})
