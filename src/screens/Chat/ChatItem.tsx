import Clipboard from '@react-native-community/clipboard'
import { config } from 'api'
import { blockUnblockResource, muteUnmuteResource, reportResource, setActiveEvent } from 'app-store/actions'
import { colors, Images, MapStyle } from 'assets'
import { MultiBoldText, Preview, Text } from 'custom-components'
import { IBottomMenuButton } from 'custom-components/BottomMenu'
import ImageLoader from 'custom-components/ImageLoader'
import { useVideoPlayer } from 'custom-components/VideoProvider'
import { useDatabase } from 'database'
import { find as findUrl } from 'linkifyjs'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Dimensions, GestureResponderEvent, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import Contacts, { Contact } from 'react-native-contacts'
//@ts-ignore
import Handlebars from 'handlebars/lib/handlebars'
import MapView, { Marker } from 'react-native-maps'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { EMIT_EVENT_MEMBER_DELETE, EMIT_EVENT_MESSAGE_DELETE, EMIT_GROUP_MEMBER_DELETE, EMIT_GROUP_MESSAGE_DELETE, EMIT_LIKE_UNLIKE, SocketService } from 'socket'
import Language from 'src/language/Language'
import { calculateImageUrl, getDisplayName, getImageUrl, launchMap, NavigationService, scaler, _hidePopUpAlert, _showBottomMenu, _showPopUpAlert, _showToast, _zoomImage } from 'utils'


const insertAtIndex = (text: string, i: number, add: number = 0) => {
    if (i < 0) {
        return text
    }
    const pair = Array.from(text)
    pair.splice(i + add, 0, '**')
    return pair.join('')
}

interface IChatItem {
    created_by: any
    contacts: Array<Contact>
    _id: string
    isAdmin: any,
    message: string
    is_system_message?: 1 | 0
    user?: any,
    parent_message: any,
    parent_id: string,
    setRepliedMessage: (msg: any) => void
    message_type: any
    is_message_liked_by_me: boolean
    message_liked_by_last_five: []
    message_total_likes_count: number
    message_liked_by_user_name: []
    message_recently_liked_user_ids: Array<any>
    is_message_sender_is_admin: boolean
    message_liked_by_users: Array<any>
    group?: any
    event?: any
    isGroupType: boolean
    member_deleted_by_user: any
    message_deleted_by_user: any
    isMuted?: boolean
    coordinates: { lat: string, lng: string }
    text: string
    isMember: boolean
    systemMessageTemplate: any
    event_detail: any,
}

const DELETE_TEXT = "{{admin_name}} {{has_deleted_post_from}} {{display_name}}"


const { height, width } = Dimensions.get('screen')

const ASPECT_RATIO = width / height;
const DefaultDelta = {
    latitudeDelta: 0.05,
    longitudeDelta: 0.05 * ASPECT_RATIO,
}

