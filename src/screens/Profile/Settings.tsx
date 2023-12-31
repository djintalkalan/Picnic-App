import { useIsFocused } from '@react-navigation/native'
import { _setLanguage, config } from 'api'
import { deleteAccount, doLogout, getProfile, refreshLanguage, setLoadingAction } from 'app-store/actions'
import { Images, colors } from 'assets'
import { Text, TextInput } from 'custom-components'
import { BackButton } from 'custom-components/BackButton'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import ImageLoader from 'custom-components/ImageLoader'
import React, { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, ImageSourcePropType, InteractionManager, Platform, ScrollView, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Entypo from 'react-native-vector-icons/Entypo'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useDispatch } from 'react-redux'
import { useDatabase } from 'src/database/Database'
import FeatureFlagWrapper from 'src/featureflag/FeatureFlagWrapper'
import IntercomService from 'src/intercom/IntercomService'
import Language, { useLanguage, useUpdateLanguage } from 'src/language/Language'
import UUIDService from 'src/uuid/UUIDService'
import { NavigationService, _hidePopUpAlert, _showErrorMessage, _showPopUpAlert, _zoomImage, dateFormat, dateStringFormat, getImageUrl, openLink, scaler, shareAppLink } from 'utils'

const languageImageSource = Entypo.getImageSourceSync("language", 50, colors.colorBlackText)
const helpImageSource = MaterialIcons.getImageSourceSync("live-help", 50, colors.colorBlackText)
const twoFactorAuth = MaterialCommunityIcons.getImageSourceSync('two-factor-authentication', 60, colors.colorBlackText)

let installer = "Other"
DeviceInfo.getInstallerPackageName().then((installerPackageName) => {
    console.log("installerPackageName", installerPackageName);
    installer = installerPackageName

    // Play Store: "com.android.vending"
    // Amazon: "com.amazon.venezia"
    // Samsung App Store: "com.sec.android.app.samsungapps"
    // iOS: "AppStore", "TestFlight", "Other"
});



