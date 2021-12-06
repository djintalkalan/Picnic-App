import { RootState } from 'app-store'
import { blockUnblockResource, getBlockedMembers, IPaginationState } from 'app-store/actions'
import { colors, Images } from 'assets'
import { MyHeader, Text } from 'custom-components'
import { ListItemSeparator, MemberListItem } from 'custom-components/ListItem/ListItem'
import { isEqual } from 'lodash'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SwipeListView } from 'react-native-swipe-list-view'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch, useSelector } from 'react-redux'
import { useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { getImageBaseUrl, scaler } from 'utils'

const initialPaginationState: IPaginationState = {
    currentPage: 0,
    totalPages: -1,
    perPage: 20
}

const BlockedMembers: FC<any> = (props) => {

    const [userData] = useDatabase("userData")

    const isLoading = useSelector((state: RootState) => state.isLoading, isEqual)

    const paginationState = useRef<IPaginationState>(initialPaginationState)

    const [blockedMembers, setBlockedMembers] = useState<Array<any>>([])

    const dispatch = useDispatch()

    const swipeListRef = useRef<SwipeListView>()

    const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
        };
    };


    const _renderItem = useCallback(({ item, index }, rowMap) => (
        <MemberListItem
            title={item?.blocked_users?.display_name}
            icon={item?.blocked_users?.image ? { uri: getImageBaseUrl('users', scaler(50), scaler(50)) + item?.blocked_users?.image } : null}
            defaultIcon={Images.ic_profile_image}
            isSelected={false}
        />
    ), [])

    const _renderHiddenItem = useCallback(({ item, index }, rowMap) => (


        <View style={{
            alignItems: 'center',
            backgroundColor: colors.colorRed,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end'
        }}>
            <TouchableOpacity onPress={() => {
                swipeListRef?.current?.closeAllOpenRows()
                dispatch(blockUnblockResource({
                    data: {
                        resource_id: item?.blocked_user_id,
                        resource_type: item?.resource_type,
                        is_blocked: '0'
                    },
                    onSuccess: (res) => {
                        setBlockedMembers(_ => _.filter(_ => _._id != item?._id))
                    }
                }))
            }} style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-end', width: scaler(70), backgroundColor: colors.colorRed }}>
                <MaterialCommunityIcons color={colors.colorWhite} name={'block-helper'} size={scaler(17)} />
                <Text style={{ marginTop: scaler(10), fontSize: scaler(11), color: colors.colorWhite }} >{Language.unblock}</Text>
            </TouchableOpacity>


        </View>
    ), [])

    useEffect(() => {
        paginationState.current = initialPaginationState
        fetchBlockedMembers()
    }, [])

    const fetchBlockedMembers = useCallback(() => {
        if (paginationState?.current?.currentPage == paginationState?.current?.totalPages) {
            return
        }
        let page = (paginationState?.current?.currentPage) + 1


        dispatch(getBlockedMembers({ page, onSuccess: onSuccess }))
    }, [])

    const onSuccess = useCallback(({ pagination, data }) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
        setBlockedMembers(_ => [..._, ...data])
    }, [])


    return (
        <SafeAreaView style={styles.container} >

            <MyHeader title={Language.blocked_members} />



            <View style={{ flex: 1, width: '100%', paddingVertical: scaler(5) }} >

                <SwipeListView
                    ref={swipeListRef}
                    keyExtractor={(_, i) => i.toString()}
                    useFlatList
                    useNativeDriver
                    data={blockedMembers}
                    renderItem={_renderItem}
                    renderHiddenItem={_renderHiddenItem}
                    leftOpenValue={scaler(70)}
                    rightOpenValue={-scaler(70)}
                    previewRowKey={'0'}
                    previewOpenValue={-40}
                    previewOpenDelay={3000}
                    onEndReached={() => {
                        if (!isLoading) {
                            fetchBlockedMembers()
                        }
                    }}
                    closeOnRowOpen={true}
                    ItemSeparatorComponent={ListItemSeparator}
                />
            </View>

        </SafeAreaView>
    )
}

export default BlockedMembers

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center'
    },
    heading: {
        fontSize: scaler(18),
        marginTop: scaler(10),
        // marginHorizontal: scaler(5),
        fontWeight: '600',
    },
    content: {
        fontSize: scaler(12),
        marginTop: scaler(5),
        marginBottom: scaler(10),
        fontWeight: '400',
        // marginHorizontal: scaler(5),
        color: colors.colorPlaceholder
    },
    divider: {
        backgroundColor: '#EBEBEB',
        height: 1,
        width: '100%'
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingVertical: scaler(20),
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: '400',
        fontSize: scaler(12.5),
        marginLeft: scaler(10)
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