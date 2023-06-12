import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import { getEventChat, getEventDetail, setLoadingAction, uploadFile } from 'app-store/actions'
import { colors, Images } from 'assets'
import { useKeyboardService } from 'custom-components'
import ColorPicker from 'custom-components/ColorPicker'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { ILocation, useDatabase } from 'database'
import { find as findUrl } from 'linkifyjs'
import { debounce } from 'lodash'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { ColorValue, Dimensions, FlatList, GestureResponderEvent, Image, ImageBackground, ListRenderItem, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Bar } from 'react-native-progress'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { EMIT_EVENT_REPLY, EMIT_SEND_EVENT_MESSAGE, EMIT_SET_CHAT_BACKGROUND, SocketService } from 'socket'
import Language, { useSystemMessageTemplate } from 'src/language/Language'
import { calculateImageUrl, getCityOnly, getImageUrl, NavigationService, scaler, _hideTouchAlert, _showTouchAlert } from 'utils'
import { DEFAULT_CHAT_BACKGROUND } from 'utils/Constants'
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
    const { keyboardHeight, isKeyboard } = useKeyboardService();
    const [link, setLink] = useState("");
    const debounceLink = useCallback(debounce((text: string) => {
        let matches = findUrl(text)
        // console.log("text", matches)
        let found = false
        matches?.some((link) => {
            if (link?.type == 'url' && link?.isLink && link?.href) {
                if (textMessageRef?.current?.trim()) {
                    setLink(link?.href)
                }
                found = true
                return true
            }
        })
        if (!found) {
            setLink("")

        }
    }, 800), [])

    useEffect(() => {
        if (repliedMessage) {
            inputRef.current?.focus()
        }
    }, [repliedMessage])

    useEffect(() => {
        console.log("socketConnected", socketConnected);
    }, [socketConnected])


    const _onPressSend = useCallback(() => {
        if (textMessageRef?.current?.trim()) {
            SocketService.emit(repliedMessage ? EMIT_EVENT_REPLY : EMIT_SEND_EVENT_MESSAGE, {
                resource_id: activeEvent?._id,
                parent_id: repliedMessage?._id,
                resource_type: "event",
                message_type: "text",
                message: textMessageRef?.current?.trim()
            })
            textMessageRef.current = ""
            inputRef.current?.clear()
            setLink(_ => _ ? "" : _)
            if (repliedMessage) {
                setRepliedMessage(null)
            }
            try {
                flatListRef?.current?.scrollToIndex({ index: 0, animated: true });
            }
            catch (e) {
                console.log(e);
            }
        }
    }, [repliedMessage])

    const _uploadImageOrVideo = useCallback((image: any, mediaType: 'photo' | 'video', text?: string) => {
        dispatch(uploadFile({
            prefixType: mediaType == 'video' ? 'video' : 'messages',
            image, onSuccess: (url, thumbnail) => {
                dispatch(setLoadingAction(false))
                if (url) {
                    SocketService.emit(repliedMessage ? EMIT_EVENT_REPLY : EMIT_SEND_EVENT_MESSAGE, {
                        resource_id: activeEvent?._id,
                        parent_id: repliedMessage?._id,
                        resource_type: "event",
                        text,
                        message_type: mediaType == 'video' ? 'file' : "image",
                        // thumbnail,
                        message: url,
                        media_extention: mediaType == 'video' ? url?.substring(url?.lastIndexOf('.') + 1, url?.length) : undefined
                    })
                    inputRef.current?.clear()
                    setLink(_ => _ ? "" : _)
                    if (repliedMessage) {
                        setRepliedMessage(null)
                    }

                    if (NavigationService.getCurrentScreen()?.name == "ImagePreview") {
                        NavigationService.goBack();
                    }
                }
            }
        }))
    }, [repliedMessage])

    const _onChooseImage = useCallback((image: any, mediaType: 'photo' | 'video') => {
        NavigationService.navigate("ImagePreview", { image, mediaType, repliedMessage, _uploadImageOrVideo, setRepliedMessage });
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
        setLink(_ => _ ? "" : _)
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
        setLink(_ => _ ? "" : _)
        if (repliedMessage) {
            // setRepliedMessage(null)
        }
    }, [repliedMessage])

    const _updateTextMessage = useCallback((text: string) => {
        textMessageRef.current = text
        if (text)
            debounceLink(text)
        else
            setLink("")
    }, [])

    const { eventDetail, activeEvent } = useSelector(state => ({
        eventDetail: state?.eventDetails?.[state?.activeEvent?._id]?.event ?? state?.activeEvent,
        activeEvent: state?.activeEvent,
    }), shallowEqual)

    const { chats } = useSelector(state => ({
        chats: state?.eventChat?.events?.[state?.activeEvent?._id]?.chats ?? [],
    }))

    const { name, city, image, state, country, event_images, _id } = eventDetail || activeEvent || {}
    const eventImage = calculateImageUrl(image, event_images)
    const colorPickerButtonRef = useRef<TouchableOpacity>(null)

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

    const systemMessageTemplate = useSystemMessageTemplate()

    const _renderChatItem = useCallback<ListRenderItem<any>>(({ item, index }) => {
        return (
            <ChatItem
                {...item}
                itemType={'event'}
                systemMessageTemplate={systemMessageTemplate}
                event={eventDetail}
                isAdmin={eventDetail?.is_admin}
                isMember={eventDetail?.status == 1 && eventDetail?.is_event_member}
                setRepliedMessage={setRepliedMessage}
            />)
    }, [eventDetail])

    const [activeBackgroundColor, setActiveBackgroundColor] = useState<ColorValue>(eventDetail?.background_color || DEFAULT_CHAT_BACKGROUND)


    const openColorPicker = useCallback((e?: GestureResponderEvent) => {
        colorPickerButtonRef.current?.measureInWindow((x, y, w, h) => {
            _showTouchAlert({
                placementStyle: {
                    // top,
                    // right: width - left,
                    top: y + h + scaler(5) + (StatusBar.currentHeight || 0),
                    right: width - (w + x)
                },
                transparent: true,
                alertComponent: () => {
                    return (
                        <ColorPicker selectedColor={activeBackgroundColor} onSelectColor={(color) => {
                            setActiveBackgroundColor(color)
                            _hideTouchAlert()
                            SocketService.emit(EMIT_SET_CHAT_BACKGROUND, { resource_id: eventDetail?._id, background_color: color, resource_type: 'event' })
                        }} />
                    )
                }
            })
        })
    }, [activeBackgroundColor])

    useEffect(() => {
        if (eventDetail?.background_color) {
            setActiveBackgroundColor(eventDetail?.background_color)
        }
    }, [eventDetail?.background_color])

    return (
        <SafeAreaViewWithStatusBar style={{ flex: 1, backgroundColor: colors.colorWhite }} >
            <ChatHeader
                title={name}
                onPress={() => {
                    setTimeout(() => {
                        NavigationService.navigate("EventDetail", { id: _id })
                    }, 0);
                }}
                // subtitle={(city ?? "") + ", " + (state ? (state + ", ") : "") + (country ?? "")}
                subtitle={getCityOnly(city, state, country)}
                icon={eventImage ? { uri: getImageUrl(eventImage, { width: scaler(50), type: 'events' }) } : undefined}
                defaultIcon={Images.ic_event_placeholder}
                rightView={<View style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <TouchableOpacity onPress={() => NavigationService.navigate('SearchChatScreen', {
                        type: 'event'
                    })} style={{ paddingHorizontal: scaler(5) }} >
                        <Image source={Images.ic_lens} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(20), resizeMode: 'contain' }} />

                    </TouchableOpacity>
                    {eventDetail?.is_admin ? <TouchableOpacity ref={colorPickerButtonRef} onPress={openColorPicker} style={{ paddingHorizontal: scaler(5) }}  >
                        <Ionicons name={'color-palette-outline'} size={scaler(23)} />
                    </TouchableOpacity> : undefined}
                </View>
                }
            />

            <ImageBackground source={Images.ic_chat_background} imageStyle={{
                opacity: 0.4,
                tintColor: "#fff",
                height: '100%', width: '100%',
                top: 0, bottom: 0
            }} style={[styles.container, {
                backgroundColor: activeBackgroundColor
            }]} >
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
                    {eventDetail?.status == 1 ? <>
                        <ChatInput
                            // value={textMessage}
                            ref={inputRef}
                            link={link}
                            resource={eventDetail}
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
                            <Text style={{ color: colors.colorWhite, textAlign: 'center', fontSize: scaler(10) }} >{Language.chat_services_down}</Text>
                        </View> : null}
                    </> : <View style={{ paddingVertical: scaler(5), paddingHorizontal: scaler(10), backgroundColor: colors.colorPlaceholder }} >
                        <Text style={{ fontStyle: 'italic', color: colors.colorWhite, textAlign: 'center', fontSize: scaler(12) }} >{Language.event_is_no_longer_available}</Text>
                    </View>
                    }
                </View> : null}


            </ImageBackground >
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
