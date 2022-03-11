import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import { RootState } from 'app-store'
import { getEventChat, getEventDetail, setLoadingAction, uploadFile } from 'app-store/actions'
import { colors, Images } from 'assets'
import { useKeyboardService } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { ILocation, useDatabase } from 'database/Database'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareFlatList as FlatList } from 'react-native-keyboard-aware-scroll-view'
import { Bar } from 'react-native-progress'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { EMIT_EVENT_REPLY, EMIT_SEND_EVENT_MESSAGE, SocketService } from 'socket'
import { getImageUrl, NavigationService, scaler, shareDynamicLink, _showErrorMessage } from 'utils'
import { ChatHeader } from '../ChatHeader'
import ChatInput from '../ChatInput'
import ChatItem from '../ChatItem'

let loadMore = false
const { width } = Dimensions.get("screen")


const EventChats: FC<any> = (props) => {

    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);
    const [socketConnected] = useDatabase<boolean>('socketConnected');
    const [isChatLoader, setChatLoader] = useState(false)
    const { bottom } = useSafeAreaInsets()
    const textMessageRef = useRef("")
    const [repliedMessage, setRepliedMessage] = useState<any>(null);
    const isFocused = useIsFocused()
    const { keyboardHeight, isKeyboard } = useKeyboardService(isFocused);

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
            textMessageRef.current = ""
            inputRef.current?.clear()
            if (repliedMessage) {
                setRepliedMessage(null)
            }
            flatListRef?.current?.scrollToPosition(0, 0, true);
        } else {
            _showErrorMessage("Please enter message")
        }
    }, [repliedMessage])

    const _onChooseImage = useCallback((image, mediaType: 'photo' | 'video') => {
        dispatch(uploadFile({
            prefixType: mediaType == 'video' ? 'video' : 'messages',
            image, onSuccess: (url, thumbnail) => {
                dispatch(setLoadingAction(false))
                if (url) {
                    SocketService.emit(repliedMessage ? EMIT_EVENT_REPLY : EMIT_SEND_EVENT_MESSAGE, {
                        resource_id: activeEvent?._id,
                        parent_id: repliedMessage?._id,
                        resource_type: "event",
                        message_type: mediaType == 'video' ? 'file' : "image",
                        // thumbnail,
                        message: url,
                        media_extention: mediaType == 'video' ? url?.substring(url?.lastIndexOf('.') + 1, url?.length) : undefined
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

    const _onChooseContacts = useCallback((contacts: Array<any>) => {
        SocketService.emit(repliedMessage ? EMIT_EVENT_REPLY : EMIT_SEND_EVENT_MESSAGE, {
            resource_id: activeEvent?._id,
            // parent_id: repliedMessage?._id,
            resource_type: "event",
            message_type: "contact",
            message: "",
            contacts: contacts,
        })
        inputRef.current?.clear()
        if (repliedMessage) {
            setRepliedMessage(null)
        }
    }, [repliedMessage])

    const _onChooseLocation = useCallback((location: ILocation) => {
        SocketService.emit(repliedMessage ? EMIT_EVENT_REPLY : EMIT_SEND_EVENT_MESSAGE, {
            resource_id: activeEvent?._id,
            // parent_id: repliedMessage?._id,
            resource_type: "event",
            message_type: "location",
            message: "",
            coordinates: {
                lat: location?.latitude,
                lng: location?.longitude
            },
        })
        inputRef.current?.clear()
        if (repliedMessage) {
            // setRepliedMessage(null)
        }
    }, [repliedMessage])

    const _updateTextMessage = useCallback((text: string) => {
        textMessageRef.current = text
    }, [])

    const { eventDetail, activeEvent } = useSelector((state: RootState) => ({
        eventDetail: state?.eventDetails?.[state?.activeEvent?._id]?.event ?? state?.activeEvent,
        activeEvent: state?.activeEvent,
    }), shallowEqual)

    const { chats } = useSelector((state: RootState) => ({
        chats: state?.eventChat?.events?.[state?.activeEvent?._id]?.chats ?? [],
    }))

    const { name, city, image, state, country, _id } = eventDetail ?? activeEvent

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
            setChatLoader: chats?.length ? null : setChatLoader
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
                event={eventDetail}
                isAdmin={eventDetail?.is_admin}
                setRepliedMessage={setRepliedMessage}
            />)
    }, [eventDetail])

    const shareEvent = useCallback(() => {
        shareDynamicLink(eventDetail?.name, {
            type: "event-detail",
            id: eventDetail?._id
        });
    }, [eventDetail])

    return (
        <SafeAreaViewWithStatusBar style={{ flex: 1, backgroundColor: colors.colorWhite }} >
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
                    <TouchableOpacity onPress={() => NavigationService.navigate('SearchChatScreen', {
                        type: 'event'
                    })} style={{ paddingHorizontal: scaler(5) }} >
                        <Image source={Images.ic_lens} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(20), resizeMode: 'contain' }} />

                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={shareEvent} style={{ paddingHorizontal: scaler(5) }}  >
                        <Image source={Images.ic_share} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(20), resizeMode: 'contain' }} />
                    </TouchableOpacity> */}
                </View>
                }
            />

            <View style={styles.container} >
                <View pointerEvents={(eventDetail?.is_event_member && socketConnected) ? undefined : 'none'} style={{ flexShrink: 1 }} >
                    {isChatLoader && <Bar width={width} height={scaler(2.5)} borderRadius={scaler(10)} animated
                        borderWidth={0}
                        animationConfig={{ bounciness: 2 }}
                        animationType={'decay'}
                        indeterminateAnimationDuration={600}
                        indeterminate
                        useNativeDriver
                        color={colors.colorPrimary} />}
                    <FlatList
                        // removeClippedSubviews={false}
                        keyboardShouldPersistTaps={'handled'}
                        data={chats}
                        extraData={chats?.length}
                        keyExtractor={_ => _._id}
                        bounces={false}
                        ref={flatListRef}
                        inverted
                        onEndReached={() => {
                            if (loadMore && !isChatLoader && isFocused) {
                                console.log("End", chats[chats.length - 1]?._id);
                                loadMore = false
                                dispatch(getEventChat({
                                    id: activeEvent?._id,
                                    message_id: chats[chats.length - 1]?._id,
                                    setChatLoader: setChatLoader
                                }))
                                setTimeout(() => {
                                    loadMore = true
                                }, 2000);
                            }

                        }}
                        renderItem={_renderChatItem}
                    />
                </View>
                {eventDetail?.is_event_member ? <View style={{ marginBottom: isKeyboard && Platform.OS == 'ios' ? (keyboardHeight - bottom) : undefined, flexGrow: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' }} >

                    <ChatInput
                        // value={textMessage}
                        ref={inputRef}
                        disableButton={!socketConnected}
                        repliedMessage={repliedMessage}
                        setRepliedMessage={setRepliedMessage}
                        onChooseImage={_onChooseImage}
                        onChangeText={_updateTextMessage}
                        onChooseContacts={_onChooseContacts}
                        onChooseLocation={_onChooseLocation}
                        onPressSend={_onPressSend}
                    />
                    {!socketConnected ? <View style={{ paddingVertical: scaler(4), paddingHorizontal: scaler(10), backgroundColor: colors.colorRed }} >
                        <Text style={{ color: colors.colorWhite, textAlign: 'center', fontSize: scaler(10) }} >Chat services seems to be not connected, trying to reconnect you</Text>
                    </View> : null}
                </View> : null}

            </View >
        </SafeAreaViewWithStatusBar>
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
