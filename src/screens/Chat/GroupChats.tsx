import { RootState } from 'app-store'
import { getGroupChat, setLoadingAction, uploadFile } from 'app-store/actions'
import { useKeyboardService } from 'custom-components'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, Platform, StyleSheet, TextInput, View } from 'react-native'
import { KeyboardAwareFlatList as FlatList } from 'react-native-keyboard-aware-scroll-view'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { EMIT_GROUP_REPLY, EMIT_SEND_GROUP_MESSAGE, SocketService } from 'socket'
import { scaler, _showErrorMessage } from 'utils'
import ChatInput from './ChatInput'
import ChatItem from './ChatItem'

let loadMore = false


export const GroupChats: FC<any> = (props) => {

    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);

    const textMessageRef = useRef("")
    const [repliedMessage, setRepliedMessage] = useState<any>(null);

    const { keyboardHeight, isKeyboard } = useKeyboardService();

    useEffect(() => {
        if (repliedMessage) {
            inputRef.current?.focus()
        }
    }, [repliedMessage])


    const _onPressSend = useCallback(() => {
        if (textMessageRef?.current) {
            SocketService.emit(repliedMessage ? EMIT_GROUP_REPLY : EMIT_SEND_GROUP_MESSAGE, {
                resource_id: activeGroup?._id,
                parent_id: repliedMessage?._id,
                resource_type: "group",
                message_type: "text",
                message: textMessageRef?.current?.trim()
            })
            inputRef.current?.clear()
            if (repliedMessage) {
                setRepliedMessage(null)
            }
        } else {
            _showErrorMessage("Please enter message")
        }
    }, [repliedMessage])

    const _onChooseImage = useCallback((image) => {
        dispatch(uploadFile({
            prefixType: 'messages',
            image, onSuccess: (url) => {
                dispatch(setLoadingAction(false))
                if (url) {
                    SocketService.emit(repliedMessage ? EMIT_GROUP_REPLY : EMIT_SEND_GROUP_MESSAGE, {
                        resource_id: activeGroup?._id,
                        parent_id: repliedMessage?._id,
                        resource_type: "group",
                        message_type: "image",
                        message: url
                    })
                    inputRef.current?.clear()
                    if (repliedMessage) {
                        setRepliedMessage(null)
                    }
                } else {
                    _showErrorMessage("Please enter message")
                }
            }
        }))
    }, [repliedMessage])

    const _updateTextMessage = useCallback((text: string) => {
        textMessageRef.current = text
    }, [])

    const { chats, groupDetail, activeGroup } = useSelector((state: RootState) => ({
        chats: state?.groupChat?.groups?.[state?.groupChat?.activeGroup?._id]?.chats ?? [],
        groupDetail: state?.groupChat?.groups?.[state?.groupChat?.activeGroup?._id]?.detail,
        activeGroup: state?.groupChat?.activeGroup
    }), shallowEqual)

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
        setTimeout(() => {
            loadMore = true
        }, 200);
        return () => { loadMore = false }
    }, [])

    const _renderChatItem = useCallback(({ item, index }) => {
        // console.log("chatItem", item)
        return (
            <ChatItem
                {...item}
                setRepliedMessage={setRepliedMessage}
            />)
    }, [chats?.length])

    return (
        <View style={styles.container} >
            <View style={{ flexShrink: 1 }} >
                <FlatList
                    keyboardShouldPersistTaps={'handled'}
                    data={chats}
                    keyExtractor={_ => _._id}
                    bounces={false}
                    ref={flatListRef}
                    inverted
                    onEndReached={() => {
                        console.log("End", chats[chats.length - 1]?._id);
                        if (loadMore) {
                            dispatch(getGroupChat({
                                id: activeGroup?._id,
                                message_id: chats[chats.length - 1]?._id
                            }))
                        }

                    }}
                    renderItem={_renderChatItem}
                />
            </View>
            <View style={{ marginBottom: isKeyboard && Platform.OS == 'ios' ? (keyboardHeight - scaler(25)) : undefined, flexGrow: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' }} >

                <ChatInput
                    // value={textMessage}
                    ref={inputRef}
                    repliedMessage={repliedMessage}
                    setRepliedMessage={setRepliedMessage}
                    onChooseImage={_onChooseImage}
                    onChangeText={_updateTextMessage}
                    onPressSend={_onPressSend}
                />
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
