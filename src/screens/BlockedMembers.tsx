import { RootState } from 'app-store'
import { blockUnblockResource, getBlockedMembers, IPaginationState } from 'app-store/actions'
import { removeFromBlockedMember } from 'app-store/actions/profileActions'
import { colors, Images } from 'assets'
import { MyHeader, Text } from 'custom-components'
import { ListItemSeparator, MemberListItem } from 'custom-components/ListItem/ListItem'
import { isEqual } from 'lodash'
import React, { FC, useCallback, useEffect, useRef } from 'react'
import { InteractionManager, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SwipeListView } from 'react-native-swipe-list-view'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch, useSelector } from 'react-redux'
import { useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { getImageBaseUrl, InitialPaginationState, scaler } from 'utils'

const BlockedMembers: FC<any> = (props) => {

    const [userData] = useDatabase("userData")

    const { isLoading, blockedUsers } = useSelector((state: RootState) => ({
        isLoading: state.isLoading,
        blockedUsers: state?.privacyData?.blockedUsers
    }), isEqual)

    const paginationState = useRef<IPaginationState>(InitialPaginationState)

    const dispatch = useDispatch()

    const swipeListRef = useRef<SwipeListView<any>>(null)


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
                        dispatch(removeFromBlockedMember(item?._id))
                    }
                }))
            }} style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-end', width: scaler(70), backgroundColor: colors.colorRed }}>
                <MaterialCommunityIcons color={colors.colorWhite} name={'block-helper'} size={scaler(17)} />
                <Text style={{ marginTop: scaler(10), fontSize: scaler(11), color: colors.colorWhite }} >{Language.unblock}</Text>
            </TouchableOpacity>


        </View>
    ), [])

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            paginationState.current = InitialPaginationState
            fetchBlockedMembers()
        })
    }, [])

    const fetchBlockedMembers = useCallback(() => {
        if (paginationState?.current?.currentPage == paginationState?.current?.totalPages) {
            return
        }
        let page = (paginationState?.current?.currentPage) + 1
        dispatch(getBlockedMembers({ page, onSuccess: onSuccess }))
    }, [])

    const onSuccess = useCallback(({ pagination }) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
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
                    data={blockedUsers}
                    renderItem={_renderItem}
                    renderHiddenItem={_renderHiddenItem}
                    leftOpenValue={scaler(70)}
                    rightOpenValue={-scaler(70)}
                    onEndReached={() => {
                        if (!isLoading && paginationState.current?.currentPage != 0) {
                            fetchBlockedMembers()
                        }
                    }}
                    closeOnRowOpen={true}
                    disableRightSwipe
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