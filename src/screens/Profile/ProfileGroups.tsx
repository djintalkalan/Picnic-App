import { getUserGroups, IPaginationState, setActiveGroup } from 'app-store/actions'
import { colors, Images } from 'assets'
import { MyHeader, Text } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { ListItem } from 'custom-components/ListItem/ListItem'
import React, { FC, useCallback, useLayoutEffect, useRef } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import Language from 'src/language/Language'
import { getCityOnly, getImageUrl, NavigationService, scaler } from 'utils'
import { INITIAL_PAGINATION_STATE } from 'utils/Constants'

const ProfileGroups: FC<any> = (props) => {

    const { isLoading, userGroups } = useSelector(state => ({
        isLoading: state.isLoading,
        userGroups: state?.userGroupsEvents?.groups,
    }))

    const paginationState = useRef<IPaginationState>(INITIAL_PAGINATION_STATE)
    const dispatch = useDispatch()


    useLayoutEffect(() => {
        paginationState.current = INITIAL_PAGINATION_STATE
        fetchUserGroups()
    }, [])

    const fetchUserGroups = useCallback(() => {
        if (paginationState?.current?.currentPage == paginationState?.current?.totalPages) {
            return
        }
        let page = (paginationState?.current?.currentPage) + 1
        dispatch(getUserGroups({ page, onSuccess: onSuccess }))
    }, [])

    const onSuccess = useCallback(({ pagination }) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
    }, [])

    const _renderEventMembers = useCallback(({ item, index }) => {
        return (
            <ListItem
                defaultIcon={Images.ic_group_placeholder}
                title={item?.group?.name}
                // highlight={}
                icon={item?.group?.image ? { uri: getImageUrl(item?.group?.image, { type: 'groups', width: scaler(46) }) } : undefined}
                // subtitle={item?.group?.city + ", " + (item?.group?.state ? (item?.group?.state + ", ") : "") + item?.group?.country}
                subtitle={getCityOnly(item?.group?.city, item?.group?.state, item?.group?.country)}

                onPress={() => {
                    dispatch(setActiveGroup(item?.group))
                    NavigationService.navigate("GroupChatScreen", { id: item?.resource_id })
                }}
                onPressImage={() => {
                    dispatch(setActiveGroup(item?.group))
                    setTimeout(() => {
                        NavigationService.navigate("GroupDetail", { id: item?.group?._id })
                    }, 0);
                }}
            />
        )
    }, [])


    return (
        <SafeAreaViewWithStatusBar style={styles.container} >
            <MyHeader backEnabled title={Language.groups} />
            <FlatList
                data={userGroups}
                keyExtractor={(_, i) => i.toString()}
                ItemSeparatorComponent={() => <View style={{ flex: 1, height: 1, backgroundColor: '#EBEBEB' }} />}
                onEndReached={() => {
                    if (!isLoading && paginationState.current?.currentPage != 0) {
                        fetchUserGroups()
                    }
                }}
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                ListEmptyComponent={<View style={{ flex: 1, justifyContent: 'center' }} ><Text style={{ textAlign: 'center' }} >{Language.groups_not_available}</Text></View>}

                renderItem={_renderEventMembers} />

        </SafeAreaViewWithStatusBar>
    )
}

export default ProfileGroups

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        paddingHorizontal: scaler(10)
    }
})
