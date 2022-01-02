import { colors } from 'assets'
import { IBottomMenuButton } from 'custom-components/BottomMenu'
import { useDatabase } from 'database'
import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Language from 'src/language/Language'
import { scaler, _showBottomMenu } from 'utils'

interface IChatItem {
    _id: string
    message: string
    is_system_message?: 1 | 0
    user?: any,
    setRepliedMessage: (msg: any) => void
}


const ChatItem = (props: IChatItem) => {
    const { message, is_system_message, user, _id, setRepliedMessage } = props ?? {}
    const { display_name, first_name, last_name } = user
    const [userData] = useDatabase("userData");
    // console.log("userData", userData);

    const myMessage = display_name == userData?.username || (first_name == userData?.first_name && last_name == userData?.last_name)
    if (is_system_message) {
        return <Text style={styles.systemText} >“{message}”</Text>
    }

    const _openChatActionMenu = useCallback(() => {
        let buttons: IBottomMenuButton[] = [{
            title: Language.reply,
            onPress: () => setRepliedMessage({ _id, user, message }),
        }]
        if (myMessage) {
            buttons.push({
                title: Language.delete,
                onPress: () => { },
            })
        } else {
            buttons = [...buttons, {
                title: Language.block,
                onPress: () => { },
            }, {
                title: Language.report,
                onPress: () => { },
            }]
        }
        _showBottomMenu({ buttons: buttons })
    }, [])

    if (myMessage) {
        return <View style={styles.myContainer} >
            <TouchableOpacity activeOpacity={1} onLongPress={_openChatActionMenu} style={styles.myMessageContainer} >
                <Text style={styles.myMessage} >{message}</Text>
            </TouchableOpacity>
        </View>
    }

    return (
        <View style={styles.container} >
            <Text style={styles.userName} >{display_name}</Text>
            <TouchableOpacity activeOpacity={1} onLongPress={_openChatActionMenu} style={styles.messageContainer} >
                <Text style={styles.message} >{message}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default memo(ChatItem, (prevProps: IChatItem, nextProps: IChatItem) => {
    return true
})

const styles = StyleSheet.create({
    myContainer: {
        width: '100%',
        alignItems: 'flex-end',
        paddingHorizontal: scaler(15),
        paddingVertical: scaler(10),
    },
    myMessageContainer: {
        borderRadius: scaler(15),
        backgroundColor: colors.colorWhite,
        paddingHorizontal: scaler(10),
        paddingVertical: scaler(10),
    },
    myMessage: {
        color: colors.colorBlackText,
        fontSize: scaler(15),
        fontWeight: '400'
    },
    container: {
        paddingHorizontal: scaler(15),
        paddingVertical: scaler(10)
    },
    messageContainer: {
        borderRadius: scaler(15),
        maxWidth: '70%',
        alignSelf: 'baseline',
        backgroundColor: colors.colorPrimary,
        paddingHorizontal: scaler(10),
        paddingVertical: scaler(10),
    },
    systemText: {
        color: "#656565",
        fontSize: scaler(13.5),
        marginVertical: scaler(10),
        textAlign: 'center',
        paddingHorizontal: scaler(12),

    },
    message: {
        color: colors.colorWhite,
        fontSize: scaler(15),
        fontWeight: '400'
    },
    userName: {
        color: colors.colorBlackText,
        fontSize: scaler(13.5),
        fontWeight: '500',
        marginBottom: scaler(5),
    }

})


