import { RootState } from 'app-store';
import { getAllGroups, IPaginationState, joinGroup, leaveGroup, muteUnmuteResource, reportResource, setActiveGroup } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { Text } from 'custom-components';
import { IBottomMenuButton } from 'custom-components/BottomMenu';
import { ListItem, ListItemSeparator } from 'custom-components/ListItem/ListItem';
import { isEqual } from 'lodash';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, InteractionManager, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Bar } from 'react-native-progress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SwipeListView } from 'react-native-swipe-list-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useDatabase } from 'src/database/Database';
import Language, { useLanguage } from 'src/language/Language';
import { getCityOnly, getImageUrl, InitialPaginationState, NavigationService, scaler, _hidePopUpAlert, _showBottomMenu, _showPopUpAlert } from 'utils';
const ITEM_HEIGHT = scaler(90)
const { width, height } = Dimensions.get('screen')

let LOADING = false

const GroupList: FC<any> = (props) => {

    const getButtons = useCallback((item: any) => {
        const { is_group_member, _id, is_group_admin } = item
        const buttons: Array<IBottomMenuButton> = []
        if (!is_group_admin) {
            buttons.push({
                title: Language.mute_group, onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_mute_group,
                        onPressButton: () => {
                            dispatch(muteUnmuteResource({ data: { is_mute: '1', resource_type: "group", resource_id: _id } }))
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_mute
                    })
                }
            })
        }
        buttons?.push({
            title: Language.group_details, onPress: () => {
                setTimeout(() => {
                    NavigationService.navigate("GroupDetail", { id: item?._id })
                }, 0);
            }
        })
        if (!is_group_admin) {
            buttons.push({
                title: Language.report_group, onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_report_group,
                        onPressButton: () => {
                            dispatch(reportResource({ resource_id: _id, resource_type: 'group' }))
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_report
                    })
                }
            })
            if (is_group_member) {
                buttons.push({
                    title: Language.leave_group, textStyle: { color: colors.colorRed }, onPress: () => {
                        _showPopUpAlert({
                            message: Language.are_you_sure_leave_group,
                            onPressButton: () => {
                                dispatch(leaveGroup(_id))
                                _hidePopUpAlert()
                            },
                            buttonStyle: { backgroundColor: colors.colorRed },
                            buttonText: Language.yes_leave
                        })
                    }
                })
            }
        }
        return buttons
    }, [useLanguage()])

    const { allGroups, searchedGroups } = useSelector<RootState, any>((state) => ({
        allGroups: state?.group?.allGroups,
        searchedGroups: state?.homeData?.searchedGroups
    }), isEqual)
    const [isLoader, setLoader] = useState(false)

    const paginationState = useRef<IPaginationState>(InitialPaginationState)
    const [selectedLocation] = useDatabase('selectedLocation')
    const [searchHomeText] = useDatabase("searchHomeText")
    const dispatch = useDispatch()

    const swipeListRef = useRef<SwipeListView<any>>(null)

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            console.log("selectedLocation changed", selectedLocation)
            paginationState.current = InitialPaginationState
            fetchGroupList()
        })
    }, [selectedLocation])

    const fetchGroupList = useCallback(() => {
        if (LOADING || paginationState?.current?.currentPage == paginationState?.current?.totalPages) {
            return
        }
        LOADING = true
        setTimeout(() => {
            LOADING = false
        }, 2000);
        let page = (paginationState?.current?.currentPage) + 1
        dispatch(getAllGroups({ page, onSuccess, setLoader }))
    }, [])

    const onSuccess = useCallback(({ pagination }) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
    }, [])

    const _renderItem = useCallback(({ item }, rowMap) => {
        const { is_group_member, city, state, country } = item
        return (
            <ListItem
                containerStyle={{ height: ITEM_HEIGHT }}
                textContainerStyle={{ justifyContent: 'center' }}
                defaultIcon={Images.ic_group_placeholder}
                title={item?.name}
                titleTextStyle={item?.is_default_group ? { color: colors.colorPrimary, fontSize: scaler(16) } : {}}
                // highlight={}
                icon={item?.image ? { uri: getImageUrl(item?.image, { width: scaler(80), type: 'groups' }) } : undefined}
                // subtitle={city + ", " + (state ? (state + ", ") : "") + country}
                subtitle={getCityOnly(city, state, country)}
                customView={is_group_member ? <Image style={{ alignSelf: 'center', height: scaler(20), width: scaler(20) }} source={Images?.ic_member_tick} /> : null}
                onPress={() => {
                    dispatch(setActiveGroup(item))
                    NavigationService.navigate("GroupChatScreen", { id: item?._id })
                }}
                onPressImage={() => {
                    dispatch(setActiveGroup(item))
                    setTimeout(() => {
                        NavigationService.navigate("GroupDetail", { id: item?._id })
                    }, 0);
                }}
            />
        )
    }, [])

    const insets = useSafeAreaInsets()

    const bottom = useMemo(() => {
        return insets.bottom
    }, [])

    const _renderHiddenItem = useCallback(({ item }, rowMap) => {
        const { is_group_member } = item
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
                    if (!is_group_member) {
                        dispatch(joinGroup(item?._id))
                    }
                }}
                    style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-end', width: scaler(80), backgroundColor: colors.colorPrimary }}>
                    <Ionicons color={colors.colorWhite} name={is_group_member ? 'checkmark-sharp' : "person-add-sharp"} size={scaler(24)} />
                    <Text style={{ fontWeight: '500', marginTop: scaler(5), fontSize: scaler(11), color: colors.colorWhite }} >{is_group_member ? Language.joined : Language?.join}</Text>
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
                refreshControl={searchedGroups?.length ? undefined : <RefreshControl
                    refreshing={false}
                    onRefresh={() => {
                        paginationState.current = InitialPaginationState
                        fetchGroupList()
                    }}
                />}
                data={(searchedGroups && searchHomeText) ? searchedGroups : allGroups}
                contentContainerStyle={{ flex: (searchedGroups ? searchedGroups : allGroups)?.length ? undefined : 1, paddingBottom: bottom + scaler(80) }}
                renderItem={_renderItem}
                renderHiddenItem={_renderHiddenItem}
                leftOpenValue={scaler(80)}
                rightOpenValue={-scaler(80)}
                directionalLockEnabled
                getItemLayout={(data: any, index: number) => (
                    { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
                )}
                ItemSeparatorComponent={ListItemSeparator}
                ref={swipeListRef}
                ListEmptyComponent={() => {
                    return <View style={{ flex: 1, }} >
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: '35%' }} >
                            <Text style={styles.noGroup} >{Language.no_groups_close}</Text>
                            <Text style={styles.youCan} >{Language.you_can} <Text onPress={() => NavigationService.navigate("CreateGroup")} style={styles.youCanPress} >{Language.create_one} </Text>
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
                //         fetchGroupList()
                //     }
                // }}
                closeOnRowOpen={true}
            />
        </View>
    )
}

export default GroupList

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
