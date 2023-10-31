import { colors } from 'assets'
import { Text } from 'custom-components'
import Database from 'database'
import React, { memo, useCallback, useMemo } from 'react'
import { GestureResponderEvent, TouchableOpacity, View } from 'react-native'
import Contacts, { Contact } from 'react-native-contacts'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Language from 'src/language/Language'
import { getDisplayName, scaler } from 'utils'
import { ImageMessageReplied } from './ImageMessage'
import { LocationMessageReplied } from './LocationMessage'
import { TextMessageReplied } from './TextMessage'
import { VideoMessageReplied } from './VideoMessage'

interface IContactMessage {
    onPressOpenActionMenu: (e?: GestureResponderEvent) => void,
    contacts: Array<Contact>,
    isMyMessage: boolean
    parent_message?: any
    _id: string
    sender: any
    person: any
    // is_message_liked_by_me: boolean
    // message_liked_by_users: Array<any>
}

interface IContactMessageReplied {
    _id: string
    contacts: Array<Contact>
    isMyMessageParent: boolean
    isMyMessage: boolean
    sender: any
}

export const ContactMessage = memo((props: IContactMessage) => {
    const { _id, onPressOpenActionMenu, contacts, isMyMessage, parent_message, sender, person,
        // is_message_liked_by_me, message_liked_by_users
    } = props
    const contact = contacts[0]
    if (!contact?.company) contact.company = ""
    // const likeString = useMemo<React.ReactNode>(() => {
    //     let string: any = ["Like"]
    //     if (is_message_liked_by_me) {
    //         string = ["Liked by ", <Text style={{ fontWeight: '600' }} >You</Text>]
    //         if (message_liked_by_users?.length == 2) {
    //             string.push(" and ")
    //             string.push(<Text style={{ fontWeight: '500' }} >{getDisplayName(person)}</Text>)
    //         }
    //     } else if (message_liked_by_users?.length) {
    //         string = ["Liked by ", <Text style={{ fontWeight: '500' }} >{getDisplayName(person)}</Text>]
    //     }
    //     return string
    // }, [is_message_liked_by_me, message_liked_by_users, props])

    const { isMyMessageParent = false, senderParent = null } = useMemo(() => {
        if (parent_message)
            return ({
                isMyMessageParent: person?._id != parent_message?.user_id,
                senderParent: person?._id != parent_message?.user_id ? Database.getStoredValue("userData") : person
            })
        return {}
    }, [person?.id, parent_message?.user_id])

    const renderParentMessage = useMemo(() => {
        if (parent_message)
            switch (parent_message?.message_type) {
                case "image":
                    return <ImageMessageReplied image={parent_message?.image} _id={parent_message?._id} sender={senderParent} isMyMessage={isMyMessage} isMyMessageParent={isMyMessageParent} text={parent_message?.text} />

                case "video":
                    return <VideoMessageReplied video={parent_message?.video} _id={parent_message?._id} sender={senderParent} isMyMessage={isMyMessage} isMyMessageParent={isMyMessageParent} text={parent_message?.text} />

                case "text":
                    return <TextMessageReplied _id={parent_message?._id} sender={senderParent} isMyMessage={isMyMessage} isMyMessageParent={isMyMessageParent} text={parent_message?.text} />

                case "contact":
                    return <ContactMessageReplied _id={parent_message?._id} sender={senderParent} isMyMessage={isMyMessage} isMyMessageParent={isMyMessageParent} contacts={parent_message?.contacts} />

                case "document":
                    return null

                case "location":
                    return <LocationMessageReplied _id={parent_message?._id} sender={senderParent} isMyMessage={isMyMessage} isMyMessageParent={isMyMessageParent} location={parent_message?.contacts} />

                default:
                    return null
            }
    }, [parent_message?.message_type, props])

    const onPressContact = useCallback(() => {
        Contacts.openContactForm(contact).then(v => {
            console.log("v", v);
        }).catch(e => {
            console.log("Error", e);
        })
    }, [])

    return <View style={{ width: '100%', justifyContent: 'flex-end', marginVertical: scaler(8), flexDirection: isMyMessage ? 'row' : 'row-reverse' }} >
        {!isMyMessage ?
            <View style={{ flex: 1, alignItems: 'flex-end' }} >
                <TouchableOpacity onPress={onPressOpenActionMenu} style={{ padding: scaler(5) }} >
                    <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity>
            </View> : null}
        <View style={{ marginLeft: scaler(10), maxWidth: '70%', alignItems: 'flex-end', padding: scaler(2), paddingBottom: 0, backgroundColor: isMyMessage ? colors.colorWhite : colors.colorMessage, borderRadius: scaler(10), borderTopLeftRadius: isMyMessage ? scaler(10) : 0, borderTopRightRadius: !isMyMessage ? scaler(10) : 0, }} >
            {renderParentMessage}
            <View style={{
                borderRadius: scaler(15), overflow: 'hidden',
                padding: scaler(5),
            }} >
                <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: colors.colorGreyText, borderBottomWidth: 1, padding: scaler(5), paddingBottom: scaler(10) }} >
                    <View style={{ height: scaler(40), width: scaler(40), alignItems: 'center', justifyContent: 'center', borderRadius: scaler(30), marginRight: scaler(10), backgroundColor: colors.colorBlackText }} >
                        <Text style={{ color: colors.colorWhite, fontSize: scaler(16), fontWeight: '500' }} >{contact.givenName?.[0]?.toUpperCase()}</Text>
                    </View>
                    <Text style={{ fontSize: scaler(12), marginRight: scaler(10), color: colors.colorBlackText }} >{contact.givenName + (contact?.familyName ? (" " + contact?.familyName) : "")}</Text>
                </View>
                <TouchableOpacity onPress={onPressContact} style={{ paddingVertical: scaler(6), alignItems: 'center', justifyContent: 'center' }} >
                    <Text style={{ color: colors.colorLink, fontSize: scaler(12), fontWeight: '500' }} >{Language.add_to_contacts}</Text>
                </TouchableOpacity>
            </View>
            {/* <View style={{ flexDirection: 'row', marginTop: scaler(5), alignItems: 'center', alignSelf: !isMyMessage ? 'flex-start' : 'flex-end' }} >
                <TouchableOpacity onPress={() => {
                    SocketService?.emit(EMIT_PERSONAL_LIKE_UNLIKE, {
                        message_id: _id,
                        is_like: is_message_liked_by_me ? "0" : '1'
                    })
                }} >
                    <Image source={Images.ic_smiley} style={{
                        resizeMode: 'contain',
                        height: scaler(20), width: scaler(20), marginRight: scaler(5),
                        tintColor: is_message_liked_by_me ? isMyMessage ? colors.colorPrimary : colors.colorBlack : undefined
                    }} />
                </TouchableOpacity>
                <Text children={likeString} style={{ fontSize: scaler(10), color: colors.colorBlackText }} />
            </View> */}
        </View>
        {isMyMessage ?
            <TouchableOpacity onPress={onPressOpenActionMenu} style={{ padding: scaler(5) }} >
                <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
            </TouchableOpacity> : null}
    </View>
})


