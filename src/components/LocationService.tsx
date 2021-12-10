import { isEqual } from 'lodash'
import React, { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Alert, InteractionManager, Platform } from 'react-native'
import Geolocation from 'react-native-geolocation-service'
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import Database, { ILocation } from 'src/database/Database'
import Language from 'src/language/Language'
import { getAddressFromLocation } from 'utils'

export const defaultLocation: ILocation = {
    latitude: 34.055101,
    longitude: -118.244797,
    address: { main_text: "Los Angeles, USA", secondary_text: "" }
}

interface LocationServiceValues {
    isLocationEnabled: boolean
    currentLocation?: ILocation
    askPermission: () => Promise<void>
}

const LocationContext = createContext<LocationServiceValues>({
    isLocationEnabled: false,
    currentLocation: undefined,
    askPermission: (async () => { })
})
navigator.geolocation = Geolocation


export const LocationServiceProvider: FC<any> = ({ children }) => {

    const askedForBlocked = useCallback(() => {
        Alert.alert(Language.permission_required, Language.app_needs_location_permission, [
            {
                text: Language.give_permission, onPress: async () => {
                    await openSettings().then(() => {
                    }).catch(e => console.log("Open Setting Error", e)).finally(() => {
                        startChecking()
                    })
                },

            },
            {
                text: Language.cancel,

            }

        ], { cancelable: true })
    }, [])

    let denyTime = useRef(0)
    const getPermissionResult = useCallback(async (result) => {
        switch (result) {
            case RESULTS.UNAVAILABLE:
                setLocationEnabled(true)
                console.log('This feature is not available (on this device / in this context)');
                break;
            case RESULTS.DENIED:
                console.log('The permission is DENIED: No actions is possible');
                setLocationEnabled(false)
                // _showErrorMessage("Location Permission denied")
                if (denyTime.current) {

                    askedForBlocked()
                }
                else {
                    denyTime.current = denyTime.current + 1

                    await askLocationPermission()

                }
            case RESULTS.LIMITED:
                console.log('The permission is limited: some actions are possible');
                setLocationEnabled(true)
                return true
            case RESULTS.GRANTED:
                console.log('The permission is GRANTED: all actions are possible');
                setLocationEnabled(true)
                return true

            case RESULTS.BLOCKED:
                askedForBlocked()
                break;
        }
    }, [])

    const checkLocationPermission = useCallback(async () => {
        const result = await check(Platform.OS == 'android' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        return await getPermissionResult(result)
    }, [])


    const askLocationPermission = useCallback(async () => {
        const result = await request(Platform.OS == 'android' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, {
            title: Language.permission_required,
            message: Language.app_needs_location_permission,
            buttonPositive: Language.give_permission,
            buttonNegative: Language.deny,
        })
        await getPermissionResult(result);

    }, [])

    useEffect(() => {
        const selectedLocation: ILocation = Database.getStoredValue<ILocation | null>("selectedLocation")
        const currentLocation: ILocation = Database.getStoredValue<ILocation | null>("currentLocation")
        if (currentLocation && currentLocation?.address?.main_text) {
            if ((!selectedLocation || !selectedLocation?.address?.main_text))
                Database.setSelectedLocation(currentLocation)
        } else {
            console.log("currentLocation", currentLocation)
            console.log("selectedLocation", selectedLocation)
            Database.setSelectedLocation(defaultLocation)
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
                    const { address, otherData } = await getAddressFromLocation(location)
                    if (address) {
                        Database.setCurrentLocation({ ...location, address, otherData })
                        const selectedLocation: ILocation = Database.getStoredValue<ILocation | null>("selectedLocation")
                        if (!selectedLocation || !selectedLocation?.address?.main_text || isEqual(selectedLocation, defaultLocation)) {
                            Database.setSelectedLocation({ ...location, address, otherData })
                        }
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