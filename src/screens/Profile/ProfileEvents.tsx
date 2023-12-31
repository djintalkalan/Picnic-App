import { useIsFocused } from '@react-navigation/native'
import { getUserUpcomingPastEvents, IPaginationState, setActiveEvent } from 'app-store/actions'
import { colors, Images } from 'assets'
import { MyHeader, Text } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { ListItem, ListItemSeparator, TicketView } from 'custom-components/ListItem/ListItem'
import TopTab, { TabProps } from 'custom-components/TopTab'
import React, { FC, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import Language, { useLanguage } from 'src/language/Language'
import { calculateImageUrl, getCityOnly, getImageUrl, NavigationService, scaler } from 'utils'
import { INITIAL_PAGINATION_STATE } from 'utils/Constants'

let loadMore = false
const ProfileEvents: FC<any> = (props) => {
    const language = useLanguage()
    const tabs = useMemo<Array<TabProps>>(() => [
        {
            name: "ProfileUpcomingEvents",
            Screen: ProfileEventsList,
            title: Language.upcoming,
            initialParams: { type: 'upcoming' },
            icon: Images.ic_calender,
            iconPosition: 'right',
        },
        {
            name: "ProfilePastEvents",
            Screen: ProfileEventsList,
            title: Language.history,
            initialParams: { type: 'past' },
            icon: Images.ic_member_tick,
            iconStyle: { height: scaler(20), width: scaler(20) },
            iconPosition: 'right',
        },
    ], [language])
    return (
        <SafeAreaViewWithStatusBar>
            <MyHeader backEnabled title={Language.events} />
            <TopTab activeTitleColor={colors.colorPrimary} tabs={tabs} swipeEnabled={false} />
        </SafeAreaViewWithStatusBar>
    )
}

const ProfileEventsList: FC<any> = (props) => {
    const isFocused = useIsFocused()
    const type: 'upcoming' | 'past' = props?.route?.params?.type
    const { isLoading, userEvents } = useSelector(state => ({
        isLoading: state.isLoading,
        userEvents: state?.userGroupsEvents?.[type],
    }))
    const paginationState = useRef<IPaginationState>(INITIAL_PAGINATION_STATE)
    const dispatch = useDispatch()

    const flatListRef = useRef<FlatList<any>>(null)

    useLayoutEffect(() => {
        paginationState.current = INITIAL_PAGINATION_STATE
        fetchEventList()
        setTimeout(() => {
            loadMore = true
        }, 200);
        return () => { loadMore = false }
    }, [])

    const fetchEventList = useCallback(() => {
        if (paginationState?.current?.currentPage == paginationState?.current?.totalPages) {
            return
        }
        let page = (paginationState?.current?.currentPage) + 1
        {


            dispatch(getUserUpcomingPastEvents({ event_filter_type: type, body: { page, onSuccess: onSuccess } }))
        }
    }, [])

    const onSuccess = useCallback(({ pagination }: any) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
    }, [])


    const _renderItem = useCallback(({ item, index }: any) => {
        const { is_event_member, city, state, country, image, event_images } = item?.event
        const eventImage = calculateImageUrl(image, event_images)
        return (
            <ListItem
                defaultIcon={Images.ic_event_placeholder}
                title={item?.event?.name}
                // highlight={}
                icon={eventImage ? { uri: getImageUrl(eventImage, { width: scaler(50), type: 'events' }) } : undefined}
                // subtitle={city + ", " + (state ? (state + ", ") : "") + country}
                subtitle={getCityOnly(city, state, country)}
                customView={<TicketView {...item?.event} />}
                onPress={() => {
                    dispatch(setActiveEvent(item?.event))
                    setTimeout(() => {
                        // if (item?.event?.is_event_member) {
                        //     NavigationService.navigate("EventChats", { id: item?.event?._id })
                        // } else {
                        NavigationService.navigate("EventDetail", { id: item?.event?._id, type: type })
                        // }
                    }, 0);


                }}
                onPressImage={() => {
                    dispatch(setActiveEvent(item?.event))
                    setTimeout(() => {
                        NavigationService.navigate("EventDetail", { id: item?.event?._id, type: type })
                    }, 0);

                }}
            />
        )
    }, [])

    return (
        <View style={styles.container} >
            <FlatList
                // refreshControl={searchedEvents ? undefined : <RefreshControl
                //     refreshing={false}
                //     onRefresh={() => {
                //         paginationState.current = INITIAL_PAGINATION_STATE
                //         fetchEventList()
                //     }}
                // />}
                data={userEvents}
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                renderItem={_renderItem}
                ListEmptyComponent={<View style={{ flex: 1, justifyContent: 'center' }} ><Text style={{ textAlign: 'center' }} >{Language.events_not_available}</Text></View>}
                ItemSeparatorComponent={ListItemSeparator}
                ref={flatListRef}
                keyExtractor={(_, i) => i.toString()}
                onEndReached={() => {
                    if (loadMore && !isLoading && paginationState.current?.currentPage != 0 && isFocused) {
                        loadMore = false
                        fetchEventList()
                        setTimeout(() => {
                            loadMore = true
                        }, 2000);
                    }
                }}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    }
})

export default ProfileEvents

