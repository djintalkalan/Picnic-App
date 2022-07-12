import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootState } from 'app-store'
import { getGroupDetail, joinGroup } from 'app-store/actions'
import { colors, Images } from 'assets'
import ColorPicker from 'custom-components/ColorPicker'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import TopTab, { TabProps } from 'custom-components/TopTab'
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { ColorValue, DeviceEventEmitter, Dimensions, GestureResponderEvent, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import UpcomingPastEvents from 'screens/Group/UpcomingPastEvents'
import Language, { useLanguage } from 'src/language/Language'
import { getCityOnly, getImageUrl, NavigationService, scaler, _showTouchAlert } from 'utils'
import { DEFAULT_CHAT_BACKGROUND, UPDATE_COLOR_EVENT } from 'utils/Constants'
import { ChatHeader } from '../ChatHeader'
import { GroupChats } from './GroupChats'

const gradientColors = ['rgba(255,255,255,0)', 'rgba(255,255,255,0.535145)', '#fff']
const { height, width } = Dimensions.get('screen')

const GroupChatScreen: FC<NativeStackScreenProps<any, 'GroupChatScreen'>> = (props) => {

    const currentIndexRef = useRef(0);
    const { groupDetail, activeGroup } = useSelector((state: RootState) => {
        return {
            groupDetail: state?.groupDetails?.[props?.route?.params?.id]?.group,
            activeGroup: state?.activeGroup
        }
    }, shallowEqual)

    const { name, city, image, state, country, _id } = groupDetail ?? activeGroup

    const activeBackgroundColorRef = useRef<ColorValue>(groupDetail?.background_color || DEFAULT_CHAT_BACKGROUND)

    useEffect(() => {
        // if (!groupDetail || activeGroup?.is_group_member != groupDetail?.is_group_member) {

        dispatch(getGroupDetail(activeGroup?._id))
        // }
        const subscription = DeviceEventEmitter.addListener(UPDATE_COLOR_EVENT, c => activeBackgroundColorRef.current = c)
        return () => {
            subscription.remove()
        }
    }, [])


    const tabs: TabProps[] = useMemo(() => [
        {
            title: Language.chat,
            name: "Chats",
            Screen: GroupChats,
            icon: Images.ic_chat_bubble,
            initialParams: { id: _id },
        },
        {
            title: Language.upcoming,
            name: "UpcomingEventsChat",
            Screen: UpcomingPastEvents,
            initialParams: { type: 'upcoming', id: _id, noLoader: true },
            icon: Images.ic_calender
        }
    ], [_id, useLanguage()])

    const defaultTabs: TabProps[] = useMemo(() => [
        {
            title: Language.chat,
            name: "Chats",
            Screen: () => <View style={{ flex: 1, backgroundColor: '#DFDFDF' }} />,
            icon: Images.ic_chat_bubble,
        },
        {
            title: Language.upcoming,
            name: "UpcomingEventsChat",
            Screen: () => <View style={{ flex: 1, backgroundColor: '#DFDFDF' }} />,
            initialParams: { type: 'upcoming', id: _id, noLoader: true },
        }
    ], [useLanguage()])


    console.log('groupDetail', groupDetail);

    const colorPickerButtonRef = useRef<TouchableOpacity>(null)


    const openColorPicker = useCallback((e?: GestureResponderEvent) => {
        colorPickerButtonRef.current?.measureInWindow((x, y, w, h) => {
            _showTouchAlert({
                placementStyle: {
                    // top,
                    // right: width - left,
                    top: y + h + scaler(5) + (StatusBar.currentHeight || 0),
                    right: width - (w + x)
                },
                transparent: true,
                alertComponent: () => {
                    return (
                        <ColorPicker selectedColor={activeBackgroundColorRef.current} />
                    )
                }
            })
        })
    }, [])


    const dispatch = useDispatch()
    if (!groupDetail) {
        return <View style={styles.container}>
            <ChatHeader
                onPress={() => {
                    setTimeout(() => {
                        NavigationService.navigate("GroupDetail", { id: _id })
                    }, 0);
                }}
                title={name || ""}
                // subtitle={(city ?? "") + ", " + (state ? (state + ", ") : "") + (country ?? "")}
                subtitle={getCityOnly(city, state, country)}
                icon={image ? { uri: getImageUrl(image, { width: scaler(50), type: 'groups' }) } : undefined}
                defaultIcon={Images.ic_group_placeholder}
            />
            <TopTab swipeEnabled={false} iconPosition='right' tabs={defaultTabs} />

        </View>
    }

    return (
        <SafeAreaViewWithStatusBar style={styles.container} >
            <ChatHeader
                title={name}
                onPress={() => {
                    setTimeout(() => {
                        NavigationService.navigate("GroupDetail", { id: _id })
                    }, 0);
                }}
                // subtitle={(city ?? "") + ", " + (state ? (state + ", ") : "") + (country ?? "")}
                subtitle={getCityOnly(city, state, country)}
                icon={image ? { uri: getImageUrl(image, { width: scaler(50), type: 'groups' }) } : undefined}
                defaultIcon={Images.ic_group_placeholder}
                rightView={<View style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <TouchableOpacity onPress={() => {
                        if (!groupDetail?.is_group_member && groupDetail?.status == 1) dispatch(joinGroup(_id))
                        else {

                        }
                    }} style={{ paddingHorizontal: scaler(5) }} >
                        {groupDetail?.is_group_member ?
                            <TouchableOpacity onPress={() => NavigationService.navigate('SearchChatScreen', {
                                screen: currentIndexRef?.current ? 'SearchedEvents' : 'ChatSearch',
                                type: 'group'
                            })}>
                                <Image source={Images.ic_lens} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(20), resizeMode: 'contain' }} />
                            </TouchableOpacity>
                            :
                            <Text style={styles.joinText} >{groupDetail?.status == 1 ? Language.join : ''}</Text>
                        }
                    </TouchableOpacity>
                    {groupDetail?.is_admin ? <TouchableOpacity ref={colorPickerButtonRef} onPress={openColorPicker} style={{ paddingHorizontal: scaler(5) }}  >
                        <Ionicons name={'color-palette-outline'} size={scaler(23)} />
                    </TouchableOpacity> : undefined}
                </View>
                }
            />
            {/* <View style={{ flex: 1, backgroundColor: '#DFDFDF' }} > */}
            <TopTab onChangeIndex={(i) => {
                currentIndexRef.current = i
            }} swipeEnabled={false} iconPosition='right' tabs={tabs} />

            {/* </View> */}



        </SafeAreaViewWithStatusBar>
    )
}

export default GroupChatScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.colorWhite,
        flex: 1
    },
    joinText: {
        color: colors.colorPrimary,
        fontSize: scaler(14)
    },
    linearGradient: {
        position: 'absolute',
        height: scaler(80),
        top: width - scaler(80),
        width: '100%'
    },
})
