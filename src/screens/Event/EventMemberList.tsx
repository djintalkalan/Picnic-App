
import { reportResource, verifyQrCode } from 'app-store/actions';
import { RootState } from 'app-store/store';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { Text } from 'custom-components';
import { IBottomMenuButton } from 'custom-components/BottomMenu';
import ImageLoader from 'custom-components/ImageLoader';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, GestureResponderEvent, ImageSourcePropType, StyleProp, StyleSheet, TouchableHighlight, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { EMIT_EVENT_MEMBER_DELETE, SocketService } from 'socket';
import Language, { useLanguage } from 'src/language/Language';
import { getDisplayName, getImageUrl, getSymbol, NavigationService, scaler, _hidePopUpAlert, _showBottomMenu, _showPopUpAlert } from 'utils';

export const EventMemberList: FC<any> = (props) => {
    const dispatch = useDispatch();
    const { members } = useSelector((state: RootState) => ({
        members: state?.eventDetails?.[props?.route?.params?.id]?.[props?.route?.params?.isCheckedIn ? 'eventMembersCheckedIn' : 'eventMembersNotCheckedIn'],
    }))

    const [swipeKey, setSwipeKey] = useState((new Date()).toISOString())

    useEffect(() => {
        !props?.route?.params?.isCheckedIn && setSwipeKey((new Date()).toISOString())
    }, [members])


    const getButtons = useCallback((item: any) => {
        console.log('items', item)
        const buttons: Array<IBottomMenuButton> = []
        // buttons.push({
        //     title: Language.block_from_chat, onPress: () => {
        //         // dispatch(setActiveEvent(item))
        //         // setTimeout(() => {
        //         //     NavigationService.navigate('EditEvent', { id: _id })
        //         // }, 0);
        //     }
        // })
        buttons.push({
            title: Language.report_member, onPress: () => {
                _showPopUpAlert({
                    message: Language.are_you_sure_report_member,
                    onPressButton: () => {
                        dispatch(reportResource({ resource_id: item?.user_id, resource_type: 'user' }))
                        _hidePopUpAlert()
                    },
                    buttonText: Language.yes_report,
                    // cancelButtonText: Language.cancel
                })
            }
        })
        if (!props?.route?.params?.isCheckedIn) {
            buttons.push({
                title: Language.remove_from_event, textStyle: { color: colors.colorErrorRed }, onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_remove_member,
                        buttonStyle: { backgroundColor: colors.colorErrorRed },
                        onPressButton: () => {
                            SocketService.emit(EMIT_EVENT_MEMBER_DELETE, {
                                resource_id: item?.resource_id,
                                user_id: item?.user_id,
                            })
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_remove,
                        // cancelButtonText: Language.cancel
                    })
                }
            })
        }

        return buttons
    }, [useLanguage()])



    const _renderEventMembers = useCallback(({ item, index }) => {
        return (
            <MemberListItem
                onLongPress={() => {
                    !item?.is_creator ? _showBottomMenu({
                        buttons: getButtons(item)
                    }) : undefined
                }}
                title={getDisplayName(item?.user, true)}
                // customRightText={item?.is_admin ? Language?.admin : ""}
                icon={item?.user?.image ? { uri: getImageUrl(item?.user?.image, { type: 'users', width: scaler(50) }) } : null}
                defaultIcon={Images.ic_image_placeholder}
                noOfTickets={item?.tickets?.no_of_tickets}
                currency={item?.tickets?.currency}
                totalPaidAmount={item?.tickets?.total_paid_amount}
                paymentMethod={item?.tickets?.payment_method}
                isCheckedIn={item?.is_event_checked_in}
            />
        )
    }, [])

    const swipeListRef = useRef<SwipeListView<any>>(null);

    const _renderHiddenItem = useCallback(({ item, index }, rowMap) => (

        <View style={{ flex: 1, flexDirection: 'row' }} >
            <View style={{
                alignItems: 'center',
                backgroundColor: colors.colorPrimary,
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-start'
            }}>
                <TouchableOpacity onPress={() => {
                    swipeListRef?.current?.closeAllOpenRows()
                    dispatch(verifyQrCode({
                        data: {
                            resource_id: item?._id,
                            ticket_id: item?.tickets?.ticket_id
                        },
                        onSuccess: (b: boolean) => {
                            if (b) {
                                NavigationService.navigate("CheckedIn")
                            }
                        }
                    }))
                }} style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-start', width: scaler(70), backgroundColor: colors.colorPrimary }}>
                    <MaterialCommunityIcons color={colors.colorWhite} name={'cloud-check-outline'} size={scaler(17)} />
                    <Text style={{ marginTop: scaler(5), fontSize: scaler(11), color: colors.colorWhite }} >{Language.check_in}</Text>
                </TouchableOpacity>

            </View>

            <View style={{
                alignItems: 'center',
                backgroundColor: '#DFDFDF',
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-end'
            }}>

                <TouchableOpacity onPress={() => {
                    swipeListRef?.current?.closeAllOpenRows()
                    !item?.is_creator ? _showBottomMenu({
                        buttons: getButtons(item)
                    }) : undefined
                    // dispatch(blockUnblockResource({
                    //     data: {
                    //         resource_id: item?.blocked_user_id,
                    //         resource_type: item?.resource_type,
                    //         is_blocked: '0'
                    //     }
                    // }))
                }} style={{ alignItems: 'center', justifyContent: 'center', height: '100%', alignSelf: 'flex-end', width: scaler(70), backgroundColor: '#DFDFDF', }}>
                    <MaterialCommunityIcons color={colors.colorWhite} name={'dots-vertical'} size={scaler(24)} />
                    <Text style={{ marginTop: scaler(10), fontSize: scaler(11), color: colors.colorWhite }} >{Language.more}</Text>
                </TouchableOpacity>
            </View>

        </View>
    ), [])
    return (
        <View style={styles.container}>
            {props?.route?.params?.isCheckedIn ?
                <FlatList
                    data={members}
                    keyExtractor={(_, i) => i.toString()}
                    ItemSeparatorComponent={() => <View style={{ flex: 1, height: 1, backgroundColor: '#EBEBEB' }} />}
                    renderItem={_renderEventMembers} />
                :
                <SwipeListView
                    key={swipeKey}
                    ref={swipeListRef}
                    keyExtractor={(_, i) => i.toString()}
                    useFlatList
                    useNativeDriver
                    data={members}
                    renderItem={_renderEventMembers}
                    renderHiddenItem={_renderHiddenItem}
                    leftOpenValue={scaler(70)}
                    rightOpenValue={-scaler(70)}
                    closeOnRowOpen={true}
                    // disableLeftSwipe
                    ItemSeparatorComponent={() => <View style={{ flex: 1, height: 1, backgroundColor: '#EBEBEB' }} />}
                />
            }

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingHorizontal: scaler(15),
        backgroundColor: colors.colorWhite
    },
    iconStyle: {
        height: scaler(50),
        width: scaler(50),
        borderRadius: scaler(30),
        resizeMode: 'cover'
    },
    textContainer: {
        flex: 1,
        paddingVertical: scaler(5),
        justifyContent: 'space-between',
        // backgroundColor: 'red',
        marginHorizontal: scaler(10)
    },
    memberListTitle: {
        color: "#272727",
        flex: 1,
        fontWeight: '400',
        fontSize: scaler(14)
    },
    rightText: {
        color: colors.colorPrimary,
        fontWeight: '500',
        fontSize: scaler(11),
    },
    container2: {
        flexDirection: 'row',
        padding: scaler(15),
        paddingVertical: scaler(20),
        backgroundColor: colors.colorWhite,
    },
})

