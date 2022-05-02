import Clipboard from '@react-native-community/clipboard'
import { config } from 'api'
import { colors, Images, MapStyle } from 'assets'
import { Preview, Text } from 'custom-components'
import { IBottomMenuButton } from 'custom-components/BottomMenu'
import ImageLoader from 'custom-components/ImageLoader'
import { useVideoPlayer } from 'custom-components/VideoProvider'
import Database, { useDatabase } from 'database/Database'
import { find as findUrl } from 'linkifyjs'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Dimensions, GestureResponderEvent, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import Contacts, { Contact } from 'react-native-contacts'
import MapView, { Marker } from 'react-native-maps'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { EMIT_PERSONAL_LIKE_UNLIKE, SocketService } from 'socket'
import Language from 'src/language/Language'
import { getDisplayName, getImageUrl, launchMap, scaler, _hidePopUpAlert, _showBottomMenu, _showPopUpAlert, _showToast, _zoomImage } from 'utils'

interface ISingleChatItem {
    _id: string
    person: any
    created_by: any
    is_system_message?: 1 | 0
    user?: any,
    parent_message: any,
    parent_id: string,
    setRepliedMessage: (msg: any) => void
    message_type: any
    is_message_liked_by_me: boolean
    message_liked_by_users: Array<any>
    message_deleted_by_user: any
    location: { lat: string, lng: string }
    text: string
    image: string
    video: string
    document: string
    contacts: Array<Contact>
    user_id: string
    chat_room_id: string
    message_deleted_user_id: string
    coordinates: { lat: string, lng: string }
    is_message_read_by_me: boolean
}
const { height, width } = Dimensions.get('screen')

const ASPECT_RATIO = width / height;
const DefaultDelta = {
    latitudeDelta: 0.05,
    longitudeDelta: 0.05 * ASPECT_RATIO,
}

