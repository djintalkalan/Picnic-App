import { colors, Images } from 'assets'
import { Text } from 'custom-components'
import Database from 'database/Database'
import React, { memo, useMemo } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { EMIT_PERSONAL_LIKE_UNLIKE, SocketService } from 'socket'
import { getDisplayName, scaler } from 'utils'
import { ContactMessageReplied } from './ContactMessage'
import { ImageMessageReplied } from './ImageMessage'
import { LocationMessageReplied } from './LocationMessage'
import { VideoMessageReplied } from './VideoMessage'

interface ITextMessage {
    text: string,
    isMyMessage: boolean
    parent_message?: any
    _id: string
    sender: any
    person: any
    is_message_liked_by_me: boolean
    message_liked_by_users: Array<any>
}

interface ITextMessageReplied {
    _id: string
    text: string
    isMyMessageParent: boolean
    isMyMessage: boolean
    sender: any

}

export const TextMessage = memo((props: ITextMessage) => {
    const { _id, text, isMyMessage, parent_message, sender, person, is_message_liked_by_me, message_liked_by_users } = props
    const likeString = useMemo<React.ReactNode>(() => {
        let string: any = ["Like"]
        if (is_message_liked_by_me) {
            string = ["Liked by ", <Text style={{ fontWeight: '600' }} >You</Text>]
            if (message_liked_by_users?.length == 2) {
                string.push(" and ")
                string.push(<Text style={{ fontWeight: '500' }} >{getDisplayName(person)}</Text>)
            }
        } else if (message_liked_by_users?.length) {
            string = ["Liked by ", <Text style={{ fontWeight: '500' }} >{getDisplayName(person)}</Text>]
        }
        return string
    }, [is_message_liked_by_me, message_liked_by_users, props])

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

    return <TouchableOpacity activeOpacity={0.8} style={{ width: '100%', justifyContent: 'flex-end', marginVertical: scaler(8), flexDirection: isMyMessage ? 'row' : 'row-reverse' }} >
        {!isMyMessage ?
            <View style={{ flex: 1, alignItems: 'flex-end' }} >
                <TouchableOpacity onPress={() => { }} style={{ padding: scaler(5) }} >
                    <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity>
            </View> : null}
        <View style={{ marginLeft: scaler(10), maxWidth: '70%', alignItems: 'flex-end', padding: scaler(7), backgroundColor: isMyMessage ? colors.colorWhite : colors.colorMessage, borderRadius: scaler(10), borderTopLeftRadius: isMyMessage ? scaler(10) : 0, borderTopRightRadius: !isMyMessage ? scaler(10) : 0, }} >
            {renderParentMessage}
            <Text style={{ fontSize: scaler(12), flex: 1, alignSelf: 'flex-start', color: isMyMessage ? colors.colorBlackText : colors.colorBlackText }} >{text}</Text>
            <View style={{ flexDirection: 'row', marginTop: scaler(5), alignItems: 'center', alignSelf: !isMyMessage ? 'flex-start' : 'flex-end' }} >
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
            </View>
        </View>
        {isMyMessage ?
            <TouchableOpacity onPress={() => { }} style={{ padding: scaler(5) }} >
                <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
            </TouchableOpacity> : null}
    </TouchableOpacity>
})


export const TextMessageReplied = memo((props: ITextMessageReplied) => {
    const { isMyMessage, isMyMessageParent } = props
    const senderName = props?.isMyMessageParent ? "You" : getDisplayName(props?.sender)
    return <TouchableOpacity style={{
        flexGrow: 1, marginBottom: scaler(5),
        borderLeftColor: colors.colorLink,
        width: '100%',
        borderLeftWidth: scaler(4),
        borderRadius: scaler(8), padding: scaler(5),
        backgroundColor: props?.isMyMessage ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.5)"
    }} >
        <Text style={{ color: colors.colorLink, fontWeight: '500' }} >{senderName}</Text>
        <Text style={{ color: colors.colorBlackText }}>{props?.text}</Text>
    </TouchableOpacity>
})