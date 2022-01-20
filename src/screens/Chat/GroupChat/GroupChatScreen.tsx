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
import { ChatHeader } from '../ChatHeader'
import { GroupChats } from './GroupChats'


const GroupChatScreen: FC<StackScreenProps<any, 'GroupChatScreen'>> = (props) => {

    const { groupDetail, activeGroup } = useSelector((state: RootState) => {
        return {
            groupDetail: state?.groupDetails?.[props?.route?.params?.id]?.group,
            activeGroup: state?.activeGroup
        }
    }, shallowEqual)


    console.log("activeGroup", activeGroup);

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
            <TopTab swipeEnabled={false} iconPosition='right' tabs={tabs} />

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
