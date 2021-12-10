import { config } from 'api'
import { colors, Images } from 'assets'
import { Text } from 'custom-components'
import { ListItemSeparator } from 'custom-components/ListItem/ListItem'
import React, { FC, useCallback, useRef, useState } from 'react'
import { Dimensions, FlatList, Image, StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete'
import { SafeAreaView } from 'react-native-safe-area-context'
import Database, { IRecentSearches, useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { NavigationService, scaler } from 'utils'


interface IGooglePlacesTextInput {

}


const GooglePlacesTextInput: FC<any> = (props) => {

    // props.navigation.setOptions({
    //     // hi: "dj"
    // })
    // console.log("navigation", props.navigation.getState(), props)
    const placeInputRef = useRef<GooglePlacesAutocompleteRef>(null);

    const [searchText, setSearchText] = useState("");

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

    const _onPress = useCallback((data, details = null) => { // 'details' is provided when fetchDetails = true
        Database.addInRecentSearches({ data, details })
        if (details?.geometry?.location) {
            const location = {
                latitude: details?.geometry?.location?.lat,
                longitude: details?.geometry?.location?.lng,
                address: data?.structured_formatting
            }
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
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.colorWhite }} >
            {/* <GooglePlacesAutocomplete
                styles={[{}]}
                query={{
                    key: config.GOOGLE_MAP_API_KEY,
                    language: 'en', // language of the results
                }}
                onPress={(data, details) => console.log(data, details)}
                placeholder={'Search Location'}
            /> */}
            <TouchableOpacity style={{ flex: 1, paddingTop: scaler(10) }} disabled >

                <GooglePlacesAutocomplete
                    ref={placeInputRef}
                    placeholder={Language.search_location}
                    minLength={3}
                    fetchDetails={true}
                    textInputProps={{
                        autoFocus: true,
                        returnKeyType: 'search',
                        placeholderTextColor: colors.colorGreyInactive,
                        onChangeText: (text) => { setSearchText(text) },
                        rightIcon: { type: 'font-awesome', name: 'chevron-left', color: 'black' },
                    }}
                    enablePoweredByContainer={false}
                    enableHighAccuracyLocation={true}
                    nearbyPlacesAPI={'GoogleReverseGeocoding'}
                    query={{
                        key: config.GOOGLE_MAP_API_KEY,
                        language: 'en',
                        types: 'geocode',
                    }}
                    onPress={_onPress}
                    renderRow={_renderRow}
                    isRowScrollable={false}
                    styles={{
                        listView: {
                            marginTop: scaler(20),
                            borderTopColor: "rgba(0, 0, 0, 0.06)",
                            borderTopWidth: 1,
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

                            // backgroundColor:colors.colorBlack
                        },
                        textInput: styles.searchInput,
                        predefinedPlacesDescription: {
                            color: 'white',
                        },
                    }}
                    currentLocation={false}
                />
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
                    }}>{"Recent Search"}</Text>
                    <FlatList
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                        data={recentSearches ?? []}
                        renderItem={({ item, index }) => {
                            return <TouchableHighlight
                                onPress={() => _onPress(item?.data, item?.details)}
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
        </SafeAreaView >
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
        height: scaler(40), backgroundColor: '#F6F6F6',
        borderRadius: scaler(10),
        paddingHorizontal: scaler(45),
        paddingVertical: 0, marginVertical: 0,
        // marginTop: scaler(0),
        marginHorizontal: scaler(20),
        fontSize: scaler(12),
        fontWeight: '300',
        color: colors.colorBlackText

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
