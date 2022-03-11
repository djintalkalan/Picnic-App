import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootState } from 'app-store'
import { getGroupDetail, joinGroup } from 'app-store/actions'
import { colors, Images } from 'assets'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import TopTab, { TabProps } from 'custom-components/TopTab'
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import UpcomingPastEvents from 'screens/Group/UpcomingPastEvents'
import Language, { useLanguage } from 'src/language/Language'
import { getImageUrl, NavigationService, scaler, shareDynamicLink } from 'utils'
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
    useEffect(() => {
        if (!groupDetail || activeGroup?.is_group_member != groupDetail?.is_group_member) {
            dispatch(getGroupDetail(activeGroup?._id))
        }
    }, [])


    const tabs: TabProps[] = useMemo(() => [
        {
            title: Language.chat,
            name: "Chats",
            screen: GroupChats,
            icon: Images.ic_chat_bubble,
            initialParams: { id: _id },
        },
        {
            title: Language.upcoming,
            name: "UpcomingEventsChat",
            screen: UpcomingPastEvents,
            initialParams: { type: 'upcoming', id: _id, noLoader: true },
            icon: Images.ic_calender
        }
    ], [_id, useLanguage()])

    const defaultTabs: TabProps[] = useMemo(() => [
        {
            title: Language.chat,
            name: "Chats",
            screen: () => <View style={{ flex: 1, backgroundColor: '#DFDFDF' }} />,
            icon: Images.ic_chat_bubble,
        },
        {
            title: Language.upcoming,
            name: "UpcomingEventsChat",
            screen: () => <View style={{ flex: 1, backgroundColor: '#DFDFDF' }} />,
            initialParams: { type: 'upcoming', id: _id, noLoader: true },
        }
    ], [useLanguage()])


    const dispatch = useDispatch()
    const shareGroup = useCallback(() => {
        shareDynamicLink(groupDetail?.name, {
            type: "group-detail",
            id: groupDetail?._id
        });
    }, [groupDetail])
    if (!groupDetail) {
        return <View style={styles.container}>
            <ChatHeader
                onPress={() => {
                    setTimeout(() => {
                        NavigationService.navigate("GroupDetail", { id: _id })
                    }, 0);
                }}
                title={name || ""}
                subtitle={(city ?? "") + ", " + (state ? (state + ", ") : "") + (country ?? "")}
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
                subtitle={(city ?? "") + ", " + (state ? (state + ", ") : "") + (country ?? "")}
                icon={image ? { uri: getImageUrl(image, { width: scaler(50), type: 'groups' }) } : undefined}
                defaultIcon={Images.ic_group_placeholder}
                rightView={<View style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <TouchableOpacity onPress={() => {
                        if (!groupDetail?.is_group_member) dispatch(joinGroup(_id))
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
                            <Text style={styles.joinText} >{Language.join}</Text>
                        }
                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={shareGroup} style={{ paddingHorizontal: scaler(5) }}  >
                        <Image source={Images.ic_share} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(20), resizeMode: 'contain' }} />
                    </TouchableOpacity> */}
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
