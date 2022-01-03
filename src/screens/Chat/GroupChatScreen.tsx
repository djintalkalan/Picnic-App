import { StackScreenProps } from '@react-navigation/stack'
import { store } from 'app-store'
import { setGroupDetail } from 'app-store/actions'
import { colors, Images } from 'assets'
import TopTab, { TabProps } from 'custom-components/TopTab'
import React, { FC, useMemo } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import UpcomingPastEvents from 'screens/Group/UpcomingPastEvents'
import Language from 'src/language/Language'
import { getImageUrl, NavigationService, scaler } from 'utils'
import { ChatHeader } from './ChatHeader'
import { GroupChats } from './GroupChats'





const GroupChatScreen: FC<StackScreenProps<any, 'GroupChatScreen'>> = (props) => {

    const { name, city, image, state, country, _id } = props.route.params?.group ?? {}


    const tabs: TabProps[] = useMemo(() => [
        {
            title: Language.chat,
            name: "Chats",
            screen: GroupChats,
            icon: Images.ic_chat_bubble

        },
        {
            title: Language.upcoming,
            name: "Upcoming",
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
                    if (store?.getState().group?.groupDetail?.group?._id != _id) {
                        dispatch(setGroupDetail(null))
                    }
                    setTimeout(() => {
                        NavigationService.navigate("GroupDetail", { id: _id })
                    }, 0);
                }}
                subtitle={city + ", " + (state ? (state + ", ") : "") + country}
                icon={image ? { uri: getImageUrl(image, { width: scaler(50), type: 'groups' }) } : undefined}
                defaultIcon={Images.ic_group_placeholder}
                rightView={<View style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <TouchableOpacity style={{ paddingHorizontal: scaler(5) }} >
                        <Image source={Images.ic_lens} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(20), resizeMode: 'contain' }} />
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
    }
})