const SingleChatItem: FC<any> = (props: ISingleChatItem) => {
    const { loadVideo } = useVideoPlayer()
    const [link, setLink] = useState("")
    const { _id, user_id, text, image, video, message_type,
        location, contacts, coordinates, parent_message,
        is_message_read_by_me, is_message_liked_by_me,
        message_liked_by_users, person, setRepliedMessage } = props

    const { display_name, userImage, userId } = useMemo(() => ({
        display_name: getDisplayName(person),
        userImage: person?.image,// user?.account_deleted == 1 ? null : user?.image,
        userId: person?._id
    }), [person])

    const [userData] = useDatabase<any>("userData");

    const likeString = useMemo<React.ReactNode>(() => {
        let string: any = [<Text key='1' >Like</Text>]
        if (is_message_liked_by_me) {
            string = [<Text key='2'>Liked by </Text>, <Text key='3' style={{ fontWeight: '600' }} >You</Text>]
            if (message_liked_by_users?.length == 2) {
                string.push(<Text key='4'> and </Text>)
                string.push(<Text key='5' style={{ fontWeight: '500' }} >{getDisplayName(person)}</Text>)
            }
        } else if (message_liked_by_users?.length) {
            string = [<Text key='6'>Liked by </Text>, <Text key='7' style={{ fontWeight: '500' }} >{getDisplayName(person)}</Text>]
        }
        return string
    }, [is_message_liked_by_me, message_liked_by_users, props])

    useEffect(() => {

        if (message_type == 'text') {
            const matches = findUrl(text?.toLowerCase())
            let found = false
            matches?.some((link) => {
                if (link?.type == 'url' && link?.isLink && link?.href) {
                    found = true
                    setLink(link?.href)
                    return true
                }
            })
            if (!found) {
                setLink("")
            }
        }
    }, [])
    const DELETE_TEXT = "{{admin_name}} has deleted post from {{display_name}}"

    const { myMessage } = useMemo(() => {
        return {
            myMessage: user_id == userData?._id,
        }
    }, [userData, user_id])

    const _onCopy = useCallback((e: GestureResponderEvent) => {
        let gravity = 'BOTTOM'
        try {
            if (e?.nativeEvent?.pageY) {
                const d = ((height) / 3)
                // if (e.nativeEvent.pageY < d) {
                //     gravity = "TOP"
                // } else
                if (e?.nativeEvent?.pageY < (2 * d)) {
                    gravity = "CENTER"
                }

            }
        }
        catch (e) {
            console.log("e", e);

        }
        Clipboard?.setString(message_type == 'file' || message_type == 'image' ? text?.trim() : text?.trim());
        // console.log("e", e, ((height - scaler(80)) / 3));
        //@ts-ignore
        _showToast("Copied", 'SHORT', gravity);
    }, [])

    const _openChatActionMenu = useCallback(() => {
        let buttons: IBottomMenuButton[] = [{
            title: Language.reply,
            onPress: () => setRepliedMessage(
                {
                    _id,
                    user: person?._id != user_id ? Database.getStoredValue("userData") : person,
                    message: message_type == 'video' ? video : message_type == 'image' ? image : text,
                    message_type: message_type == 'video' ? 'file' : message_type,
                    contacts,
                    coordinates: location
                }),
        }]
        if (myMessage) {
            buttons?.push({
                title: Language.delete, onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_delete_message,
                        onPressButton: () => {
                            // SocketService.emit(isGroupType ? EMIT_GROUP_MESSAGE_DELETE : EMIT_EVENT_MESSAGE_DELETE, {
                            //     resource_id: group?._id,
                            //     message_id: _id
                            // })
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_delete
                    })

                }
            })
        }

        _showBottomMenu({ buttons: buttons })
    }, [])

    const renderMap = useMemo(() => {
        if (!location?.lat || !location?.lng) {
            return null
        }
        const region = {
            latitude: parseFloat(location?.lat),
            longitude: parseFloat(location?.lng),
            ...DefaultDelta
        }

        return <TouchableOpacity activeOpacity={0.8} onPress={() => {
            launchMap({ lat: parseFloat(location?.lat), long: parseFloat(location?.lng) })
        }} style={{
            borderRadius: scaler(15), overflow: 'hidden',
            padding: scaler(5),
            height: (width - scaler(20)) / 2.8, width: (width - scaler(20)) / 1.5, backgroundColor: 'white'
        }} >
            <View style={{ flex: 1, overflow: 'hidden', borderRadius: scaler(15), }} pointerEvents='none' >
                <MapView
                    style={{ flex: 1, overflow: 'hidden' }}
                    minZoomLevel={2}
                    customMapStyle={MapStyle}
                    provider={'google'}
                    cacheEnabled
                    showsMyLocationButton={false}
                    initialRegion={region} >
                    <Marker coordinate={region} >
                        <Image style={{ height: scaler(20), width: scaler(20), resizeMode: 'contain' }} source={Images.ic_marker} />
                    </Marker>

                </MapView>
            </View>
        </TouchableOpacity>
    }, [JSON.stringify(location)])

    if (message_type == 'image') {

        return <View style={{ width: '100%', padding: scaler(10), backgroundColor: colors.colorWhite, marginVertical: scaler(10) }} >
            <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                <View style={styles.imageContainer}>
                    <ImageLoader
                        placeholderSource={Images.ic_home_profile}
                        source={{ uri: getImageUrl(myMessage ? userData?.image : userImage, { width: scaler(30), type: 'users' }) }}
                        style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                </View>
                <Text style={[styles.imageDisplayName, { color: colors.colorBlack }]} >{myMessage ? userData?.username : display_name}</Text>
                <TouchableOpacity onPress={_openChatActionMenu} style={{ padding: scaler(5) }} >
                    <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity>
            </View>
            <ImageLoader
                placeholderSource={Images.ic_image_placeholder}
                borderRadius={scaler(15)}
                resizeMode={'cover'}
                onPress={() => _zoomImage(getImageUrl(image, { type: 'messages' }))}
                source={{ uri: getImageUrl(image, { type: 'messages' }) }}
                //@ts-ignore
                style={{ resizeMode: 'cover', marginVertical: scaler(10), borderRadius: scaler(15), height: (width - scaler(20)) / 1.9, width: width - scaler(20) }} />
            {text ? <View style={{ width: '100%', paddingHorizontal: scaler(15), paddingBottom: scaler(8), paddingTop: scaler(3) }} >
                <Text autoLink onLongPress={_onCopy}
                    style={[styles.message, { color: colors.colorBlackText, flex: 1, }]} >{text?.trim()}</Text>
            </View>
                : null}
            <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                <TouchableOpacity onPress={() => {
                    SocketService?.emit(EMIT_PERSONAL_LIKE_UNLIKE, {
                        message_id: _id,
                        is_like: is_message_liked_by_me ? "0" : '1'
                    })
                }} >
                    <Image source={Images.ic_smiley} style={{
                        resizeMode: 'contain',
                        height: scaler(20), width: scaler(20), marginHorizontal: scaler(5),
                        tintColor: is_message_liked_by_me ? colors.colorPrimary : undefined
                    }} />
                </TouchableOpacity>
                <Text children={likeString} style={[styles.likeBy, { flex: 0, flexShrink: 1, color: 'black' }]} />
            </View>
        </View>
    }

    if (message_type == 'video') {
        return <View style={{ width: '100%', padding: scaler(10), backgroundColor: colors.colorWhite, marginBottom: scaler(10) }} >
            <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                <View style={styles.imageContainer}>
                    <ImageLoader
                        placeholderSource={Images.ic_home_profile}
                        source={{ uri: getImageUrl(myMessage ? userData?.image : userImage, { width: scaler(30), type: 'users' }) }}
                        style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                </View>
                <Text style={[styles.imageDisplayName, { color: colors.colorBlack }]} >{myMessage ? userData?.username : display_name}</Text>
                <TouchableOpacity onPress={_openChatActionMenu} style={{ padding: scaler(5) }} >
                    <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity>
            </View>
            <ImageLoader
                reload={true}
                placeholderSource={Images.ic_image_placeholder}
                borderRadius={scaler(15)}
                source={{ uri: config.VIDEO_URL + (video?.substring(0, video?.lastIndexOf("."))) + "-00001.png" }}// getImageUrl(message, { width: width, type: 'messages' }) }}
                //@ts-ignore
                style={{ resizeMode: 'contain', marginVertical: scaler(10), borderRadius: scaler(15), height: (width - scaler(20)) / 1.9, width: width - scaler(20) }} />
            <TouchableOpacity onPress={() => {
                loadVideo && loadVideo(config.VIDEO_URL + video)
            }} style={{ alignItems: 'center', justifyContent: 'center', position: 'absolute', top: scaler(55), bottom: scaler(40), left: width / 3, right: width / 3, }} >
                {/* <View style={{ backgroundColor: colors.colorWhite, borderRadius: scaler(30), height: scaler(60), width: scaler(60) }} > */}
                <Ionicons color={colors.colorPrimary} name="play-circle" size={scaler(60)} />
                {/* </View> */}
            </TouchableOpacity>
            {text ? <View style={{ width: '100%', paddingHorizontal: scaler(15), paddingBottom: scaler(8), paddingTop: scaler(3) }} >
                <Text autoLink onLongPress={_onCopy}
                    style={[styles.message, { color: colors.colorBlackText, flex: 1, }]} >{text?.trim()}</Text>
            </View>
                : null}
            <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                <TouchableOpacity onPress={() => {
                    SocketService?.emit(EMIT_PERSONAL_LIKE_UNLIKE, {
                        message_id: _id,
                        is_like: is_message_liked_by_me ? "0" : '1'
                    })
                }} >
                    <Image source={Images.ic_smiley} style={{
                        resizeMode: 'contain',
                        height: scaler(20), width: scaler(20), marginHorizontal: scaler(5),
                        tintColor: is_message_liked_by_me ? colors.colorPrimary : undefined
                    }} />
                </TouchableOpacity>
                <Text children={likeString} style={[styles.likeBy, { flex: 0, flexShrink: 1, color: 'black' }]} />
            </View>
        </View>
    }

    if (message_type == 'contact') {
        const c: Contact = { ...props?.contacts?.[0] }
        if (!c.company) c.company = ""
        const map = <TouchableOpacity activeOpacity={0.8} onPress={() => {
            Contacts.openContactForm(c).then(v => {
                console.log("v", v);

            }).catch(e => {
                console.log("Error", e);

            })
        }} style={{
            borderRadius: scaler(15), overflow: 'hidden',
            padding: scaler(5),
            marginBottom: scaler(10),
            // maxWidth: '80%',
            // height: (width - scaler(20)) / 2.8,
            width: (width - scaler(20)) / 1.5,
            backgroundColor: 'white'
        }} >
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: colors.colorGreyText, borderBottomWidth: 1, padding: scaler(5), paddingBottom: scaler(10) }} >
                <View style={{ height: scaler(40), width: scaler(40), alignItems: 'center', justifyContent: 'center', borderRadius: scaler(30), marginRight: scaler(10), backgroundColor: colors.colorBlackText }} >
                    <Text style={{ color: colors.colorWhite, fontSize: scaler(16), fontWeight: '500' }} >{c.givenName?.[0]?.toUpperCase()}</Text>
                </View>
                <Text style={{ flex: 1, marginRight: scaler(10) }} >{c.givenName + (c?.familyName ? (" " + c?.familyName) : "")}</Text>
            </View>
            <TouchableOpacity onPress={() => {
                Contacts.openContactForm(c).then(v => {
                    console.log("v", v);

                }).catch(e => {
                    console.log("Error", e);

                })
            }} style={{ paddingVertical: scaler(6), alignItems: 'center', flex: 1, justifyContent: 'center' }} >
                <Text>{Language.add_to_contacts}</Text>
            </TouchableOpacity>
        </TouchableOpacity>

        if (myMessage) {
            return <View style={styles.myContainer} >
                <View style={[styles.myMessageContainer, { alignItems: 'flex-end', padding: 0 }]} >
                    {map}
                </View>
                <TouchableOpacity onPress={_openChatActionMenu} style={{ marginStart: scaler(5) }} >
                    <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity>
            </View>
        }
        return <View style={styles.container} >
            <View style={{ flexDirection: 'row', marginLeft: scaler(10) }} >
                <View style={{ flex: 1 }} >
                    {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scaler(4) }} >
                        <View style={(is_message_sender_is_admin || isMuted) ? [styles.imageContainer, { borderColor: colors.colorGreyText }] : styles.imageContainer}>
                            <ImageLoader
                                placeholderSource={Images.ic_home_profile}
                                source={{ uri: getImageUrl(userImage, { width: scaler(30), type: 'users' }) }}
                                style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                        </View>
                        <Text style={is_message_sender_is_admin ? [styles.imageDisplayName] : [styles.imageDisplayName, { color: colors.colorBlack }]} >{display_name}</Text>
                        <TouchableOpacity onPress={_openChatActionMenu} style={{ padding: scaler(5) }} >
                            <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                        </TouchableOpacity>
                    </View> */}
                    {map}
                </View>
            </View>
        </View>
    }

    if (message_type == 'location') {
        if (myMessage) {
            return <View style={styles.myContainer} >
                <View style={[styles.myMessageContainer, { alignItems: 'flex-end', padding: 0, overflow: 'hidden' }]} >
                    {renderMap}
                </View>
                <TouchableOpacity onPress={_openChatActionMenu} style={{ marginStart: scaler(5) }} >
                    <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity>
            </View>
        }
        return <View style={styles.container} >
            <View style={{ flexDirection: 'row', marginLeft: scaler(10) }} >
                <View style={{ flex: 1, overflow: 'hidden' }} >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scaler(4) }} >
                        <View style={styles.imageContainer}>
                            <ImageLoader
                                placeholderSource={Images.ic_home_profile}
                                source={{ uri: getImageUrl(userImage, { width: scaler(30), type: 'users' }) }}
                                style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                        </View>
                        <Text style={[styles.imageDisplayName, { color: colors.colorBlack }]} >{display_name}</Text>
                        <TouchableOpacity onPress={_openChatActionMenu} style={{ padding: scaler(5) }} >
                            <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                        </TouchableOpacity>
                    </View>
                    {renderMap}
                </View>
            </View>
        </View>
    }


    const region = useMemo(() => {
        return parent_message?.message_type == 'location' ? {
            latitude: parseFloat(parent_message?.location?.lat ?? "12"),
            longitude: parseFloat(parent_message?.location?.lng ?? "12"),
            ...DefaultDelta
        } : {
            latitude: 12,
            longitude: 12,
            ...DefaultDelta
        }
    }, [parent_message])

    if (myMessage) {
        return <>
            {/* {link ? <Preview
                text={link} /> : null} */}
            <View style={styles.myContainer} >
                <View style={[styles.myMessageContainer, { alignItems: 'flex-end' }]} >
                    {parent_message ?
                        <View style={{ marginBottom: scaler(5) }} >
                            <Text style={[styles.userName, { fontSize: scaler(12), color: "#656565", fontWeight: '400' }]} >{parent_message?.user_id == userData?._id ? userData?.username : display_name}</Text>
                            <TouchableOpacity disabled style={[styles.messageContainer, {
                                maxWidth: undefined, width: '100%',
                                padding: parent_message?.message_type != "text" ? 0 : scaler(10),
                            }]} >
                                {parent_message?.message_type == "image" || parent_message?.message_type == "video" ?
                                    <ImageLoader
                                        placeholderSource={Images.ic_image_placeholder}
                                        style={{ borderRadius: scaler(10), height: scaler(60), width: width / 2 }}
                                        source={{ uri: parent_message?.message_type == "video" ? config.VIDEO_URL + (parent_message?.video?.substring(0, parent_message?.video?.lastIndexOf("."))) + "-00001.png" : getImageUrl(parent_message?.image, { width: width / 2, height: scaler(60), type: 'messages' }) }} />
                                    : parent_message?.message_type == 'contact' ?
                                        <View style={{ flexDirection: 'row', width: width / 2, alignItems: 'center', padding: scaler(5), paddingBottom: scaler(5), borderRadius: scaler(10), marginTop: scaler(5) }} >
                                            <View style={{ height: scaler(40), width: scaler(40), alignItems: 'center', justifyContent: 'center', borderRadius: scaler(30), marginRight: scaler(10), backgroundColor: colors.colorBlackText }} >
                                                <Text style={{ color: colors.colorWhite, fontSize: scaler(16), fontWeight: '500' }} >{parent_message?.contacts?.[0]?.givenName?.[0]?.toUpperCase()}</Text>
                                            </View>
                                            <Text style={{ flex: 1, marginRight: scaler(10) }} >{parent_message?.contacts?.[0]?.givenName + (parent_message?.contacts?.[0]?.familyName ? (" " + parent_message?.contacts?.[0]?.familyName) : "")}</Text>
                                        </View>
                                        : parent_message?.message_type == 'location' ?
                                            <View pointerEvents='none' style={{ borderRadius: scaler(10), borderColor: colors.colorPrimary, borderWidth: scaler(0.5), overflow: 'hidden' }} >
                                                <MapView
                                                    style={{ width: width / 2, height: scaler(80), overflow: 'hidden' }}
                                                    minZoomLevel={2}
                                                    customMapStyle={MapStyle}
                                                    provider={'google'}
                                                    cacheEnabled
                                                    showsMyLocationButton={false}
                                                    initialRegion={region}
                                                >
                                                    <Marker coordinate={region} >
                                                        <Image style={{ height: scaler(20), width: scaler(20), resizeMode: 'contain' }} source={Images.ic_marker} />
                                                    </Marker>

                                                </MapView>
                                            </View>
                                            : <Text type={parent_message?.text?.includes(DELETE_TEXT) ? 'italic' : undefined} style={[styles.message, { flex: 1, fontSize: scaler(12) }]} >{parent_message?.text?.includes(DELETE_TEXT) ? "Message Deleted" : parent_message?.text}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                        : null}
                    <Text autoLink
                        onLongPress={_onCopy}
                        style={[styles.myMessage, {}]} >{text?.trim()}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(8) }} >
                        <TouchableOpacity onPress={() => {
                            SocketService?.emit(EMIT_PERSONAL_LIKE_UNLIKE, {
                                message_id: _id,
                                is_like: is_message_liked_by_me ? "0" : '1'
                            })
                        }} >
                            <Image source={Images.ic_smiley} style={{
                                resizeMode: 'contain',
                                height: scaler(20), width: scaler(20), marginRight: scaler(5),
                                tintColor: is_message_liked_by_me ? colors.colorPrimary : undefined
                            }} />
                        </TouchableOpacity>
                        <Text children={likeString} style={[styles.likeBy, { flex: 0, flexShrink: 1, color: 'black' }]} />
                    </View>
                </View>

                <TouchableOpacity onPress={_openChatActionMenu} style={{ marginStart: scaler(5) }} >
                    <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity>
            </View>
            {link ? <Preview
                text={link} /> : null}
        </>
    }



    return (
        <>
            {/* {link ? <Preview
                text={link} /> : null} */}
            <View style={styles.container} >
                <View style={{ flexDirection: 'row', marginLeft: scaler(10) }} >
                    {/* <TouchableOpacity onPress={_openChatActionMenu} style={{ marginStart: scaler(2), marginTop: scaler(3) }} >
                        <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                    </TouchableOpacity> */}
                    <View style={{ flex: 1, flexDirection: 'row' }} >
                        {/* <Text style={is_message_sender_is_admin ? [styles.userName, { color: colors.colorPrimary }] : styles.userName} >{display_name}</Text> */}
                        <View style={[styles.messageContainer]} >
                            {parent_message ?
                                <View style={{ marginBottom: scaler(5), width: '100%' }} >
                                    <Text style={[styles.userName, { fontSize: scaler(12), color: "#fff", fontWeight: '400' }]} >{parent_message?.user_id == userData?._id ? userData?.username : display_name}</Text>
                                    <TouchableOpacity disabled activeOpacity={1} onLongPress={() => { }} style={[styles.myMessageContainer, {
                                        maxWidth: undefined, width: '100%',
                                        padding: parent_message?.message_type != "text" ? 0 : scaler(10),
                                    }]} >
                                        {parent_message?.message_type == "image" || parent_message?.message_type == "video" ?
                                            <ImageLoader
                                                placeholderSource={Images.ic_image_placeholder}
                                                style={{ borderRadius: scaler(10), height: scaler(60), width: width / 2 }}
                                                source={{ uri: parent_message?.message_type == "video" ? config.VIDEO_URL + (parent_message?.video?.substring(0, parent_message?.video?.lastIndexOf("."))) + "-00001.png" : getImageUrl(parent_message?.image, { width: width / 2, height: scaler(60), type: 'messages' }) }} />
                                            : parent_message?.message_type == 'contact' ?
                                                <View style={{ flexDirection: 'row', alignItems: 'center', padding: scaler(5), paddingBottom: scaler(5), borderRadius: scaler(10), marginTop: scaler(5) }} >
                                                    <View style={{ height: scaler(40), width: scaler(40), alignItems: 'center', justifyContent: 'center', borderRadius: scaler(30), marginRight: scaler(10), backgroundColor: colors.colorBlackText }} >
                                                        <Text style={{ color: colors.colorWhite, fontSize: scaler(16), fontWeight: '500' }} >{parent_message?.contacts?.[0]?.givenName?.[0]?.toUpperCase()}</Text>
                                                    </View>
                                                    <Text style={{ marginRight: scaler(10), color: colors.colorBlack }} >{parent_message?.contacts?.[0]?.givenName + (parent_message?.contacts?.[0]?.familyName ? (" " + parent_message?.contacts?.[0]?.familyName) : "")}</Text>
                                                </View>
                                                : parent_message?.message_type == 'location' ?
                                                    <View pointerEvents='none' style={{ width: width / 2, height: scaler(80), borderRadius: scaler(10), overflow: 'hidden' }} >
                                                        <MapView
                                                            style={{ flex: 1, overflow: 'hidden' }}
                                                            minZoomLevel={2}
                                                            customMapStyle={MapStyle}
                                                            provider={'google'}
                                                            cacheEnabled
                                                            showsMyLocationButton={false}
                                                            initialRegion={region}
                                                        >
                                                            <Marker coordinate={region} >
                                                                <Image style={{ height: scaler(20), width: scaler(20), resizeMode: 'contain' }} source={Images.ic_marker} />
                                                            </Marker>
                                                        </MapView>
                                                    </View>
                                                    : <Text type={parent_message?.text?.includes(DELETE_TEXT) ? 'italic' : undefined} style={[styles.myMessage, { flex: 1, fontSize: scaler(12) }]} >{parent_message?.text?.includes(DELETE_TEXT) ? "Message Deleted" : parent_message?.text}</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                                : null}
                            <Text autoLink onLongPress={_onCopy}
                                style={styles.message} >{text?.trim()}</Text>
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: scaler(8) }} >
                                <TouchableOpacity onPress={() => {
                                    SocketService?.emit(EMIT_PERSONAL_LIKE_UNLIKE, {
                                        message_id: _id,
                                        is_like: is_message_liked_by_me ? "0" : '1'
                                    })
                                }} >
                                    <Image source={Images.ic_smiley} style={{
                                        resizeMode: 'contain',
                                        height: scaler(20), width: scaler(20), marginRight: scaler(5),
                                        tintColor: is_message_liked_by_me ? colors.colorWhite : colors.colorWhite
                                    }} />
                                </TouchableOpacity>
                                <Text children={likeString} style={[styles.likeBy, { flex: 0, flexShrink: 1, color: colors.colorWhite }]} />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_openChatActionMenu} style={{ padding: scaler(5), }} >
                                <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} style={{ alignSelf: 'flex-end' }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

            </View>
            {link ? <Preview
                text={link} /> : null}
        </>
    )
}

