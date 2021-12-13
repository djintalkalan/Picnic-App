import { doLogout } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Button, Modal, Text } from 'custom-components'
import { BackButton } from 'custom-components/BackButton'
import React, { FC, useState } from 'react'
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import { useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { getImageUrl, NavigationService, scaler } from 'utils'


const Settings: FC<any> = (props) => {

    const [userData] = useDatabase("userData")

    const [isLogoutAlert, setLogoutAlert] = useState(false)

    const dispatch = useDispatch()


    const [profileImage, setProfileImage] = useState()


    return (
        <SafeAreaView style={styles.container} >
            <BackButton />



            <View style={{ flex: 1, width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(5) }} >

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(10) }} >
                    <TouchableOpacity onPress={() => NavigationService.navigate("ProfileScreen")}>
                        <Image onError={(err) => setProfileImage(Images.ic_home_profile)} style={{ height: scaler(60), width: scaler(60), borderRadius: scaler(30) }}
                            source={profileImage ?? userData?.image ? { uri: getImageUrl(userData?.image, { type: 'users', width: scaler(60) }) } :
                                Images.ic_home_profile} />
                    </TouchableOpacity>
                    <View style={{ marginLeft: scaler(10) }} >
                        <Text onPress={() => NavigationService.navigate("ProfileScreen")} style={{ color: colors.colorBlackText, fontWeight: '600', fontSize: scaler(16) }} >{userData?.first_name} {userData?.last_name}</Text>
                        <Text onPress={() => {
                            NavigationService.navigate("ProfileScreen", { isEditEnabled: true })
                        }} style={{ color: colors.colorPrimary, fontWeight: '500', fontSize: scaler(14) }} >{Language?.edit_profile}</Text>

                    </View>
                </View>

                <View style={{ marginHorizontal: scaler(10), marginTop: scaler(15) }} >

                    <SettingButton
                        onPress={() => {

                        }}
                        image={Images.ic_calender_2}
                        title={Language.events}
                    />


                    <SettingButton
                        onPress={() => {
                            NavigationService.navigate("UpdatePassword")
                        }}
                        image={Images.ic_key}
                        title={Language.change_password} />


                    <SettingButton
                        onPress={() => {
                            NavigationService.navigate("PrivacyScreen")
                        }}
                        image={Images.ic_lock}
                        title={Language.privacy}
                    />

                    <SettingButton
                        onPress={() => {
                            setLogoutAlert(true)
                        }}
                        divider={false}
                        titleColor={colors.colorPrimary}
                        image={Images.ic_logout}
                        title={Language.logout} />


                </View>
            </View>

            <Modal transparent visible={isLogoutAlert} >

                <View style={{ flex: 1, padding: '10%', backgroundColor: 'rgba(0, 0, 0, 0.49)', alignItems: 'center', justifyContent: 'center' }} >
                    <View style={styles.alertContainer} >

                        <Text style={{ marginTop: scaler(10), paddingHorizontal: '10%', textAlign: 'center', color: colors.colorPlaceholder, fontSize: scaler(14), fontWeight: '500' }} >{Language.are_you_sure_want}</Text>

                        <Button
                            onPress={() => {
                                setLogoutAlert(false)
                                setTimeout(() => dispatch(doLogout()), 200)

                            }}
                            backgroundColor={colors.colorRed}
                            containerStyle={{ marginTop: scaler(30), marginBottom: scaler(20) }}
                            fontSize={scaler(14)}
                            paddingHorizontal={scaler(30)}
                            title={'Yes, Logout'}
                            paddingVertical={scaler(10)}
                        />
                        <Text onPress={() => setLogoutAlert(false)} style={{ paddingHorizontal: '10%', textAlign: 'center', color: colors.colorBlackText, fontSize: scaler(14), fontWeight: '400' }} >{Language.cancel}</Text>

                    </View>
                </View>


            </Modal>
        </SafeAreaView>
    )
}

const SettingButton = ({ divider = true, ...props }: { divider?: boolean, titleColor?: string, onPress: () => void, title: string, image: ImageSourcePropType }) => {
    return (
        <>
            <TouchableOpacity onPress={props?.onPress}
                style={styles.buttonContainer} >
                <Image style={{ height: scaler(22), width: scaler(22) }} source={props?.image} />
                <Text style={[styles.buttonText, { flex: 1, color: props?.titleColor ?? colors.colorBlackText }]} >{props?.title}</Text>

            </TouchableOpacity>
            {divider ? <View style={styles.divider} /> : null}
        </>
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
    divider: {
        backgroundColor: '#EBEBEB',
        height: 1,
        width: '100%'
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingVertical: scaler(20),
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: '400',
        fontSize: scaler(14),
        marginLeft: scaler(20)
    },
    alertContainer: {
        backgroundColor: colors.colorWhite,
        padding: scaler(20),
        width: '100%',
        elevation: 3,
        alignItems: 'center',
        borderRadius: scaler(20)
    },
})