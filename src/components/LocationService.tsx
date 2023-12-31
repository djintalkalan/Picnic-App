import { isEqual } from 'lodash'
import React, { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Alert, InteractionManager, Platform } from 'react-native'
import Geolocation from 'react-native-geolocation-service'
import { check, openSettings, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions'
import Database, { ILocation, useDatabase, useOtherValues } from 'src/database/Database'
import Language from 'src/language/Language'
import { getAddressFromLocation } from 'utils'

export const defaultLocation: ILocation = __DEV__ ? {
    // latitude: 34.055101,//30.6984528
    // longitude: -118.244797, // 76.62734
    // address: { main_text: "Los Angeles, USA", secondary_text: "" }
    // otherData: {
    //     city: "Los Angeles",
    //     state: "",
    //     country: "USA"
    // }

    latitude: 30.7260915,
    longitude: 76.683011,
    address: { main_text: "Block-520, Tdi Taj Plaza, Sector 118", secondary_text: "Sahibzada Ajit Singh Nagar, Sahibzada Ajit Singh Nagar, Punjab, India" },
    otherData: {
        city: "Sahibzada Ajit Singh Nagar",
        state: "Punjab",
        country: "India"
    }
} :
    {
        latitude: 18.220833,
        longitude: -66.590149,
        address: {
            main_text: "Puerto Rico",
            secondary_text: "",
        },
        otherData: {
            city: "Puerto Rico",
            state: "",
            country: ""
        }
    }

interface LocationServiceValues {
    isLocationEnabled: boolean
    currentLocation?: ILocation
    askPermission: () => Promise<any>
}

const LocationContext = createContext<LocationServiceValues>({
    isLocationEnabled: false,
    currentLocation: undefined,
    askPermission: (async () => { })
})
//@ts-ignore
navigator.geolocation = Geolocation

export const LocationServiceProvider: FC<any> = ({ children }) => {
    const [isLogin] = useDatabase<boolean>("isLogin")
    const [showGif, setGif] = useOtherValues<boolean>("showGif", true);

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
            // { text: Language.cancel, }
        ], { cancelable: true })
    }, [])

    let denyTime = useRef(0)
    const getPermissionResult = useCallback(async (result: PermissionStatus) => {
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
            case RESULTS.GRANTED:
                // console.log('The permission is limited: some actions are possible');
                setLocationEnabled(true)
                return updateLocation()
            // console.log('The permission is GRANTED: all actions are possible');
            // setLocationEnabled(true)
            // updateLocation()
            // return true

            case RESULTS.BLOCKED:
                askedForBlocked()
                break;
        }
    }, [isLogin])

    const checkLocationPermission = useCallback(async () => {
        const result = await check(Platform.OS == 'android' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        return await getPermissionResult(result)
    }, [isLogin])

    const askLocationPermission = useCallback(async () => {
        if (isLogin) {
            Alert.alert(Language.permission_required, Language.app_needs_location_permission, [
                {
                    text: Language.give_permission, onPress: async () => {
                        const result = await request(Platform.OS == 'android' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, {
                            title: Language.permission_required,
                            message: Language.app_needs_location_permission,
                            buttonPositive: Language.give_permission,
                            buttonNegative: Language.deny,
                        })
                        await getPermissionResult(result);
                    },
                },
                // {
                //     text: Language.cancel,
                // }
            ], { cancelable: true })
        }
    }, [isLogin])

    useEffect(() => {
        if (isLogin && !showGif) {
            const selectedLocation = Database.getStoredValue<ILocation | null>("selectedLocation")
            const currentLocation = Database.getStoredValue<ILocation | null>("currentLocation")
            if (currentLocation && currentLocation?.address?.main_text) {
                if ((!selectedLocation || !selectedLocation?.address?.main_text))
                    Database.setSelectedLocation(currentLocation)
            } else {
                // console.log("currentLocation", currentLocation)
                // console.log("selectedLocation", selectedLocation)
                Database.setSelectedLocation(defaultLocation)
            }
            InteractionManager.runAfterInteractions(async () => {
                askForChecking()
            })
        }
    }, [isLogin, showGif])

    const askForChecking = useCallback(() => {
        // const isLogin = Database.getStoredValue<boolean>("isLogin")

        if (isLogin) {
            startChecking()
        }
        // startChecking()

    }, [isLogin])

    const startChecking = useCallback(async () => {
        return await checkLocationPermission()
    }, [isLogin])

    const updateLocation = useCallback(async () => {
        await new Promise((resolve, reject) => {
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
                        const selectedLocation = Database.getStoredValue<ILocation | null>("selectedLocation")
                        if (!selectedLocation || !selectedLocation?.address?.main_text || isEqual(selectedLocation, defaultLocation)) {
                            Database.setSelectedLocation({ ...location, address, otherData })
                        }
                        resolve(true)
                    }
                },
                (error) => {
                    // See error code charts below.
                    console.log(error.code, error.message);
                    reject(error)

                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );

        })
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