import { useFocusEffect } from '@react-navigation/native'
import { RootState } from 'app-store'
import { deleteEvent, getEventDetail, muteUnmuteResource, reportResource } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Button, Card, Text, useStatusBar } from 'custom-components'
import { isEqual } from 'lodash'
import React, { FC, useCallback, useLayoutEffect, useState } from 'react'
import { Dimensions, GestureResponderEvent, Image, ImageSourcePropType, InteractionManager, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import Language from 'src/language/Language'
import { dateFormat, getImageUrl, getSymbol, NavigationService, scaler, stringToDate, _hidePopUpAlert, _showPopUpAlert } from 'utils'
const { height, width } = Dimensions.get('screen')
const gradientColors = ['rgba(255,255,255,0)', 'rgba(255,255,255,0.535145)', '#fff']



const EventDetail: FC<any> = (props) => {

    const [isEditButtonOpened, setEditButtonOpened] = useState(false)
    const dispatch = useDispatch()
    const { pushStatusBarStyle, popStatusBarStyle } = useStatusBar()

    const { event, eventMembers, is_event_joined } = useSelector((state: RootState) => ({
        event: state?.event?.eventDetail?.event,
        eventMembers: state?.event?.eventDetail?.eventMembers,
        is_event_joined: state?.event?.eventDetail?.is_event_joined
    }), isEqual)


    useLayoutEffect(() => {
        // console.log("payload", props)
        InteractionManager.runAfterInteractions(() => {
            dispatch(getEventDetail(props?.route?.params?.id))
        })
    }, [])

    useFocusEffect(useCallback(() => {
        pushStatusBarStyle({ translucent: true, backgroundColor: 'transparent', barStyle: 'light-content' })
        return () => {
            popStatusBarStyle()
        }
    }, []))


    // const _renderGroupMembers = useCallback(({ item, index }) => {
    //     return (
    //         <MemberListItem
    //             onLongPress={item?.is_admin ? undefined : () => {
    //                 _showBottomMenu({
    //                     buttons: getBottomMenuButtons(item)
    //                 })
    //             }}
    //             containerStyle={{ paddingHorizontal: scaler(0) }}
    //             title={item?.user?.first_name + " " + (item?.user?.last_name ?? "")}
    //             customRightText={item?.is_admin ? Language?.admin : ""}
    //             icon={item?.user?.image ? { uri: getImageUrl(item?.user?.image, { type: 'users', width: scaler(50) }) } : null}
    //             defaultIcon={Images.ic_home_profile}
    //         />
    //     )
    // }, [])

    const [isDefault, setDefault] = useState<boolean>(false)

    if (!event) {
        return <View style={styles.container}>
            <View style={{ width: width, height: width, alignItems: 'center', justifyContent: 'center', backgroundColor: colors?.colorFadedPrimary }}>
                <Image style={{ height: scaler(100), width: scaler(100) }} source={Images.ic_event_placeholder} />
            </View>
            <LinearGradient colors={gradientColors} style={styles.linearGradient} />
        </View>
    }
    return (
        <SafeAreaView style={styles.container} edges={['bottom']} >
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true} style={styles.container} >

                {isDefault || !event?.image ?
                    <View style={{ width: width, height: width, alignItems: 'center', justifyContent: 'center', backgroundColor: colors?.colorFadedPrimary }}>
                        <Image style={{ height: scaler(100), width: scaler(100) }} source={Images.ic_event_placeholder} />
                    </View>
                    : <Image onError={() => {
                        setDefault(true)
                    }} source={event?.image ? { uri: getImageUrl(event?.image, { width: width, type: 'events' }) } : Images.ic_group_placeholder}
                        style={{ width: width, height: width, resizeMode: 'cover' }} />}
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
                            {event?.is_admin ?
                                <><InnerButton visible={event?.is_admin ? true : false} onPress={() => {
                                    setEditButtonOpened(false)
                                    NavigationService.navigate('EditEvent', { id: event?._id })
                                }} title={Language.edit} /><InnerButton title={Language.share} /><InnerButton title={Language.cancel} textColor={colors.colorErrorRed} onPress={() => {
                                    _showPopUpAlert({
                                        message: Language.are_you_sure_cancel_event,
                                        onPressButton: () => {
                                            dispatch(deleteEvent(event?._id))
                                            _hidePopUpAlert()
                                            setTimeout(() => {
                                                NavigationService.navigate('HomeEventTab')
                                            }, 200);
                                        },
                                        buttonStyle: { backgroundColor: colors.colorErrorRed },
                                        buttonText: Language.yes_cancel,
                                    })
                                }
                                } hideBorder /></> :
                                <><InnerButton title={Language.share} /><InnerButton title={Language.mute} onPress={() => {
                                    _showPopUpAlert({
                                        message: Language.are_you_sure_mute_event,
                                        onPressButton: () => {
                                            dispatch(muteUnmuteResource({ data: { is_mute: '1', resource_type: "event", resource_id: event?._id } }))
                                            setTimeout(() => {
                                                NavigationService.navigate('HomeEventTab')
                                            }, 200);
                                            _hidePopUpAlert()
                                        },
                                        buttonText: Language.yes_mute,
                                        // cancelButtonText: Language.cancel
                                    })
                                }} /><InnerButton title={Language.report} onPress={() => {
                                    _showPopUpAlert({
                                        message: Language.are_you_sure_report_event,
                                        onPressButton: () => {
                                            dispatch(reportResource({ resource_id: event?._id, resource_type: 'event' }))
                                            _hidePopUpAlert()
                                        },
                                        buttonText: Language.yes_report,
                                        // cancelButtonText: Language.cancel
                                    })
                                }} hideBorder /></>
                            }
                        </Card>

                    </View> : null

                }
                <View style={styles.infoContainer} >
                    <View style={styles.nameContainer}>
                        <View style={{ flex: 1, marginEnd: scaler(12) }} >
                            <Text style={styles.name} >{event?.name}</Text>
                            <Text style={styles.address} >{event?.city + ", " + (event?.state ? (event?.state + ", ") : "") + event?.country}</Text>
                        </View>
                        <View >
                            <Text style={{ fontSize: scaler(19), fontWeight: '600' }}>{event?.is_free_event ? 'Free' : getSymbol(event?.event_currency) + event?.event_fees}</Text>
                            <Text style={styles.address} >{event?.is_free_event ? '' : Language.per_person}</Text>

                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: scaler(16) }}>
                        <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }} source={Images.ic_group_events} />
                        <Text style={styles.events} >{dateFormat(stringToDate(event?.event_date, 'YYYY-MM-DD', '-'), 'MMMMMM, DD, YYYY')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }} source={Images.ic_event_time} />
                        <Text style={styles.events} >{dateFormat(stringToDate(event?.event_date + " " + event?.event_start_time, "YYYY-MM-DD", "-"), 'hh:mm A')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: scaler(16) }}>
                        <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }} source={Images.ic_event_location} />
                        <Text style={styles.events} >{event?.city + ", " + (event?.state ? (event?.state + ", ") : "") + event?.country}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }} source={Images.ic_events_tickets} />
                        <Text style={styles.events} >{event?.is_admin ? event?.total_sold_tickets + ' ' + Language.participants : event?.capacity_type == 'limited' ? event?.capacity - event?.total_sold_tickets + ' ' + Language.tickets_available : Language.unlimited}</Text>
                    </View>
                    {event?.details ?
                        <View style={{ marginVertical: scaler(22) }}>
                            <Text style={styles.about} >{event?.details} </Text>
                        </View> : <View style={{ marginBottom: scaler(22) }} />
                    }
                    <View>
                        <Text style={{ fontWeight: '500', fontSize: scaler(15) }}>{Language.event_hosted_by}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: scaler(15) }}>
                            <Image source={{ uri: getImageUrl(event?.creator_of_event?.image, { width: 46, type: 'users' }) }} style={{ height: scaler(46), width: scaler(46), borderRadius: scaler(23) }} />
                            <Text style={{ marginLeft: scaler(10) }}>{event?.creator_of_event?.first_name + ' ' + event?.creator_of_event?.last_name}</Text>
                        </View>
                    </View>
                    {event?.short_description ?
                        <><Text style={{ fontWeight: '500', fontSize: scaler(15) }}>{Language.about_event}</Text><Text style={styles.about}>{event?.short_description}</Text></> : <View />
                    }
                    <View style={{ marginTop: scaler(20), flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ flex: 1 }}>{Language.members}</Text>
                        <Image style={{ height: scaler(14), resizeMode: 'contain' }} source={Images.ic_right} />
                    </View>

                </View>
                <View style={{ height: 1, width: '90%', backgroundColor: '#DBDBDB', alignSelf: 'center' }} />

            </ScrollView>
            {stringToDate(event?.event_date, 'YYYY-MM-DD', '-') > new Date() ?
                event?.is_admin ?
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: scaler(10) }}>
                        <View style={{ flex: 1 }}>
                            <Button title={Language.add_to_calender} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Button title={Language.start_chat}
                                fontColor={'black'}
                                backgroundColor={'white'}
                                buttonStyle={{
                                    borderColor: 'black',
                                    borderWidth: scaler(1)
                                }}
                                textStyle={{ fontWeight: '400' }} />
                        </View>
                    </View> :
                    <View style={{ marginHorizontal: scaler(10) }}>
                        <Button title={Language.confirm}
                            onPress={() => NavigationService.navigate('BookEvent',
                                {
                                    name: event?.name,
                                    price: event?.event_fees,
                                    currency: event?.event_currency,
                                    capacity: event?.capacity,
                                    soldTickets: event?.total_sold_tickets,
                                    capacityType: event?.capacity_type
                                })} />
                    </View>
                : <View />
            }
            {/* {event?.is_admin ? null : renderBottomActionButtons()} */}
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
            <TouchableOpacity onPress={onPress} style={{ paddingVertical: scaler(15), flexDirection: 'row', alignItems: 'center' }} >
                <Image source={icon} style={{ height: scaler(25), width: scaler(25), resizeMode: 'contain' }} />
                <Text style={{ color: colors.colorRed, marginLeft: scaler(10) }} >{title}</Text>
            </TouchableOpacity>
            <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB' }} />
        </>
    ) : null
}

const InnerButton = (props: { visible?: boolean, hideBorder?: boolean, title: string, icon?: ImageSourcePropType, textColor?: string, onPress?: (e?: GestureResponderEvent) => void }) => {
    const { onPress, title, icon, visible = true, textColor } = props
    return visible ? (
        <TouchableOpacity onPress={onPress} style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'flex-end', paddingHorizontal: scaler(15), paddingVertical: scaler(8),
            borderBottomColor: colors.colorGreyText,
            borderBottomWidth: props?.hideBorder ? 0 : 0.7,
        }} >
            <Text style={{ flexGrow: 1, textAlign: 'left', fontWeight: '400', fontSize: scaler(12), color: textColor ?? colors.colorBlackText }} >{title}</Text>
        </TouchableOpacity>
    ) : null
}

export default EventDetail

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
        // color: colors.colorWhite,
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
