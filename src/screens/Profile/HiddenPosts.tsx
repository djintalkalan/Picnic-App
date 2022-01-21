
import { getMutedResources, IPaginationState } from 'app-store/actions';
import { RootState } from 'app-store/store';
import { colors } from 'assets/Colors';
import { MyHeader } from 'custom-components';
import React, { FC, useCallback, useEffect, useRef } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, View } from 'react-native';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ChatItem from 'screens/Chat/ChatItem';
import Language from 'src/language/Language';

const initialPaginationState: IPaginationState = {
    currentPage: 0,
    totalPages: -1,
    perPage: 20
}
const HiddenPosts: FC = () => {
    const flatListRef = useRef<FlatList>(null);
    const { isLoading, mutedPosts } = useSelector((state: RootState) => {
        return ({
            isLoading: state.isLoading,
            mutedPosts: state?.privacyData?.mutedPosts,
        })
    }, shallowEqual)
    const paginationState = useRef<IPaginationState>(initialPaginationState)
    const dispatch = useDispatch();

    console.log('hidden posts', mutedPosts)

    useEffect(() => {
        paginationState.current = initialPaginationState
        fetchResources()
    }, [])

    const fetchResources = useCallback(() => {
        if (paginationState?.current?.currentPage == paginationState?.current?.totalPages) {
            return
        }
        let page = (paginationState?.current?.currentPage) + 1


        dispatch(getMutedResources({ resource_type: 'message', page, onSuccess: onSuccess }))
    }, [])

    const onSuccess = useCallback(({ pagination }) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
    }, [])


    const _renderChatItem = useCallback(({ item, index }) => {
        console.log("chatItem", item?.muted_message?.message)
        return (
            <ChatItem
                {...item}
                _id={item?.muted_messages?._id}
                message={item?.muted_messages?.message}
                message_type={item?.muted_messages?.message_type}
                isMuted={true}
                user={item?.muted_messages?.user}
            // isAdmin={eventDetail?.is_admin}
            // setRepliedMessage={setRepliedMessage}
            />)
    }, [])


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.colorWhite }}>
            <MyHeader title={Language.hidden_posts} backEnabled />
            <View style={styles.container}>
                <View style={{ flexShrink: 1 }}>
                    <FlatList
                        refreshControl={<RefreshControl
                            refreshing={false}
                            onRefresh={() => {
                                paginationState.current = initialPaginationState
                                fetchResources()
                            }}
                        />}
                        keyboardShouldPersistTaps={'handled'}
                        data={mutedPosts}
                        extraData={mutedPosts?.length}
                        keyExtractor={_ => _._id}
                        bounces={false}
                        ref={flatListRef}
                        inverted
                        onEndReached={() => {
                            if (!isLoading && paginationState.current?.currentPage != 0) {
                                fetchResources()
                            }

                        }}
                        renderItem={_renderChatItem}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#DFDFDF"
    }
})
export default HiddenPosts;