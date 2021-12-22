import { useFocusEffect } from '@react-navigation/native';
import { RootState } from 'app-store';
import { getAllEvents, IPaginationState, joinEvent, muteUnmuteResource, reportResource } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { Button, Modal, Text } from 'custom-components';
import { IBottomMenuButton } from 'custom-components/BottomMenu';
import { ListItem, ListItemSeparator, TicketView } from 'custom-components/ListItem/ListItem';
import { isEqual } from 'lodash';
import React, { FC, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useDatabase } from 'src/database/Database';
import Language, { useLanguage } from 'src/language/Language';
import { getImageUrl, getShortAddress, InitialPaginationState, NavigationService, scaler, _showBottomMenu } from 'utils';


const EventList: FC<any> = (props) => {

    const getButtons = useCallback((item: any) => {
        const { is_event_member, _id, is_event_admin } = item
        const buttons: Array<IBottomMenuButton> = []
        if (!is_event_admin) {
            buttons.push({
                title: Language.mute_event, onPress: () => {
                    dispatch(muteUnmuteResource({ data: { is_mute: '1', resource_type: "event", resource_id: _id } }))
                }
            })
        }
        buttons?.push({
            title: Language.event_details,
            // onPress: () => {
            //     if (store?.getState().group?.groupDetail?.group?._id != item?._id) {
            //         dispatch(setGroupDetail(null))
            //     }
            //     setTimeout(() => {
            //         NavigationService.navigate("GroupDetail", { id: item?._id })
            //     }, 0);
            // }
        })
        if (!is_event_admin) {
            buttons.push({
                title: Language.report_event, onPress: () => {
                    dispatch(reportResource({ resource_id: _id, resource_type: 'event' }))
                    // reportedItemRef.current = item
                    // setReportAlert(true)
                }
            })
            if (is_event_member) {
                buttons.push({
                    title: Language.leave_event, textStyle: { color: colors.colorRed },
                    // onPress: () => {
                    //     dispatch(leaveEvent(_id))
                    // }
                })
            }
        }
        return buttons
    }, [useLanguage()])

    const { isLoading, allEvents } = useSelector<RootState, any>((state) => ({
        isLoading: state.isLoading,
        allEvents: state?.event?.allEvents
    }), isEqual)

    const paginationState = useRef<IPaginationState>(InitialPaginationState)
    const reportedItemRef = useRef<any>(null)
    const [isReportAlert, setReportAlert] = useState(false)

    const [selectedLocation] = useDatabase('selectedLocation')
    const dispatch = useDispatch()

    const swipeListRef = useRef<SwipeListView<any>>(null)

    useFocusEffect(useCallback(() => {

    }, []))

    useLayoutEffect(() => {
        console.log("selectedLocation changed", selectedLocation)
        paginationState.current = InitialPaginationState
        fetchEventList()
    }, [selectedLocation])

    const fetchEventList = useCallback(() => {
        if (paginationState?.current?.currentPage == paginationState?.current?.totalPages) {
            return
        }
        let page = (paginationState?.current?.currentPage) + 1
        dispatch(getAllEvents({ page, onSuccess: onSuccess }))
    }, [])

    const onSuccess = useCallback(({ pagination }) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
    }, [])

    const _renderItem = useCallback(({ item }, rowMap) => {
        const { is_event_member } = item

        return (
            <ListItem
                defaultIcon={Images.ic_event_placeholder}
                title={item?.name}
                // highlight={}
                icon={item?.image ? { uri: getImageUrl(item?.image, { width: scaler(50), type: 'events' }) } : undefined}
                subtitle={getShortAddress(item.address, item?.state)}
                // customView={item?.capacity_type == 'unlimited' ? <View style={{ alignSelf: 'center',ba }}><Text style={{ fontSize: scaler(9) }}>{Language.unlimited}</Text></View>}
                onPress={() => {

                }}
                customView={<TicketView {...item} />}

            // onPressImage={() => {
            //     if (store?.getState().group?.groupDetail?.group?._id != item?._id) {
            //         dispatch(setGroupDetail(null))
            //     }
            //     setTimeout(() => {
            //         NavigationService.navigate("GroupDetail", { id: item?._id })
            //     }, 0);
            // }}
            />
        )
    }, [])

    const _renderHiddenItem = useCallback(({ item }, rowMap) => {
        const { is_event_pinned_by_me } = item
        return (<View style={{ flex: 1, flexDirection: 'row', }} >
            <View style={{
                alignItems: 'center',
                flex: 1,
                backgroundColor: colors.colorPrimary,
                flexDirection: 'row',
                justifyContent: 'flex-start'
            }}>
                <TouchableOpacity onPress={() => {
                    swipeListRef?.current?.closeAllOpenRows()
                    if (!is_event_pinned_by_me) {
                        dispatch(joinEvent(item?._id))
                    }
                }}
                    style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-end', width: scaler(80), backgroundColor: colors.colorPrimary }}>
                    <Ionicons color={colors.colorWhite} name={'checkmark-sharp'} size={scaler(24)} />
                    <Text style={{ fontWeight: '500', marginTop: scaler(5), fontSize: scaler(11), color: colors.colorWhite }} >{is_event_pinned_by_me ? Language.joined : Language?.pin}</Text>
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
                refreshControl={<RefreshControl
                    refreshing={false}
                    onRefresh={() => {
                        paginationState.current = InitialPaginationState
                        fetchEventList()
                    }}
                />}
                data={allEvents}
                contentContainerStyle={{ flex: allEvents?.length ? undefined : 1 }}
                renderItem={_renderItem}
                renderHiddenItem={_renderHiddenItem}
                leftOpenValue={scaler(80)}
                rightOpenValue={-scaler(80)}
                directionalLockEnabled
                ItemSeparatorComponent={ListItemSeparator}
                ref={swipeListRef}
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
                keyExtractor={(_, i) => i.toString()}
                useAnimatedList
                useNativeDriver
                onEndReached={() => {
                    if (!isLoading && paginationState.current?.currentPage != 0) {
                        fetchEventList()
                    }
                }}
                closeOnRowOpen={true}
            />
            <Modal transparent visible={isReportAlert} >

                <View style={{ flex: 1, padding: '10%', backgroundColor: 'rgba(0, 0, 0, 0.49)', alignItems: 'center', justifyContent: 'center' }} >
                    <View style={styles.alertContainer} >

                        <Text style={{ marginTop: scaler(10), paddingHorizontal: '10%', textAlign: 'center', color: colors.colorPlaceholder, fontSize: scaler(14), fontWeight: '500' }} >{Language.are_you_sure_logout}</Text>

                        <Button
                            onPress={() => {
                                setReportAlert(false)
                            }}
                            backgroundColor={colors.colorRed}
                            containerStyle={{ marginTop: scaler(30), marginBottom: scaler(20) }}
                            fontSize={scaler(14)}
                            paddingHorizontal={scaler(30)}
                            title={'Yes, Logout'}
                            paddingVertical={scaler(10)}
                        />
                        <Text onPress={() => setReportAlert(false)} style={{ paddingHorizontal: '10%', textAlign: 'center', color: colors.colorBlackText, fontSize: scaler(14), fontWeight: '400' }} >{Language.cancel}</Text>
                    </View>
                </View>


            </Modal>
        </View>
    )
}

export default EventList;

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
