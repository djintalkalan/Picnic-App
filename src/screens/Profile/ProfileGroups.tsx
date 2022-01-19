import { getUserGroups, IPaginationState, setActiveGroup } from 'app-store/actions'
import { RootState } from 'app-store/store'
import { colors, Images } from 'assets'
import { MyHeader } from 'custom-components'
import { ListItem } from 'custom-components/ListItem/ListItem'
import React, { FC, useCallback, useLayoutEffect, useRef } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import Language from 'src/language/Language'
import { NavigationService, scaler } from 'utils'
import { getImageUrl, InitialPaginationState } from 'utils/utilities'

const ProfileGroups: FC<any> = (props) => {

    const { isLoading, userGroups } = useSelector<RootState, any>((state) => ({
        isLoading: state.isLoading,
        userGroups: state?.userGroupsEvents?.groups,
    }))

    console.log('groups are', userGroups);


    const paginationState = useRef<IPaginationState>(InitialPaginationState)
    const dispatch = useDispatch()


    useLayoutEffect(() => {
        paginationState.current = InitialPaginationState
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
                subtitle={item?.group?.city + ", " + (item?.group?.state ? (item?.group?.state + ", ") : "") + item?.group?.country}

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
        <SafeAreaView style={styles.container} >
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
                renderItem={_renderEventMembers} />

        </SafeAreaView>
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
