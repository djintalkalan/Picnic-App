import { colors } from 'assets'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { Contact } from 'react-native-contacts'

interface IChatItem {
    _id: string
    created_by: any
    isAdmin: any,
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
    message_deleted_by_user: any
    isMuted?: boolean

    location: { lat: string, lng: string }
    text: string
    image: string
    video: string
    document: string
    contacts: Array<Contact>
}

const OneToOneChatInput: FC<any> = (props) => {
    return (
        <View style={styles.container} >

        </View>
    )
}

export default OneToOneChatInput

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    }
})