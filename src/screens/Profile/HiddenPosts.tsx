
import { getMutedResources, IPaginationState } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { MyHeader } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import React, { FC, useCallback, useEffect, useRef } from 'react';
import { FlatList, ListRenderItem, RefreshControl, StyleSheet, View } from 'react-native';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ChatItem from 'screens/Chat/ChatItem';
import Language, { useSystemMessageTemplate } from 'src/language/Language';
import { INITIAL_PAGINATION_STATE } from 'utils/Constants';

const HiddenPosts: FC = () => {
    const flatListRef = useRef<FlatList>(null);
    const isLoading = useSelector(_ => _?.isLoading, shallowEqual)
    const mutedPosts = useSelector(_ => _?.privacyData?.mutedPosts)

    const paginationState = useRef<IPaginationState>(INITIAL_PAGINATION_STATE)
    const dispatch = useDispatch();

    useEffect(() => {
        paginationState.current = INITIAL_PAGINATION_STATE
        fetchResources()
    }, [])

    const fetchResources = useCallback(() => {
        if (paginationState?.current?.currentPage == paginationState?.current?.totalPages) {
            return
        }
        let page = (paginationState?.current?.currentPage) + 1


        dispatch(getMutedResources({ resource_type: 'message', page, onSuccess: onSuccess }))
    }, [])

    const onSuccess = useCallback(({ pagination }: any) => {
        paginationState.current = pagination || { currentPage: 1, totalPages: 1 }
    }, [])
    const systemMessageTemplate = useSystemMessageTemplate()

    const _renderChatItem = useCallback<ListRenderItem<any>>(({ item, index }) => {
        return (
            <ChatItem
                systemMessageTemplate={systemMessageTemplate}
                {...item?.muted_messages}
                itemType={'muted'}
            />)
    }, [])


    return (
        <SafeAreaViewWithStatusBar edges={['top']} style={{ flex: 1, backgroundColor: colors.colorWhite }}>
            <MyHeader title={Language.hidden_posts} backEnabled />
            <View style={styles.container}>
                <View style={{ flex: 1 }}>
                    <FlatList
                        refreshControl={<RefreshControl
                            refreshing={false}
                            onRefresh={() => {
                                paginationState.current = INITIAL_PAGINATION_STATE
                                fetchResources()
                            }}
                        />}
                        keyboardShouldPersistTaps={'handled'}
                        data={mutedPosts}
                        extraData={mutedPosts?.length}
                        keyExtractor={_ => _.muted_message_id}
                        bounces={false}
                        ref={flatListRef}
                        // inverted
                        onEndReached={() => {
                            if (!isLoading && paginationState.current?.currentPage != 0) {
                                fetchResources()
                            }

                        }}
                        renderItem={_renderChatItem}
                    />
                </View>
            </View>
        </SafeAreaViewWithStatusBar>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#DFDFDF"
    }
})
export default HiddenPosts;