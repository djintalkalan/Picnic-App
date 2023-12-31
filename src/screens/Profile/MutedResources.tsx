import { getMutedResources, IPaginationState, IResourceType, muteUnmuteResource } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Text } from 'custom-components'
import { ListItem, ListItemSeparator } from 'custom-components/ListItem/ListItem'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { getCityOnly, getImageUrl, scaler } from 'utils'
import { INITIAL_PAGINATION_STATE } from 'utils/Constants'

const MutedResources: FC<any> = (props) => {

    const [userData] = useDatabase("userData")
    const type: IResourceType = props?.route?.params?.type

    const { isLoading, mutedGroups, mutedEvents } = useSelector(state => {
        return ({
            isLoading: state.isLoading,
            mutedGroups: state?.privacyData?.mutedGroups,
            mutedEvents: state?.privacyData?.mutedEvents
        })
    }, shallowEqual)

    const mutedResource = type == 'group' ? mutedGroups : mutedEvents

    const paginationState = useRef<IPaginationState>(INITIAL_PAGINATION_STATE)

    const [resources, setResources] = useState<Array<any>>([])

    const dispatch = useDispatch()

    const swipeListRef = useRef<SwipeListView<any>>(null)


    const _renderItem = useCallback(({ item, index }, rowMap) => {
        const { name, image, city, state, country } = (type == 'group' ? item?.muted_groups : item?.muted_events) || {}

        return (
            <ListItem
                defaultIcon={Images.ic_group_placeholder}
                title={name}
                //@ts-ignore
                icon={image ? { uri: getImageUrl(image, { width: scaler(50), type: (type + 's') }) } : undefined}
                // subtitle={city + ", " + (state ? (state + ", ") : "") + country}
                subtitle={getCityOnly(city, state, country)}
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
                        resource_id: item?.resource_id ?? item?.muted_event_id,
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
        paginationState.current = INITIAL_PAGINATION_STATE
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
        <View style={styles.container} >
            <View style={{ flex: 1, width: '100%' }} >
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

        </View>
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