import { deleteAccount, doLogout, getProfile } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Text, TextInput } from 'custom-components'
import { BackButton } from 'custom-components/BackButton'
import React, { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, ImageSourcePropType, InteractionManager, ScrollView, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Entypo from 'react-native-vector-icons/Entypo'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useDispatch } from 'react-redux'
import { useDatabase } from 'src/database/Database'
import Language, { useLanguage, useUpdateLanguage } from 'src/language/Language'
import { getImageUrl, NavigationService, scaler, shareAppLink, _hidePopUpAlert, _showErrorMessage, _showPopUpAlert } from 'utils'

const languageImageSource = Entypo.getImageSourceSync("language", 50, colors.colorBlackText)

const Settings: FC<any> = (props) => {

    const updateLanguage = useUpdateLanguage()
    const selectedLanguage = useLanguage()

    const [userData] = useDatabase("userData")

    const [isLogoutAlert, setLogoutAlert] = useState(false)

    const dispatch = useDispatch()

    const passwordRef = useRef("")

    const [isLanguageModal, setLanguageModal] = useState();


    const [profileImage, setProfileImage] = useState()

    useEffect(() => {
        dispatch(getProfile())
    }, [selectedLanguage]);

    const customView = useCallback(memo(() => {

        return <View style={{ width: '100%' }} >
            <TouchableOpacity onPress={() => {
                InteractionManager.runAfterInteractions(() => {
                    _hidePopUpAlert()
                    setTimeout(() => {
                        updateLanguage("en")
                    }, 0);
                })
            }}
                style={{ alignItems: 'center', width: '100%', flexDirection: 'row', paddingVertical: scaler(10) }} >
                <MaterialIcons name={selectedLanguage == 'en' ? 'check-circle' : 'radio-button-unchecked'} size={scaler(25)} color={colors.colorPrimary} />
                <Text style={{ marginLeft: scaler(10), fontSize: scaler(14), color: colors.colorBlackText }} >English</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
                InteractionManager.runAfterInteractions(() => {
                    _hidePopUpAlert()
                    setTimeout(() => {
                        updateLanguage("es")
                    }, 0);
                })
            }} style={{ alignItems: 'center', width: '100%', flexDirection: 'row', paddingVertical: scaler(10) }} >
                <MaterialIcons name={selectedLanguage == 'es' ? 'check-circle' : 'radio-button-unchecked'} size={scaler(25)} color={colors.colorPrimary} />
                <Text style={{ marginLeft: scaler(10), fontSize: scaler(14), color: colors.colorBlackText }}>Spanish</Text>
            </TouchableOpacity>
        </View>
    }), [updateLanguage, selectedLanguage])

    return (
        <SafeAreaView style={styles.container} >
            <BackButton />

            <ScrollView bounces={false} style={{ flex: 1, width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(5) }} >

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
                            NavigationService.navigate("ProfileEvents")

                        }}
                        image={Images.ic_calender_2}
                        title={Language.events}
                        arrowRight={true}
                    />

                    <SettingButton
                        onPress={() => {
                            NavigationService.navigate("ProfileGroups")

                        }}
                        image={Images.ic_group_2}
                        title={Language.groups}
                        arrowRight={true}
                    />


                    <SettingButton
                        onPress={() => {
                            NavigationService.navigate("UpdatePassword")
                        }}
                        image={Images.ic_key}
                        title={Language.change_password}
                        arrowRight={true} />


                    <SettingButton
                        onPress={() => {
                            NavigationService.navigate("PrivacyScreen")
                        }}
                        image={Images.ic_lock}
                        title={Language.review}
                        arrowRight={true}
                    />


                    <SettingButton
                        onPress={() => {
                            shareAppLink("Picnic Groups")
                        }}
                        image={Images.ic_share}
                        title={Language.share_picnic}
                    />

                    {!userData?.is_premium ?
                        <SettingButton
                            onPress={() => {
                                NavigationService.navigate("Subscription", { from: 'settings' })
                            }}
                            image={Images.ic_smiley}
                            title={Language.join_now}
                        /> : undefined
                    }

                    <SettingButton
                        onPress={() => {
                            _showPopUpAlert({
                                title: Language.change_language,
                                customView: customView

                            })
                        }}
                        image={languageImageSource}
                        title={Language.change_language}
                    />

                    <SettingButton
                        onPress={() => {
                            _showPopUpAlert({
                                message: Language.are_you_sure_logout,
                                buttonText: Language.yes_logout,
                                buttonStyle: { backgroundColor: colors.colorRed },
                                onPressButton: () => dispatch(doLogout())
                            })
                        }}
                        divider={false}
                        titleColor={colors.colorPrimary}
                        image={Images.ic_logout}
                        fontWeight={'500'}
                        title={Language.logout} />


                    <SettingButton
                        containerStyle={{ paddingTop: 0 }}
                        onPress={() => {
                            _showPopUpAlert({
                                message: Language.are_you_sure_delete_account,
                                buttonText: Language.yes_delete_account,
                                buttonStyle: { backgroundColor: colors.colorRed },
                                onPressButton: () => {
                                    _showPopUpAlert({
                                        message: Language.enter_password_to_delete,
                                        buttonText: Language.delete_account,
                                        buttonStyle: { backgroundColor: colors.colorRed },
                                        customView: () => {
                                            const [isSecure, setSecure] = useState(true)
                                            return <View style={{ width: '100%' }} >
                                                <TextInput
                                                    placeholder={Language.password}
                                                    style={{ fontSize: scaler(13) }}
                                                    name={'password'}
                                                    onChangeText={(text) => passwordRef.current = text}
                                                    onPressIcon={() => setSecure(!isSecure)}
                                                    secureTextEntry={isSecure}
                                                    icon={isSecure ? Images.ic_eye_open : Images.ic_eye_closed}
                                                    iconSize={scaler(18)}
                                                    required={true}
                                                />
                                            </View>
                                        },
                                        onPressButton: () => {
                                            if (passwordRef?.current) {
                                                dispatch(deleteAccount({ password: passwordRef?.current }))
                                            } else {
                                                _showErrorMessage(Language.password_required)
                                            }
                                        }
                                    })
                                }
                            })
                        }}
                        divider={false}
                        titleColor={colors.colorRed}
                        fontWeight={'500'}
                        image={Images.ic_delete}
                        title={Language.delete_account} />


                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const SettingButton = ({ divider = true, containerStyle, ...props }: { fontWeight?: any, containerStyle?: StyleProp<ViewStyle>, divider?: boolean, titleColor?: string, arrowRight?: boolean, onPress: () => void, title: string, image: ImageSourcePropType }) => {
    const cStyle = useMemo(() => ({ ...StyleSheet.flatten(containerStyle) }), [])
    return (
        <>
            <TouchableOpacity onPress={props?.onPress}
                style={[styles.buttonContainer, cStyle]} >
                <Image style={{ height: scaler(22), width: scaler(22), resizeMode: 'contain' }} source={props?.image} />
                <Text style={[styles.buttonText, { flex: 1, color: props?.titleColor ?? colors.colorBlackText, fontWeight: props?.fontWeight }]} >{props?.title}</Text>
                {props?.arrowRight ? <Image style={{ height: scaler(15), width: scaler(7), resizeMode: 'contain' }} source={Images.ic_right} /> : undefined}

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