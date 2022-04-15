import { colors } from 'assets'
import { Text } from 'custom-components'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { Contact } from 'react-native-contacts'

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
}

const SingleChatItem: FC<any> = (props) => {
    const { text } = props
    return (
        <View style={styles.container} >
            <Text>{text}</Text>
        </View>
    )
}

export default SingleChatItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    }
})