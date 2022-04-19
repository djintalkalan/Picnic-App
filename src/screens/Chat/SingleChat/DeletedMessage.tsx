import { colors } from 'assets'
import { Text } from 'custom-components'
import React, { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { getDisplayName, scaler } from 'utils'

interface IDeletedMessage {
    isMyMessage: boolean
}

interface IDeletedMessageReplied {
    _id: string
    text: string
    isMyMessageParent: boolean
    isMyMessage: boolean
    sender: any

}

export const DeletedMessage = memo((props: IDeletedMessage) => {
    const { isMyMessage } = props
    return <TouchableOpacity activeOpacity={0.8} style={{ width: '100%', justifyContent: 'flex-end', marginVertical: scaler(8), flexDirection: isMyMessage ? 'row' : 'row-reverse' }} >
        <View style={{ marginRight: scaler(32), marginLeft: scaler(10), maxWidth: '70%', alignItems: 'flex-end', padding: scaler(7), backgroundColor: ("#c5c5c5" || (isMyMessage ? colors.colorWhite : colors.colorMessage)), borderRadius: scaler(10), borderTopLeftRadius: isMyMessage ? scaler(10) : 0, borderTopRightRadius: !isMyMessage ? scaler(10) : 0, }} >
            <Text style={{ fontStyle: 'italic', fontSize: scaler(12), flex: 1, alignSelf: 'flex-start', color: "#ad313e" }} >{"Message Deleted"}</Text>
        </View>
    </TouchableOpacity>
})


export const DeletedMessageReplied = memo((props: IDeletedMessageReplied) => {
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