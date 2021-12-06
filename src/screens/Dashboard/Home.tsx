import { colors, Images } from 'assets'
import { Text } from 'custom-components'
import React, { FC } from 'react'
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Octicons from 'react-native-vector-icons/Octicons'
import { useDispatch } from 'react-redux'
import Language, { useLanguage, useUpdateLanguage } from 'src/language/Language'
import { NavigationService, scaler } from 'utils'
const Home: FC = () => {

    const dispatch = useDispatch()

    const updateLanguage = useUpdateLanguage()
    const language = useLanguage()
    // console.log("language", language)
    return (
        <SafeAreaView style={styles.container} >

            <View style={styles.headerContainer} >

                <View style={styles.settingButtonContainer} >
                    <Text style={styles.locationText} >Los Angeles, USA</Text>
                    <Octicons style={{ marginLeft: scaler(6) }} name={"chevron-down"} size={scaler(18)} />
                </View>

                <TouchableOpacity onPress={() => NavigationService.navigate("ProfileScreen")} >
                    <Image style={{ height: scaler(35), width: scaler(35), resizeMode: 'contain' }} source={Images.ic_home_profile} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => NavigationService.navigate("Settings")} >
                    <Image style={{ marginLeft: scaler(10), height: scaler(25), width: scaler(25), resizeMode: 'contain' }} source={Images.ic_setting} />
                </TouchableOpacity>

            </View>

            <View>

                <TextInput style={styles.searchInput}
                    placeholder={Language.search_placeholder}
                    placeholderTextColor={"#797979"}
                />
                <Image style={{ height: scaler(20), position: 'absolute', top: scaler(10), left: scaler(25), resizeMode: 'contain' }} source={Images.ic_lens} />
            </View>


        </SafeAreaView>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
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
        marginHorizontal: scaler(20),
        fontSize: scaler(11),
        fontWeight: '300',
        color: colors.colorBlackText

    }
})