export const ContactMessageReplied = memo((props: IContactMessageReplied) => {
    const { isMyMessage, contacts } = props
    const contact = contacts[0]
    if (!contact?.company) contact.company = ""
    const senderName = props?.isMyMessageParent ? Language.you : getDisplayName(props?.sender)
    return <TouchableOpacity activeOpacity={0.7} style={{
        flexGrow: 1, marginBottom: scaler(5),
        borderLeftColor: colors.colorLink,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'baseline',
        width: '100%',
        borderLeftWidth: scaler(4),
        borderRadius: scaler(8), padding: scaler(5),
        backgroundColor: props?.isMyMessage ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.5)"
    }} >
        <View style={{ padding: scaler(5), flexGrow: 1, paddingEnd: scaler(10), justifyContent: 'center' }} >
            <Text style={{ fontSize: scaler(12), color: colors.colorLink, fontWeight: '500' }} >{senderName}</Text>
            <Text style={{ fontSize: scaler(12), color: colors.colorBlackText }} >{Language.contact}</Text>
        </View>
        <View style={{ height: scaler(40), width: scaler(40), alignItems: 'center', justifyContent: 'center', borderRadius: scaler(30), marginRight: scaler(10), backgroundColor: colors.colorBlackText }} >
            <Text style={{ color: colors.colorWhite, fontSize: scaler(16), fontWeight: '500' }} >{contact.givenName?.[0]?.toUpperCase()}</Text>
        </View>

    </TouchableOpacity>
})