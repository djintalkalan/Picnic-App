import React, { createContext, FC, useCallback, useContext, useEffect, useState } from 'react'
import { Alert, InteractionManager, Platform } from 'react-native'
import Geolocation from 'react-native-geolocation-service'
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import Database, { ILocation } from 'src/database/Database'
import { getAddressFromLocation } from 'utils'

interface LocationServiceValues {
    isLocationEnabled: boolean
    currentLocation?: ILocation
    askPermission?: () => void
}

const LocationContext = createContext<LocationServiceValues>({
    isLocationEnabled: false,
    currentLocation: undefined,
    askPermission: () => null
})

export const LocationServiceProvider: FC<any> = ({ children }) => {


    const getPermissionResult = useCallback(async (result) => {
        switch (result) {
            case RESULTS.UNAVAILABLE:
                setLocationEnabled(true)
                console.log('This feature is not available (on this device / in this context)');
                break;
            case RESULTS.DENIED:
                console.log('The permission is DENIED: No actions is possible');
                setLocationEnabled(false)
                await askLocationPermission()
            case RESULTS.LIMITED:
                console.log('The permission is limited: some actions are possible');
                setLocationEnabled(true)
                return true
            case RESULTS.GRANTED:
                console.log('The permission is GRANTED: all actions are possible');
                setLocationEnabled(true)
                return true

            case RESULTS.BLOCKED:
                Alert.alert("Need Permission", "This app need location permission to continue", [
                    {
                        text: "Give Permission", onPress: async () => {
                            await openSettings().then(() => {
                            }).catch(e => console.log("Open Setting Error", e)).finally(() => {
                                startChecking()
                            })
                        },

                    },

                ], { cancelable: true })
                break;
        }
    }, [])

    const checkLocationPermission = useCallback(async () => {
        const result = await check(Platform.OS == 'android' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        return await getPermissionResult(result)
    }, [])


    const askLocationPermission = useCallback(async () => {
        const result = await request(Platform.OS == 'android' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, {
            title: "Required Permission",
            message: "App needs location permission to verify your current location",
            buttonPositive: "Give Permission",
            buttonNegative: "Deny",
        })
        await getPermissionResult(result);

    }, [])

    useEffect(() => {
        const selectedLocation: ILocation = Database.getStoredValue<ILocation | null>("selectedLocation")
        const currentLocation: ILocation = Database.getStoredValue<ILocation | null>("currentLocation")
        if (currentLocation && currentLocation?.address?.main_text && (!selectedLocation || !selectedLocation?.address?.main_text)) {
            Database.setSelectedLocation(currentLocation)
        }
        InteractionManager.runAfterInteractions(async () => {
            startChecking()
        })
    }, [])

    const startChecking = useCallback(async () => {
        const hasPermissionAvailable = await checkLocationPermission()
        if (hasPermissionAvailable) {
            Geolocation.getCurrentPosition(
                async (position) => {
                    console.log(position);
                    const location = {
                        latitude: position?.coords?.latitude,
                        longitude: position?.coords?.longitude,
                    }
                    let address = await getAddressFromLocation(location)
                    Database.setCurrentLocation({ ...location, address })
                    const selectedLocation: ILocation = Database.getStoredValue<ILocation | null>("selectedLocation")
                    if (!selectedLocation || !selectedLocation?.address?.main_text) {
                        Database.setSelectedLocation({ ...location, address })
                    }
                },
                (error) => {
                    // See error code charts below.
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        }
    }, [])


    const [isLocationEnabled, setLocationEnabled] = useState(false)

    return (
        <LocationContext.Provider value={{
            isLocationEnabled: isLocationEnabled,
            askPermission: startChecking
        }}  >
            {children}
        </LocationContext.Provider>)
}

export const useLocationService = (): LocationServiceValues => useContext(LocationContext)

export const withLocationService = (Component: any) => {
    return (props: any) => {
        const data: LocationServiceValues = useLocationService()
        return <Component {...data} {...props} />;
    };
};