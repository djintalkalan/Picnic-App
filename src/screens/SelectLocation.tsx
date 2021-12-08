import { useFocusEffect } from '@react-navigation/core'
import { Images, MapStyle } from 'assets'
import { colors } from 'assets/Colors'
import { useStatusBar } from 'custom-components'
import { useLocationService } from 'custom-components/LocationService'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, Image, InteractionManager, StyleSheet, View } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { ILocation, useDatabase } from 'src/database/Database'
import { getAddressFromLocation, scaler } from 'utils'
const defaultLocation: ILocation = {
    latitude: 34.055101,
    longitude: -118.244797,
    address: "Los Angeles, USA"
}

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const DefaultDelta = {
    latitudeDelta: 0.05,
    longitudeDelta: 0.05 * ASPECT_RATIO,


}
const SelectLocation: FC<any> = (props) => {

    const { pushStatusBarStyle, popStatusBarStyle } = useStatusBar()

    const [focused, setFocused] = useState(false)

    const mapRef = useRef<MapView>()

    const { askPermission } = useLocationService()


    const [currentLocation] = useDatabase<ILocation>("currentLocation", defaultLocation)
    const [selectedLocation, setSelectedLocation] = useDatabase<ILocation>("selectedLocation", currentLocation ?? defaultLocation)



    useEffect(() => {
        askPermission && askPermission()
    }, [])


    useEffect(() => {
        setTimeout(() => {
            mapRef?.current?.animateToCoordinate(selectedLocation, 1000)
        }, 200)
    }, [selectedLocation])



    useFocusEffect(useCallback(() => {
        InteractionManager.runAfterInteractions(() => {
            pushStatusBarStyle({ translucent: true, backgroundColor: 'transparent' })
            setFocused(true)
        })
        return () => {
            InteractionManager.runAfterInteractions(() => {
                popStatusBarStyle()
                setFocused(false)
            })
        }

    }, []))

    const setPosition = useCallback(async (location: ILocation) => {
        let address = await getAddressFromLocation(location)
        setSelectedLocation({ ...location, address })
    }, [])

    const onMapPress = useCallback((e) => {
        const { coordinate } = e.nativeEvent
        setPosition(coordinate)
    }, [])
    return (
        <View style={styles.container} >
            {focused ?
                <MapView provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={styles.map}
                    minZoomLevel={2}
                    ref={mapRef}
                    initialRegion={{
                        latitude: selectedLocation?.latitude ?? defaultLocation?.latitude,
                        longitude: selectedLocation?.longitude ?? defaultLocation?.longitude,
                        ...DefaultDelta
                    }}
                    showsUserLocation
                    onPress={onMapPress}
                    customMapStyle={MapStyle}>
                    <Marker
                        // draggable
                        coordinate={{
                            latitude: selectedLocation?.latitude ?? defaultLocation?.latitude,
                            longitude: selectedLocation?.longitude ?? defaultLocation?.longitude,
                            ...DefaultDelta
                        }}
                    >
                        <Image style={{ height: scaler(35), width: scaler(35), resizeMode: 'contain' }} source={Images.ic_marker} />

                    </Marker>

                </MapView> : null
            }


        </View>
    )
}

export default SelectLocation

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.colorWhite },
    map: {
        flex: 1
    }
})
