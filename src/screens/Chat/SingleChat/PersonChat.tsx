import { useIsFocused } from '@react-navigation/native'
import { RootState } from 'app-store'
import { getPersonChat, setLoadingAction, uploadFile } from 'app-store/actions'
import { colors, Images } from 'assets'
import { useKeyboardService } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import Database, { ILocation, useDatabase } from 'database/Database'
import { find as findUrl } from 'linkifyjs'
import { debounce } from 'lodash'
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareFlatList as FlatList } from 'react-native-keyboard-aware-scroll-view'
import { Bar } from 'react-native-progress'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { EMIT_SEND_PERSONAL_MESSAGE, SocketService } from 'socket'
import { getImageUrl, NavigationService, scaler } from 'utils'
import { ChatHeader } from '../ChatHeader'
import ChatInput from '../ChatInput'
import SingleChatItem from './SingleChatItem'

let loadMore = false
const { width } = Dimensions.get("screen")

const PersonChat: FC<any> = (props) => {
    const { person } = props?.route?.params
    const chatRoomIdRef = useRef();
    useEffect(() => {
        chatRoomIdRef.current = props?.route?.params?.chatRoomId
    }, [props?.route?.params?.chatRoomId])


    const members = useMemo(() => {
        const userData = Database.getStoredValue('userData');
        return {
            [userData?._id]: userData,
            [person?._id]: person
        }
    }, [person])

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
            SocketService.emit(EMIT_SEND_PERSONAL_MESSAGE, {
                chat_room_id: "",
                user_id: person?._id,
                parent_id: repliedMessage?._id,
                message_type: "text",
                text: textMessageRef?.current?.trim()
            })
            textMessageRef.current = ""
            inputRef.current?.clear()
            setLink(_ => _ ? "" : _)
            if (repliedMessage) {
                setRepliedMessage(null)
            }
            flatListRef?.current?.scrollToPosition(0, 0, true);
        }
    }, [repliedMessage])

    const _uploadImageOrVideo = useCallback((image, mediaType: 'photo' | 'video', text?: string) => {
        dispatch(uploadFile({
            prefixType: mediaType == 'video' ? 'video' : 'messages',
            image, onSuccess: (url, thumbnail) => {
                dispatch(setLoadingAction(false))
                if (url) {
                    SocketService.emit(EMIT_SEND_PERSONAL_MESSAGE, {
                        chat_room_id: "",
                        user_id: person?._id,
                        parent_id: repliedMessage?._id,
                        message_type: mediaType == 'video' ? 'video' : "image",
                        text: text,
                        [mediaType == 'video' ? 'video' : 'image']: url
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

    const _onChooseImage = useCallback((image, mediaType: 'photo' | 'video') => {
        NavigationService.navigate("ImagePreview", { image, mediaType, repliedMessage, _uploadImageOrVideo, setRepliedMessage });
    }, [repliedMessage])

    const _onChooseContacts = useCallback((contacts: Array<any>) => {
        SocketService.emit(EMIT_SEND_PERSONAL_MESSAGE, {

            chat_room_id: chatRoomIdRef?.current,
            user_id: person?._id,
            parent_id: repliedMessage?._id,
            message_type: "contact",
            contacts: contacts,
        })
        inputRef.current?.clear()
        setLink(_ => _ ? "" : _)
        if (repliedMessage) {
            setRepliedMessage(null)
        }
    }, [repliedMessage])

    const _onChooseLocation = useCallback((location: ILocation) => {
        SocketService.emit(EMIT_SEND_PERSONAL_MESSAGE, {
            chat_room_id: chatRoomIdRef?.current,
            user_id: person?._id,
            parent_id: repliedMessage?._id,
            message_type: "location",
            location: {
                lat: location?.latitude,
                lng: location?.longitude
            },
        })
        inputRef.current?.clear()
        setLink(_ => _ ? "" : _)
        if (repliedMessage) {
            setRepliedMessage(null)
        }
    }, [repliedMessage])

    const _updateTextMessage = useCallback((text: string) => {
        textMessageRef.current = text
        if (text)
            debounceLink(text)
        else
            setLink("")
    }, [])

    const { chats } = useSelector((state: RootState) => ({
        chats: chatRoomIdRef?.current ? state?.personChat?.chatRooms?.[chatRoomIdRef?.current]?.chats : [],
    }))

    const dispatch = useDispatch()

    // useEffect(() => {
    //     setTimeout(() => {
    //         // console.log("chats", chats);
    //         // flatListRef?.current?.scrollToEnd()
    //     }, 200);
    // }, [chats])

    useEffect(() => {
        dispatch(getPersonChat({
            id: person?._id,
            chat_room_id: chatRoomIdRef?.current,
            onChatRoomIdUpdate: (id: string) => {
                props?.navigation?.setParams({ ...props?.navigation?.route?.params, chatRoomId: id })
            },
            setChatLoader: chats?.length ? null : setChatLoader
        }))
        setTimeout(() => {
            loadMore = true
        }, 200);
        return () => { loadMore = false }
    }, [])

    const _renderChatItem = useCallback(({ item, index }) => {
        return (
            <SingleChatItem
                {...item}
                person={person}
                setRepliedMessage={setRepliedMessage}
            />)
    }, [person])


    return (
        <SafeAreaViewWithStatusBar style={{ flex: 1, backgroundColor: colors.colorWhite }} >
            <ChatHeader
                title={person?.first_name + " " + person?.last_name}
                // subtitle={(city ?? "") + ", " + (state ? (state + ", ") : "") + (country ?? "")}
                icon={person?.image ? { uri: getImageUrl(person?.image, { width: scaler(50), type: 'users' }) } : undefined}
                defaultIcon={Images.ic_home_profile}
                rightView={<View style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <TouchableOpacity onPress={() => NavigationService.navigate('SearchChatScreen', {
                        type: 'person'
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
                <View style={{ flexShrink: 1 }} >
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
                                dispatch(getPersonChat({
                                    id: person?._id,
                                    chat_room_id: chatRoomIdRef?.current,
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
                <View style={{ marginBottom: isKeyboard && Platform.OS == 'ios' ? (keyboardHeight - bottom) : undefined, flexGrow: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' }} >

                    <ChatInput
                        // value={textMessage}
                        ref={inputRef}
                        link={link}
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
                </View>

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

export default PersonChat
