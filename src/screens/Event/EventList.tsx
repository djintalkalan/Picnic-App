import { RootState } from 'app-store';
import { deleteEvent, getAllEvents, IPaginationState, leaveEvent, muteUnmuteResource, pinEvent, reportResource, setActiveEvent } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { Text } from 'custom-components';
import { IBottomMenuButton } from 'custom-components/BottomMenu';
import { EventItem } from 'custom-components/ListItem/EventItem';
import { TicketView } from 'custom-components/ListItem/ListItem';
import { isEqual } from 'lodash';
import React, { FC, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Bar } from 'react-native-progress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SwipeListView } from 'react-native-swipe-list-view';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useDatabase } from 'src/database/Database';
import Language, { useLanguage } from 'src/language/Language';
import { dateStringFormat, formatAmount, getCityOnly, getFreeTicketsInMultiple, getImageUrl, NavigationService, scaler, shareDynamicLink, _hidePopUpAlert, _showBottomMenu, _showPopUpAlert } from 'utils';
import { INITIAL_PAGINATION_STATE } from 'utils/Constants';


const ITEM_HEIGHT = scaler(140)
const { width, height } = Dimensions.get('screen')
let LOADING = false

const EventList: FC<any> = (props) => {
    const insets = useSafeAreaInsets()

    const bottom = useMemo(() => {
        return insets.bottom
    }, [])

    const getButtons = useCallback((item: any) => {
        const { is_event_member, _id, is_event_admin, name } = item
        const buttons: Array<IBottomMenuButton> = []
        if (is_event_admin) {
            buttons.push({
                title: Language.edit_event, onPress: () => {
                    dispatch(setActiveEvent(item))
                    setTimeout(() => {
                        NavigationService.navigate('CreateEvent1', { id: _id })
                    }, 0);
                }
            })
            buttons.push({
                title: Language.share_event, onPress: () => {
                    shareDynamicLink(name, {
                        type: "event-detail",
                        id: _id
                    });
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

    const { allEvents, searchedEvents } = useSelector<RootState, any>((state) => ({
        allEvents: state?.event?.allEvents,
        searchedEvents: state?.homeData?.searchedEvents
    }), isEqual)

    const paginationState = useRef<IPaginationState>(INITIAL_PAGINATION_STATE)
    const [selectedLocation] = useDatabase('selectedLocation')
    const dispatch = useDispatch()
    const [isLoader, setLoader] = useState(false)
    const [searchHomeText] = useDatabase("searchHomeText")

    const swipeListRef = useRef<SwipeListView<any>>(null)

    useLayoutEffect(() => {
        console.log("selectedLocation changed", selectedLocation)
        paginationState.current = INITIAL_PAGINATION_STATE
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
        dispatch(getAllEvents({ page, onSuccess: onSuccess, setLoader: setLoader }))
    }, [])

    const onSuccess = useCallback(({ pagination }) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
    }, [])

    // console.log(allEvents);


    const _renderItem = useCallback(({ item }, rowMap) => {
        const { ticket_type, ticket_plans = [], is_event_member, city, state, country, is_free_event, event_date, event_currency, event_fees, } = item
        if (ticket_type == 'multiple') {
            var { total_free_tickets = 0, total_free_tickets_consumed = 0 } = getFreeTicketsInMultiple(ticket_plans)
        } else {
            //@ts-ignore
            var { total_free_tickets = 0, total_free_tickets_consumed = 0 } = item
        }

        return (
            <EventItem
                containerStyle={{ height: ITEM_HEIGHT }}
                // textContainerStyle={{ justifyContent: 'center' }}
                defaultIcon={Images.ic_event_placeholder}
                title={item?.name}
                // highlight={}
                icon={item?.image ? { uri: getImageUrl(item?.image, { width: ITEM_HEIGHT + scaler(30), type: 'events' }) } : undefined}
                subtitle={getCityOnly(city, state, country)}
                // subtitle={city + ", " + (state ? (state + ", ") : "") + country}
                customView={<TicketView size='small' {...item} />}
                onPress={() => {
                    dispatch(setActiveEvent(item));
                    setTimeout(() => {
                        if (item?.is_event_member) {
                            NavigationService.navigate("EventChats", { id: item?._id });
                        } else {
                            NavigationService.navigate("EventDetail", { id: item?._id });
                        }
                    }, 0);


                }}
                onPressImage={() => {
                    dispatch(setActiveEvent(item));
                    setTimeout(() => {
                        NavigationService.navigate("EventDetail", { id: item?._id });
                    }, 0);

                }}
                date={dateStringFormat(event_date, "MMM DD, YYYY", "YYYY-MM-DD", "-")}
                currency={""}
                free_tickets={!is_free_event ? (total_free_tickets - total_free_tickets_consumed) : 0}
                price={!is_free_event ? formatAmount(event_currency, event_fees) : ""} />
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
            {isLoader && <Bar width={width} height={scaler(2.5)} borderRadius={scaler(10)} animated
                borderWidth={0}
                animationConfig={{ bounciness: 2 }}
                animationType={'decay'}
                indeterminateAnimationDuration={600}
                indeterminate
                useNativeDriver
                color={colors.colorPrimary} />}
            <SwipeListView
                refreshControl={searchedEvents?.length ? undefined : <RefreshControl
                    refreshing={false}
                    onRefresh={() => {
                        paginationState.current = INITIAL_PAGINATION_STATE
                        fetchEventList()
                    }}
                />}
                data={searchedEvents && searchHomeText ? searchedEvents : allEvents}
                contentContainerStyle={{ flex: (searchedEvents ? searchedEvents : allEvents)?.length ? undefined : 1, paddingBottom: bottom + scaler(80) }}
                renderItem={_renderItem}
                renderHiddenItem={_renderHiddenItem}
                leftOpenValue={scaler(80)}
                rightOpenValue={-scaler(80)}
                directionalLockEnabled
                ItemSeparatorComponent={() => {
                    return <View style={{
                        flex: 1, height: 1,
                        backgroundColor: colors.colorD,
                        marginRight: scaler(120),
                        marginVertical: scaler(0)
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
                        <View style={{ flex: 1, padding: scaler(10), alignItems: 'flex-end', marginBottom: scaler(0), marginRight: scaler(45) }} >
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
