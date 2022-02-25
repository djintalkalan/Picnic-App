import { RootState } from 'app-store';
import { deleteEvent, getAllEvents, IPaginationState, leaveEvent, muteUnmuteResource, pinEvent, reportResource, setActiveEvent } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { Text } from 'custom-components';
import { IBottomMenuButton } from 'custom-components/BottomMenu';
import { EventItem } from 'custom-components/ListItem/EventItem';
import { TicketView } from 'custom-components/ListItem/ListItem';
import { isEqual } from 'lodash';
import React, { FC, useCallback, useLayoutEffect, useRef } from 'react';
import { Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import Database, { useDatabase } from 'src/database/Database';
import Language, { useLanguage } from 'src/language/Language';
import { getImageUrl, InitialPaginationState, NavigationService, scaler, _hidePopUpAlert, _showBottomMenu, _showPopUpAlert } from 'utils';

const ITEM_HEIGHT = scaler(120)
let LOADING = false
const EventList: FC<any> = (props) => {

    const getButtons = useCallback((item: any) => {
        const { is_event_member, _id, is_event_admin } = item
        const buttons: Array<IBottomMenuButton> = []
        if (is_event_admin) {
            buttons.push({
                title: Language.edit_event, onPress: () => {
                    dispatch(setActiveEvent(item))
                    setTimeout(() => {
                        NavigationService.navigate('EditEvent', { id: _id })
                    }, 0);
                }
            })
            buttons.push({
                title: Language.share_event, onPress: () => {
                    NavigationService.navigate('EditEvent', { id: _id })
                }
            })
        }
        if (!is_event_admin) {
            if (!is_event_member) {
                buttons.push({
                    title: Language.join_event, textStyle: { color: colors.colorPrimary }, onPress: () => {
                        dispatch(setActiveEvent(item))
                        setTimeout(() => {
                            NavigationService.navigate("EventDetail", { id: _id })
                        }, 0);
                    }
                })
            }
            buttons.push({
                title: Language.mute_event, onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_mute_event,
                        onPressButton: () => {
                            dispatch(muteUnmuteResource({ data: { is_mute: '1', resource_type: "event", resource_id: _id } }))
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_mute,
                        // cancelButtonText: Language.cancel
                    })
                }
            })
        }


        buttons?.push({
            title: Language.event_details, onPress: () => {
                dispatch(setActiveEvent(item))
                setTimeout(() => {
                    NavigationService.navigate("EventDetail", { id: _id })
                }, 0);
            }
        })
        if (is_event_admin) {
            buttons.push({
                title: Language.cancel_event, textStyle: { color: colors.colorRed }, onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_cancel_event,
                        onPressButton: () => {
                            dispatch(deleteEvent(_id))
                            _hidePopUpAlert()
                        },
                        buttonStyle: { backgroundColor: colors.colorErrorRed },
                        buttonText: Language.yes_cancel,
                        // cancelButtonText: Language.cancel
                    })
                }
            })
        }
        if (!is_event_admin) {
            buttons.push({
                title: Language.report_event, onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_report_event,
                        onPressButton: () => {
                            dispatch(reportResource({ resource_id: _id, resource_type: 'event' }))
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_report,
                        // cancelButtonText: Language.cancel
                    })
                }
            })
            if (is_event_member) {
                buttons.push({
                    title: Language.cancel_reservation, textStyle: { color: colors.colorErrorRed }, onPress: () => {
                        _showPopUpAlert({
                            message: Language.are_you_sure_cancel_reservation + '?',
                            buttonStyle: { backgroundColor: colors.colorErrorRed },
                            onPressButton: () => {
                                dispatch(leaveEvent(_id))
                                _hidePopUpAlert()
                            },
                            buttonText: Language.yes_cancel,
                            // cancelButtonText: Language.cancel
                        })
                    }
                })
            }

        }
        return buttons
    }, [useLanguage()])

    const { isLoading, allEvents, searchedEvents } = useSelector<RootState, any>((state) => ({
        isLoading: state.isLoading,
        allEvents: state?.event?.allEvents,
        searchedEvents: state?.homeData?.searchedEvents
    }), isEqual)

    const paginationState = useRef<IPaginationState>(InitialPaginationState)
    const [selectedLocation] = useDatabase('selectedLocation')
    const dispatch = useDispatch()

    const swipeListRef = useRef<SwipeListView<any>>(null)

    useLayoutEffect(() => {
        console.log("selectedLocation changed", selectedLocation)
        paginationState.current = InitialPaginationState
        fetchEventList()
    }, [selectedLocation])

    const fetchEventList = useCallback(() => {
        if (LOADING || paginationState?.current?.currentPage == paginationState?.current?.totalPages) {
            return
        }
        LOADING = true
        setTimeout(() => {
            LOADING = false
        }, 2000);
        let page = (paginationState?.current?.currentPage) + 1
        dispatch(getAllEvents({ page, onSuccess: onSuccess }))
    }, [])

    const onSuccess = useCallback(({ pagination }) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
    }, [])

    // console.log(allEvents);


    const _renderItem = useCallback(({ item }, rowMap) => {
        const { is_event_member, city, state, country } = item
        return (
            <EventItem
                containerStyle={{ height: ITEM_HEIGHT }}
                // textContainerStyle={{ justifyContent: 'center' }}
                defaultIcon={Images.ic_event_placeholder}
                title={item?.name}
                // highlight={}
                icon={item?.image ? { uri: getImageUrl(item?.image, { width: ITEM_HEIGHT, type: 'events' }) } : undefined}
                subtitle={city + ", " + (state ? (state + ", ") : "") + country}
                customView={<TicketView size={'small'} {...item} />}
                onPress={() => {
                    dispatch(setActiveEvent(item))
                    setTimeout(() => {
                        if (item?.is_event_member) {
                            NavigationService.navigate("EventChats", { id: item?._id })
                        } else {
                            NavigationService.navigate("EventDetail", { id: item?._id })
                        }
                    }, 0);


                }}
                onPressImage={() => {
                    dispatch(setActiveEvent(item))
                    setTimeout(() => {
                        NavigationService.navigate("EventDetail", { id: item?._id })
                    }, 0);

                }}
            />
        )
    }, [])

    const _renderHiddenItem = useCallback(({ item }, rowMap) => {
        const { is_event_member, is_event_pinned_by_me } = item
        return (<View style={{ flex: 1, flexDirection: 'row', height: ITEM_HEIGHT }} >
            <View style={{
                alignItems: 'center',
                flex: 1,
                backgroundColor: colors.colorPrimary,
                flexDirection: 'row',
                justifyContent: 'flex-start'
            }}>
                <TouchableOpacity onPress={() => {
                    swipeListRef?.current?.closeAllOpenRows()
                    dispatch(pinEvent({ resource_id: item?._id, is_pin: is_event_pinned_by_me ? 0 : 1 }))
                }}
                    style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-end', width: scaler(80), backgroundColor: colors.colorPrimary }}>

                    <MaterialCommunityIcons color={colors.colorWhite} name={is_event_pinned_by_me ? 'check' : 'pin-outline'} size={scaler(24)} />

                    <Text style={{ fontWeight: '500', marginTop: scaler(5), fontSize: scaler(11), color: colors.colorWhite }} >{is_event_pinned_by_me ? Language.pinned : Language?.pin}</Text>
                </TouchableOpacity>
            </View>
            <View style={{
                alignItems: 'center',
                flex: 1,
                backgroundColor: "#DFDFDF",
                flexDirection: 'row',
                justifyContent: 'flex-end'
            }}>
                <TouchableOpacity onPress={() => {
                    swipeListRef?.current?.closeAllOpenRows()
                    _showBottomMenu({
                        buttons: getButtons(item)
                    })

                }} style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-end', width: scaler(80), backgroundColor: "#DFDFDF" }}>
                    <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(24)} />
                    <Text style={{ fontWeight: '500', marginTop: scaler(5), fontSize: scaler(11), color: "#7B7B7B" }} >{Language.more}</Text>
                </TouchableOpacity>


            </View>
        </View>
        )
    }, [])
    return (
        <View style={styles.container} >
            <SwipeListView
                refreshControl={searchedEvents ? undefined : <RefreshControl
                    refreshing={false}
                    onRefresh={() => {
                        paginationState.current = InitialPaginationState
                        fetchEventList()
                    }}
                />}
                data={searchedEvents && Database.getOtherString("searchHomeText") ? searchedEvents : allEvents}
                contentContainerStyle={{ flex: (searchedEvents ? searchedEvents : allEvents)?.length ? undefined : 1 }}
                renderItem={_renderItem}
                renderHiddenItem={_renderHiddenItem}
                leftOpenValue={scaler(80)}
                rightOpenValue={-scaler(80)}
                directionalLockEnabled
                ItemSeparatorComponent={() => {
                    return <View style={{
                        flex: 1, marginHorizontal: scaler(15), height: 1,
                        // backgroundColor: '#EBEBEB',
                        marginVertical: scaler(4)
                    }} />
                }}
                ref={swipeListRef}
                getItemLayout={(data: any, index: number) => (
                    { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
                )}
                ListEmptyComponent={() => {
                    return <View style={{ flex: 1, }} >
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: '35%' }} >
                            <Text style={styles.noGroup} >{Language.no_events_close}</Text>
                            <Text style={styles.youCan} >{Language.you_can} <Text onPress={() => NavigationService.navigate("CreateEvent1")} style={styles.youCanPress} >{Language.create_one} </Text>
                                {Language.by_clicking_here}
                            </Text>
                            <Text onPress={() => NavigationService.navigate("SelectLocation")} style={styles.youCanPress} >{Language.change_the_location}</Text>
                        </View>
                        <View style={{ flex: 1, padding: scaler(10), alignItems: 'flex-end', marginBottom: scaler(90), marginRight: scaler(45) }} >
                            <Image source={Images.ic_line} style={{ flex: 1, aspectRatio: 0.7145522388, }} />
                        </View>
                    </View>
                }}
                keyExtractor={(_, i) => _?._id}
                useAnimatedList
                useNativeDriver
                // onEndReached={() => {
                //     if (!isLoading && paginationState.current?.currentPage != 0) {
                //         fetchEventList()
                //     }
                // }}
                closeOnRowOpen={true}
            />
        </View>
    )
}

export default EventList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    },
    noGroup: {
        color: colors.colorBlack,
        fontSize: scaler(17),
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: scaler(20)

    },
    youCan: {
        color: colors.colorBlack,
        fontSize: scaler(12),
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: scaler(20)
    },
    youCanPress: {
        color: colors.colorPrimary,
        fontSize: scaler(12),
        fontWeight: '500',
        textAlign: 'center',

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
