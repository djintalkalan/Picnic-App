import { useIsFocused } from '@react-navigation/native'
import { RootState } from 'app-store'
import { getGroupChat, setLoadingAction, uploadFile } from 'app-store/actions'
import { colors } from 'assets'
import { useKeyboardService } from 'custom-components'
import { ILocation, useDatabase } from 'database/Database'
import { find as findUrl } from 'linkifyjs'
import { debounce } from 'lodash'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { Bar } from 'react-native-progress'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { EMIT_GROUP_REPLY, EMIT_SEND_GROUP_MESSAGE, SocketService } from 'socket'
import { NavigationService, scaler } from 'utils'
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

    const { groupDetail, activeGroup } = useSelector((state: RootState) => ({
        groupDetail: state?.groupDetails?.[state?.activeGroup?._id]?.group,
        activeGroup: state?.activeGroup,
    }), shallowEqual)

    const { chats } = useSelector((state: RootState) => ({
        chats: state?.groupChat?.groups?.[state?.activeGroup?._id]?.chats ?? [],
    }))


    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getGroupChat({
            id: activeGroup?._id,
            setChatLoader: chats?.length ? null : setChatLoader
        }))
        setTimeout(() => {
            loadMore = true
        }, 200);
        return () => { loadMore = false }
    }, [])

    const _renderChatItem = useCallback(({ item, index }) => {
        return (
            <ChatItem
                {...item}
                isGroupType={true}
                group={groupDetail}
                isMember={groupDetail?.is_group_member && (groupDetail?.is_admin || groupDetail?.restriction_mode == 'open' || (groupDetail?.restriction_mode == 'subscribed' && userData?.is_premium))}
                isAdmin={groupDetail?.is_admin}
                setRepliedMessage={setRepliedMessage}
            />)
    }, [groupDetail])

    return (
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
            {groupDetail?.is_group_member ? <View style={{ marginBottom: isKeyboard && Platform.OS == 'ios' ? (keyboardHeight - bottom) : undefined, flexGrow: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' }} >
                {groupDetail?.is_admin || groupDetail?.restriction_mode == 'open' || (groupDetail?.restriction_mode == 'subscribed' && userData?.is_premium) ?
                    <><ChatInput
                        // value={textMessage}
                        ref={inputRef}
                        link={link}
                        disableButton={!socketConnected}
                        repliedMessage={repliedMessage}
                        setRepliedMessage={setRepliedMessage}
                        onChooseImage={_onChooseImage}
                        onChooseContacts={_onChooseContacts}
                        onChooseLocation={_onChooseLocation}
                        onChangeText={_updateTextMessage}
                        onPressSend={_onPressSend}
                    />
                        {!socketConnected ? <View style={{ paddingVertical: scaler(4), paddingHorizontal: scaler(10), backgroundColor: colors.colorRed }} >
                            <Text style={{ color: colors.colorWhite, textAlign: 'center', fontSize: scaler(10) }} >Chat services seems to be not connected, trying to reconnect you</Text>
                        </View> : null}
                    </> :
                    <View style={{ paddingVertical: scaler(5), paddingHorizontal: scaler(10), backgroundColor: colors.colorPlaceholder }} >
                        <Text style={{ fontStyle: 'italic', color: colors.colorWhite, textAlign: 'center', fontSize: scaler(12) }} >Only {groupDetail?.restriction_mode == 'subscribed' ? 'subscribers' : 'admin'} can send messages</Text>
                    </View>
                }
            </View> : !socketConnected ? <View style={{ paddingVertical: scaler(4), paddingHorizontal: scaler(10), backgroundColor: colors.colorRed }} >
                <Text style={{ color: colors.colorWhite, textAlign: 'center', fontSize: scaler(10) }} >Chat services seems to be not connected, trying to reconnect you</Text>
            </View> : null}
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
