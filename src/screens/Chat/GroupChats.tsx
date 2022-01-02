import { RootState } from 'app-store'
import { getGroupChat } from 'app-store/actions'
import { useKeyboardService } from 'custom-components'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, InputAccessoryView, Platform, StyleSheet, TextInput, View } from 'react-native'
import { KeyboardAwareFlatList as FlatList } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch, useSelector } from 'react-redux'
import { scaler } from 'utils'
import ChatInput from './ChatInput'
import ChatItem from './ChatItem'

export const GroupChats: FC<any> = (props) => {

    const flatListRef = useRef<FlatList>(null);
    const inputRefAccess = useRef<TextInput>(null);
    const inputRef = useRef<TextInput>(null);

    const [textMessage, setTextMessage] = useState("");
    const [repliedMessage, setRepliedMessage] = useState(null);

    const { keyboardHeight, isKeyboard } = useKeyboardService();

    const isEqual = useCallback((l, r) => {
        return l?.chats?.length == r?.chats?.length
    }, [])

    useEffect(() => {
        if (repliedMessage) {
            console.log("Deepak");

            !(inputRef.current?.isFocused() || inputRefAccess.current?.isFocused()) && inputRef.current?.focus()
        }
    }, [repliedMessage])

    useEffect(() => {
        if (isKeyboard)
            setTimeout(() => {
                inputRefAccess.current?.focus()
            }, 200)
    }, [isKeyboard])

    const _onPressSend = useCallback(() => {

    }, [textMessage])


    const { chats, groupDetail, activeGroup } = useSelector((state: RootState) => ({
        chats: state?.groupChat?.groups?.[state?.groupChat?.activeGroup?._id]?.chats ?? [],
        groupDetail: state?.groupChat?.groups?.[state?.groupChat?.activeGroup?._id]?.detail,
        activeGroup: state?.groupChat?.activeGroup
    }), isEqual)

    const dispatch = useDispatch()

    useEffect(() => {
        setTimeout(() => {
            console.log("chats", chats);
            // flatListRef?.current?.scrollToEnd()
        }, 200);
    }, [chats])

    useEffect(() => {
        dispatch(getGroupChat({
            id: activeGroup?._id,
        }))
    }, [])

    const _renderChatItem = useCallback(({ item, index }) => {
        // console.log("chatItem", item)
        return (
            <ChatItem
                {...item}
                setRepliedMessage={setRepliedMessage}
            />)
    }, [])

    return (
        <View style={styles.container} >
            <View style={{ flexShrink: 1 }} >
                <FlatList
                    keyboardShouldPersistTaps={'handled'}
                    data={chats}
                    bounces={false}
                    ref={flatListRef}
                    inverted
                    onEndReached={() => {
                        console.log("End");
                    }}
                    renderItem={_renderChatItem}
                />
            </View>
            <View style={{ flexGrow: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' }} >
                {Platform.OS == 'ios' &&
                    <InputAccessoryView style={{ alignItems: 'flex-end' }} nativeID={'done'}   >
                        <View style={{ width: '100%' }} >
                            <ChatInput
                                ref={inputRefAccess}
                                repliedMessage={repliedMessage}
                                value={textMessage}
                                onChangeText={setTextMessage}
                                setRepliedMessage={setRepliedMessage}
                                onPressSend={_onPressSend}
                            />

                            {/* <View style={styles.accessory}>
                                <Button
                                    onPress={() => Keyboard.dismiss()}
                                    title="Done"
                                />
                            </View> */}
                        </View>
                    </InputAccessoryView>}
                {true ? <ChatInput
                    value={textMessage}
                    ref={inputRef}
                    repliedMessage={repliedMessage}
                    setRepliedMessage={setRepliedMessage}
                    onChangeText={setTextMessage}
                    onPressSend={_onPressSend}
                /> : null}
            </View>
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#DFDFDF"
    },

    accessory: {
        width: Dimensions.get('window').width,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        paddingHorizontal: scaler(8)
    },
})
