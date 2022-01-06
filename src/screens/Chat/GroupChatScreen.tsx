import { StackScreenProps } from '@react-navigation/stack'
import { RootState } from 'app-store'
import { getGroupDetail, joinGroup } from 'app-store/actions'
import { colors, Images } from 'assets'
import TopTab, { TabProps } from 'custom-components/TopTab'
import React, { FC, useEffect, useMemo } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import UpcomingPastEvents from 'screens/Group/UpcomingPastEvents'
import Language from 'src/language/Language'
import { getImageUrl, NavigationService, scaler } from 'utils'
import { ChatHeader } from './ChatHeader'
import { GroupChats } from './GroupChats'





const GroupChatScreen: FC<StackScreenProps<any, 'GroupChatScreen'>> = (props) => {

    const { group, is_group_joined, activeGroup } = useSelector((state: RootState) => {
        return {
            group: state?.groupDetails?.[props?.route?.params?.id]?.group,
            is_group_joined: state?.groupDetails?.[props?.route?.params?.id]?.is_group_joined,
            activeGroup: state?.activeGroup
        }
    }, shallowEqual)

    const { name, city, image, state, country, _id } = group ?? activeGroup
    useEffect(() => {
        if (!group || activeGroup?.is_group_member != is_group_joined) {
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
    ], [_id])


    const dispatch = useDispatch()

    return (
        <SafeAreaView style={styles.container} >
            <ChatHeader
                title={name}
                onPress={() => {
                    setTimeout(() => {
                        NavigationService.navigate("GroupDetail", { id: _id })
                    }, 0);
                }}
                subtitle={city + ", " + (state ? (state + ", ") : "") + country}
                icon={image ? { uri: getImageUrl(image, { width: scaler(50), type: 'groups' }) } : undefined}
                defaultIcon={Images.ic_group_placeholder}
                rightView={<View style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <TouchableOpacity onPress={() => {
                        if (!is_group_joined) dispatch(joinGroup(_id))
                        else {

                        }
                    }} style={{ paddingHorizontal: scaler(5) }} >
                        {is_group_joined ?
                            <Image source={Images.ic_lens} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(20), resizeMode: 'contain' }} />
                            :
                            <Text style={styles.joinText} >{Language.join}</Text>
                        }
                    </TouchableOpacity>
                    <TouchableOpacity style={{ paddingHorizontal: scaler(5) }}  >
                        <Image source={Images.ic_share} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(20), resizeMode: 'contain' }} />
                    </TouchableOpacity>
                </View>
                }
            />
            {/* <View style={{ flex: 1, backgroundColor: '#DFDFDF' }} > */}
            <TopTab iconPosition='right' tabs={tabs} />

            {/* </View> */}



        </SafeAreaView>
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
    }
})