const ChatItem = (props: IChatItem) => {
    const { loadVideo } = useVideoPlayer()
    const [link, setLink] = useState("")

    const { message, isAdmin, message_deleted_by_user, isGroupType, is_system_message, user,
        event_detail: eventInMessage,
        message_type, _id, setRepliedMessage, parent_message,
        coordinates, contacts,
        text, member_deleted_by_user,
        // is_message_sender_is_admin,
        // message_recently_liked_user_ids,
        // message_liked_by_user_name,
        // parent_id,
        message_liked_by_users,
        message_total_likes_count, isMuted, isMember, systemMessageTemplate } = props ?? {}
    const group = useMemo(() => (isGroupType ? props?.group : props?.event), [isGroupType])
    const { display_name, userImage, userId } = useMemo(() => ({
        display_name: getDisplayName(user),
        userImage: user?.image,// user?.account_deleted == 1 ? null : user?.image,
        userId: user?._id
    }), [user])
    const [userData] = useDatabase<any>("userData");

    let is_message_liked_by_me = props?.is_message_liked_by_me || false
    const is_message_sender_is_admin = group?.user_id == props?.created_by

    // if (is_message_liked_by_me == false && message_liked_by_users?.findIndex(_ => _?.user_id == userData?._id) != -1) {
    //     is_message_liked_by_me = true
    // }

    useEffect(() => {
        if (message_type == 'text' && message?.trim()) {
            const matches = findUrl(message?.toLowerCase())
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

    const renderMap = useMemo(() => {
        if (!props?.coordinates?.lat || !props?.coordinates?.lng) {
            return null
        }
        const region = {
            latitude: parseFloat(props?.coordinates?.lat),
            longitude: parseFloat(props?.coordinates?.lng),
            ...DefaultDelta
        }

        return <TouchableOpacity activeOpacity={0.8} onPress={() => {
            launchMap({ lat: parseFloat(props?.coordinates?.lat), long: parseFloat(props?.coordinates?.lng) })
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
    }, [JSON.stringify(props?.coordinates)])


    const pinLocation = () => {
        if (!group?.location?.coordinates?.length && message_type != 'resource_direction' && group?.is_direction != '1') {
            return null
        }
        const region = {
            latitude: parseFloat(group?.location?.coordinates[1]),
            longitude: parseFloat(group?.location?.coordinates[0]),
            ...DefaultDelta
        }

        return <TouchableOpacity activeOpacity={0.8} onPress={() => {
            launchMap({ lat: parseFloat(group?.location?.coordinates[1]), long: parseFloat(group?.location?.coordinates[0]) })
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
                    // cacheEnabled
                    showsMyLocationButton={false}
                    initialRegion={region} >
                    <Marker coordinate={region} >
                        <Image style={{ height: scaler(20), width: scaler(20), resizeMode: 'contain' }} source={Images.ic_marker} />
                    </Marker>

                </MapView>
            </View>
        </TouchableOpacity>
    }

    const eventOfGroupMessage = () => {
        const eventImage = calculateImageUrl(eventInMessage?.image, eventInMessage?.event_images)
        return <View style={{
            borderRadius: scaler(15), overflow: 'hidden',
            padding: scaler(7),
            height: (width - scaler(20)) / 2.8, width: (width - scaler(20)) / 1.5, backgroundColor: 'white'
        }} >
            <View style={{ flex: 1, overflow: 'hidden', borderRadius: scaler(10), }} pointerEvents='none' >
                <ImageLoader
                    placeholderSource={Images.ic_event_placeholder}
                    borderRadius={scaler(15)}
                    resizeMode={eventImage ? 'cover' : 'contain'}
                    onPress={() => _zoomImage(getImageUrl(eventImage, { type: 'events' }))}
                    source={{ uri: getImageUrl(eventImage, { type: 'events' }) }}
                    //@ts-ignore
                    style={{ resizeMode: eventImage ? 'cover' : 'contain', borderRadius: scaler(10), height: '100%', width: '100%' }} />

            </View>
        </View>
    }

    const { remainingNames, myMessage } = useMemo(() => {
        return {
            myMessage: userId == userData?._id,
            remainingNames: message_liked_by_users?.filter(_ => _?.user_id != userData?._id).map(_ => (getDisplayName({ ..._, first_name: _?.name })))?.reverse() ?? []
        }
    }, [message_liked_by_users, userData, userId])

    const _openChatActionMenu = useCallback(() => {
        if (!isMember && !isMuted) return
        let buttons: IBottomMenuButton[] = [{
            title: Language.reply,
            onPress: () => setRepliedMessage({ _id, user, message, message_type, contacts, coordinates }),
        },
        {
            title: Language.mute,
            onPress: () => dispatch(muteUnmuteResource({ data: { is_mute: '1', resource_type: "message", resource_id: _id, [isGroupType ? "groupId" : "eventId"]: group?._id } })),
        }]
        if (myMessage || isAdmin) {
            buttons.push({
                title: Language.delete,
                onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_delete_message,
                        onPressButton: () => {
                            SocketService.emit(isGroupType ? EMIT_GROUP_MESSAGE_DELETE : EMIT_EVENT_MESSAGE_DELETE, {
                                resource_id: group?._id,
                                message_id: _id
                            })
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_delete
                    })

                }
            })
        }
        if (!myMessage) {
            buttons = [...buttons, {
                title: Language.block,
                onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_block_member,
                        onPressButton: () => {
                            dispatch(blockUnblockResource({
                                data: { resource_id: userId, resource_type: 'user', is_blocked: '1' },
                                onSuccess: () => {

                                }
                            }))
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_block
                    })
                },
            }, {
                title: Language.report,
                onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_report_member,
                        onPressButton: () => {
                            dispatch(reportResource({ resource_id: userId, resource_type: 'user' }))
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_report
                    })
                },
            }]
        }
        if (isMuted) {
            buttons = [{
                title: Language.unmute,
                onPress: () => {
                    dispatch(muteUnmuteResource({
                        data: {
                            resource_id: _id,
                            resource_type: 'message',
                            is_mute: '0',
                        },
                        onSuccess: (res) => {
                            // setResources(_ => _.filter(_ => _._id != item?._id))
                        }
                    }))
                },
            }]
        }
        if (isAdmin && !myMessage) (buttons.push({
            title: Language.remove,
            onPress: () => {
                _showPopUpAlert({
                    message: Language.are_you_sure_remove_member,
                    onPressButton: () => {
                        SocketService.emit(isGroupType ? EMIT_GROUP_MEMBER_DELETE : EMIT_EVENT_MEMBER_DELETE, {
                            resource_id: group?._id,
                            user_id: userId
                        })
                        _hidePopUpAlert()
                    },
                    buttonStyle: { backgroundColor: colors.colorRed },
                    buttonText: Language.yes_remove
                })

                // dispatch(muteUnmuteResource({
                //     data: {
                //         groupId: group?._id,
                //         resource_id: _id,
                //         resource_type: 'message',
                //         is_mute: '1'
                //     },
                //     onSuccess: () => {

                //     }
                // }))
            },
            textStyle: { color: colors.colorRed }
        }))
        _showBottomMenu({ buttons: buttons })
    }, [isMember])

    const dispatch = useDispatch()

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
        Clipboard?.setString(message_type == 'resource_direction' ? group?.address : message_type == 'file' || message_type == 'image' ? text?.trim() : message?.trim());
        // console.log("e", e, ((height - scaler(80)) / 3));
        //@ts-ignore
        _showToast(Language.getString('copied'), 'SHORT', gravity);
    }, [])

    const region = useMemo(() => {
        return parent_message?.message_type == 'location' ? {
            latitude: parseFloat(parent_message?.coordinates?.lat ?? "12"),
            longitude: parseFloat(parent_message?.coordinates?.lng ?? "12"),
            ...DefaultDelta
        } : {
            latitude: 12,
            longitude: 12,
            ...DefaultDelta
        }
    }, [parent_message])



    if (is_system_message) {
        const adminName = getDisplayName(message_deleted_by_user || member_deleted_by_user)
        let m = message || ''
        try {
            if (message?.trim()) {
                const template = Handlebars.compile(message)
                m = template({
                    display_name: "**" + display_name + "**",
                    name: "**" + group?.name + "**",
                    admin_name: "**" + adminName + "**",
                    ...systemMessageTemplate
                })
            }
        }
        catch (e) {

        }
        return <MultiBoldText fontWeight='600' style={[styles.systemText, { flex: 1 }]} text={'“' + m + '”'} />
    }
    const total = message_total_likes_count - (is_message_liked_by_me ? 2 : 1)

    if (message_type == 'image') {

        return <View style={{ width: '100%', padding: scaler(10), backgroundColor: colors.colorWhite }} >
            <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                <View style={(is_message_sender_is_admin || isMuted) ? [styles.imageContainer, { borderColor: colors.colorWhite }] : styles.imageContainer}>
                    <ImageLoader
                        placeholderSource={Images.ic_home_profile}
                        source={{ uri: getImageUrl(userImage, { width: scaler(30), type: 'users' }) }}
                        style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                </View>
                <Text style={is_message_sender_is_admin ? [styles.imageDisplayName] : [styles.imageDisplayName, { color: colors.colorBlack }]} >{display_name}</Text>
                <TouchableOpacity onPress={_openChatActionMenu} style={{ padding: scaler(5) }} >
                    <MaterialCommunityIcons color={!isMember && !isMuted ? 'transparent' : colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity>
            </View>
            <ImageLoader
                placeholderSource={Images.ic_image_placeholder}
                borderRadius={scaler(15)}
                resizeMode={'cover'}
                onPress={() => _zoomImage(getImageUrl(message, { type: 'messages' }))}
                source={{ uri: getImageUrl(message, { type: 'messages' }) }}
                //@ts-ignore
                style={{ resizeMode: 'cover', marginVertical: scaler(10), borderRadius: scaler(15), height: (width - scaler(20)) / 1.9, width: width - scaler(20) }} />
            {text ? <View style={{ width: '100%', paddingHorizontal: scaler(15), paddingBottom: scaler(8), paddingTop: scaler(3) }} >
                <Text autoLink onLongPress={_onCopy}
                    style={[styles.message, { color: colors.colorBlackText, flex: 1, }]} >{text?.trim()}</Text>
            </View>
                : null}
            {isMuted || !isMember ?
                null :
                <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <TouchableOpacity disabled={!isMember} onPress={() => {
                        SocketService?.emit(EMIT_LIKE_UNLIKE, {
                            message_id: _id,
                            is_like: is_message_liked_by_me ? "0" : '1',
                            resource_id: group?._id,
                            resource_type: isGroupType ? 'group' : 'event'
                        })
                    }} >
                        <Image source={Images.ic_smiley} style={{
                            resizeMode: 'contain',
                            height: scaler(20), width: scaler(20), marginHorizontal: scaler(5),
                            tintColor: is_message_liked_by_me ? colors.colorPrimary : undefined
                        }} />
                    </TouchableOpacity>
                    <Text style={styles.likeBy} >
                        {(is_message_liked_by_me || message_total_likes_count) ? Language.liked_by : Language.like}<Text style={[styles.likeBy, { fontWeight: '500' }]} >{is_message_liked_by_me ? " " + Language.you + (remainingNames?.[0] ? "," : "") : ""}</Text> {remainingNames?.[0] ? remainingNames?.[0] : ""}{(total > 0 ? (" and " + total + " other") : "") + (total > 1 ? "s" : "")}
                    </Text>
                </View>}
        </View>
    }

    if (message_type == 'location') {
        if (myMessage) {
            return <View style={styles.myContainer} >
                <View style={[styles.myMessageContainer, { alignItems: 'flex-end', padding: 0, overflow: 'hidden' }]} >
                    {renderMap}
                </View>
                {isMember || isMuted ? <TouchableOpacity onPress={_openChatActionMenu} style={{ marginStart: scaler(5) }} >
                    <MaterialCommunityIcons color={!isMember && !isMuted ? 'transparent' : colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity> : null}
            </View>
        }
        return <View style={styles.container} >
            <View style={{ flexDirection: 'row', marginLeft: scaler(10) }} >
                <View style={{ flex: 1, overflow: 'hidden' }} >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scaler(4) }} >
                        <View style={(is_message_sender_is_admin || isMuted) ? [styles.imageContainer, { borderColor: colors.colorGreyText }] : styles.imageContainer}>
                            <ImageLoader
                                placeholderSource={Images.ic_home_profile}
                                source={{ uri: getImageUrl(userImage, { width: scaler(30), type: 'users' }) }}
                                style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                        </View>
                        <Text style={is_message_sender_is_admin ? [styles.imageDisplayName] : [styles.imageDisplayName, { color: colors.colorBlack }]} >{display_name}</Text>
                        <TouchableOpacity onPress={_openChatActionMenu} style={{ padding: scaler(5) }} >
                            <MaterialCommunityIcons color={!isMember && !isMuted ? 'transparent' : colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                        </TouchableOpacity>
                    </View>
                    {renderMap}
                </View>
            </View>
        </View>
    }

    if (message_type == 'resource_direction') {
        if (group?.is_direction != '1') return <View />
        let m = message || ''
        try {
            if (message?.trim()) {
                const template = message?.trim() ? Handlebars.compile(message) : null
                m = template(systemMessageTemplate)
            }
        }
        catch (e) {

        }
        if (myMessage) {
            return <View style={styles.myContainer} >
                <View style={[styles.myMessageContainer, { padding: 0, overflow: 'hidden', width: (width - scaler(20)) / 1.5 }]} >
                    {pinLocation()}
                    <View style={{ marginHorizontal: scaler(8), marginBottom: scaler(5) }}>
                        <Text style={styles.myMessage}>{m} </Text>
                        <Text style={{ color: 'blue', fontSize: scaler(13) }}
                            onLongPress={_onCopy}
                            onPress={() => launchMap({ lat: parseFloat(group?.location?.coordinates[1]), long: parseFloat(group?.location?.coordinates[0]) })} >{group?.address}</Text>
                    </View>

                </View>
            </View>
        }
        return <View style={styles.container} >
            <View style={{ flexDirection: 'row', marginLeft: scaler(10) }} >
                <View style={{ flex: 1, overflow: 'hidden' }} >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scaler(4) }} >
                        <View style={(is_message_sender_is_admin || isMuted) ? [styles.imageContainer, { borderColor: colors.colorGreyText }] : styles.imageContainer}>
                            <ImageLoader
                                placeholderSource={Images.ic_home_profile}
                                source={{ uri: getImageUrl(userImage, { width: scaler(30), type: 'users' }) }}
                                style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                        </View>
                        <Text style={is_message_sender_is_admin ? [styles.imageDisplayName] : [styles.imageDisplayName, { color: colors.colorBlack }]} >{display_name}</Text>
                    </View>
                    <View style={{ backgroundColor: colors.colorWhite, width: (width - scaler(20)) / 1.5, borderRadius: scaler(15) }}>
                        {pinLocation()}
                        <View style={{ marginHorizontal: scaler(8), marginBottom: scaler(5), flexShrink: 1 }}>
                            <Text style={styles.myMessage}>{m} </Text>
                            <Text style={{ color: 'blue', fontSize: scaler(13) }}
                                onLongPress={_onCopy}
                                onPress={() => launchMap({ lat: parseFloat(group?.location?.coordinates[1]), long: parseFloat(group?.location?.coordinates[0]) })} >{group?.address}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    }

    if (message_type == 'event_of_group') {
        if (!eventInMessage) return null
        if (!myMessage) {
            return <View style={styles.myContainer} >
                <TouchableOpacity activeOpacity={0.8} onPress={() => {
                    dispatch(setActiveEvent({ ...eventInMessage, _id: eventInMessage?.event_id }))
                    NavigationService?.navigate("EventDetail", { id: eventInMessage?.event_id })
                }} style={[styles.myMessageContainer, { padding: 0, overflow: 'hidden', width: (width - scaler(20)) / 1.5 }]} >
                    {eventOfGroupMessage()}
                    <View style={{ marginHorizontal: scaler(8), marginBottom: scaler(5) }}>
                        <Text style={{ fontSize: scaler(13), marginBottom: scaler(5), color: colors.colorPrimary, fontWeight: '500' }}>{eventInMessage?.name} </Text>
                        {eventInMessage?.short_description ? <Text ellipsizeMode='tail' numberOfLines={3} style={{ marginBottom: scaler(10), flex: 1, fontSize: scaler(12), color: '#444444', fontWeight: '500' }}>{eventInMessage?.short_description} </Text> : null}
                    </View>

                </TouchableOpacity>
            </View>
        }
        return <View style={styles.container} >
            <View style={{ flexDirection: 'row', marginLeft: scaler(10) }} >
                <View style={{ flex: 1, overflow: 'hidden' }} >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scaler(4) }} >
                        <View style={(is_message_sender_is_admin || isMuted) ? [styles.imageContainer, { borderColor: colors.colorGreyText }] : styles.imageContainer}>
                            <ImageLoader
                                placeholderSource={Images.ic_home_profile}
                                source={{ uri: getImageUrl(userImage, { width: scaler(30), type: 'users' }) }}
                                style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                        </View>
                        <Text style={is_message_sender_is_admin ? [styles.imageDisplayName] : [styles.imageDisplayName, { color: colors.colorBlack }]} >{display_name}</Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => {
                        dispatch(setActiveEvent({ ...eventInMessage, _id: eventInMessage?.event_id }))
                        NavigationService?.navigate("EventDetail", { id: eventInMessage?.event_id })
                    }} style={{ backgroundColor: colors.colorWhite, width: (width - scaler(20)) / 1.5, borderRadius: scaler(15) }}>
                        {eventOfGroupMessage()}
                        <View style={{ marginHorizontal: scaler(10), marginBottom: scaler(5), flexShrink: 1 }}>
                            <Text style={{ fontSize: scaler(13), color: colors.colorPrimary, fontWeight: '500' }}>{eventInMessage?.name} </Text>
                            {eventInMessage?.short_description ? <Text ellipsizeMode='tail' numberOfLines={3} style={{ marginBottom: scaler(10), flex: 1, fontSize: scaler(12), color: '#444444', fontWeight: '500' }}>{eventInMessage?.short_description} </Text> : null}
                        </View>
                    </TouchableOpacity>
                </View>
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
                {isMember || isMuted ? <TouchableOpacity onPress={_openChatActionMenu} style={{ marginStart: scaler(5) }} >
                    <MaterialCommunityIcons color={!isMember && !isMuted ? 'transparent' : colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity> : null}
            </View>
        }
        return <View style={styles.container} >
            <View style={{ flexDirection: 'row', marginLeft: scaler(10) }} >
                <View style={{ flex: 1 }} >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scaler(4) }} >
                        <View style={(is_message_sender_is_admin || isMuted) ? [styles.imageContainer, { borderColor: colors.colorGreyText }] : styles.imageContainer}>
                            <ImageLoader
                                placeholderSource={Images.ic_home_profile}
                                source={{ uri: getImageUrl(userImage, { width: scaler(30), type: 'users' }) }}
                                style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                        </View>
                        <Text style={is_message_sender_is_admin ? [styles.imageDisplayName] : [styles.imageDisplayName, { color: colors.colorBlack }]} >{display_name}</Text>
                        <TouchableOpacity onPress={_openChatActionMenu} style={{ padding: scaler(5) }} >
                            <MaterialCommunityIcons color={!isMember && !isMuted ? 'transparent' : colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                        </TouchableOpacity>
                    </View>
                    {map}
                </View>
            </View>
        </View>
    }

    if (message_type == 'file') {
        return <View style={{ width: '100%', padding: scaler(10), backgroundColor: colors.colorWhite }} >
            <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                <View style={(is_message_sender_is_admin || isMuted) ? [styles.imageContainer, { borderColor: colors.colorWhite }] : styles.imageContainer}>
                    <ImageLoader
                        placeholderSource={Images.ic_home_profile}
                        source={{ uri: getImageUrl(userImage, { width: scaler(30), type: 'users' }) }}
                        style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                </View>
                <Text style={is_message_sender_is_admin ? [styles.imageDisplayName] : [styles.imageDisplayName, { color: colors.colorBlack }]} >{display_name}</Text>
                <TouchableOpacity onPress={_openChatActionMenu} style={{ padding: scaler(5) }} >
                    <MaterialCommunityIcons color={!isMember && !isMuted ? 'transparent' : colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity>
            </View>
            <ImageLoader
                reload={true}
                placeholderSource={Images.ic_image_placeholder}
                borderRadius={scaler(15)}
                source={{ uri: config.VIDEO_URL + (message?.substring(0, message?.lastIndexOf("."))) + "-00001.png" }}// getImageUrl(message, { width: width, type: 'messages' }) }}
                //@ts-ignore
                style={{ resizeMode: 'contain', marginVertical: scaler(10), borderRadius: scaler(15), height: (width - scaler(20)) / 1.9, width: width - scaler(20) }} />
            <TouchableOpacity disabled={isMuted} onPress={() => {
                loadVideo && loadVideo(config.VIDEO_URL + message)
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
            {isMuted || !isMember ?
                null :
                <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <TouchableOpacity disabled={!isMember} onPress={() => {
                        SocketService?.emit(EMIT_LIKE_UNLIKE, {
                            message_id: _id,
                            is_like: is_message_liked_by_me ? "0" : '1',
                            resource_id: group?._id,
                            resource_type: isGroupType ? 'group' : 'event'
                        })
                    }} >
                        <Image source={Images.ic_smiley} style={{
                            resizeMode: 'contain',
                            height: scaler(20), width: scaler(20), marginHorizontal: scaler(5),
                            tintColor: is_message_liked_by_me ? colors.colorPrimary : undefined
                        }} />
                    </TouchableOpacity>
                    <Text style={styles.likeBy} >
                        {(is_message_liked_by_me || message_total_likes_count) ? Language.liked_by : Language.like}<Text style={[styles.likeBy, { fontWeight: '500' }]} >{is_message_liked_by_me ? " " + Language.you + (remainingNames?.[0] ? "," : "") : ""}</Text> {remainingNames?.[0] ? remainingNames?.[0] : ""}{(total > 0 ? (" and " + total + " other") : "") + (total > 1 ? "s" : "")}
                    </Text>
                </View>}
        </View>
    }

    if (myMessage) {
        return <>
            {isMuted && link ? <Preview
                text={link} /> : null}
            <View style={styles.myContainer} >
                <View style={[styles.myMessageContainer, { alignItems: 'flex-end' }]} >
                    {parent_message ?
                        <View style={{ marginBottom: scaler(5) }} >
                            <Text style={[styles.userName, { fontSize: scaler(12), color: "#656565", fontWeight: '400' }]} >{getDisplayName(parent_message?.parent_message_creator)}</Text>
                            <TouchableOpacity disabled style={[styles.messageContainer, {
                                maxWidth: undefined, width: '100%',
                                padding: parent_message?.message_type != "text" ? 0 : scaler(10),
                            }]} >
                                {parent_message?.message_type == "image" || parent_message?.message_type == "file" ?
                                    <ImageLoader
                                        placeholderSource={Images.ic_image_placeholder}
                                        style={{ borderRadius: scaler(10), height: scaler(60), width: width / 2 }}
                                        source={{ uri: parent_message?.message_type == "file" ? config.VIDEO_URL + (parent_message?.message?.substring(0, parent_message?.message?.lastIndexOf("."))) + "-00001.png" : getImageUrl(parent_message?.message, { width: width / 2, height: scaler(60), type: 'messages' }) }} />
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
                                                    initialRegion={region} >
                                                    <Marker coordinate={region} >
                                                        <Image style={{ height: scaler(20), width: scaler(20), resizeMode: 'contain' }} source={Images.ic_marker} />
                                                    </Marker>

                                                </MapView>
                                            </View>
                                            : <Text type={parent_message?.message?.includes(DELETE_TEXT) ? 'italic' : undefined} style={[styles.message, { flex: 1, fontSize: scaler(12) }]} >{parent_message?.message?.includes(DELETE_TEXT) ? Language?.message_deleted : parent_message?.message}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                        : null}
                    <Text autoLink
                        onLongPress={_onCopy}
                        style={[styles.myMessage, {}]} >{message?.trim()}</Text>
                    {isMuted || !isMember ? null : <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(8) }} >
                        <TouchableOpacity disabled={!isMember} onPress={() => {
                            SocketService?.emit(EMIT_LIKE_UNLIKE, {
                                message_id: _id,
                                is_like: is_message_liked_by_me ? "0" : '1',
                                resource_id: group?._id,
                                resource_type: isGroupType ? 'group' : 'event'
                            })
                        }} >
                            <Image source={Images.ic_smiley} style={{
                                resizeMode: 'contain',
                                height: scaler(20), width: scaler(20), marginLeft: scaler(5),
                                tintColor: is_message_liked_by_me ? colors.colorPrimary : undefined
                            }} />
                        </TouchableOpacity>
                        {(is_message_liked_by_me || message_total_likes_count) ?
                            <Text style={[styles.likeBy, { flex: 0, marginLeft: scaler(5) }]} >
                                {(is_message_liked_by_me || message_total_likes_count) ? Language.liked_by : ""}<Text style={[styles.likeBy, { fontWeight: '500' }]} >{is_message_liked_by_me ? " " + Language.you + (remainingNames?.[0] ? "," : "") : ""}</Text> {remainingNames?.[0] ? remainingNames?.[0] : ""}{(total > 0 ? (" and " + total + " other") : "") + (total > 1 ? "s" : "")}
                            </Text> : null}
                    </View>}
                </View>

                {isMember || isMuted ? <TouchableOpacity onPress={_openChatActionMenu} style={{ marginStart: scaler(5) }} >
                    <MaterialCommunityIcons color={!isMember && !isMuted ? 'transparent' : colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity> : null}
            </View>
            {!isMuted && link ? <Preview
                text={link} /> : null}
        </>
    }

    return (
        <>
            {isMuted && link ? <Preview
                text={link} /> : null}
            <View style={styles.container} >
                <View style={{ flexDirection: 'row', marginLeft: scaler(10) }} >
                    {/* <TouchableOpacity onPress={_openChatActionMenu} style={{ marginStart: scaler(2), marginTop: scaler(3) }} >
                    <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity> */}
                    <View style={{ flex: 1 }} >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scaler(4) }} >
                            <View style={(is_message_sender_is_admin || isMuted) ? [styles.imageContainer, { borderColor: colors.colorGreyText }] : styles.imageContainer}>
                                <ImageLoader
                                    placeholderSource={Images.ic_home_profile}
                                    source={{ uri: getImageUrl(userImage, { width: scaler(30), type: 'users' }) }}
                                    style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                            </View>
                            <Text style={is_message_sender_is_admin ? [styles.imageDisplayName] : [styles.imageDisplayName, { color: colors.colorBlack }]} >{display_name}</Text>
                            <TouchableOpacity onPress={_openChatActionMenu} style={{ padding: scaler(5) }} >
                                <MaterialCommunityIcons color={!isMember && !isMuted ? 'transparent' : colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                            </TouchableOpacity>
                        </View>
                        {/* <Text style={is_message_sender_is_admin ? [styles.userName, { color: colors.colorPrimary }] : styles.userName} >{display_name}</Text> */}
                        <View style={styles.messageContainer} >
                            {parent_message ?
                                <View style={{ marginBottom: scaler(5), width: '100%' }} >
                                    <Text style={[styles.userName, { fontSize: scaler(12), color: "#fff", fontWeight: '400' }]} >{getDisplayName(parent_message?.parent_message_creator)}</Text>
                                    <TouchableOpacity disabled activeOpacity={1} onLongPress={_openChatActionMenu} style={[styles.myMessageContainer, {
                                        maxWidth: undefined, width: '100%',
                                        padding: parent_message?.message_type != "text" ? 0 : scaler(10),
                                    }]} >
                                        {parent_message?.message_type == "image" || parent_message?.message_type == "file" ?
                                            <ImageLoader
                                                placeholderSource={Images.ic_image_placeholder}
                                                style={{ borderRadius: scaler(10), height: scaler(60), width: width / 2 }}
                                                source={{ uri: parent_message?.message_type == "file" ? config.VIDEO_URL + (parent_message?.message?.substring(0, parent_message?.message?.lastIndexOf("."))) + "-00001.png" : getImageUrl(parent_message?.message, { width: width / 2, height: scaler(60), type: 'messages' }) }} />
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
                                                            initialRegion={region} >
                                                            <Marker coordinate={region} >
                                                                <Image style={{ height: scaler(20), width: scaler(20), resizeMode: 'contain' }} source={Images.ic_marker} />
                                                            </Marker>
                                                        </MapView>
                                                    </View>
                                                    : <Text type={parent_message?.message?.includes(DELETE_TEXT) ? 'italic' : undefined} style={[styles.myMessage, { flex: 1, fontSize: scaler(12) }]} >{parent_message?.message?.includes(DELETE_TEXT) ? Language?.message_deleted : parent_message?.message}</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                                : null}
                            <Text autoLink onLongPress={_onCopy}
                                style={styles.message} >{message?.trim()}</Text>
                            {isMuted || !isMember ? null : <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: scaler(8) }} >
                                <TouchableOpacity disabled={!isMember} onPress={() => {
                                    SocketService?.emit(EMIT_LIKE_UNLIKE, {
                                        message_id: _id,
                                        is_like: is_message_liked_by_me ? "0" : '1',
                                        resource_id: group?._id,
                                        resource_type: isGroupType ? 'group' : 'event'
                                    })
                                }} >
                                    <Image source={Images.ic_smiley} style={{
                                        resizeMode: 'contain',
                                        height: scaler(20), width: scaler(20), marginRight: scaler(5),
                                        tintColor: is_message_liked_by_me ? colors.colorWhite : colors.colorWhite
                                    }} />
                                </TouchableOpacity>
                                {(is_message_liked_by_me || message_total_likes_count) ?
                                    <Text style={[styles.likeBy, { flex: 0, flexShrink: 1, color: colors.colorWhite }]} >
                                        {(is_message_liked_by_me || message_total_likes_count) ? Language.liked_by : ""}<Text style={[styles.likeBy, { fontWeight: '500', color: colors.colorWhite }]} >{is_message_liked_by_me ? " " + Language.you + (remainingNames?.[0] ? "," : "") : ""}</Text> {remainingNames?.[0] ? remainingNames?.[0] : ""}{(total > 0 ? (" and " + total + " other") : "") + (total > 1 ? "s" : "")}
                                    </Text> : null}
                            </View>}
                        </View>
                    </View>

                </View>

            </View>
            {!isMuted && link ? <Preview
                text={link} /> : null}
        </>
    )
}

// export default memo(ChatItem, (prevProps: IChatItem, nextProps: IChatItem) => {
//     return true
// })

export default memo(ChatItem)

const styles = StyleSheet.create({
    myContainer: {
        width: '90%',
        alignSelf: 'flex-end',
        paddingVertical: scaler(10),
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: scaler(8),
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
    container: {
        paddingVertical: scaler(10)
    },
    messageContainer: {
        borderRadius: scaler(15),
        maxWidth: '70%',
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
        borderColor: colors.colorPrimary,
        borderWidth: scaler(3),
        alignItems: 'center',
        justifyContent: 'center'
    }

})