const Settings: FC<any> = (props) => {



    const updateLanguage = useUpdateLanguage()
    const selectedLanguage = useLanguage()

    const [userData] = useDatabase("userData")
    // console.log('userData', userData);

    const dispatch = useDispatch()

    const passwordRef = useRef("")

    // useFocusEffect(useCallback(() => {
    //     setTimeout(() => {
    //         false && Database.setUserData({ ...Database.getStoredValue("userData"), is_premium: false })
    //     }, 2000)
    // }, []))

    const isFocused = useIsFocused()

    useEffect(() => {
        if (isFocused) {
            dispatch(getProfile())
        }
    }, [selectedLanguage, isFocused]);

    const setLanguage = useCallback((language: any) => {
        dispatch(setLoadingAction(true))
        InteractionManager.runAfterInteractions(() => {
            _setLanguage({ language: language }).then((res: any) => {
                if (res && res?.status == 200) {
                    _hidePopUpAlert()
                    updateLanguage(language)
                    dispatch(setLoadingAction(false))
                    setTimeout(() => {
                        dispatch(refreshLanguage())
                    }, 500);
                }
            }).catch((e: any) => {
                console.log(e)
                dispatch(setLoadingAction(false))
            })
        })
    }, [updateLanguage])

    const customView = useCallback(memo(() => {

        return <View style={{ width: '100%' }} >
            <TouchableOpacity onPress={() => { setLanguage('en') }} style={{ alignItems: 'center', width: '100%', flexDirection: 'row', paddingVertical: scaler(10) }} >
                <MaterialIcons name={selectedLanguage == 'en' ? 'check-circle' : 'radio-button-unchecked'} size={scaler(25)} color={colors.colorPrimary} />
                <Text style={{ marginLeft: scaler(10), fontSize: scaler(14), color: colors.colorBlackText }} >{Language.english}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setLanguage('es') }} style={{ alignItems: 'center', width: '100%', flexDirection: 'row', paddingVertical: scaler(10) }} >
                <MaterialIcons name={selectedLanguage == 'es' ? 'check-circle' : 'radio-button-unchecked'} size={scaler(25)} color={colors.colorPrimary} />
                <Text style={{ marginLeft: scaler(10), fontSize: scaler(14), color: colors.colorBlackText }}>{Language.spanish}</Text>
            </TouchableOpacity>
        </View>
    }), [selectedLanguage])


    return (
        <SafeAreaViewWithStatusBar style={styles.container} >
            <BackButton />
            <ScrollView bounces={false} style={{ flex: 1, width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(5) }} >

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(10) }} >
                    <TouchableOpacity onPress={() => _zoomImage(userData?.image ? getImageUrl(userData?.image, { type: 'users' }) : "")}>
                        <ImageLoader placeholderSource={Images.ic_home_profile} style={{ height: scaler(60), width: scaler(60), borderRadius: scaler(30) }}
                            source={userData?.image ? { uri: getImageUrl(userData?.image, { type: 'users', width: scaler(60) }) } : null} />
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
                        onPress={() => { NavigationService.navigate('PaypalDetails') }}
                        image={Images.ic_paypal_icon}
                        title={Language?.paypal_details}
                        arrowRight={true}
                    />
                    <FeatureFlagWrapper flag='enable-lightning' >
                        <SettingButton
                            onPress={() => { NavigationService.navigate('ReceiveBitcoin') }}
                            image={Images.ic_bitcoin_receive}
                            title={Language?.receive_bitcoin}
                            arrowRight={true}
                        />
                        <SettingButton
                            onPress={() => { NavigationService.navigate('SendBitcoinAmount') }}
                            image={Images.ic_bitcoin_send}
                            title={Language?.send_bitcoin}
                            arrowRight={true}
                        />
                        {/* <SettingButton
                            onPress={() => { NavigationService.navigate('Mnemonic') }}
                            image={Images.ic_bitcoin_send}
                            title={Language?.bitcoin_mnemonic}
                            arrowRight={true}
                        /> */}
                        <SettingButton
                            onPress={() => { NavigationService.navigate('ListBitcoinTransactions') }}
                            image={Images.ic_bitcoin_transactions}
                            title={Language?.bitcoin_transactions}
                            arrowRight={true}
                        />
                    </FeatureFlagWrapper>

                    <SettingButton
                        onPress={() => {
                            shareAppLink("Picnic Groups")
                        }}
                        image={Images.ic_share}
                        title={Language.share_picnic}
                    />

                    {/* {!userData?.is_premium || userData?.type == 'trial' ? */}
                    <SubscriptionButton userData={userData} />
                    {/* : undefined
                    } */}

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
                        onPress={() => { NavigationService.navigate('TwoFactorAuth') }}
                        image={twoFactorAuth}
                        title={Language.two_factor_auth}
                    />


                    <SettingButton
                        onPress={() => {
                            IntercomService.openMessenger();
                        }}
                        image={helpImageSource}
                        title={Language.help_and_support}
                    />

                    <View style={{}} >
                        <TouchableOpacity
                            onPress={() => {
                                openLink(config.PRIVACY_URL)
                            }}
                            style={[styles.buttonContainer, {}]} >
                            <MaterialIcons color={colors.colorBlackText} size={scaler(25)} name={'policy'} />
                            <View>
                                <Text style={[styles.buttonText, { color: colors.colorBlackText, }]} >{Language.privacy_policy}</Text>
                                <Text style={[styles.buttonText, { fontSize: scaler(11), color: colors.colorGreyInactive, fontWeight: '400' }]} >{Language.how_picnic_collects}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.9}
                            onPress={UUIDService.showUUIDToast}
                            style={[styles.buttonContainer, { paddingTop: 0 }]} >
                            <MaterialIcons color={colors.colorBlackText} size={scaler(25)} name={'info-outline'} />
                            <View>
                                <Text style={[styles.buttonText, { color: colors.colorBlackText, }]} >{Language.version}</Text>
                                <Text style={[styles.buttonText, { fontSize: scaler(11), color: colors.colorGreyInactive, fontWeight: '400' }]} >{(Platform.OS == 'ios' && installer != "AppStore") ? ("TestFlight v" + config.APP_VERSION + " Build " + config.BUILD_NUMBER_CODE) : config.APP_VERSION}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>


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
                        containerStyle={{ paddingTop: scaler(10) }}
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
        </SafeAreaViewWithStatusBar>
    )
}

const SettingButton = ({ divider = true, containerStyle, ...props }: { fontWeight?: any, containerStyle?: StyleProp<ViewStyle>, divider?: boolean, titleColor?: string, arrowRight?: boolean, onPress?: () => void, title: string, image: ImageSourcePropType }) => {
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



const SubscriptionButton = ({ userData }: { userData: any }) => {
    // console.log("userData", userData);

    // userData.is_premium = true
    // userData.type = 'yearly'

    let heading = '';

    if (userData?.is_premium) {
        if (userData?.type == 'monthly') {
            heading = Language.monthly_member
        } else if (userData?.type == 'yearly') {
            let memberSince = '';
            if (userData?.payment_date_unix) {
                memberSince = dateFormat(new Date(parseInt(userData?.payment_date_unix)), 'YYYY')
            }
            heading = Language.member_since?.trim() + " " + memberSince
        } else {
            let expireAt;
            if (userData?.expire_at_unix) {
                expireAt = dateFormat(new Date(parseInt(userData?.expire_at_unix)), 'MMM DD, YYYY')
            } else if (userData?.expire_at) {
                expireAt = dateStringFormat(userData?.expire_at, 'MMM DD, YYYY', "YYYY-MM-DD", '-');
            }
            heading = Language.join_now_free_trial?.trim() + " " + expireAt
        }
    } else {
        heading = Language.join_now
    }

    return (
        <SettingButton
            onPress={!userData?.is_premium || userData?.type == 'trial' || userData?.type == 'monthly' ?
                () => { NavigationService.navigate("Subscription", { from: 'settings' }) }
                : undefined}
            image={Images.ic_smiley}
            title={heading}
        />
    )
}

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