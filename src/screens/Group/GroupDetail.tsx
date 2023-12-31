import { useFocusEffect } from '@react-navigation/native'
import { _getAdminChatCount, _whatsappImport } from 'api'
import { blockUnblockResource, deleteGroup, getGroupChat, getGroupDetail, getGroupMembers, joinGroup, leaveGroup, muteUnmuteResource, reportResource, setLoadingAction } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Card, Text } from 'custom-components'
import { IBottomMenuButton } from 'custom-components/BottomMenu'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import ImageLoader from 'custom-components/ImageLoader'
import { MemberListItem } from 'custom-components/ListItem/ListItem'
import { useDatabase } from 'database'
import { isEqual, sortBy } from 'lodash'
import React, { FC, Fragment, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { ColorValue, Dimensions, GestureResponderEvent, Image, ImageSourcePropType, InteractionManager, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native'
import { pickSingle } from 'react-native-document-picker'
import LinearGradient from 'react-native-linear-gradient'
import { SwipeRow } from 'react-native-swipe-list-view'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch, useSelector } from 'react-redux'
import { EMIT_GROUP_MEMBER_DELETE, SocketService } from 'socket'
import Language, { useLanguage } from 'src/language/Language'
import { getCityOnly, getImageUrl, NavigationService, scaler, shareDynamicLink, _hidePopUpAlert, _hideTouchAlert, _showBottomMenu, _showErrorMessage, _showPopUpAlert, _showSuccessMessage, _showTouchAlert, _zoomImage } from 'utils'
const { height, width } = Dimensions.get('screen')
const gradientColors = ['rgba(255,255,255,0)', 'rgba(255,255,255,0.535145)', '#fff']
const GroupDetail: FC<any> = (props) => {

    const swipeRef = useRef<SwipeRow<any>>(null)


    const language = useLanguage()
    const getBottomMenuButtons = useCallback((item: any) => {
        return [
            {
                title: Language.block,
                onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_block_member,
                        onPressButton: () => {
                            dispatch(blockUnblockResource({
                                data: { resource_id: item?.user_id, resource_type: 'user', is_blocked: '1' }
                            }))
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_block
                    })

                }
            },
            {
                title: Language.report,
                onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_report_member,
                        onPressButton: () => {
                            dispatch(reportResource({
                                resource_type: 'user',
                                resource_id: item?.user_id
                            }))
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_report
                    })

                }
            },
            {
                title: Language.remove,
                onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_remove_member,
                        onPressButton: () => {
                            // dispatch(removeGroupMember({
                            //     resource_id: item?.resource_id,
                            //     user_id: item?.user_id
                            // }))
                            SocketService.emit(EMIT_GROUP_MEMBER_DELETE, {
                                resource_id: item?.resource_id,
                                user_id: item?.user_id
                            })
                            _hidePopUpAlert()
                            _hidePopUpAlert()
                        },
                        buttonStyle: { backgroundColor: colors.colorRed },
                        buttonText: Language.yes_remove
                    })


                },
                textStyle: { color: colors.colorRed }
            }
        ]
    }, [language])

    const [isOpened, setOpened] = useState(false)
    const dispatch = useDispatch()
    const [unreadCountOfAdmin, setUnreadCountOfAdmin] = useState(0)
    const { group, groupMembers, } = useSelector(state => ({
        group: state?.groupDetails?.[props?.route?.params?.id]?.group,
        groupMembers: sortBy((state?.groupDetails?.[props?.route?.params?.id]?.groupMembers || []), _ => (!_?.is_admin)),
    }), isEqual)


    useFocusEffect(useCallback(() => {
        console.log("group", group);

        InteractionManager.runAfterInteractions(() => {
            if (group?.is_admin == 1) {
                dispatch(getGroupMembers(props?.route?.params?.id))
            } else {
                if (group?.is_group_member && group?.creator_of_group?._id)
                    _getAdminChatCount(group?.creator_of_group?._id).then(res => {
                        if (res?.status == 200) {
                            setUnreadCountOfAdmin(res?.data?.unread_count || 0)
                        }
                    }).catch(e => {
                        console.log("e", e);
                    })
            }
        })
    }, [group]))

    useLayoutEffect(() => {
        setTimeout(() => {
            dispatch(getGroupDetail(props?.route?.params?.id))
        }, 200)
    }, [])

    const [userData] = useDatabase('userData');

    const _renderGroupMembers = useCallback(({ item, index }: any) => {
        return (
            <MemberListItem
                onLongPress={item?.is_admin ? undefined : () => {
                    _showBottomMenu({
                        buttons: getBottomMenuButtons(item)
                    })
                }}
                containerStyle={{ paddingHorizontal: scaler(0) }}
                title={item?.user?.first_name + " " + (item?.user?.last_name ?? "")}
                customRightText={item?.is_admin ? Language?.admin : <TouchableOpacity style={{ paddingHorizontal: scaler(5) }} onPress={() => {
                    console.log("person", item?.user);
                    NavigationService.navigate("PersonChat", { person: item?.user })
                }}>
                    <Image
                        source={Images.ic_chat_message}
                        style={{ height: scaler(30), width: scaler(30), resizeMode: 'contain' }}
                    />
                    {(item?.unread_count?.count || 0) > 0 && <View style={{ alignItems: 'center', justifyContent: 'center', position: 'absolute', top: -scaler(3), end: scaler(1), height: scaler(18), width: scaler(18), borderWidth: scaler(2), borderColor: colors.colorWhite, borderRadius: scaler(15), backgroundColor: colors.colorPrimary }}>
                        <Text style={{ color: colors.colorWhite, fontSize: scaler(10) }} >{item?.unread_count?.count || 0}</Text>
                    </View>}
                </TouchableOpacity>
                }
                icon={item?.user?.image ? { uri: getImageUrl(item?.user?.image, { type: 'users', width: scaler(50) }) } : null}
                defaultIcon={Images.ic_home_profile}
            />
        )
    }, [])

    const renderBottomActionButtons = useCallback(() => {
        return <View style={{ paddingHorizontal: scaler(15), paddingBottom: scaler(20) }} >

            {(group?.status == 1 && (group?.is_admin || (group?.is_group_member && group?.can_anyone_host_events == 1))) ?
                <BottomButton
                    title={Language.host_event_in_this_group}
                    icon={Images.ic_calender}
                    buttonTextColor={colors.colorPrimary}
                    onPress={() => {
                        NavigationService.navigate("CreateEvent1", {
                            group
                        })
                    }} />
                : undefined}

            <BottomButton
                title={Language.delete_group}
                icon={Images.ic_delete}
                visibility={group?.is_admin}
                onPress={() => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_delete_group,
                        onPressButton: () => {
                            dispatch(deleteGroup(group?._id))
                            _hidePopUpAlert()
                        },
                        buttonStyle: { backgroundColor: colors.colorRed },
                        buttonText: Language.yes_delete
                    })
                }} />
            {/** @ts-ignore */}
            {(!group?.is_admin || group?.status == 1) && <SwipeRow ref={swipeRef} disableRightSwipe
                rightOpenValue={-scaler(80)}
            >
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', }} >
                    <View style={{
                        alignItems: 'center',
                        flex: 1,
                        backgroundColor: "#DFDFDF",
                        flexDirection: 'row',
                        justifyContent: 'flex-end'
                    }}>
                        <TouchableOpacity onPress={() => {
                            const buttons: Array<IBottomMenuButton> = []
                            if (!(group?.is_admin)) {
                                buttons.push({
                                    title: Language.mute_group, onPress: () => {
                                        _showPopUpAlert({
                                            message: Language.are_you_sure_mute_group,
                                            onPressButton: () => {
                                                dispatch(muteUnmuteResource({ data: { is_mute: '1', resource_type: "group", resource_id: group?._id } }))
                                                _hidePopUpAlert()
                                            },
                                            buttonText: Language.yes_mute
                                        })
                                    }
                                })

                                buttons.push({
                                    title: Language.report_group, onPress: () => {
                                        _showPopUpAlert({
                                            message: Language.are_you_sure_report_group,
                                            onPressButton: () => {
                                                dispatch(reportResource({ resource_id: group?._id, resource_type: 'group' }))
                                                _hidePopUpAlert()
                                            },
                                            buttonText: Language.yes_report
                                        })
                                    }
                                })
                            }
                            // swipeListRef?.current?.closeAllOpenRows()
                            _showBottomMenu({
                                buttons
                            })

                            swipeRef?.current?.closeRow();

                        }} style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-end', width: scaler(80), backgroundColor: "#DFDFDF" }}>
                            <MaterialCommunityIcons color={colors.colorGreyMore} name={'dots-vertical'} size={scaler(24)} />
                            <Text style={{ fontWeight: '500', marginTop: scaler(5), fontSize: scaler(11), color: "#7B7B7B" }} >{Language.more}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {group?.is_group_member ? <BottomButton
                    title={(group?.is_broadcast_group == 1 && !group?.is_admin) ? Language.unfollow : Language.leave_group}
                    icon={Images.ic_leave_group}
                    hideBottomBar
                    buttonTextColor={colors.colorPrimary}
                    visibility={group?.is_group_member}
                    onPress={() => {
                        if (group?.is_admin) {
                            _showPopUpAlert({
                                message: Language.are_you_sure_leave_group,
                                onPressButton: () => {
                                    NavigationService.navigate("SelectAdmin", { id: props?.route?.params?.id })
                                    _hidePopUpAlert()
                                },
                                buttonStyle: { backgroundColor: colors.colorErrorRed },
                                buttonText: Language.yes_leave
                            })
                            return
                        }

                        if (group?.is_broadcast_group == 1) {
                            dispatch(leaveGroup({ groupId: group?._id }))
                            return
                        }

                        _showPopUpAlert({
                            message: Language.are_you_sure_leave_group,
                            onPressButton: () => {
                                dispatch(leaveGroup({ groupId: group?._id }))
                                _hidePopUpAlert()
                            },
                            buttonStyle: { backgroundColor: colors.colorRed },
                            buttonText: Language.yes_leave
                        })
                    }} />
                    :
                    <BottomButton
                        title={group?.is_broadcast_group == 1 ? Language.follow : Language.join_now}
                        icon={group?.is_broadcast_group == 1 ? Images.ic_megaphone : Images.ic_join_group}
                        hideBottomBar
                        visibility={!group?.is_group_member && group?.status == 1}
                        buttonTextColor={colors.colorPrimary}
                        onPress={() => {
                            dispatch(joinGroup(group?._id))
                        }} />
                    // : undefined
                }

            </SwipeRow>}
        </View>


    }, [group])

    const pickFile = useCallback((type: 'whatsapp' | 'telegram') => {
        pickSingle({
            type: Platform.OS == 'android' ? (type == 'telegram' ? 'application/json' : 'text/plain') : (type == 'telegram' ? "public.content" : "public.plain-text"),
            // copyTo: 'cachesDirectory'
        }).then(document => {
            console.log(document);
            if (document?.uri && document?.name?.endsWith(type == 'telegram' ? ".json" : ".txt")) {
                const { uri, name, type: t } = document
                const file = { uri, name, type: t }
                const formData = new FormData()
                formData.append("file", file);
                formData.append("resource_id", group?._id);
                formData.append("imported_platform", type);

                dispatch(setLoadingAction(true))
                _whatsappImport(formData, type).then((res) => {
                    dispatch(setLoadingAction(false))
                    if (res?.status == 200) {
                        _showSuccessMessage(Language.successfully_imported);
                        dispatch(getGroupChat({
                            id: props?.route?.params?.id
                        }))
                        NavigationService.replace("GroupChatScreen", { id: props?.route?.params?.id })
                    } else if (res?.status == 400) {
                        _showErrorMessage(res.message);
                    } else {
                        _showErrorMessage(Language.something_went_wrong);
                    }
                }).catch((e) => {
                    dispatch(setLoadingAction(false))
                })
            } else {
                _showErrorMessage(type == 'telegram' ? Language.unsupported_json : Language.unsupported_txt)
            }
        })
    }, [group])

    const shareGroup = useCallback(() => {
        shareDynamicLink(group?.name, {
            type: "group-detail",
            id: group?._id,
            image: group?.image ? getImageUrl(group?.image, { width: 0 + scaler(400), type: 'groups' }) : undefined
        }).then(() => {
            _hideTouchAlert();
        }).catch(() => {
            _hideTouchAlert()
        });
    }, [group])

    const openEditButton = useCallback((e: any) => {
        dotMenuButtonRef.current?.measureInWindow((x, y, w, h) => {
            _showTouchAlert({
                placementStyle: {
                    // top,
                    // right: width - left,
                    top: y + h + scaler(5) + (StatusBar.currentHeight || 0),
                    right: w - scaler(5)
                },
                transparent: true,
                alertComponent: () => {
                    return (
                        <Card cardElevation={2} style={styles.fabActionContainer} >
                            <InnerButton visible={group?.is_admin ? true : false} onPress={() => {
                                NavigationService.navigate("CreateGroup", { group })
                                _hideTouchAlert()
                            }} title={Language.edit} />
                            <InnerButton onPress={shareGroup} title={Language.share} />
                            {/* <InnerButton title={Language.export_chat} /> */}
                            <InnerButton onPress={() => {
                                _showBottomMenu({
                                    buttons: [{
                                        title: Language.whatsapp,
                                        iconSource: Images.ic_whatsapp,
                                        onPress: () => pickFile('whatsapp')

                                    }, {
                                        title: Language.telegram,
                                        iconSource: Images.ic_telegram,
                                        onPress: () => pickFile('telegram')
                                    }]
                                })
                                _hideTouchAlert()
                            }} title={Language.import_chat}
                                hideBorder
                            />
                        </Card>
                    )
                }
            })
        })
    }, [group])

    const dotMenuButtonRef = useRef<TouchableOpacity>(null)

    const _showBio = useCallback(() => {
        _showPopUpAlert({
            title: Language.bio,
            leftTitle: true,
            isClose: true,
            customView: () => {
                return <TouchableOpacity onPress={() => {
                    NavigationService.navigate("PersonChat", { person: group?.creator_of_group })
                    _hidePopUpAlert();
                }}>
                    <Text style={{
                        color: colors.colorPrimary,
                        fontSize: scaler(14), fontWeight: '500',
                    }} >{Language.start_chat}</Text>
                </TouchableOpacity>
            },
            message: group?.creator_of_group?.bio
        });
    }, [group?.creator_of_group?._id],)

    // if (group)
    if (!group) {
        return <SafeAreaViewWithStatusBar barStyle={'light-content'} translucent edges={['left']} style={styles.container}>
            <View style={{ width: width, height: width, alignItems: 'center', justifyContent: 'center', backgroundColor: colors?.colorFadedPrimary }}>
                <Image source={Images.ic_group_placeholder} />
            </View>
            <LinearGradient colors={gradientColors} style={styles.linearGradient} />
        </SafeAreaViewWithStatusBar>
    }
    return (
        <SafeAreaViewWithStatusBar barStyle={'light-content'} translucent edges={['left']} >
            <ScrollView bounces={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true} style={styles.container} >

                <View style={{ width: width, height: width, alignItems: 'center', justifyContent: 'center', backgroundColor: colors?.colorFadedPrimary }}>
                    <ImageLoader
                        onPress={() => group?.image && _zoomImage(getImageUrl(group?.image, { type: 'groups' }))}
                        //@ts-ignore
                        style={{ width: width, height: width, resizeMode: 'cover' }}
                        placeholderSource={Images.ic_group_placeholder}
                        placeholderStyle={{}}
                        source={{ uri: getImageUrl(group?.image, { width: width, type: 'groups' }) }} />
                </View>
                <LinearGradient colors={gradientColors} style={styles.linearGradient} />
                <View style={{ width: '100%', top: scaler(30), position: 'absolute', flexDirection: 'row', padding: scaler(20), justifyContent: 'space-between' }} >
                    <TouchableOpacity onPress={() => NavigationService.goBack()} style={styles.backButton} >
                        <Image style={styles.imgBack} source={Images.ic_back_group} />
                    </TouchableOpacity>
                    {group?.status == 1 ?
                        <TouchableOpacity ref={dotMenuButtonRef} onPress={(e) => (group?.is_admin) ? openEditButton(e) : shareGroup()} style={styles.backButton} >
                            <Image style={styles.imgBack} source={(group?.is_admin) ? Images.ic_more_group : Images.ic_leave_in_group} />
                        </TouchableOpacity> : undefined}
                </View>
                <View style={styles.infoContainer} >
                    <View style={styles.nameContainer}>
                        <View style={{ flex: 1, marginEnd: scaler(12) }} >
                            <Text style={styles.name} >{group?.name}</Text>
                            <Text style={styles.address} >{getCityOnly(group?.city, group?.state, group?.country)}</Text>
                            {/* <Text style={styles.address} >{group?.city + ", " + (group?.state ? (group?.state + ", ") : "") + group?.country}</Text> */}
                        </View>
                        <View style={{ alignItems: 'flex-end' }} >
                            <View style={styles.typeContainer} >
                                <Image style={{ height: scaler(20), width: scaler(20) }} source={Images.ic_briefcase} />
                                <Text style={styles.groupType}>{(Language as any)?.[group?.category]}</Text>
                            </View>
                            {group?.radio_frequency ? <Text style={[styles.address, { textAlign: 'right', marginHorizontal: scaler(3) }]}>{Language.fm_freq} : {group?.radio_frequency}</Text> : null}
                        </View>
                    </View>
                    <Text autoLink style={styles.about} >{group?.details}</Text>
                </View>
                <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB' }} />
                {group?.is_admin ?
                    <>
                        <View style={styles.memberContainer} >
                            <TouchableOpacity onPress={() => {
                                NavigationService.navigate("Events", { id: props?.route?.params?.id })
                            }} style={{ flexDirection: 'row', alignItems: 'center' }} >
                                <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }} source={Images.ic_group_events} />
                                <Text style={styles.events} >{Language.events}</Text>
                                <Image style={{ height: scaler(12), resizeMode: 'contain' }} source={Images.ic_right} />
                            </TouchableOpacity>
                            <View style={{ height: 1, marginVertical: scaler(15), width: '100%', backgroundColor: '#DBDBDB' }} />
                            <Text style={styles.members} >{Language.members} <Text style={styles.membersCount} >({groupMembers?.length})</Text></Text>
                            {(isOpened ? groupMembers : groupMembers.slice(0, 5)).map((item, index) => {
                                return <Fragment key={index} >
                                    {index > 0 &&
                                        <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB' }} />
                                    }
                                    {_renderGroupMembers({ item, index })}
                                </Fragment>
                            })}
                            {/* <FlatList 
                        scrollEnabled={false}
                        // onLayout={(e) => {
                        //     const height = e.nativeEvent.layout.height
                        //     if (!isOpened) {
                        //         flatListHeightRef.current = height
                        //     }
                        // }}
                        // style={{ height: isOpened ? flatListHeightRef?.current : undefined }}
                        data={isOpened ? groupMembers : groupMembers.slice(0, 5)}
                        renderItem={_renderGroupMembers}
                        ItemSeparatorComponent={() => (
                            <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB' }} />
                        )}
                    /> */}
                            {(!isOpened && groupMembers?.length > 5) && <>
                                <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB' }} />
                                <TouchableOpacity onPress={() => setOpened(true)} style={{ alignItems: 'center', flexDirection: 'row', paddingVertical: scaler(15), paddingHorizontal: scaler(10) }} >
                                    <Text style={styles.events} >{(groupMembers?.length - 5)} {Language.more}</Text>
                                    <Image style={{ transform: [{ rotate: '90deg' }], height: scaler(12), resizeMode: 'contain' }} source={Images.ic_right} />
                                </TouchableOpacity>
                            </>}
                        </View>
                        <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB' }} />
                        {renderBottomActionButtons()}
                    </>
                    :
                    group?.status != 6 &&
                    <>
                        <Text style={{ padding: scaler(15), fontWeight: '500', fontSize: scaler(15) }}>{Language.group_admin}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: scaler(15), marginBottom: scaler(15) }}>
                            <ImageLoader
                                placeholderSource={Images.ic_home_profile}
                                source={{ uri: getImageUrl(group?.creator_of_group?.image, { width: scaler(70), type: 'users' }) ?? Images.ic_image_placeholder }}
                                style={{ height: scaler(50), width: scaler(50), borderRadius: scaler(25) }} />
                            <View style={{ marginLeft: scaler(10), flex: 1 }}>
                                <Text>
                                    {group?.creator_of_group?.first_name + ' ' + group?.creator_of_group?.last_name}
                                </Text>
                                {group?.creator_of_group?.bio ? <TouchableOpacity style={{ alignSelf: 'baseline', }} onPress={_showBio}>
                                    <Text style={{ color: colors.colorPrimary, fontWeight: '500', fontSize: scaler(12), }} >{Language.click_for_bio}</Text></TouchableOpacity> : null}
                            </View>

                            {/* {group?.is_group_member ? */}
                            <TouchableOpacity style={{ paddingHorizontal: scaler(10) }} onPress={() => {
                                console.log("person", group?.creator_of_group);
                                NavigationService.navigate("PersonChat", { person: group?.creator_of_group })
                            }}>
                                <Image
                                    source={Images.ic_chat_message}
                                    style={{ height: scaler(30), width: scaler(30), resizeMode: 'contain' }}
                                />
                                {(unreadCountOfAdmin || 0) > 0 && <View style={{ alignItems: 'center', justifyContent: 'center', position: 'absolute', top: -scaler(3), end: scaler(5), height: scaler(18), width: scaler(18), borderWidth: scaler(2), borderColor: colors.colorWhite, borderRadius: scaler(15), backgroundColor: colors.colorPrimary }}>
                                    <Text style={{ color: colors.colorWhite, fontSize: scaler(10) }} >{unreadCountOfAdmin || 0}</Text>
                                </View>}
                            </TouchableOpacity>
                            {/* : undefined} */}
                        </View>
                    </>
                }

            </ScrollView>
            {group?.is_admin ? null : renderBottomActionButtons()}
        </SafeAreaViewWithStatusBar>
    )
    return null
}
interface IBottomButton {
    title: string
    icon: ImageSourcePropType
    visibility?: boolean
    onPress?: (e?: GestureResponderEvent) => void
    hideBottomBar?: boolean
    buttonTextColor?: ColorValue
    noTint?: boolean
}
const BottomButton: FC<IBottomButton> = ({ title, icon, visibility = true, onPress, hideBottomBar = false, buttonTextColor = colors.colorRed, noTint = false }) => {
    return visibility ? (
        <>
            <TouchableOpacity onPress={onPress} activeOpacity={1} style={{ backgroundColor: colors.colorWhite, paddingVertical: scaler(15), flexDirection: 'row', alignItems: 'center' }} >
                <Image source={icon} style={{ height: scaler(25), width: scaler(25), resizeMode: 'contain', tintColor: noTint ? undefined : buttonTextColor }} />
                <Text style={{ color: buttonTextColor, marginLeft: scaler(10) }} >{title}</Text>
            </TouchableOpacity>
            {!hideBottomBar && <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB' }} />}
        </>
    ) : null
}

const InnerButton = (props: { visible?: boolean, hideBorder?: boolean, title: string, icon?: ImageSourcePropType, onPress?: (e?: GestureResponderEvent) => void }) => {
    const { onPress, title, icon, visible = true } = props
    return visible ? (
        <TouchableOpacity onPress={onPress} style={{
            flexDirection: 'row',
            paddingHorizontal: scaler(15), paddingVertical: scaler(8),
            borderBottomColor: colors.colorGreyText,
            borderBottomWidth: props?.hideBorder ? 0 : 0.7,
        }} >
            <Text style={{ flexGrow: 1, textAlign: 'left', fontWeight: '400', fontSize: scaler(12), color: colors.colorBlackText }} >{title}</Text>
        </TouchableOpacity>
    ) : null
}

export default GroupDetail

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        overflow: 'hidden'
    },
    linearGradient: {
        position: 'absolute',
        height: scaler(80),
        top: width - scaler(80),
        width: '100%'
    },
    infoContainer: {
        width: '100%',
        padding: scaler(15),
        paddingTop: scaler(5),
    },
    nameContainer: {
        flexDirection: 'row',
    },
    name: {
        fontSize: scaler(17),
        fontWeight: '600',
        color: "#272727",
    },
    address: {
        fontSize: scaler(12),
        fontWeight: '400',
        color: colors.colorGreyInactive,
        marginTop: scaler(2)
    },
    groupType: {
        fontSize: scaler(12),
        fontWeight: '500',
        textTransform: 'capitalize',
        paddingHorizontal: scaler(5),
        color: colors.colorWhite,
    },
    typeContainer: {
        marginTop: scaler(10),
        flexDirection: 'row',
        borderRadius: scaler(20),
        alignItems: 'center',
        padding: scaler(4),
        // alignSelf: 'baseline',
        backgroundColor: colors.colorPrimary
    },
    about: {
        fontSize: scaler(12),
        fontWeight: '400',
        textTransform: 'capitalize',
        color: '#9A9A9A',
        marginTop: scaler(6),
    },
    memberContainer: {
        padding: scaler(20),
        paddingBottom: scaler(5),
    },
    events: {
        fontSize: scaler(13),
        fontWeight: '500',
        color: colors.colorBlackText,
        flex: 1
    },
    members: {
        fontSize: scaler(15),
        fontWeight: '500',
        color: colors.colorBlack,
    },
    membersCount: {
        fontSize: scaler(11),
        fontWeight: '400',
        color: colors.colorBlack,
    },
    backButton: {
        borderRadius: scaler(20), height: scaler(35), width: scaler(35),
        alignItems: 'center', justifyContent: 'center'
    },
    imgBack: {
        width: '100%',
        height: '100%', resizeMode: 'contain'
    },
    fabActionContainer: {
        borderRadius: scaler(10),
        paddingVertical: scaler(4),
        backgroundColor: colors.colorWhite,
        alignItems: 'flex-start',
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingVertical: scaler(20),
        alignItems: 'center',
        backgroundColor: colors.colorWhite
    },
    buttonText: {
        fontWeight: '400',
        fontSize: scaler(14),
        marginLeft: scaler(20)
    },
})
