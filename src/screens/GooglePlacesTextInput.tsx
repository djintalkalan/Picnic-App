import { useFocusEffect } from '@react-navigation/native'
import { config } from 'api'
import { colors, Images } from 'assets'
import { Text } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { ListItemSeparator } from 'custom-components/ListItem/ListItem'
import React, { FC, useCallback, useRef, useState } from 'react'
import { Dimensions, FlatList, Image, StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete'
import { useDispatch } from 'react-redux'
import Database, { ILocation, IRecentSearches, useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { getOtherDataFromAddress, NavigationService, scaler } from 'utils'


interface IGooglePlacesTextInput {

}


const GooglePlacesTextInput: FC<any> = (props) => {

    // props.navigation.setOptions({
    //     // hi: "dj"
    // })
    // console.log("navigation", props.navigation.getState(), props)
    useFocusEffect(useCallback(() => {
        setTimeout(() => {
            setFocused(true)
        }, 100);
    }, []))
    const placeInputRef = useRef<GooglePlacesAutocompleteRef>(null);
    const dispatch = useDispatch()

    const [searchText, setSearchText] = useState("");
    const [isFocused, setFocused] = useState(false);

    const [recentSearches] = useDatabase<Array<IRecentSearches>>("recentSearches", [])

    const _renderRow = useCallback((data, index, icon = Images.ic_search_location) => {
        return <View style={styles.rowContainer} >
            <Image style={{ height: scaler(40), width: scaler(40) }} source={icon} />
            <View style={{ marginLeft: scaler(20), flex: 1 }} >
                <Text style={styles.mainText} >{data?.structured_formatting?.main_text}</Text>
                <Text style={styles.secondaryText}>{data?.structured_formatting?.secondary_text}</Text>
            </View>
            <Image style={{ height: scaler(20), width: scaler(20) }} source={Images.ic_search_send} />
        </View>
    }, [])

    const _onPress = useCallback(async (data, details = null, otherData = null) => { // 'details' is provided when fetchDetails = true
        if (details?.geometry?.location) {
            let location: ILocation = {
                latitude: details?.geometry?.location?.lat,
                longitude: details?.geometry?.location?.lng,
                address: data?.structured_formatting,
            }
            // console.log("location", location)
            if (!otherData && location?.address) {
                otherData = getOtherDataFromAddress(location?.address)
                // console.log("otherData", otherData)
                // dispatch(setLoadingAction(true))
                // otherData = await (await getAddressFromLocation(location)).otherData
                // dispatch(setLoadingAction(false))
            }
            location.otherData = otherData
            // return
            Database.addInRecentSearches({ data, details, otherData })

            if (props?.route?.params?.onSelectLocation) {
                props?.route?.params?.onSelectLocation(location)
                NavigationService.goBack()

            } else {
                Database.setSelectedLocation(location)
                NavigationService.goBack()
            }
        }
    }, [])

    return (
        <SafeAreaViewWithStatusBar style={{ flex: 1 }} >
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ flex: 1, paddingTop: scaler(10) }} disabled >
                    {isFocused && <GooglePlacesAutocomplete
                        ref={placeInputRef}
                        keyboardShouldPersistTaps={'always'}
                        placeholder={Language.search_location}
                        minLength={3}
                        fetchDetails={true}
                        keepResultsAfterBlur
                        textInputProps={{
                            autoFocus: true,
                            returnKeyType: 'done',
                            placeholderTextColor: colors.colorGreyInactive,
                            numberOfLines: 1,
                            multiline: false,
                            onChangeText: (text) => { setSearchText(text) },
                            // rightIcon: { type: 'font-awesome', name: 'chevron-left', color: 'black' },
                        }}
                        enablePoweredByContainer={false}
                        enableHighAccuracyLocation={true}
                        nearbyPlacesAPI={'GoogleReverseGeocoding'}
                        GooglePlacesDetailsQuery={{
                            types: '(cities)',
                        }}
                        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
                        query={{
                            key: config.GOOGLE_MAP_API_KEY,
                            language: 'en',
                            types: '(cities)',
                        }}
                        onPress={_onPress}
                        renderRow={_renderRow}
                        isRowScrollable={false}
                        debounce={500}
                        styles={{
                            listView: {
                                marginTop: scaler(20),
                                borderTopColor: "rgba(0, 0, 0, 0.06)",
                                borderTopWidth: 1,
                                flex: 1,
                                // backgroundColor:'red'
                            },
                            row: {
                                padding: scaler(15),
                            },
                            separator: {
                                width: Dimensions.get('screen').width - scaler(40),
                                alignSelf: 'center',
                            },
                            container: {
                            },
                            textInputContainer: {
                                borderTopWidth: 0,
                                borderBottomWidth: 0,
                                marginTop: scaler(10),

                                // backgroundColor: colors.colorBlack
                            },
                            textInput: styles.searchInput,
                            predefinedPlacesDescription: {
                                color: 'white',
                            },
                        }}
                        currentLocation={false}
                    />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { NavigationService.goBack() }} style={styles.closeButton} >
                    <Image style={styles.imagePlaceholder} source={Images.ic_left} />
                </TouchableOpacity>

                {(!searchText || searchText.length == 0) &&
                    <View style={{
                        top: scaler(60), left: 0, right: 0, position: 'absolute', flex: 1, width: '100%',
                        marginTop: scaler(20),
                        // borderTopColor: "rgba(0, 0, 0, 0.06)",
                        // borderTopWidth: 2,
                    }} >
                        <Text style={{
                            fontWeight: '500', flex: 1, fontSize: scaler(12), color: '#9A9A9A',
                            marginHorizontal: scaler(20),
                            marginTop: scaler(20),
                            marginBottom: scaler(10),
                        }}>{Language.recent_search}</Text>
                        <FlatList
                            style={{ flex: 1 }}
                            showsVerticalScrollIndicator={false}
                            data={recentSearches ?? []}
                            renderItem={({ item, index }) => {
                                return <TouchableHighlight
                                    onPress={() => _onPress(item?.data, item?.details, item?.otherData)}
                                    style={{ width: '100%', padding: scaler(15) }
                                    }
                                    //   onPress={() => _onPress(rowData)}
                                    underlayColor={'#c8c7cc'}
                                >
                                    {_renderRow(item?.data, index, Images.ic_recent_search)}
                                </TouchableHighlight>
                            }}
                            ItemSeparatorComponent={ListItemSeparator}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>}


                {/* <TextInput style={styles.searchInput}
                    placeholder={Language.search_placeholder}
                    placeholderTextColor={colors.colorGreyInactive}
                />
                <Image style={styles.imagePlaceholder} source={Images.ic_lens} /> */}
            </View>
        </SafeAreaViewWithStatusBar >
    )
}

