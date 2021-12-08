import { useFocusEffect } from '@react-navigation/core'
import { MapStyle } from 'assets'
import { colors } from 'assets/Colors'
import { useStatusBar } from 'custom-components'
import React, { FC, useCallback, useState } from 'react'
import { InteractionManager, StyleSheet, View } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'

const SelectLocation: FC<any> = (props) => {

    const { pushStatusBarStyle, popStatusBarStyle } = useStatusBar()

    const [focused, setFocused] = useState(false)

    const [selectedLocation, setSelectedLocation] = useState({
        latitude: 34.055101,
        longitude: -118.244797,
    })

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
    return (
        <View style={styles.container} >
            {focused ?
                <MapView provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={styles.map}
                    customMapStyle={MapStyle}
                    region={{
                        latitude: selectedLocation.latitude,
                        longitude: selectedLocation.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}>
                </MapView> : null
            }


        </View>
    )
}

export default SelectLocation

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.colorWhite },
    map: {
        ...StyleSheet.absoluteFillObject,
    }
})
