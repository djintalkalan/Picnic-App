import { blockUnblockResource, reportResource } from 'app-store/actions'
import { colors, Images } from 'assets'
import { InnerBoldText, Text } from 'custom-components'
import { IBottomMenuButton } from 'custom-components/BottomMenu'
import ImageLoader from 'custom-components/ImageLoader'
import { useDatabase } from 'database'
import React, { memo, useCallback, useMemo } from 'react'
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { EMIT_EVENT_MEMBER_DELETE, EMIT_EVENT_MESSAGE_DELETE, EMIT_GROUP_MEMBER_DELETE, EMIT_GROUP_MESSAGE_DELETE, EMIT_LIKE_UNLIKE, SocketService } from 'socket'
import Language from 'src/language/Language'
import { getImageUrl, scaler, _hidePopUpAlert, _showBottomMenu, _showPopUpAlert } from 'utils'

interface IChatItem {
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
    group?: any
    event?: any
    isGroupType: boolean
    message_deleted_by_user: any
}

const DelText = "{{admin_name}} has deleted post from {{display_name}}"

const { height, width } = Dimensions.get('screen')

const ChatItem = (props: IChatItem) => {
    const { message, isAdmin, message_deleted_by_user, isGroupType, is_system_message, user, message_type, _id, setRepliedMessage, parent_message, message_recently_liked_user_ids, message_liked_by_last_five, message_liked_by_user_name, message_total_likes_count, parent_id } = props ?? {}
    const group = useMemo(() => (isGroupType ? props?.group : props?.event), [isGroupType])
    const { display_name, image: userImage, _id: userId } = user ?? {}
    const [userData] = useDatabase<any>("userData");
    const is_message_liked_by_me = message_recently_liked_user_ids?.includes(userData?._id)

    const remainingNames = message_liked_by_user_name?.filter(_ => _ != userData?.username) ?? []

    const myMessage = userId == userData?._id

    const _openChatActionMenu = useCallback(() => {
        let buttons: IBottomMenuButton[] = [{
            title: Language.reply,
            onPress: () => setRepliedMessage({ _id, user, message }),
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
                            dispatch(reportResource({ resource_id: _id, resource_type: 'user' }))
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_report
                    })
                },
            }]
        }
        buttons.push({
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
        })
        _showBottomMenu({ buttons: buttons })
    }, [])

    const dispatch = useDispatch()


    if (is_system_message) {
        return <InnerBoldText style={styles.systemText} text={'“' + message.replace("{{display_name}}", "**" + display_name + "**")?.replace("{{name}}", "**" + group?.name + "**")?.replace("{{admin_name}}", "**" + (message_deleted_by_user?.display_name ?? "") + "**") + '”'} />
    }

    if (message_type == 'image') {
        return <View style={{ width: '100%', padding: scaler(10), backgroundColor: colors.colorWhite }} >
            <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                <ImageLoader
                    placeholderSource={Images.ic_home_profile}
                    source={{ uri: getImageUrl(userImage, { width: scaler(30), type: 'users' }) }}
                    style={{ borderRadius: scaler(30), height: scaler(30), width: scaler(30) }} />
                <Text style={styles.imageDisplayName} >{display_name}</Text>
                <TouchableOpacity onPress={_openChatActionMenu} style={{ padding: scaler(5) }} >
                    <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(22)} />
                </TouchableOpacity>
            </View>
            <ImageLoader
                placeholderSource={Images.ic_image_placeholder}
                borderRadius={scaler(15)}
                source={{ uri: getImageUrl(message, { width: width, type: 'messages' }) }}
                style={{ resizeMode: 'cover', marginVertical: scaler(10), borderRadius: scaler(15), height: (width - scaler(20)) / 1.9, width: width - scaler(20) }} />
            <TouchableOpacity onPress={() => {
                SocketService?.emit(EMIT_LIKE_UNLIKE, {
                    message_id: _id,
                    is_like: is_message_liked_by_me ? "0" : '1'
                })
            }} style={{ flexDirection: 'row', alignItems: 'center' }} >

                <Image source={Images.ic_smiley} style={{
                    resizeMode: 'contain',
                    height: scaler(20), width: scaler(20), marginHorizontal: scaler(5),
                    tintColor: is_message_liked_by_me ? colors.colorPrimary : undefined
                }} />
                <Text style={styles.likeBy} >
                    {(is_message_liked_by_me || message_total_likes_count) ? "Liked by" : "Like"}<Text style={[styles.likeBy, { fontWeight: '500' }]} >{is_message_liked_by_me ? " You" + (remainingNames?.[0] ? "," : "") : ""}</Text> {remainingNames?.[0] ? remainingNames?.[0] : ""}{remainingNames?.length > 1 ? " and " + (message_total_likes_count - 1) + " others" : ""}
                </Text>
            </TouchableOpacity>
        </View>
    }

    if (myMessage) {
        return <View style={styles.myContainer} >
            <TouchableOpacity activeOpacity={1} onLongPress={_openChatActionMenu} style={styles.myMessageContainer} >
                {parent_message ?
                    <View style={{ marginBottom: scaler(5) }} >
                        <Text style={[styles.userName, { fontSize: scaler(12), color: "#656565", fontWeight: '400' }]} >{parent_message?.parent_message_creator?.display_name}</Text>
                        <TouchableOpacity disabled activeOpacity={1} onLongPress={_openChatActionMenu} style={[styles.messageContainer, { maxWidth: undefined, width: '100%' }]} >
                            <Text type={parent_message?.message?.includes(DelText) ? 'italic' : undefined} style={[styles.message, { flex: 1, fontSize: scaler(12) }]} >{parent_message?.message?.includes(DelText) ? "Message Deleted" : parent_message?.message}</Text>
                        </TouchableOpacity>
                    </View>
                    : null}
                <Text style={styles.myMessage} >{message?.trim()}</Text>
            </TouchableOpacity>
        </View>
    }

    return (
        <View style={styles.container} >
            <Text style={styles.userName} >{display_name}</Text>
            <TouchableOpacity activeOpacity={1} onLongPress={_openChatActionMenu} style={styles.messageContainer} >
                {parent_message ?
                    <View style={{ marginBottom: scaler(5), width: '100%' }} >
                        <Text style={[styles.userName, { fontSize: scaler(12), color: "#fff", fontWeight: '400' }]} >{parent_message?.parent_message_creator?.display_name}</Text>
                        <TouchableOpacity disabled activeOpacity={1} onLongPress={_openChatActionMenu} style={[styles.myMessageContainer, { maxWidth: undefined, width: '100%' }]} >
                            <Text type={parent_message?.message?.includes(DelText) ? 'italic' : undefined} style={[styles.myMessage, { flex: 1, fontSize: scaler(12) }]} >{parent_message?.message?.includes(DelText) ? "Message Deleted" : parent_message?.message}</Text>
                        </TouchableOpacity>
                    </View>
                    : null}
                <Text style={styles.message} >{message?.trim()}</Text>
            </TouchableOpacity>
        </View>
    )
}

// export default memo(ChatItem, (prevProps: IChatItem, nextProps: IChatItem) => {
//     return true
// })

export default memo(ChatItem)

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
        fontSize: scaler(14),
        fontWeight: '400',
        textAlign: 'right'
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
    }

})


