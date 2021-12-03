import { colors, Images } from 'assets'
import { Text } from 'custom-components'
import { BackButton } from 'custom-components/BackButton'
import React, { FC } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Language from 'src/language/Language'
import { NavigationService, scaler } from 'utils'


const Settings: FC<any> = (props) => {

    return (
        <SafeAreaView style={styles.container} >
            <BackButton />



            <View style={{ flex: 1, width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(5) }} >

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(10) }} >
                    <Image style={{ height: scaler(60), width: scaler(60) }} source={Images.ic_profile_image} />
                    <View style={{ marginLeft: scaler(10) }} >
                        <Text style={{ color: colors.colorBlackText, fontWeight: '600', fontSize: scaler(16) }} >{"John Doe"}</Text>
                        <Text onPress={() => {
                            NavigationService.navigate("ProfileScreen")
                        }} style={{ color: colors.colorPrimary, fontWeight: '500', fontSize: scaler(14) }} >{Language?.edit_profile}</Text>

                    </View>
                </View>

                <View style={{ marginHorizontal: scaler(10), marginTop: scaler(15) }} >

                    <TouchableOpacity style={{ flexDirection: 'row', paddingVertical: scaler(20), alignItems: 'center', }} >
                        <Image style={{ height: scaler(22), width: scaler(22) }} source={Images.ic_calender_2} />
                        <Text style={{ color: colors.colorBlackText, fontWeight: '400', fontSize: scaler(14), marginLeft: scaler(20) }} >{Language.events}</Text>

                    </TouchableOpacity>

                    <View style={{ backgroundColor: '#EBEBEB', height: 1, width: '100%' }} />

                    <TouchableOpacity onPress={() => {
                        NavigationService.navigate("UpdatePassword")
                    }} style={{ flexDirection: 'row', paddingVertical: scaler(20), alignItems: 'center', }} >
                        <Image style={{ height: scaler(22), width: scaler(22) }} source={Images.ic_key} />
                        <Text style={{ color: colors.colorBlackText, fontWeight: '400', fontSize: scaler(14), marginLeft: scaler(20) }} >{Language.change_password}</Text>

                    </TouchableOpacity>

                    <View style={{ backgroundColor: '#EBEBEB', height: 1, width: '100%' }} />

                    <TouchableOpacity style={{ flexDirection: 'row', paddingVertical: scaler(20), alignItems: 'center', }} >
                        <Image style={{ height: scaler(22), width: scaler(22) }} source={Images.ic_lock} />
                        <Text style={{ color: colors.colorBlackText, fontWeight: '400', fontSize: scaler(14), marginLeft: scaler(20) }} >{Language.privacy}</Text>

                    </TouchableOpacity>

                    <View style={{ backgroundColor: '#EBEBEB', height: 1, width: '100%' }} />

                    <TouchableOpacity style={{ flexDirection: 'row', paddingVertical: scaler(20), alignItems: 'center', }} >
                        <Image style={{ height: scaler(22), width: scaler(22) }} source={Images.ic_logout} />
                        <Text style={{ color: colors.colorPrimary, fontWeight: '400', fontSize: scaler(14), marginLeft: scaler(20) }} >{Language.logout}</Text>

                    </TouchableOpacity>


                </View>


            </View>
        </SafeAreaView>
    )
}

export default Settings

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center'
    },
    heading: {
        fontSize: scaler(18),
        marginTop: scaler(10),
        // marginHorizontal: scaler(5),
        fontWeight: '600',
    },
    content: {
        fontSize: scaler(12),
        marginTop: scaler(5),
        marginBottom: scaler(10),
        fontWeight: '400',
        // marginHorizontal: scaler(5),
        color: colors.colorPlaceholder
    },
})