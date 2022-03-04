import { useFocusEffect } from '@react-navigation/core'
import { RootState } from 'app-store'
import { getMutedReportedCount } from 'app-store/actions'
import { colors, Images } from 'assets'
import { MyHeader, Text } from 'custom-components'
import { isEqual } from 'lodash'
import React, { FC, useCallback, useState } from 'react'
import { Image, ImageSourcePropType, InteractionManager, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { NavigationService, scaler } from 'utils'


const PrivacyScreen: FC<any> = (props) => {

    const [userData] = useDatabase("userData")

    const [isLogoutAlert, setLogoutAlert] = useState(false)

    const dispatch = useDispatch()

    const { privacyState } = useSelector((state: RootState) => ({
        privacyState: state.privacyState
    }), isEqual)

    useFocusEffect(useCallback(() => {
        InteractionManager.runAfterInteractions(() => {
            dispatch(getMutedReportedCount())
        })
    }, []))


    return (
        <SafeAreaView style={styles.container} >

            <MyHeader title={Language.review} />



            <View style={{ flex: 1, width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(5) }} >

                <View style={{}} >
                    <SettingButton
                        onPress={() => {
                            NavigationService.navigate("BlockedMembers")
                        }}
                        image={Images.ic_blocked_members}
                        title={Language.unblock}
                        subtitle={privacyState?.users + " " + Language.members?.toLowerCase()}
                    />

                    <SettingButton
                        onPress={() => {
                            NavigationService.navigate("MutedGroupsEvents")
                        }}
                        image={Images.ic_muted}
                        title={Language.unmute}
                        subtitle={privacyState?.groups + ' ' + Language.groups?.toLowerCase() + " / " + privacyState?.events + ' ' + Language.events?.toLowerCase()}
                    />

                    <SettingButton
                        onPress={() => {
                            NavigationService.navigate("HiddenPosts")
                        }}
                        image={Images.ic_hidden_posts}
                        title={Language.restore}
                        subtitle={privacyState?.posts + " " + Language.messages}
                    />

                </View>
            </View>

        </SafeAreaView>
    )
}

const SettingButton = ({ divider = true, ...props }: { subtitle: string, divider?: boolean, titleColor?: string, onPress: () => void, title: string, image: ImageSourcePropType }) => {
    return (
        <>
            <TouchableOpacity onPress={props?.onPress}
                style={styles.buttonContainer} >
                <Image style={{ height: scaler(22), width: scaler(22) }} source={props?.image} />
                <Text style={[styles.buttonText, { flex: 1, color: props?.titleColor ?? colors.colorBlackText }]} >{props?.title}</Text>

                <Text style={{ color: colors.colorPlaceholder, fontSize: scaler(12) }} >{props?.subtitle}</Text>


                <Image source={Images.ic_right} style={{ height: scaler(15), width: scaler(15), resizeMode: 'contain' }} />

            </TouchableOpacity>
            {divider ? <View style={styles.divider} /> : null}
        </>
    )
}

export default PrivacyScreen

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
        fontSize: scaler(12.5),
        marginLeft: scaler(10)
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