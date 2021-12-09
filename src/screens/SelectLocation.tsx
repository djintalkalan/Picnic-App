import { useFocusEffect } from '@react-navigation/core'
import { Images, MapStyle } from 'assets'
import { colors } from 'assets/Colors'
import { Button, Text, useStatusBar } from 'custom-components'
import { useLocationService } from 'custom-components/LocationService'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, Image, InteractionManager, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { ILocation, useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { getAddressFromLocation, NavigationService, scaler } from 'utils'
const defaultLocation: ILocation = {
    latitude: 34.055101,
    longitude: -118.244797,
    address: { main_text: "Los Angeles, USA", secondary_text: "" }
}

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const DefaultDelta = {
    latitudeDelta: 0.1,
    longitudeDelta: 0.1 * ASPECT_RATIO,
}
const SelectLocation: FC<any> = (props) => {

    const { pushStatusBarStyle, popStatusBarStyle } = useStatusBar()
    const [focused, setFocused] = useState(false)
    const mapRef = useRef<MapView>()
    const { askPermission } = useLocationService()
    const [currentLocation] = useDatabase<ILocation>("currentLocation", defaultLocation)
    const [selectedLocation, setSelectedLocation] = useDatabase<ILocation>("selectedLocation", currentLocation ?? defaultLocation)
    const [localLocation, setLocalLocation] = useState(selectedLocation)
    useEffect(() => {
        askPermission && askPermission()
    }, [])

    useEffect(() => {
        setTimeout(() => {
            mapRef?.current?.animateToCoordinate(localLocation, 0)
        }, 200)
    }, [localLocation])

    useFocusEffect(useCallback(() => {
        pushStatusBarStyle({ translucent: true, backgroundColor: 'transparent' })

        setTimeout(() => {
            setFocused(true)
        }, 200)
        return () => {
            popStatusBarStyle()
            InteractionManager.runAfterInteractions(() => {
                setFocused(false)
            })
        }
    }, []))

    const setPosition = useCallback(async (location: ILocation) => {
        let address = await getAddressFromLocation(location)
        setLocalLocation({ ...location, address })
    }, [])

    const onMapPress = useCallback((e) => {
        const { coordinate } = e.nativeEvent
        setPosition(coordinate)
    }, [])

    return (
        <View style={styles.container} >
            {focused ?
                <View style={styles.map} >
                    <MapView provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                        style={styles.map}
                        minZoomLevel={2}
                        ref={mapRef}
                        initialRegion={{
                            latitude: localLocation?.latitude ?? defaultLocation?.latitude,
                            longitude: localLocation?.longitude ?? defaultLocation?.longitude,
                            ...DefaultDelta
                        }}
                        showsUserLocation
                        onPress={onMapPress}
                        customMapStyle={MapStyle}>
                        <Marker
                            // draggable
                            coordinate={{
                                latitude: localLocation?.latitude ?? defaultLocation?.latitude,
                                longitude: localLocation?.longitude ?? defaultLocation?.longitude,
                                ...DefaultDelta
                            }}
                        >
                            <Image style={{ height: scaler(35), width: scaler(35), resizeMode: 'contain' }} source={Images.ic_marker} />

                        </Marker>
                    </MapView>
                    <SafeAreaView edges={['top']} style={{
                        width: '100%',
                    }} >
                        <TouchableOpacity onPress={() => NavigationService.goBack()} style={styles.closeButton} >
                            <AntDesign name={'close'} size={scaler(20)} color={colors.colorBlack} />
                        </TouchableOpacity>
                        <View style={{
                            marginVertical: scaler(10)
                        }} >
                            <TouchableOpacity activeOpacity={0.8} onPress={() => {
                                NavigationService.navigate("GooglePlacesTextInput", {
                                    onSelectLocation: (location: ILocation) => {
                                        setLocalLocation(location)

                                    }
                                })
                            }} style={{}} >
                                <View pointerEvents={'none'}>
                                    <TextInput style={styles.searchInput}
                                        onFocus={() => {

                                        }}
                                        placeholder={Language.search_placeholder}
                                        placeholderTextColor={colors.colorGreyInactive}
                                    />
                                </View>
                            </TouchableOpacity>
                            <Image style={styles.imagePlaceholder} source={Images.ic_lens} />

                        </View>
                    </SafeAreaView>

                </View> : null
            }
            {localLocation?.address?.main_text ? <View style={{
                width: '100%',
                borderRadius: scaler(10),
                backgroundColor: colors.colorWhite,
                padding: scaler(20),
                bottom: 0,
                position: 'absolute',
            }} >
                <Text style={styles.drag} >{"Drag pin to select location"}</Text>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',

                }} >
                    <Image style={{ height: scaler(35), width: scaler(35) }} source={Images.ic_location} />
                    <View style={{ marginLeft: scaler(10), flex: 1 }}>
                        <Text style={styles.primaryText} >{localLocation?.address?.main_text}</Text>
                        <Text style={styles.secondaryText} >{localLocation?.address?.secondary_text}</Text>
                    </View>
                </View>

                <Button onPress={() => {
                    setSelectedLocation(localLocation)
                    NavigationService.goBack()
                }} containerStyle={{ marginTop: scaler(20) }} title={'Confirm Location'} />


            </View> : null}
        </View>
    )
}

export default SelectLocation

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.colorWhite },
    map: {
        ...StyleSheet.absoluteFillObject,
        // height: height
    },
    searchInput: {
        height: scaler(40), backgroundColor: colors.colorWhite,
        borderRadius: scaler(10),
        paddingHorizontal: scaler(45),
        paddingVertical: 0, marginVertical: 0,
        // marginTop: scaler(0),
        marginHorizontal: scaler(20),
        fontSize: scaler(11),
        fontWeight: '300',
        color: colors.colorBlackText,
        elevation: 2

    },
    imagePlaceholder: {
        position: 'absolute',
        height: scaler(20),
        width: scaler(20),
        resizeMode: 'contain',
        top: scaler(10),
        left: scaler(30)
    },
    closeButton: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
        height: scaler(30),
        width: scaler(30),
        borderRadius: scaler(15),
        marginTop: scaler(30),
        marginHorizontal: scaler(20),
        elevation: 2,
        backgroundColor: colors.colorBackground
    },
    drag: {
        color: '#9A9A9A',
        fontSize: scaler(11),
        marginBottom: scaler(10),
        fontWeight: '500',
    },
    primaryText: {
        color: colors.colorBlack,
        flex: 1,
        fontSize: scaler(16),
        fontWeight: '600',
    },
    secondaryText: {
        color: '#878787',
        flex: 1,
        fontSize: scaler(12),
        fontWeight: '400',
    }
})