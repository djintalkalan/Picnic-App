import { colors, Images } from 'assets'
import { Text } from 'custom-components'
import TopTab, { TabProps } from 'custom-components/TopTab'
import React, { FC, useState } from 'react'
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Octicons from 'react-native-vector-icons/Octicons'
import { useDispatch } from 'react-redux'
import GroupList from 'screens/GroupList'
import { ILocation, useDatabase } from 'src/database/Database'
import Language, { useLanguage, useUpdateLanguage } from 'src/language/Language'
import { getImageBaseUrl, NavigationService, scaler } from 'utils'

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
        screen: GroupList
    }
]


const Home: FC = () => {

    const dispatch = useDispatch()

    const updateLanguage = useUpdateLanguage()
    const language = useLanguage()
    // console.log("language", language)

    const [userData] = useDatabase("userData");
    const [currentLocation] = useDatabase<ILocation>("currentLocation")
    const [selectedLocation, setSelectedLocation] = useDatabase<ILocation>("selectedLocation", currentLocation)


    const [profileImage, setProfileImage] = useState()

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

                <TouchableOpacity style={{ borderRadius: scaler(18), }} onPress={() => {
                    NavigationService.navigate("ProfileScreen")
                }} >
                    <Image style={{ borderRadius: scaler(18), height: scaler(35), width: scaler(35), resizeMode: 'contain' }}
                        onError={(err) => setProfileImage(Images.ic_home_profile)} source={
                            profileImage ?? userData?.image ? { uri: getImageBaseUrl('users', scaler(35), scaler(35)) + userData?.image } :
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

                <TextInput style={styles.searchInput}
                    placeholder={Language.search_placeholder}
                    placeholderTextColor={colors.colorGreyInactive}
                />
                <Image style={styles.imagePlaceholder} source={Images.ic_lens} />
            </View>

            <TopTab

                swipeEnabled={false} tabs={tabs} />


        </SafeAreaView>
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
    }
})
