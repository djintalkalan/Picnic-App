import { colors } from 'assets';
import { Text } from 'custom-components';
import React, { FC, useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { scaler } from 'utils';

const ChatSearch: FC = () => {
    const data = [
        { message: 'hello', sender: 'Sangeeta' },
        { message: 'hello this id from the sender sangeeta', sender: 'Sangeeta' },
        { message: 'hello', sender: 'Sangeeta' },
        { message: 'hello', sender: 'Sangeeta' },
    ]
    const _renderChatItem = useCallback(({ item, index }) => {
        // console.log("chatItem", item)
        return (
            <View style={{ paddingHorizontal: scaler(24), paddingTop: scaler(17) }}>
                <Text>{item?.sender}</Text>
                <View style={styles.msgContainer}>
                    <Text style={{ fontSize: scaler(15), color: colors.colorWhite, fontWeight: '400' }}>{item?.message}</Text>
                </View>
            </View>
        )

    }, [])
    return (
        <View style={styles.container}>
            <View style={{ flexShrink: 1 }} >
                <FlatList
                    keyboardShouldPersistTaps={'handled'}
                    data={data}
                    // extraData={chats?.length}
                    // keyExtractor={_ => _._id}
                    // bounces={false}
                    // ref={flatListRef}
                    // onEndReachedThreshold={1}
                    // inverted
                    // onEndReached={() => {
                    //     if (loadMore && isFocused) {
                    //         console.log("End", chats[chats.length - 1]?._id);
                    //         loadMore = false
                    //         dispatch(getGroupChat({
                    //             id: activeGroup?._id,
                    //             message_id: chats[chats.length - 1]?._id
                    //         }))
                    //     }

                    // }}
                    renderItem={_renderChatItem}
                />
            </View>

        </View>
    )
}
export default ChatSearch;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    },
    msgContainer: {
        paddingVertical: scaler(7),
        paddingHorizontal: scaler(12),
        backgroundColor: colors.colorPrimary,
        borderRadius: scaler(10),
        marginTop: scaler(4),
        alignSelf: 'baseline',
    }
})