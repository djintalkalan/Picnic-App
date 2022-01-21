import { RootState } from 'app-store'
import { getUserUpcomingPastEvents, IPaginationState, setActiveEvent } from 'app-store/actions'
import { colors, Images } from 'assets'
import { MyHeader } from 'custom-components'
import { ListItem, ListItemSeparator, TicketView } from 'custom-components/ListItem/ListItem'
import TopTab, { TabProps } from 'custom-components/TopTab'
import React, { FC, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import Language, { useLanguage } from 'src/language/Language'
import { getImageUrl, InitialPaginationState, NavigationService, scaler } from 'utils'

const ProfileEvents: FC<any> = (props) => {
    const tabs = useMemo<Array<TabProps>>(() => [
        {
            name: "ProfileUpcomingEvents",
            screen: ProfileEventsList,
            title: Language.upcoming,
            initialParams: { type: 'upcoming' }
        },
        {
            name: "ProfilePastEvents",
            screen: ProfileEventsList,
            title: Language.history,
            initialParams: { type: 'past' }
        },
    ], [useLanguage()])
    return (
        <SafeAreaView style={styles.container} >
            <MyHeader backEnabled title={Language.events} />

            <TopTab activeTitleColor={colors.colorPrimary} tabs={tabs} swipeEnabled={false} />

        </SafeAreaView>
    )
}


const ProfileEventsList: FC<any> = (props) => {
    const type: 'upcoming' | 'past' = props?.route?.params?.type
    const { isLoading, userEvents } = useSelector((state: RootState) => ({
        isLoading: state.isLoading,
        userEvents: state?.userGroupsEvents?.[type],
    }))
    const paginationState = useRef<IPaginationState>(InitialPaginationState)
    const dispatch = useDispatch()

    const flatListRef = useRef<FlatList<any>>(null)

    useLayoutEffect(() => {
        paginationState.current = InitialPaginationState
        fetchEventList()
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

    const onSuccess = useCallback(({ pagination }) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
    }, [])


    const _renderItem = useCallback(({ item, index }) => {
        const { is_event_member, city, state, country } = item?.event
        return (
            <ListItem
                defaultIcon={Images.ic_event_placeholder}
                title={item?.event?.name}
                // highlight={}
                icon={item?.event?.image ? { uri: getImageUrl(item?.event?.image, { width: scaler(50), type: 'events' }) } : undefined}
                subtitle={city + ", " + (state ? (state + ", ") : "") + country}
                customView={<TicketView {...item?.event} />}
                onPress={() => {
                    dispatch(setActiveEvent(item?.event))
                    setTimeout(() => {
                        if (item?.event?.is_event_member) {
                            NavigationService.navigate("EventChats", { id: item?.event?._id })
                        } else {
                            NavigationService.navigate("EventDetail", { id: item?.event?._id, type: type })
                        }
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
                //         paginationState.current = InitialPaginationState
                //         fetchEventList()
                //     }}
                // />}
                data={userEvents}
                // contentContainerStyle={{ flex: (searchedEvents ? searchedEvents : allEvents)?.length ? undefined : 1 }}
                renderItem={_renderItem}
                ItemSeparatorComponent={ListItemSeparator}
                ref={flatListRef}
                keyExtractor={(_, i) => i.toString()}
                onEndReached={() => {
                    if (!isLoading && paginationState.current?.currentPage != 0) {
                        fetchEventList()
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