export default SingleChatItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: scaler(10)
        // backgroundColor: colors.colorWhite
    },
    myContainer: {
        width: '80%',
        alignSelf: 'flex-end',
        paddingVertical: scaler(10),
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: scaler(8),
        // marginBottom: scaler(10)
    },
    myMessageContainer: {
        borderRadius: scaler(15),
        backgroundColor: colors.colorWhite,
        padding: scaler(10),
    },
    myMessage: {
        color: colors.colorBlackText,
        fontSize: scaler(14),
        fontWeight: '400',
        // textAlign: 'justify'
    },
    // container: {
    //     paddingVertical: scaler(10)
    // },
    messageContainer: {
        borderRadius: scaler(15),
        maxWidth: '80%',
        alignSelf: 'baseline',
        backgroundColor: colors.colorPrimary,
        padding: scaler(10),
    },
    systemText: {
        color: "#656565",
        fontSize: scaler(13),
        marginVertical: scaler(10),
        textAlign: 'center',
        paddingHorizontal: scaler(12),

    },
    message: {
        color: colors.colorWhite,
        fontSize: scaler(14),
        fontWeight: '400'
    },
    userName: {
        color: colors.colorBlackText,
        fontSize: scaler(13),
        fontWeight: '500',
        marginBottom: scaler(5),
    },
    imageDisplayName: {
        color: colors.colorPrimary,
        fontSize: scaler(13),
        fontWeight: '600',
        marginStart: scaler(10),
        flex: 1
    },
    likeBy: {
        color: colors.colorBlack,
        fontSize: scaler(12),
        fontWeight: '400',
        flex: 1
    },
    imageContainer: {
        width: scaler(34),
        height: scaler(34),
        borderRadius: scaler(17),
        borderColor: colors.colorGreyText,
        borderWidth: scaler(3),
        alignItems: 'center',
        justifyContent: 'center'
    }

})