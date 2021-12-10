import { useFocusEffect } from '@react-navigation/native';
import { RootState } from 'app-store';
import { getAllGroups, IPaginationState } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { ListItem, ListItemSeparator } from 'custom-components/ListItem/ListItem';
import { isEqual } from 'lodash';
import React, { FC, useCallback, useLayoutEffect, useRef } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useDispatch, useSelector } from 'react-redux';
import { useDatabase } from 'src/database/Database';
import { InitialPaginationState, scaler } from 'utils';


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

    const _renderItem = useCallback((data, rowMap) => (
        <ListItem
            defaultIcon={Images.ic_profile_image}
            title={"Soccer meetup"}
            icon={Images.ic_profile_image}
            subtitle={"Los Angeles, USA "}
            isSelected={false}
        />
    ), [])

    const _renderHiddenItem = useCallback((data, rowMap) => (
        <View style={{
            alignItems: 'center',
            backgroundColor: '#DDD',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 15,
        }}>
        </View>
    ), [])
    return (
        <SafeAreaView style={styles.container} >
            <SwipeListView
                refreshControl={<RefreshControl
                    refreshing={false}
                    onRefresh={() => {
                        paginationState.current = InitialPaginationState
                        fetchGroupList()
                    }}
                />}
                data={allGroups}
                renderItem={_renderItem}
                renderHiddenItem={_renderHiddenItem}
                leftOpenValue={scaler(80)}
                rightOpenValue={-scaler(80)}
                ItemSeparatorComponent={ListItemSeparator}
                ref={swipeListRef}
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
        </SafeAreaView>
    )
}

export default GroupList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    }
})
