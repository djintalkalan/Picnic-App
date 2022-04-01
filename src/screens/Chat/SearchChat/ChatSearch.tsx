import { colors } from 'assets';
import { SingleBoldText, Text } from 'custom-components';
import React, { FC, useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { getDisplayName, scaler } from 'utils';
import { useSearchState } from './SearchProvider';

let searched = ""

const insertAtIndex = (text: string, i: number) => {
    const pair = Array.from(text)
    pair.splice(i, 0, '**')
    return pair.join('')
}

const ChatSearch: FC<any> = () => {
    const { chats, searchedText } = useSearchState()
    const _renderChatItem = useCallback(({ item, index }) => {
        // let regEx = new RegExp(searched?.trim(), "ig");
        // const message = item?.message.replace(regEx, ("**" + searched?.trim() + "**"))
        // item?.message?.toLowerCase()?.indexOf(searched);

        let message = insertAtIndex(item?.message, item?.message?.toLowerCase()?.indexOf(searched))
        message = insertAtIndex(message, message?.toLowerCase()?.indexOf(searched) + searched?.length)

        return (
            <View style={{ paddingHorizontal: scaler(24), paddingTop: scaler(17) }}>
                <Text>{getDisplayName(item?.user)}</Text>
                <View style={styles.msgContainer}>
                    <SingleBoldText fontWeight='600' style={{ fontSize: scaler(15), color: colors.colorWhite, fontWeight: '400' }} text={message} />
                </View>
            </View>
        )

    }, [searchedText])

    useEffect(() => {
        searched = searchedText
    }, [searchedText])

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }} >
                <FlatList
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps={'handled'}
                    data={chats}
                    // extraData={chats?.length}
                    keyExtractor={_ => _._id}
                    bounces={false}
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