import { useFocusEffect } from '@react-navigation/native'
import { RootState } from 'app-store'
import { getGroupDetail } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Card, Text, useStatusBar } from 'custom-components'
import { IBottomMenuButton } from 'custom-components/BottomMenu'
import { MemberListItem } from 'custom-components/ListItem/ListItem'
import { isEqual } from 'lodash'
import React, { FC, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, FlatList, GestureResponderEvent, Image, ImageSourcePropType, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import Language, { useLanguage } from 'src/language/Language'
import { getImageUrl, getShortAddress, NavigationService, scaler, _showBottomMenu } from 'utils'
const { height, width } = Dimensions.get('screen')
const gradientColors = ['rgba(255,255,255,0)', 'rgba(255,255,255,0.535145)', '#fff']



const GroupDetail: FC<any> = (props) => {
    const language = useLanguage()
    const BottomMenuButtons = useMemo<Array<IBottomMenuButton>>(() => [
        {
            title: Language.block,
            onPress: () => {

            }
        },
        {
            title: Language.report,
            onPress: () => {

            }
        },
        {
            title: Language.remove,
            onPress: () => {

            },
            textStyle: { color: colors.colorRed }
        }
    ], [language])

    const [isOpened, setOpened] = useState(false)
    const [isEditButtonOpened, setEditButtonOpened] = useState(false)
    const flatListHeightRef = useRef(0)
    const dispatch = useDispatch()
    const { pushStatusBarStyle, popStatusBarStyle } = useStatusBar()

    const { group, groupMembers } = useSelector((state: RootState) => ({
        group: state?.group?.groupDetail?.group,
        groupMembers: state?.group?.groupDetail?.groupMembers,
    }), isEqual)

    // console.log("group", group)

    useLayoutEffect(() => {
        // console.log("payload", props)
        dispatch(getGroupDetail(props?.route?.params?.id))
    }, [])

    useFocusEffect(useCallback(() => {
        pushStatusBarStyle({ translucent: true, backgroundColor: 'transparent', barStyle: 'light-content' })
        return () => {
            popStatusBarStyle()
        }
    }, []))

    const _renderGroupMembers = useCallback(({ item, index }) => {
        return (
            <MemberListItem
                onLongPress={item?.is_admin ? undefined : () => {
                    _showBottomMenu({
                        buttons: BottomMenuButtons
                    })
                }}
                containerStyle={{ paddingHorizontal: scaler(0) }}
                title={item?.user?.display_name}
                customRightText={item?.is_admin ? Language?.admin : ""}
                icon={item?.user?.image ? { uri: getImageUrl(item?.user?.image, { type: 'users', width: scaler(50) }) } : null}
                defaultIcon={Images.ic_home_profile}
            />
        )
    }, [])

    if (group)
        return (
            <SafeAreaView style={styles.container} edges={['bottom']} >
                <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true} style={styles.container} >
                    <Image source={group?.image ? { uri: getImageUrl(group?.image, { width: width, type: 'groups' }) } : Images.ic_group_placeholder}
                        style={{ width: width, height: width, resizeMode: 'cover' }} />
                    <LinearGradient colors={gradientColors} style={styles.linearGradient} />
                    <View style={{ width: '100%', top: scaler(30), position: 'absolute', flexDirection: 'row', padding: scaler(20), justifyContent: 'space-between' }} >
                        <TouchableOpacity onPress={() => NavigationService.goBack()} style={styles.backButton} >
                            <Image style={styles.imgBack} source={Images.ic_back_group} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditButtonOpened(!isEditButtonOpened)} style={styles.backButton} >
                            <Image style={styles.imgBack} source={Images.ic_more_group} />
                        </TouchableOpacity>
                    </View>
                    {isEditButtonOpened ?
                        <View style={{ position: 'absolute', right: scaler(20), top: scaler(90) }} >
                            <Card cardElevation={2} style={styles.fabActionContainer} >
                                <InnerButton visible={group?.is_admin ? true : false} onPress={() => {
                                    NavigationService.navigate("CreateGroup", { group })
                                    setEditButtonOpened(false)
                                }} title={Language.edit} />
                                <InnerButton title={Language.share} />
                                <InnerButton title={Language.export_chat} />
                                <InnerButton title={Language.import_chat}
                                    hideBorder
                                />
                            </Card>

                        </View> : null

                    }
                    <View style={styles.infoContainer} >
                        <View style={styles.nameContainer}>
                            <View style={{ flex: 1, marginEnd: scaler(12) }} >
                                <Text style={styles.name} >{group?.name}</Text>
                                <Text style={styles.address} >{getShortAddress(group?.address, group?.state)}</Text>
                            </View>
                            <View style={styles.typeContainer} >
                                <Image style={{ height: scaler(20), width: scaler(20) }} source={Images.ic_briefcase} />
                                <Text style={styles.groupType}>{group?.category}</Text>
                            </View>
                        </View>
                        <Text style={styles.about} >{group?.details}</Text>
                    </View>
                    <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB' }} />
                    {group?.is_admin ? <View style={styles.memberContainer} >
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} >
                            <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }} source={Images.ic_group_events} />
                            <Text style={styles.events} >{Language.events}</Text>
                            <Image style={{ height: scaler(12), resizeMode: 'contain' }} source={Images.ic_right} />
                        </TouchableOpacity>
                        <View style={{ height: 1, marginVertical: scaler(15), width: '100%', backgroundColor: '#DBDBDB' }} />
                        <Text style={styles.members} >Members <Text style={styles.membersCount} >({groupMembers?.length})</Text></Text>
                        <FlatList
                            nestedScrollEnabled
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
                        />
                        {(!isOpened && groupMembers?.length > 5) && <>
                            <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB' }} />
                            <TouchableOpacity onPress={() => setOpened(true)} style={{ flex: 1, alignItems: 'center', flexDirection: 'row', paddingVertical: scaler(15), paddingHorizontal: scaler(10) }} >
                                <Text style={styles.events} >{(groupMembers?.length - 5)} {Language.more}</Text>
                                <Image style={{ transform: [{ rotate: '90deg' }], height: scaler(12), resizeMode: 'contain' }} source={Images.ic_right} />
                            </TouchableOpacity></>}
                    </View> : null}
                    <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB' }} />


                    <View style={{ paddingHorizontal: scaler(15) }} >
                        <BottomButton
                            title={Language.delete_group}
                            icon={Images.ic_delete}
                            visibility={group?.is_admin}
                            onPress={() => { }} />

                        <BottomButton
                            title={Language.leave_group}
                            icon={Images.ic_leave_group}
                            visibility
                            onPress={() => { }} />

                        <BottomButton
                            title={Language.report_group}
                            icon={Images.ic_report_group}
                            visibility
                            onPress={() => { }} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    return null
}
interface IBottomButton {
    title: string
    icon: ImageSourcePropType
    visibility?: boolean
    onPress?: (e?: GestureResponderEvent) => void
}
const BottomButton: FC<IBottomButton> = ({ title, icon, visibility = true, onPress }) => {

    return visibility ? (
        <>
            <TouchableOpacity style={{ paddingVertical: scaler(15), flexDirection: 'row', alignItems: 'center' }} >
                <Image source={icon} style={{ height: scaler(25), width: scaler(25), resizeMode: 'contain' }} />
                <Text style={{ color: colors.colorRed, marginLeft: scaler(10) }} >{title}</Text>
            </TouchableOpacity>
            <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB' }} />
        </>
    ) : null
}

const InnerButton = (props: { visible?: boolean, hideBorder?: boolean, title: string, icon?: ImageSourcePropType, onPress?: (e?: GestureResponderEvent) => void }) => {
    const { onPress, title, icon, visible = true } = props
    return visible ? (
        <TouchableOpacity onPress={onPress} style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'flex-end', paddingHorizontal: scaler(15), paddingVertical: scaler(8),
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
        alignSelf: 'baseline',
        backgroundColor: colors.colorPrimary
    },
    about: {
        fontSize: scaler(12),
        fontWeight: '400',
        textTransform: 'capitalize',
        color: '#9A9A9A',
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
    }
})
