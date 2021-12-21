import { RootState } from 'app-store'
import { searchAtHome, setSearchedData } from 'app-store/actions/homeaActions'
import { colors, Images } from 'assets'
import { Card, Text } from 'custom-components'
import TopTab, { TabProps } from 'custom-components/TopTab'
import _ from 'lodash'
import React, { FC, useCallback, useState } from 'react'
import { GestureResponderEvent, Image, ImageSourcePropType, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Octicons from 'react-native-vector-icons/Octicons'
import { useDispatch, useSelector } from 'react-redux'
import EventList from 'screens/EventList'
import GroupList from 'screens/Group/GroupList'
import { ILocation, useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { getImageUrl, NavigationService, scaler } from 'utils'

const tabs: TabProps[] = [
    {
        title: "Groups",
        icon: Images.ic_group_icon,
        name: "GroupTab",
        screen: GroupList
    },
    {
        title: "Events",
        icon: Images.ic_calender,
        name: "EventTab",
        screen: EventList
    }
]


const Home: FC = () => {
    const [isFABOpen, setFABOpen] = useState(false)
    const [searchText, setSearchText] = useState("")
    const defaultLocation: ILocation = {
        latitude: 34.055101,
        longitude: -118.244797,
        address: { main_text: "Los Angeles, USA", secondary_text: "" }
    }
    const dispatch = useDispatch()

    const { groupLength, eventLength } = useSelector<RootState, any>((state) => ({
        eventLength: 0,
        groupLength: state?.group?.allGroups?.length
    }))
    const [currentTabIndex, setCurrentTabIndex] = useState(0)
    const [userData] = useDatabase("userData");
    const [currentLocation] = useDatabase<ILocation>("currentLocation", defaultLocation)
    const [selectedLocation, setSelectedLocation] = useDatabase<ILocation>("selectedLocation", currentLocation)


    const [profileImage, setProfileImage] = useState()
    const isFabTransparent = (currentTabIndex && !eventLength) || (!currentTabIndex && !groupLength)

    const debounceSearch = useCallback(_.debounce((text) => {
        dispatch(searchAtHome({ text, type: currentTabIndex ? 'events' : 'groups' }))
    }, 500), [currentTabIndex])

    const debounceClear = useCallback(_.debounce(() => {
        dispatch(setSearchedData({ data: null, type: currentTabIndex ? 'events' : 'groups' }))
    }, 1000), [])

    return (
        <SafeAreaView style={styles.container} >

            <View style={styles.headerContainer} >

                <TouchableOpacity
                    onPress={() => {
                        NavigationService.navigate("SelectLocation")
                    }}
                    style={styles.settingButtonContainer} >
                    <Text numberOfLines={1} style={styles.locationText} >{selectedLocation?.address?.main_text}</Text>
                    <Octicons style={{ marginLeft: scaler(6) }} name={"chevron-down"} size={scaler(18)} />
                </TouchableOpacity>

                <TouchableOpacity style={{ borderRadius: scaler(18), overflow: 'hidden' }} onPress={() => {
                    NavigationService.navigate("ProfileScreen")
                }} >
                    <Image style={{ borderRadius: scaler(18), height: scaler(35), width: scaler(35), resizeMode: 'contain' }}
                        onError={(err) => setProfileImage(Images.ic_home_profile)} source={
                            profileImage ?? userData?.image ? { uri: getImageUrl(userData?.image, { type: 'users', width: scaler(60) }) } :
                                Images.ic_home_profile
                        }
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => NavigationService.navigate("Settings")} >
                    <Image style={{ marginLeft: scaler(10), height: scaler(25), width: scaler(25), resizeMode: 'contain' }} source={Images.ic_setting} />
                </TouchableOpacity>

            </View>

            <View style={{
                paddingBottom: scaler(20),
                borderBottomColor: 'rgba(0, 0, 0, 0.04)',
                borderBottomWidth: 2,
                marginBottom: scaler(2),
                // shadowColor: "#000",
                // shadowOffset: {
                //     width: 0,
                //     height: 1,
                // },
                // shadowOpacity: 0.20,
                // shadowRadius: 1.41,

                // elevation: 2,

            }} >

                <TextInput
                    onChangeText={(text) => {
                        setSearchText(text)
                        debounceSearch(text?.trim()?.length > 2 ? text : null)
                        text?.trim()?.length < 3 && debounceClear()
                    }}
                    style={styles.searchInput}
                    value={searchText}
                    placeholder={Language.search_placeholder}
                    placeholderTextColor={colors.colorGreyInactive}
                />
                <Image style={styles.imagePlaceholder} source={Images.ic_lens} />
            </View>

            <TopTab onChangeIndex={(i) => {
                if (searchText.trim()) {
                    setSearchText("");
                    debounceSearch(null);
                }
                setCurrentTabIndex(i);
            }} swipeEnabled={false} tabs={tabs} />

            <View style={{ alignSelf: 'baseline', position: 'absolute', bottom: scaler(40), right: scaler(15), }} >
                {isFABOpen &&
                    <Card cardElevation={isFabTransparent ? 0 : 2} style={[styles.fabActionContainer, { backgroundColor: (isFabTransparent) ? 'transparent' : colors.colorWhite }]} >
                        <InnerButton title={Language.share_picnic} icon={Images.ic_share_picnic} />
                        <InnerButton onPress={() => {
                            NavigationService.navigate("CreateGroup");
                            setTimeout(() => {
                                setFABOpen(false)
                            }, 1000);
                        }} title={Language.create_group} icon={Images.ic_create_group} />
                        <InnerButton title={Language.host_event} icon={Images.ic_host_event} />
                    </Card>
                }
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                        setFABOpen(!isFABOpen)
                    }}
                    style={{ alignSelf: 'flex-end' }} >
                    <Image style={{ height: scaler(90), width: scaler(90) }} source={isFABOpen ? Images.ic_fab_open : Images.ic_add_fab} />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    )
}

const InnerButton = (props: { title: string, icon: ImageSourcePropType, onPress?: (e?: GestureResponderEvent) => void }) => {
    const { onPress, title, icon } = props
    return (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }} >
            <Text style={{ fontWeight: '500', fontSize: scaler(12), color: colors.colorBlackText }} >{title}</Text>
            <Image style={{ height: scaler(50), width: scaler(50) }} source={icon} />
        </TouchableOpacity>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        overflow: 'hidden'
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scaler(20),
    },
    locationText: {
        fontWeight: '700',
        fontSize: scaler(15),
        color: "#292929",
        maxWidth: '80%',
    },
    settingButtonContainer: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        // justifyContent: 'flex-end'
    },
    searchInput: {
        height: scaler(40), backgroundColor: colors.colorBackground,
        borderRadius: scaler(10),
        paddingHorizontal: scaler(45),
        paddingVertical: 0, marginVertical: 0,
        // marginTop: scaler(0),
        marginHorizontal: scaler(20),
        fontSize: scaler(11),
        fontWeight: '300',
        color: colors.colorBlackText

    },
    imagePlaceholder: {
        height: scaler(20),
        position: 'absolute',
        top: scaler(10),
        left: scaler(25),
        resizeMode: 'contain'
    },
    fabActionContainer: {
        borderRadius: scaler(10),
        paddingHorizontal: scaler(10),
        backgroundColor: colors.colorWhite,
        elevation: 2,
        marginRight: scaler(8),
        justifyContent: 'flex-end',
    }
})
