import { useFocusEffect } from '@react-navigation/native';
import { RootState } from 'app-store';
import { getAllGroups, IPaginationState } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { Text } from 'custom-components';
import { ListItem, ListItemSeparator } from 'custom-components/ListItem/ListItem';
import { isEqual } from 'lodash';
import React, { FC, useCallback, useLayoutEffect, useRef } from 'react';
import { Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useDatabase } from 'src/database/Database';
import Language from 'src/language/Language';
import { getImageUrl, InitialPaginationState, NavigationService, scaler } from 'utils';


const GroupList: FC<any> = (props) => {

    const { isLoading, allGroups } = useSelector((state: RootState) => ({
        isLoading: state.isLoading,
        allGroups: state?.allGroups
    }), isEqual)

    const paginationState = useRef<IPaginationState>(InitialPaginationState)
    const [selectedLocation] = useDatabase('selectedLocation')
    const dispatch = useDispatch()

    const swipeListRef = useRef<SwipeListView<any>>(null)

    useFocusEffect(useCallback(() => {

    }, []))

    useLayoutEffect(() => {
        console.log("selectedLocation changed", selectedLocation)
        paginationState.current = InitialPaginationState
        fetchGroupList()
    }, [selectedLocation])

    const fetchGroupList = useCallback(() => {
        if (paginationState?.current?.currentPage == paginationState?.current?.totalPages) {
            return
        }
        let page = (paginationState?.current?.currentPage) + 1
        dispatch(getAllGroups({ page, onSuccess: onSuccess }))
    }, [])

    const onSuccess = useCallback(({ pagination }) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
    }, [])

    const _renderItem = useCallback(({ item }, rowMap) => (
        <ListItem
            defaultIcon={Images.ic_group_placeholder}
            title={item?.name}
            icon={item?.image ? { uri: getImageUrl(item?.image, { width: scaler(50), type: 'groups' }) } : undefined}
            subtitle={item?.address.substring(0, item?.address?.indexOf(item?.state) - 2) || item?.address}
            isSelected={false}
        />
    ), [])

    const _renderHiddenItem = useCallback(({ item }, rowMap) => (
        <View style={{ flex: 1, flexDirection: 'row', }} >
            <View style={{
                alignItems: 'center',
                flex: 1,
                backgroundColor: colors.colorPrimary,
                flexDirection: 'row',
                justifyContent: 'flex-start'
            }}>
                <TouchableOpacity onPress={() => {

                }} style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-end', width: scaler(80), backgroundColor: colors.colorPrimary }}>
                    <Ionicons color={colors.colorWhite} name={'checkmark-sharp'} size={scaler(24)} />
                    <Text style={{ fontWeight: '500', marginTop: scaler(5), fontSize: scaler(11), color: colors.colorWhite }} >{"Join"}</Text>
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

                }} style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-end', width: scaler(80), backgroundColor: "#DFDFDF" }}>
                    <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(24)} />
                    <Text style={{ fontWeight: '500', marginTop: scaler(5), fontSize: scaler(11), color: "#7B7B7B" }} >{Language.more}</Text>
                </TouchableOpacity>


            </View>
        </View>
    ), [])
    return (
        <View style={styles.container} >
            <SwipeListView
                refreshControl={<RefreshControl
                    refreshing={false}
                    onRefresh={() => {
                        paginationState.current = InitialPaginationState
                        fetchGroupList()
                    }}
                />}
                data={allGroups}
                contentContainerStyle={{ flex: allGroups?.length ? undefined : 1 }}
                renderItem={_renderItem}
                renderHiddenItem={_renderHiddenItem}
                leftOpenValue={scaler(80)}
                rightOpenValue={-scaler(80)}
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
                        fetchGroupList()
                    }
                }}
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
})
