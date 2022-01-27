import { useFocusEffect } from '@react-navigation/native'
import { RootState } from 'app-store'
import { getEventChat, getEventDetail, setLoadingAction, uploadFile } from 'app-store/actions'
import { colors, Images } from 'assets'
import { useKeyboardService } from 'custom-components'
import { useDatabase } from 'database/Database'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareFlatList as FlatList } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { EMIT_EVENT_REPLY, EMIT_SEND_EVENT_MESSAGE, SocketService } from 'socket'
import { getImageUrl, NavigationService, scaler, shareDynamicLink, _showErrorMessage } from 'utils'
import { ChatHeader } from '../ChatHeader'
import ChatInput from '../ChatInput'
import ChatItem from '../ChatItem'

let loadMore = false


const EventChats: FC<any> = (props) => {

    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);
    const [socketConnected] = useDatabase<boolean>('socketConnected');


    const textMessageRef = useRef("")
    const [repliedMessage, setRepliedMessage] = useState<any>(null);

    const { keyboardHeight, isKeyboard } = useKeyboardService();

    useEffect(() => {
        if (repliedMessage) {
            inputRef.current?.focus()
        }
    }, [repliedMessage])

    useEffect(() => {
        console.log("socketConnected", socketConnected);
    }, [socketConnected])


    const _onPressSend = useCallback(() => {
        if (textMessageRef?.current) {
            SocketService.emit(repliedMessage ? EMIT_EVENT_REPLY : EMIT_SEND_EVENT_MESSAGE, {
                resource_id: activeEvent?._id,
                parent_id: repliedMessage?._id,
                resource_type: "event",
                message_type: "text",
                message: textMessageRef?.current?.trim()
            })
            inputRef.current?.clear()
            if (repliedMessage) {
                setRepliedMessage(null)
            }
            flatListRef?.current?.scrollToPosition(0, 0, true);
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
                    SocketService.emit(repliedMessage ? EMIT_EVENT_REPLY : EMIT_SEND_EVENT_MESSAGE, {
                        resource_id: activeEvent?._id,
                        parent_id: repliedMessage?._id,
                        resource_type: "event",
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

    const { eventDetail, activeEvent } = useSelector((state: RootState) => ({
        eventDetail: state?.eventDetails?.[state?.activeEvent?._id]?.event,
        activeEvent: state?.activeEvent,
    }), shallowEqual)

    const { chats } = useSelector((state: RootState) => ({
        chats: state?.eventChat?.events?.[state?.activeEvent?._id]?.chats ?? [],
    }))

    const { name, city, image, state, country, _id } = eventDetail ?? activeEvent
    console.log('chats are', chats);



    const dispatch = useDispatch()

    // useEffect(() => {
    //     setTimeout(() => {
    //         // console.log("chats", chats);
    //         // flatListRef?.current?.scrollToEnd()
    //     }, 200);
    // }, [chats])

    useEffect(() => {
        dispatch(getEventChat({
            id: activeEvent?._id,
        }))
        setTimeout(() => {
            loadMore = true
        }, 200);
        if (!eventDetail || activeEvent?.is_event_member != eventDetail?.is_event_member) {
            dispatch(getEventDetail(activeEvent?._id))
        }
        return () => { loadMore = false }
    }, [])

    useFocusEffect(useCallback(() => {
        if (eventDetail && !eventDetail.is_event_member) {
            NavigationService.goBack();
        }
    }, [eventDetail]))



    const _renderChatItem = useCallback(({ item, index }) => {
        return (
            <ChatItem
                {...item}
                isAdmin={eventDetail?.is_admin}
                setRepliedMessage={setRepliedMessage}
            />)
    }, [eventDetail?.is_admin])

    const shareEvent = useCallback(() => {
        shareDynamicLink(eventDetail?.name, {
            type: "event-detail",
            id: eventDetail?._id
        });
    }, [eventDetail])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.colorWhite }} >
            <ChatHeader
                title={name}
                onPress={() => {
                    setTimeout(() => {
                        NavigationService.navigate("EventDetail", { id: _id })
                    }, 0);
                }}
                subtitle={(city ?? "") + ", " + (state ? (state + ", ") : "") + (country ?? "")}
                icon={image ? { uri: getImageUrl(image, { width: scaler(50), type: 'events' }) } : undefined}
                defaultIcon={Images.ic_event_placeholder}
                rightView={<View style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <TouchableOpacity onPress={() => {

                    }} style={{ paddingHorizontal: scaler(5) }} >
                        <Image source={Images.ic_lens} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(20), resizeMode: 'contain' }} />

                    </TouchableOpacity>
                    <TouchableOpacity onPress={shareEvent} style={{ paddingHorizontal: scaler(5) }}  >
                        <Image source={Images.ic_share} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(20), resizeMode: 'contain' }} />
                    </TouchableOpacity>
                </View>
                }
            />



            <View style={styles.container} >
                <View pointerEvents={(eventDetail?.is_event_member && socketConnected) ? undefined : 'none'} style={{ flexShrink: 1 }} >
                    <FlatList
                        keyboardShouldPersistTaps={'handled'}
                        data={chats}
                        extraData={chats?.length}
                        keyExtractor={_ => _._id}
                        bounces={false}
                        ref={flatListRef}
                        inverted
                        onEndReached={() => {
                            console.log("End", chats[chats.length - 1]?._id);
                            if (loadMore) {
                                dispatch(getEventChat({
                                    id: activeEvent?._id,
                                    message_id: chats[chats.length - 1]?._id
                                }))
                            }

                        }}
                        renderItem={_renderChatItem}
                    />
                </View>
                {eventDetail?.is_event_member ? <View style={{ marginBottom: isKeyboard && Platform.OS == 'ios' ? (keyboardHeight - scaler(25)) : undefined, flexGrow: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' }} >

                    <ChatInput
                        // value={textMessage}
                        ref={inputRef}
                        disableButton={!socketConnected}
                        repliedMessage={repliedMessage}
                        setRepliedMessage={setRepliedMessage}
                        onChooseImage={_onChooseImage}
                        onChangeText={_updateTextMessage}
                        onPressSend={_onPressSend}
                    />
                    {!socketConnected ? <View style={{ paddingVertical: scaler(4), paddingHorizontal: scaler(10), backgroundColor: colors.colorRed }} >
                        <Text style={{ color: colors.colorWhite, textAlign: 'center', fontSize: scaler(10) }} >Chat services seems to be not connected, trying to reconnect you</Text>
                    </View> : null}
                </View> : null}

            </View >
        </SafeAreaView>
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
    joinText: {
        color: colors.colorPrimary,
        fontSize: scaler(14)
    }
})

export default EventChats
