import { useIsFocused } from '@react-navigation/native'
import { getGroupChat, setLoadingAction, uploadFile } from 'app-store/actions'
import { colors, Images } from 'assets'
import { useKeyboardService } from 'custom-components'
import { ILocation, useDatabase } from 'database'
import { find as findUrl } from 'linkifyjs'
import { debounce } from 'lodash'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { ColorValue, DeviceEventEmitter, Dimensions, FlatList, ImageBackground, Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { Bar } from 'react-native-progress'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { EMIT_GROUP_REPLY, EMIT_SEND_GROUP_MESSAGE, EMIT_SET_CHAT_BACKGROUND, SocketService } from 'socket'
import Language, { useSystemMessageTemplate } from 'src/language/Language'
import { NavigationService, scaler } from 'utils'
import { DEFAULT_CHAT_BACKGROUND, UPDATE_COLOR_EVENT } from 'utils/Constants'
import ChatInput from '../ChatInput'
import ChatItem from '../ChatItem'

let loadMore = false
const { width } = Dimensions.get("screen")

export const GroupChats: FC<any> = (props) => {

    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);
    const [socketConnected] = useDatabase<boolean>('socketConnected');
    const [userData] = useDatabase<any>('userData');
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
            SocketService.emit(repliedMessage ? EMIT_GROUP_REPLY : EMIT_SEND_GROUP_MESSAGE, {
                resource_id: activeGroup?._id,
                parent_id: repliedMessage?._id,
                resource_type: "group",
                message_type: "text",
                message: textMessageRef?.current?.trim()
            })
            inputRef.current?.clear()
            textMessageRef.current = ""
            if (repliedMessage) {
                setRepliedMessage(null)
            }
            setLink(_ => _ ? "" : _)
            try {
                flatListRef?.current?.scrollToIndex({ index: 0, animated: true });
            }
            catch (e) {
                console.log(e);
            }
        }
    }, [repliedMessage])


    const _uploadImageOrVideo = useCallback((image, mediaType: 'photo' | 'video', text?: string) => {

        dispatch(uploadFile({
            prefixType: mediaType == 'video' ? 'video' : 'messages',
            image, onSuccess: (url, thumbnail) => {
                dispatch(setLoadingAction(false))
                if (url) {
                    SocketService.emit(repliedMessage ? EMIT_GROUP_REPLY : EMIT_SEND_GROUP_MESSAGE, {
                        resource_id: activeGroup?._id,
                        parent_id: repliedMessage?._id,
                        resource_type: "group",
                        message_type: mediaType == 'video' ? 'file' : "image",
                        message: url,
                        text,
                        // thumbnail,
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

    const _onChooseImage = useCallback((image, mediaType: 'photo' | 'video') => {
        NavigationService.navigate("ImagePreview", { image, mediaType, repliedMessage, _uploadImageOrVideo, setRepliedMessage });
    }, [repliedMessage])

    const _onChooseContacts = useCallback((contacts: Array<any>) => {
        SocketService.emit(repliedMessage ? EMIT_GROUP_REPLY : EMIT_SEND_GROUP_MESSAGE, {
            resource_id: activeGroup?._id,
            // parent_id: repliedMessage?._id,
            resource_type: "group",
            message_type: "contact",
            message: "",
            contacts: contacts,
        })
        inputRef.current?.clear()
        setLink(_ => _ ? "" : _)
        if (repliedMessage) {
            // setRepliedMessage(null)
        }
    }, [repliedMessage])

    const _onChooseLocation = useCallback((location: ILocation) => {
        SocketService.emit(repliedMessage ? EMIT_GROUP_REPLY : EMIT_SEND_GROUP_MESSAGE, {
            resource_id: activeGroup?._id,
            // parent_id: repliedMessage?._id,
            resource_type: "group",
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

    const { groupDetail, activeGroup } = useSelector(state => ({
        groupDetail: state?.groupDetails?.[state?.activeGroup?._id]?.group,
        activeGroup: state?.activeGroup,
    }), shallowEqual)

    const { chats } = useSelector(state => ({
        chats: state?.groupChat?.groups?.[state?.activeGroup?._id]?.chats ?? [],
    }))

    const [activeBackgroundColor, setActiveBackgroundColor] = useState<ColorValue>(groupDetail?.background_color || DEFAULT_CHAT_BACKGROUND)

    const dispatch = useDispatch()
    const changeChatBackground = useCallback((color: ColorValue) => {
        setActiveBackgroundColor(color)
        SocketService.emit(EMIT_SET_CHAT_BACKGROUND, { resource_id: groupDetail?._id, background_color: color, resource_type: 'group' })
    }, [])

    useEffect(() => {
        dispatch(getGroupChat({
            id: activeGroup?._id,
            setChatLoader: chats?.length ? null : setChatLoader
        }))
        setTimeout(() => {
            loadMore = true
        }, 200);
        const subscription = DeviceEventEmitter.addListener(UPDATE_COLOR_EVENT, changeChatBackground)
        return () => {
            loadMore = false
            subscription.remove()
        }
    }, [])

    useEffect(() => {
        if (groupDetail?.background_color) {
            setActiveBackgroundColor(groupDetail?.background_color)
        }
    }, [groupDetail?.background_color])
    const systemMessageTemplate = useSystemMessageTemplate()
    const _renderChatItem = useCallback(({ item, index }) => {
        return (
            <ChatItem
                {...item}
                systemMessageTemplate={systemMessageTemplate}
                isGroupType={true}
                group={groupDetail}
                isMember={groupDetail?.status == 1 && groupDetail?.is_group_member && (groupDetail?.is_admin || groupDetail?.restriction_mode == 'open' || (groupDetail?.restriction_mode == 'subscribed' && userData?.is_premium))}
                isAdmin={groupDetail?.is_admin}
                setRepliedMessage={setRepliedMessage}
            />)
    }, [groupDetail])

    return (
        <ImageBackground source={Images.ic_chat_background} imageStyle={{
            opacity: 0.4,
            tintColor: "#fff",
            height: '100%', width: '100%',
            top: 0, bottom: 0
        }} style={[styles.container, {
            backgroundColor: activeBackgroundColor
        }]} >
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
                    style={{ flexGrow: 1 }}
                    extraData={chats?.length}
                    keyExtractor={_ => _._id}
                    bounces={false}
                    ref={flatListRef}
                    onEndReachedThreshold={0.1}
                    inverted
                    onEndReached={() => {
                        if (loadMore && !isChatLoader && isFocused) {
                            console.log("End", chats[chats.length - 1]?._id);
                            loadMore = false
                            dispatch(getGroupChat({
                                id: activeGroup?._id,
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
                {groupDetail?.is_group_member ?
                    (groupDetail?.status == 1 && (groupDetail?.is_admin || groupDetail?.restriction_mode == 'open' || (groupDetail?.restriction_mode == 'subscribed' && userData?.is_premium)) ?
                        <ChatInput
                            // value={textMessage}
                            ref={inputRef}
                            link={link}
                            resource={groupDetail}
                            disableButton={!socketConnected}
                            repliedMessage={repliedMessage}
                            setRepliedMessage={setRepliedMessage}
                            onChooseImage={_onChooseImage}
                            onChooseContacts={_onChooseContacts}
                            onChooseLocation={_onChooseLocation}
                            onChangeText={_updateTextMessage}
                            onPressSend={_onPressSend}
                        /> :
                        <>
                            <View style={{ paddingVertical: scaler(5), paddingHorizontal: scaler(10), backgroundColor: colors.colorPlaceholder }} >
                                <Text style={{ fontStyle: 'italic', color: colors.colorWhite, textAlign: 'center', fontSize: scaler(12) }} >{groupDetail?.status == 6 ? Language.group_is_no_longer_available : Language.formatString(Language.only_can_send_messages, groupDetail?.restriction_mode == 'subscribed' ? Language.subscribers?.toLowerCase() : Language.admin?.toLowerCase())}</Text>
                            </View>
                        </>)
                    : null}
                {!socketConnected ?
                    <View style={{ paddingVertical: scaler(4), paddingHorizontal: scaler(10), backgroundColor: colors.colorRed }} >
                        <Text style={{ color: colors.colorWhite, textAlign: 'center', fontSize: scaler(10) }} >{Language.chat_services_down}</Text>
                    </View> : null}
            </View>

        </ImageBackground >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#DFDFDF"
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
