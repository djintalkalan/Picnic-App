import { colors } from 'assets'
import { IBottomMenuButton } from 'custom-components/BottomMenu'
import Database from 'database'
import React, { FC, memo, useCallback, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { Contact } from 'react-native-contacts'
import { EMIT_PERSONAL_MESSAGE_DELETE, SocketService } from 'socket'
import Language from 'src/language/Language'
import { _hidePopUpAlert, _showBottomMenu, _showPopUpAlert } from 'utils'
import { ContactMessage } from './ContactMessage'
import { DeletedMessage } from './DeletedMessage'
import { ImageMessage } from './ImageMessage'
import { LocationMessage } from './LocationMessage'
import { TextMessage } from './TextMessage'
import { VideoMessage } from './VideoMessage'

interface IChatItem {
    _id: string
    status: number,
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
    const { _id, status, location, setRepliedMessage, image, video, contacts, text, person, parent_message, message_type, message_liked_by_users, is_message_liked_by_me, user_id } = props
    const { isMyMessage, sender } = useMemo(() => ({
        isMyMessage: person?._id != user_id,
        sender: person?._id != user_id ? Database.getStoredValue("userData") : person
    }), [person?.id, user_id])

    const onPressOpenActionMenu = useCallback(() => {
        if (!Database.getStoredValue("socketConnected")) {
            return
        }
        let buttons: IBottomMenuButton[] = [{
            title: Language.reply,
            onPress: () => setRepliedMessage({ _id, user: sender, message: message_type == 'video' ? video : message_type == 'image' ? image : text, message_type: message_type == 'video' ? 'file' : message_type, contacts, coordinates: location, personChat: true }),
        }]
        if (isMyMessage) {
            buttons.push({
                title: Language.delete,
                onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_delete_message,
                        onPressButton: () => {
                            SocketService.emit(EMIT_PERSONAL_MESSAGE_DELETE, {
                                message_id: _id
                            })
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_delete
                    })
                },
            })
        }
        _showBottomMenu({ buttons: buttons })
    }, [])

    const renderMessage = useMemo(() => {
        if (status == 2) {
            return <DeletedMessage
                isMyMessage={isMyMessage}
            />
        }
        switch (message_type) {
            case "image":

                return <ImageMessage
                    onPressOpenActionMenu={onPressOpenActionMenu}
                    is_message_liked_by_me={is_message_liked_by_me}
                    message_liked_by_users={message_liked_by_users}
                    person={person} sender={sender}
                    _id={_id} parent_message={parent_message}
                    isMyMessage={isMyMessage} text={text}
                    image={image}
                />

            case "video":

                return <VideoMessage
                    onPressOpenActionMenu={onPressOpenActionMenu}
                    is_message_liked_by_me={is_message_liked_by_me}
                    message_liked_by_users={message_liked_by_users}
                    person={person} sender={sender}
                    _id={_id} parent_message={parent_message}
                    isMyMessage={isMyMessage} text={text}
                    video={video}
                />

            case "text":
                return <TextMessage
                    onPressOpenActionMenu={onPressOpenActionMenu}
                    is_message_liked_by_me={is_message_liked_by_me}
                    message_liked_by_users={message_liked_by_users}
                    person={person} sender={sender}
                    _id={_id} parent_message={parent_message}
                    isMyMessage={isMyMessage} text={text} />

            case "contact":
                return <ContactMessage
                    onPressOpenActionMenu={onPressOpenActionMenu}
                    // is_message_liked_by_me={is_message_liked_by_me}
                    // message_liked_by_users={message_liked_by_users}
                    person={person} sender={sender}
                    _id={_id} parent_message={parent_message}
                    isMyMessage={isMyMessage} contacts={contacts} />

            case "document":
                return null

            case "location":
                return <LocationMessage
                    onPressOpenActionMenu={onPressOpenActionMenu}
                    // is_message_liked_by_me={is_message_liked_by_me}
                    // message_liked_by_users={message_liked_by_users}
                    person={person} sender={sender}
                    _id={_id} parent_message={parent_message}
                    isMyMessage={isMyMessage} location={location} />
        }
    }, [message_type, props])
    return renderMessage ?? null
}

export default memo(SingleChatItem
    // ,(prevProps, nextProps) => (isEqual(prevProps, nextProps)))
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    }
})