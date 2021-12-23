import { RootState } from 'app-store'
import { getMutedResources, IPaginationState, IResourceType, muteUnmuteResource } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Text } from 'custom-components'
import { ListItem, ListItemSeparator } from 'custom-components/ListItem/ListItem'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SwipeListView } from 'react-native-swipe-list-view'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { getImageUrl, scaler } from 'utils'

const initialPaginationState: IPaginationState = {
    currentPage: 0,
    totalPages: -1,
    perPage: 20
}

const MutedResources: FC<any> = (props) => {

    const [userData] = useDatabase("userData")
    const type: IResourceType = props?.route?.params?.type

    const { isLoading, mutedGroups, mutedEvents } = useSelector((state: RootState) => {
        return ({
            isLoading: state.isLoading,
            mutedGroups: state?.privacyData?.mutedGroups,
            mutedEvents: state?.privacyData?.mutedEvents
        })
    }, shallowEqual)

    const mutedResource = type == 'group' ? mutedGroups : mutedEvents

    console.log("mutedResource : " + type, mutedResource)

    const paginationState = useRef<IPaginationState>(initialPaginationState)

    const [resources, setResources] = useState<Array<any>>([])

    const dispatch = useDispatch()

    const swipeListRef = useRef<SwipeListView<any>>()


    const _renderItem = useCallback(({ item, index }, rowMap) => {
        const { city, state, country } = item?.muted_groups || {}

        return (
            <ListItem
                defaultIcon={Images.ic_group_placeholder}
                title={item?.muted_groups?.name}
                icon={item?.muted_groups?.image ? { uri: getImageUrl(item?.muted_groups?.image, { width: scaler(50), type: 'groups' }) } : undefined}
                subtitle={city + ", " + (state ? (state + ", ") : "") + country}
                // isSelected={is_group_member}
                onPress={() => {

                }}
                onPressImage={() => {

                }}
            />
        )
    }, [])



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
                dispatch(muteUnmuteResource({
                    data: {
                        resource_id: item?.resource_id,
                        resource_type: item?.resource_type,
                        is_mute: '0'
                    },
                    onSuccess: (res) => {
                        setResources(_ => _.filter(_ => _._id != item?._id))
                    }
                }))
            }} style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-end', width: scaler(70), backgroundColor: colors.colorRed }}>
                <MaterialCommunityIcons color={colors.colorWhite} name={'volume-mute'} size={scaler(17)} />
                <Text style={{ marginTop: scaler(10), fontSize: scaler(11), color: colors.colorWhite }} >{Language.unmute}</Text>
            </TouchableOpacity>


        </View>
    ), [])

    useEffect(() => {
        paginationState.current = initialPaginationState
        fetchResources()
    }, [])

    const fetchResources = useCallback(() => {
        if (paginationState?.current?.currentPage == paginationState?.current?.totalPages) {
            return
        }
        let page = (paginationState?.current?.currentPage) + 1


        dispatch(getMutedResources({ resource_type: type, page, onSuccess: onSuccess }))
    }, [])

    const onSuccess = useCallback(({ pagination }) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
    }, [])


    return (
        <SafeAreaView style={styles.container} >

            <View style={{ flex: 1, width: '100%', paddingVertical: scaler(5) }} >

                <SwipeListView
                    ref={swipeListRef}
                    keyExtractor={(_, i) => i.toString()}
                    useFlatList
                    useNativeDriver
                    data={mutedResource}
                    extraData={mutedResource}
                    renderItem={_renderItem}
                    renderHiddenItem={_renderHiddenItem}
                    rightOpenValue={-scaler(70)}
                    onEndReached={() => {
                        if (!isLoading && paginationState?.current?.currentPage) {
                            fetchResources()
                        }
                    }}
                    closeOnRowOpen={true}
                    disableRightSwipe={true}
                    ItemSeparatorComponent={ListItemSeparator}
                />
            </View>

        </SafeAreaView>
    )
}

export default MutedResources

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