export default EventMemberList;




interface MemberListItemProps {
    title: string
    icon?: ImageSourcePropType | null
    defaultIcon: ImageSourcePropType
    isSelected?: boolean,
    containerStyle?: StyleProp<ViewStyle>
    customRightTextStyle?: StyleProp<ViewStyle>
    customRightText?: string | Element
    onPressImage?: (e?: GestureResponderEvent) => void
    onPress?: (e?: GestureResponderEvent) => void
    onLongPress?: (e?: GestureResponderEvent) => void
    noOfTickets: string
    currency: string
    totalPaidAmount: string
    paymentMethod: string
    isCheckedIn: string

}

export const MemberListItem: FC<MemberListItemProps> = ({ isCheckedIn, noOfTickets, currency, paymentMethod, totalPaidAmount, onPress, onLongPress, onPressImage, title, customRightText, customRightTextStyle, icon, defaultIcon, containerStyle, isSelected = false }) => {
    return (
        <TouchableHighlight onLongPress={onLongPress} onPress={onPressImage} underlayColor={colors.colorWhite} >
            <View style={[styles.container2, { ...StyleSheet.flatten(containerStyle) }]} >
                <TouchableHighlight style={{ alignSelf: 'center' }} onPress={onPressImage} underlayColor={colors.colorFadedPrimary} >
                    <ImageLoader
                        placeholderSource={defaultIcon}
                        //@ts-ignore
                        source={icon}
                        style={[styles.iconStyle, {
                            height: scaler(40),
                            width: scaler(40),
                        }]} />
                </TouchableHighlight>
                <View style={[styles.textContainer, { justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' }]} >
                    <Text style={styles.memberListTitle} >{title}</Text>

                </View>
                <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center' }} >
                    <View style={{ alignItems: 'center', marginEnd: scaler(15), padding: scaler(1), aspectRatio: 1, justifyContent: 'center', minHeight: scaler(20), minWidth: scaler(20), borderRadius: scaler(100), backgroundColor: colors.colorPrimary }} >
                        <Text style={{ fontSize: scaler(11.5), color: colors.colorWhite }} >{noOfTickets}</Text>
                    </View>
                    <View style={{ marginHorizontal: scaler(5), alignItems: 'center' }} >
                        <Text style={{ color: '#797979', fontSize: scaler(13) }} >{paymentMethod}</Text>
                        <Text style={{ fontWeight: '600', color: '#272727', fontSize: scaler(14) }} >{getSymbol(currency) + totalPaidAmount}</Text>
                    </View>
                    {(paymentMethod == 'cash' && !isCheckedIn) ?
                        <MaterialCommunityIcons size={scaler(22)} name={'checkbox-marked-circle-outline'} color={colors.colorPrimary} />
                        : null}
                </View>

            </View>
        </TouchableHighlight>
    )
}