export default GooglePlacesTextInput

const styles = StyleSheet.create({
    safeAreaView: {
        position: 'absolute',
        width: '100%',
        flexShrink: 1
    },
    searchInput: {
        height: scaler(40),
        backgroundColor: '#F6F6F6',
        borderRadius: scaler(10),
        paddingHorizontal: scaler(45),
        paddingVertical: 0, marginVertical: 0,
        // marginTop: scaler(0),
        marginHorizontal: scaler(20),
        fontSize: scaler(12),
        fontWeight: '300',
        textAlignVertical: 'center',
        color: colors.colorBlackText,
        // backgroundColor: 'red'

    },
    imagePlaceholder: {
        height: scaler(16),
        width: scaler(16),
        resizeMode: 'contain'
    },
    closeButton: {
        position: 'absolute',
        top: scaler(20),
        left: scaler(20),
        width: scaler(40),
        alignItems: 'center',
        justifyContent: 'center',
        height: scaler(40),
        // backgroundColor: 'yellow',
    },
    rowContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
    },
    mainText: {
        color: colors.colorBlackText,
        fontSize: scaler(15),
        fontWeight: '500'
    },
    secondaryText: {
        color: "#9A9A9A",
        fontSize: scaler(11),
        fontWeight: '400'
    }
})