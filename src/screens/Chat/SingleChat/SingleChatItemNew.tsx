import { colors } from 'assets'
import Database from 'database/Database'
import { isEqual } from 'lodash'
import React, { FC, memo, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { Contact } from 'react-native-contacts'
import { ContactMessage } from './ContactMessage'
import { ImageMessage } from './ImageMessage'
import { LocationMessage } from './LocationMessage'
import { TextMessage } from './TextMessage'
import { VideoMessage } from './VideoMessage'

interface IChatItem {
    _id: string
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
    is_message_read_by_me: boolean
    person: any,
}

const SingleChatItem: FC<IChatItem> = (props) => {
    const { _id, location, image, video, contacts, text, person, parent_message, message_type, message_liked_by_users, is_message_liked_by_me, user_id } = props
    const { isMyMessage, sender } = useMemo(() => ({
        isMyMessage: person?._id != user_id,
        sender: person?._id != user_id ? Database.getStoredValue("userData") : person
    }), [person?.id, user_id])

    const renderMessage = useMemo(() => {
        switch (message_type) {
            case "image":

                return <ImageMessage
                    is_message_liked_by_me={is_message_liked_by_me}
                    message_liked_by_users={message_liked_by_users}
                    person={person} sender={sender}
                    _id={_id} parent_message={parent_message}
                    isMyMessage={isMyMessage} text={text}
                    image={image}
                />

            case "video":

                return <VideoMessage
                    is_message_liked_by_me={is_message_liked_by_me}
                    message_liked_by_users={message_liked_by_users}
                    person={person} sender={sender}
                    _id={_id} parent_message={parent_message}
                    isMyMessage={isMyMessage} text={text}
                    video={video}
                />


                break;

            case "text":

                return <TextMessage
                    is_message_liked_by_me={is_message_liked_by_me}
                    message_liked_by_users={message_liked_by_users}
                    person={person} sender={sender}
                    _id={_id} parent_message={parent_message}
                    isMyMessage={isMyMessage} text={text} />

                break;

            case "contact":
                return <ContactMessage
                    // is_message_liked_by_me={is_message_liked_by_me}
                    // message_liked_by_users={message_liked_by_users}
                    person={person} sender={sender}
                    _id={_id} parent_message={parent_message}
                    isMyMessage={isMyMessage} contacts={contacts} />
            case "document":

                break;

            case "location":
                return <LocationMessage
                    // is_message_liked_by_me={is_message_liked_by_me}
                    // message_liked_by_users={message_liked_by_users}
                    person={person} sender={sender}
                    _id={_id} parent_message={parent_message}
                    isMyMessage={isMyMessage} location={location} />

            default:
                break;
        }
    }, [message_type, props])
    return renderMessage ?? null
}

export default memo(SingleChatItem, (prevProps, nextProps) => (isEqual(prevProps, nextProps)))

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    }
})