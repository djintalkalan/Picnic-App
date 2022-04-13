import { useFocusEffect } from '@react-navigation/core'
import { colors, Images, MapStyle } from 'assets'
import { Button, defaultLocation, Text, useLocationService, useStatusBar } from 'custom-components'
import { FocusAwareStatusBar } from 'custom-components/FocusAwareStatusBar'
import { isEqual } from 'lodash'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import {
    Dimensions, Image, InteractionManager, StyleSheet, TextInput,
    // TouchableOpacity as RTO,
    TouchableOpacity,
    View
} from 'react-native'
// import { TouchableOpacity as GTO } from 'react-native-gesture-handler'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Database, { ILocation, useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { getAddressFromLocation, NavigationService, scaler } from 'utils'

const { width, height } = Dimensions.get('window');

// const TouchableOpacity = Platform.OS == 'android' ? RTO : RTO

const ASPECT_RATIO = width / height;
const DefaultDelta = {
    latitudeDelta: 0.1,
    longitudeDelta: 0.1 * ASPECT_RATIO,
}
const SelectLocation: FC<any> = (props) => {
    const onSelectLocation = props?.route?.params?.onSelectLocation
    const prevSelectedLocation = props?.route?.params?.prevSelectedLocation
    const type = props?.route?.params?.type || ""
    const { pushStatusBarStyle, popStatusBarStyle } = useStatusBar()
    const [focused, setFocused] = useState(false)
    const mapRef = useRef<MapView>(null)
    const { askPermission } = useLocationService()
    const [currentLocation] = useDatabase<ILocation>("currentLocation", defaultLocation)
    const [selectedLocation, setSelectedLocation] = useDatabase<ILocation>("selectedLocation", currentLocation ?? defaultLocation)
    const [localLocation, setLocalLocation] = useState<ILocation>(onSelectLocation ? prevSelectedLocation : selectedLocation)

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            askPermission && askPermission()
            if (type == 'currentLocation') {
                setTimeout(() => {
                    getCurrentLocation()
                }, 1000);
            }
        })
    }, [])

    useEffect(() => {
        setTimeout(() => {
            localLocation && mapRef?.current?.animateCamera({ center: localLocation }, { duration: 500 })
        }, 500)
    }, [localLocation])

    useFocusEffect(useCallback(() => {
        InteractionManager.runAfterInteractions(() => {
            pushStatusBarStyle({ translucent: true, backgroundColor: 'transparent' })
            setTimeout(() => {
                setFocused(true)
            }, 200)
        })

        return () => {
            setFocused(false)
            popStatusBarStyle()
        }
    }, []))

    const getCurrentLocation = useCallback(() => {
        if (currentLocation && !isEqual(currentLocation, defaultLocation)) {
            setLocalLocation(currentLocation)
        } else {
            askPermission().then(() => {
                setTimeout(() => {
                    setLocalLocation(Database.getStoredValue('currentLocation'))
                }, 0);
            })
        }
    }, [currentLocation, defaultLocation])

    const setPosition = useCallback(async (location: ILocation) => {
        let { address, otherData } = await getAddressFromLocation(location)
        if (address)
            setLocalLocation({ ...location, address, otherData })
    }, [])

    const onMapPress = useCallback((e) => {
        const { coordinate } = e.nativeEvent
        setPosition(coordinate)
    }, [])

    return (
        <View style={styles.container} >
            <FocusAwareStatusBar translucent backgroundColor={'transparent'} />
            <View style={styles.map} >
                {focused ?
                    <View style={styles.map}
                        pointerEvents={type == 'currentLocation' ? 'none' : undefined}
                    >
                        <MapView provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                            style={{ flex: 1 }}
                            minZoomLevel={2}
                            showsMyLocationButton={false}
                            ref={mapRef}
                            // cacheEnabled
                            onUserLocationChange={async (e) => {
                                const coords = {
                                    latitude: e.nativeEvent.coordinate.latitude,
                                    longitude: e.nativeEvent.coordinate.longitude,
                                }
                                let { address, otherData } = await getAddressFromLocation(coords)
                                let newLocation = {
                                    ...coords, address, otherData
                                }
                                // let oldLocation = Database.getStoredValue("currentLocation")
                                // console.log("oldLocation", oldLocation);
                                // console.log("newLocation", newLocation);

                                // !_.isEqual(oldLocation?.address, newLocation?.address) &&
                                address && Database.setCurrentLocation(newLocation)
                            }}
                            initialRegion={{
                                latitude: localLocation?.latitude ?? currentLocation?.latitude ?? defaultLocation?.latitude,
                                longitude: localLocation?.longitude ?? currentLocation?.longitude ?? defaultLocation?.longitude,
                                ...DefaultDelta
                            }}
                            showsUserLocation
                            onPress={onMapPress}
                            customMapStyle={MapStyle}>
                            {(onSelectLocation && localLocation?.latitude) || (!onSelectLocation) ?
                                <Marker
                                    draggable
                                    onDragEnd={onMapPress}
                                    coordinate={{
                                        latitude: localLocation?.latitude ?? defaultLocation?.latitude,
                                        longitude: localLocation?.longitude ?? defaultLocation?.longitude,
                                        ...DefaultDelta
                                    }}
                                >
                                    <Image style={{ height: scaler(35), width: scaler(35), resizeMode: 'contain' }} source={Images.ic_marker} />
                                </Marker> : null}
                        </MapView>
                    </View> : null}
                <SafeAreaView edges={['top']} style={{
                    width: '100%',
                }} >
                    <View style={{
                        alignSelf: 'flex-end', backgroundColor: colors.colorWhite, marginTop: scaler(25),
                        marginHorizontal: scaler(20),
                        borderRadius: scaler(20)
                    }} >
                        <TouchableOpacity onPress={() => NavigationService.goBack()} style={styles.closeButton} >
                            <AntDesign name={'close'} size={scaler(20)} color={colors.colorBlack} />
                        </TouchableOpacity>
                    </View>
                    {type == 'currentLocation' ? null : <View style={{ marginVertical: scaler(10) }} >
                        <TouchableOpacity activeOpacity={0.9} onPress={() => {
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
                                    placeholder={Language.search_location}
                                    placeholderTextColor={colors.colorGreyInactive}
                                />
                            </View>
                        </TouchableOpacity>
                        <Image style={styles.imagePlaceholder} source={Images.ic_lens} />

                    </View>}

                    <TouchableOpacity onPress={getCurrentLocation} style={[styles.currentLocationButton, type == 'currentLocation' ? { marginTop: scaler(20) } : {}]} >
                        <MaterialCommunityIcons name={'crosshairs-gps'} size={scaler(20)} color={colors.colorWhite} />
                    </TouchableOpacity>
                </SafeAreaView>

            </View>
            {
                localLocation?.address?.main_text ? <View style={{
                    width: '100%',
                    borderRadius: scaler(10),
                    backgroundColor: colors.colorWhite,
                    padding: scaler(20),
                    bottom: 0,
                    position: 'absolute',
                }} >
                    {type == 'currentLocation' ? null : <Text style={styles.drag} >{Language.drag_pin_to_select_location}</Text>}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',

                    }} >
                        <Image style={{ height: scaler(35), width: scaler(35) }} source={Images.ic_location} />
                        <View style={{ marginLeft: scaler(10), flex: 1 }}>
                            {/* <Text style={styles.primaryText} >{localLocation?.otherData?.city}</Text>
                            <Text style={styles.secondaryText} >{localLocation?.otherData?.state ? localLocation?.otherData?.state + ", " : ""} {localLocation?.otherData?.country}</Text> */}
                            <Text style={styles.primaryText} >{localLocation?.address?.main_text}</Text>
                            {localLocation?.address?.secondary_text ? <Text style={styles.secondaryText} >{localLocation?.address?.secondary_text}</Text> : null}
                        </View>
                    </View>

                    <Button opacityType='gesture' onPress={() => {
                        onSelectLocation ?
                            onSelectLocation(localLocation) :
                            setSelectedLocation(localLocation)
                        NavigationService.goBack()
                    }} containerStyle={{ marginTop: scaler(20) }} title={type == 'currentLocation' ? Language.share_current_location : Language.confirm_location} />
                </View> : null
            }
        </View >
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
        height: scaler(40),
        backgroundColor: colors.colorWhite,
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
        elevation: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
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
    },
    currentLocationButton: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
        height: scaler(30),
        width: scaler(30),
        borderRadius: scaler(15),
        elevation: 2,
        marginEnd: scaler(10),
        backgroundColor: colors.colorPrimary
    }
})
