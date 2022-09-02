import { config } from 'api'
import { _copyEvent } from 'api/APIProvider'
import { RootState } from 'app-store'
import { deleteEvent, getEventDetail, leaveEvent, muteUnmuteResource, reportResource, setActiveGroup, setLoadingAction } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Button, Card, Text, TextInput } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import ImageLoader from 'custom-components/ImageLoader'
import { ListItem } from 'custom-components/ListItem/ListItem'
import { useVideoPlayer } from 'custom-components/VideoProvider'
import { add } from 'date-fns'
import { isEqual } from 'lodash'
import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, GestureResponderEvent, Image, ImageSourcePropType, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native'
import { presentEventCreatingDialog } from 'react-native-add-calendar-event'
import LinearGradient from 'react-native-linear-gradient'
//@ts-ignore
import Carousel from 'react-native-looped-carousel'
import QRCode from 'react-native-qrcode-svg'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useDispatch, useSelector } from 'react-redux'
import Language from 'src/language/Language'
import { dateFormat, formatAmount, getCityOnly, getImageUrl, launchMap, NavigationService, scaler, shareDynamicLink, _hidePopUpAlert, _hideTouchAlert, _showErrorMessage, _showPopUpAlert, _showTouchAlert, _zoomImage } from 'utils'


const { height, width } = Dimensions.get('screen')
const gradientColors = ['rgba(255,255,255,0)', 'rgba(255,255,255,0.535145)', '#fff']

const ASPECT_RATIO = width / height;
const DefaultDelta = {
    latitudeDelta: 0.3,
    longitudeDelta: 0.3 * ASPECT_RATIO,
}

const EventDetail: FC<any> = (props) => {

    const dispatch = useDispatch()
    const eventNameRef = useRef("")
    const { loadVideo } = useVideoPlayer()
    const [imageArray, setImageArray] = useState<Array<any>>([])
    const [selectedBullet, setSelectedBullet] = useState<number>(0)
    const { event } = useSelector((state: RootState) => ({
        event: state?.eventDetails?.[props?.route?.params?.id]?.event,
    }), isEqual)

    const eventDate = new Date(event?.event_start_date_time);

    const endSales = event?.sales_ends_on ? new Date(event?.sales_ends_on) : eventDate;


    const { isCancelledByMember, activeTicket }: { isCancelledByMember: boolean, activeTicket: any } = useMemo(() => {
        if (event?.my_tickets) {
            const index = event?.my_tickets?.findIndex((_: any) => _.status == 1) ?? -1
            const activeTicket = index > -1 ? event?.my_tickets[index] : null

            if (activeTicket) {
                activeTicket.event_tax_rate = activeTicket.event_tax_rate || event?.event_tax_rate
                activeTicket.event_tax_amount = (activeTicket.event_tax_rate * (activeTicket?.no_of_tickets - (activeTicket?.no_of_free_tickets_used || 0)) * activeTicket.amount / 100)
                if (activeTicket.plan_id) {
                    activeTicket.ticket_name = activeTicket.selected_plan?.name
                    activeTicket.currency = activeTicket.selected_plan?.currency
                } else {
                    activeTicket.currency = event?.event_currency
                }
                activeTicket.total_paid_amount = (activeTicket.total_paid_amount) || (activeTicket.event_tax_amount + activeTicket?.total_tickets_amount)
            }
            console.log("activeTicket", activeTicket);

            return {
                isCancelledByMember: (!event?.my_tickets?.length || index > -1) ? false : true,
                activeTicket
            }
        }
        return {
            isCancelledByMember: false,
            activeTicket: null
        }
    }, [event?.my_tickets])

    useLayoutEffect(() => {
        setTimeout(() => {
            // NavigationService.goBack()
            dispatch(getEventDetail(props?.route?.params?.id))

        }, 200);
    }, [])

    useEffect(() => {
        if (event?.image || event?.event_images) {
            setImageArray([...(event?.image ? [{ type: 'image', name: event?.image }] : []), ...(event?.event_images || [])])
        }
    }, [event])

    const _showCancellationPolicy = useCallback(() => {
        _showPopUpAlert({
            message: Language.are_you_sure_cancel_reservation + '?',
            customView: !event?.is_free_event && activeTicket?.payment_method == 'paypal' && event?.event_refund_policy?.trim() ? () => <TouchableOpacity
                onPress={() => {
                    event?.event_refund_policy ?
                        _showPopUpAlert({
                            message: event?.event_refund_policy,
                            cancelButtonText: null,
                            onPressButton: () => {
                                _showCancellationPolicy()
                            },
                            buttonStyle: { backgroundColor: colors.colorErrorRed },
                            buttonText: Language.close,
                        })
                        : _showErrorMessage(Language.refund_policy_not_available)
                }}>
                <Text style={{ fontSize: scaler(15), color: colors.colorPrimary }}>{Language?.read_refund_policy}</Text>
            </TouchableOpacity> : undefined,
            onPressButton: () => {
                dispatch(leaveEvent(event?._id))
                _hidePopUpAlert()
            },
            buttonText: Language.yes_cancel,
        })
    }, [event, activeTicket])



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

    const region = useMemo(() => ({
        latitude: parseFloat(event?.location?.coordinates?.[1] ?? 0),
        longitude: parseFloat(event?.location?.coordinates?.[0] ?? 0),
        ...DefaultDelta
    }), [event])

    const ticket_plans = useMemo(() => (event?.ticket_type == 'single' ? [] : (event?.ticket_plans || [])), [event])


    const shareEvent = useCallback(() => {
        shareDynamicLink(event?.name, {
            type: "event-detail",
            id: event?._id
        });
    }, [event])

    const onConfirmCopy = useCallback(() => {
        // _hidePopUpAlert()
        // return NavigationService.navigate('CreateEvent1', { id: '6290baf6c3a91bc2b5a6bbfe', copy: "1" })
        if (!eventNameRef.current?.trim()) {
            _showErrorMessage(Language.event_name_required)
            return
        }
        if (eventNameRef.current?.trim()?.length < 3) {
            _showErrorMessage(Language.min_characters_event_name)
            return
        }
        dispatch(setLoadingAction(true))
        _copyEvent({ _id: event?._id, name: eventNameRef.current }).
            then((res) => {
                dispatch(setLoadingAction(false))
                _hidePopUpAlert()
                if (res?.status == 200) {
                    NavigationService.navigate('CreateEvent1', { id: res?.data, copy: "1" })
                    eventNameRef.current = ''
                }
                else {
                    _showErrorMessage(res?.message)
                }
            }).
            catch(e => {
                console.log(e)
                dispatch(setLoadingAction(false))
            })
    }, [event])

    const onCopyEvent = useCallback(() => {
        return (
            _showPopUpAlert({
                title: Language.copy + ' ' + event?.name,
                customView: () => <View style={{ width: '100%' }}>
                    <TextInput
                        containerStyle={{ marginEnd: scaler(4) }}
                        placeholder={Language.new_event_name}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'eventName'}
                        onChangeText={(text) => eventNameRef.current = text}
                        required={true}
                    />
                </View>,
                buttonText: Language.copy,
                buttonStyle: { backgroundColor: colors.colorPrimary },
                onPressButton: onConfirmCopy,
                onPressCancel: () => {
                    eventNameRef.current = ''
                }
            })
        )
    }, [event?.name, onConfirmCopy])

    const dotMenuButtonRef = useRef<TouchableOpacity>(null)
    const priceButtonRef = useRef<TouchableOpacity>(null)

    const openEditButton = useCallback((e?: GestureResponderEvent) => {
        dotMenuButtonRef.current?.measureInWindow((x, y, w, h) => {
            _showTouchAlert({
                placementStyle: {
                    // top,
                    // right: width - left,
                    top: y + h + scaler(5) + (StatusBar.currentHeight || 0),
                    right: width - (w + x)
                },
                transparent: true,
                alertComponent: () => {
                    if (event?.is_admin && eventDate < new Date()) {
                        return <Card cardElevation={2} style={styles.fabActionContainer} >
                            <InnerButton hideBorder visible={true} onPress={() => {
                                _hideTouchAlert()
                                onCopyEvent()
                            }} title={Language.copy} />
                        </Card>
                    }

                    return (
                        <Card cardElevation={2} style={styles.fabActionContainer} >
                            {event?.is_admin ?
                                <><InnerButton visible={event?.is_admin ? true : false} onPress={() => {
                                    _hideTouchAlert()
                                    NavigationService.navigate('CreateEvent1', { id: event?._id })
                                }} title={Language.edit} />
                                    <InnerButton visible={event?.is_admin ? true : false} onPress={() => {
                                        _hideTouchAlert()
                                        onCopyEvent()
                                    }} title={Language.copy} />
                                    <InnerButton onPress={() => {
                                        shareEvent();
                                        _hideTouchAlert()
                                    }} title={Language.share} />
                                    <InnerButton title={Language.cancel} textColor={colors.colorErrorRed} onPress={() => {
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
                                        // _hidePopUpAlert()
                                        _hideTouchAlert()
                                    }
                                    } hideBorder /></>
                                :
                                <><InnerButton onPress={() => {
                                    shareEvent();
                                    _hideTouchAlert()
                                }} title={Language.share} />
                                    <InnerButton title={Language.mute} onPress={() => {
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
                                        _hideTouchAlert()
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
                                        _hideTouchAlert()
                                    }} hideBorder={event?.is_event_member ? false : true} />
                                    {event?.is_event_member ?
                                        <InnerButton title={Language.cancel} textColor={colors.colorErrorRed} onPress={() => {
                                            _showCancellationPolicy()
                                            _hideTouchAlert()
                                        }} hideBorder /> : undefined}
                                </>
                            }
                        </Card>
                    )
                }
            })
        })
    }, [event])

    const showAllTicketVisible = useCallback((e?: GestureResponderEvent) => {
        priceButtonRef.current?.measureInWindow((x, y, w, h) => {
            _showTouchAlert({
                placementStyle: {
                    top: y + h + (StatusBar.currentHeight || 0),
                    right: width - (x + w),
                    maxWidth: width - 2 * (width - (x + w)),
                },
                transparent: true,
                alertComponent: () => {
                    return (
                        <Card style={styles.planView} useCompatPadding={false} cornerRadius={scaler(5)} cardElevation={3} >
                            <View style={{ borderRadius: scaler(5) }}>
                                {ticket_plans?.map((_: any, i: number) => {
                                    if (_.status == 1)
                                        return <TicketPlans key={i} {..._} />
                                })}
                            </View>
                        </Card>
                    )
                }
            })
        })
    }, [event])


    const calculateButtonDisability = useCallback(() => {
        if (!(event?.payment_api_username || event?.payment_email) &&
            (!event?.payment_method?.includes('cash') &&
                !event?.is_free_event)) {
            return true;
        }
        return false;
    }, [event]);

    if (!event) {
        return <SafeAreaViewWithStatusBar barStyle={'light-content'} translucent edges={['left']} backgroundColor={colors.colorWhite} style={styles.container}>
            <View style={styles.placeholder}>
                <Image style={styles.eventImage} source={Images.ic_event_placeholder} />
            </View>
            <LinearGradient colors={gradientColors} style={styles.linearGradient} />
        </SafeAreaViewWithStatusBar>
    }
    return (
        <SafeAreaViewWithStatusBar backgroundColor={colors.colorWhite} barStyle={'light-content'} translucent edges={['bottom']} >
            <ScrollView bounces={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true} style={styles.container} >
                <View style={{ width: width, height: width, backgroundColor: colors?.colorFadedPrimary }}>
                    {imageArray?.length > 0 ?
                        <Carousel
                            delay={4000}
                            style={{ flex: 1 }}
                            autoplay={true}
                            bullets={false}
                            onAnimateNextPage={(i: number) => selectedBullet != i && setSelectedBullet(i)}  >
                            {imageArray?.map((_: any, i: number) => {
                                return (
                                    <TouchableOpacity style={styles.customSlide}
                                        key={i}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            _.type == 'image' ?
                                                _zoomImage(getImageUrl(_?.name, { type: 'events' })) :
                                                loadVideo && loadVideo(config.VIDEO_URL + _.name)
                                        }}>
                                        {i > (event?.image ? 0 : -1) && _.type == 'image' ?
                                            <SafeAreaView edges={['top', 'bottom']} >
                                                <Image style={[styles.customImage, _.type != 'image' ? { resizeMode: 'contain' } : { resizeMode: 'contain' }]}
                                                    source={{
                                                        uri: _.type == 'image' ?
                                                            getImageUrl(_?.name, { width: width, type: 'events' }) :
                                                            config.VIDEO_URL + (_?.name?.substring(0, _?.name?.lastIndexOf("."))) + "-00001.png"
                                                    }} />
                                            </SafeAreaView> :
                                            <Image style={[styles.customImage, _.type != 'image' ? { resizeMode: 'contain' } : { resizeMode: 'contain' }]}
                                                source={{
                                                    uri: _.type == 'image' ?
                                                        getImageUrl(_?.name, { width: width, type: 'events' }) :
                                                        config.VIDEO_URL + (_?.name?.substring(0, _?.name?.lastIndexOf("."))) + "-00001.png"
                                                }} />}
                                        {_.type == 'video' ?
                                            <TouchableOpacity style={styles.playButton} onPress={() => { loadVideo && loadVideo(config.VIDEO_URL + _.name) }} >
                                                <Ionicons color={colors.colorPrimary} name="play-circle" size={scaler(60)} />
                                            </TouchableOpacity> : undefined}

                                        {/* <ImageLoader
                                        // onPress={() => event?.image && _zoomImage(getImageUrl(event?.image, { type: 'events' }))}
                                        //@ts-ignore
                                        style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                        placeholderSource={Images.ic_event_placeholder}
                                        placeholderStyle={{}}
                                        source={{ uri: _.type == 'image' ? getImageUrl(_?.name, { width: width, type: 'events' }) : config.VIDEO_URL + (_?.name?.substring(0, _?.name?.lastIndexOf("."))) + "-00001.png" }} /> */}
                                    </TouchableOpacity>
                                );
                            })}
                        </Carousel>
                        :
                        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                            <Image source={Images.ic_event_placeholder} style={{}} />
                        </View>

                    }
                </View>

                <LinearGradient colors={gradientColors} style={styles.linearGradient} />
                {imageArray?.length > 0 && <View style={styles.bulletContainer} >
                    {imageArray?.map((b, i) => (<View key={i} style={selectedBullet == i ? styles.selectedBulletStyle : styles.bulletStyle} />))}
                </View>}
                <View style={styles.subHeading} >
                    <TouchableOpacity onPress={() => NavigationService.goBack()} style={styles.backButton} >
                        <Image style={styles.imgBack} source={Images.ic_back_group} />
                    </TouchableOpacity>
                    {event.status == 1 && (eventDate >= new Date() || event?.is_admin) ?
                        <TouchableOpacity ref={dotMenuButtonRef} onPress={() => openEditButton()} style={styles.backButton} >
                            <Image style={styles.imgBack} source={Images.ic_more_group} />
                        </TouchableOpacity>
                        : undefined}
                </View>
                <View style={styles.infoContainer} >
                    <View style={styles.nameContainer}>
                        <View style={{ flex: 1, marginEnd: scaler(12) }} >
                            <Text style={styles.name} >{event?.name}</Text>
                            <View style={{ alignItems: 'center', flexDirection: 'row' }} >
                                <Text style={styles.address} >
                                    {/* {event?.city + ", " + (event?.state ? (event?.state + ", ") : "") + event?.country} */}
                                    {getCityOnly(event?.city, event?.state, event?.country)}
                                </Text>
                            </View>
                        </View>
                        <View>
                            <TouchableOpacity ref={priceButtonRef} disabled={!ticket_plans?.length} onPress={() => !event?.is_free_event ? showAllTicketVisible() : undefined} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ alignItems: 'flex-end' }} >
                                    <Text style={{ fontSize: scaler(19), fontWeight: '600' }}>
                                        {event?.is_free_event ? Language.free : formatAmount(event?.event_currency, event?.event_fees)}
                                    </Text>
                                    {event?.is_free_event && event?.is_donation_enabled ?
                                        <Text style={{ fontSize: scaler(10.5), fontWeight: '400', color: colors.colorGreyInactive }}>{Language.donation_accepted}</Text>
                                        : null}
                                </View>
                                {(ticket_plans?.length > 0 && !event?.is_free_event) ?
                                    <Image source={Images.ic_arrow_dropdown} style={{ height: scaler(30), width: scaler(30), tintColor: colors.colorBlack }} />
                                    : undefined}
                            </TouchableOpacity>
                            <Text style={styles.address} >{event?.is_free_event ? '' : Language.per_person}</Text>

                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', zIndex: -1 }} >
                        <View style={{ flex: 1 }} >

                            {event?.is_multi_day_event != 1 ?
                                <><View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: scaler(16) }}>
                                    <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }}
                                        source={Images.ic_group_events} />
                                    <Text style={styles.events}>
                                        {dateFormat(new Date(event?.event_start_date_time), 'MMMMMM, DD, YYYY')}
                                    </Text>
                                </View><View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }}
                                            source={Images.ic_event_time} />
                                        <Text style={styles.events}>
                                            {dateFormat(new Date(event?.event_start_date_time), 'hh:mm A')}
                                        </Text>
                                    </View></>
                                : <>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(16), marginBottom: scaler(8), }}>
                                        <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }}
                                            source={Images.ic_group_events} />
                                        <View>
                                            <Text style={styles.dateTitle}>
                                                {Language.start_date}
                                            </Text>
                                            <Text style={styles.events}>
                                                {dateFormat(new Date(event?.event_start_date_time), 'MMMMMM, DD, YYYY hh:mm A')}
                                            </Text>
                                        </View>

                                    </View><View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scaler(16) }}>
                                        <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }}
                                            source={Images.ic_group_events} />
                                        <View>
                                            <Text style={styles.dateTitle}>
                                                {Language.end_date}
                                            </Text>
                                            <Text style={styles.events}>
                                                {dateFormat(new Date(event?.event_end_date_time), 'MMMMMM, DD, YYYY hh:mm A')}
                                            </Text>
                                        </View>

                                    </View></>}


                        </View>

                        {activeTicket || isCancelledByMember ?
                            isCancelledByMember ?
                                <Image style={{ resizeMode: 'contain', height: scaler(100), width: scaler(100) }} source={Images.ic_cancelled} />
                                :
                                <View style={{ padding: scaler(10) }} >
                                    <QRCode
                                        value={"picnic-groups" + activeTicket?.ticket_id}
                                        size={scaler(80)}
                                    // logoSize={scaler(40)}
                                    />
                                    <Text style={styles.ticketId} >{activeTicket?.ticket_id}</Text>
                                </View> : null}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical: scaler(10) }}>
                        <View style={{ flex: 1 }} >
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: scaler(10) }}>
                                <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }}
                                    source={Images.ic_event_location} />
                                <Text onPress={() => {
                                    launchMap({ lat: region?.latitude, long: region?.longitude })
                                }} style={[styles.events, { color: colors.colorLink, fontWeight: '400', flex: 1 }]} >
                                    {/* {event?.city + ", " + (event?.state ? (event?.state + ", ") : "") + event?.country} */}
                                    {event?.address}
                                </Text>

                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image style={{ width: scaler(30), height: scaler(30), marginEnd: scaler(10) }}
                                    source={Images.ic_events_tickets} />
                                <Text style={styles.events} >
                                    {event?.is_admin ?
                                        event?.total_sold_tickets + ' ' + Language.participants : event?.capacity_type == 'limited'
                                            ? event?.capacity - event?.total_sold_tickets + ' ' + Language.tickets_available
                                            : Language.unlimited_entry}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {event?.short_description ?
                        <View style={{ marginVertical: scaler(15) }}>
                            <Text autoLink style={styles.about} >{event?.short_description}</Text>
                        </View> : <View style={{ marginBottom: scaler(15) }} />
                    }
                    {/* <View style={{ height: 1, width: '100%', backgroundColor: colors.colorTextPlaceholder, marginVertical: scaler(5) }} /> */}
                    {activeTicket?.amount || activeTicket?.payment_method == 'free' ?
                        !activeTicket?.is_donation ?
                            <><Text style={{ fontWeight: '500', fontSize: scaler(15), marginVertical: scaler(5) }}>{Language.ticket_purchased}</Text>
                                <View style={{ marginBottom: scaler(15) }}>
                                    <View style={{ alignItems: 'center', paddingStart: scaler(10), paddingEnd: scaler(15), }}>

                                        {activeTicket?.no_of_tickets - (activeTicket?.no_of_free_tickets_used || 0) > 0 ?
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.ticketInfoTitle}>
                                                    <Text style={[styles.ticketInfo, activeTicket?.ticket_name ? {} : { fontStyle: 'italic', fontWeight: '500' }]}>{activeTicket?.ticket_name || Language.standard}</Text>  x {activeTicket?.no_of_tickets - (activeTicket?.no_of_free_tickets_used || 0)} {(Language as any)?.['ticket' + (activeTicket?.no_of_tickets - (activeTicket?.no_of_free_tickets_used || 0) > 1 ? 's' : "")]}
                                                </Text>
                                                <Text style={styles.ticketInfo}>
                                                    {formatAmount(activeTicket?.currency, activeTicket?.total_tickets_amount)}
                                                </Text>
                                            </View> : null}




                                        {activeTicket?.no_of_free_tickets_used ?
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.ticketInfoTitle}>
                                                    <Text style={[styles.ticketInfo, activeTicket?.ticket_name ? {} : { fontStyle: 'italic', fontWeight: '500' }]}>{activeTicket?.ticket_name || Language.standard}</Text>  x {activeTicket?.no_of_free_tickets_used} {(Language as any)?.['ticket' + (activeTicket?.no_of_free_tickets_used > 1 ? 's' : "")]} <Image
                                                        style={{
                                                            width: scaler(18),
                                                            height: scaler(18),
                                                            resizeMode: 'contain',
                                                        }}
                                                        source={Images.ic_free_ticket_icon}
                                                    /> <Text
                                                        style={[styles.ticketInfo, { fontStyle: 'italic', fontWeight: '500', color: colors.colorPrimary }]}>{Language.free}</Text>
                                                </Text>
                                                <Text style={styles.ticketInfo}>
                                                    {formatAmount(activeTicket?.currency, 0)}
                                                </Text>
                                            </View>
                                            : null}

                                        <View style={{ flexDirection: 'row' }}>

                                            <Text style={styles.ticketInfoTitle}>
                                                {Language.tax} ({activeTicket?.event_tax_rate}%)
                                            </Text>
                                            <Text style={styles.ticketInfo}>
                                                {formatAmount(activeTicket?.currency, activeTicket?.event_tax_amount)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ height: 1, marginStart: scaler(10), marginEnd: scaler(10), backgroundColor: colors.colorTextPlaceholder, marginVertical: scaler(8) }} />
                                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingStart: scaler(10), paddingEnd: scaler(15), }}>
                                        <Text style={[{ flex: 1, }, styles.ticketInfo]}>
                                            {Language.total}
                                        </Text>
                                        <Text style={[{ marginLeft: scaler(10), }, styles.ticketInfo]}>
                                            {formatAmount(activeTicket?.currency, activeTicket?.total_paid_amount)}
                                        </Text>
                                    </View>
                                </View></> :
                            <View style={{ marginBottom: scaler(10) }}>
                                <Text style={{ fontWeight: '500', fontSize: scaler(15), marginVertical: scaler(5) }}>{Language.ticket_purchased}</Text>
                                <View style={{ paddingStart: scaler(10), paddingEnd: scaler(15) }}>
                                    <Text style={styles.ticketInfo}>
                                        <Text style={[styles.ticketInfo, { fontStyle: 'italic', fontWeight: '500' }]}>{Language.free}</Text>  x {activeTicket?.no_of_tickets} {(Language as any)?.['ticket' + (activeTicket?.no_of_tickets > 1 ? 's' : "")]}
                                    </Text>
                                    <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                        <Text style={[styles.ticketInfo, { flex: 1 }]}>
                                            {Language?.donation}
                                        </Text>
                                        <Text style={styles.ticketInfo}>
                                            {formatAmount(activeTicket?.currency, activeTicket?.total_tickets_amount)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        : null}

                    {event.status == 1 && <>
                        <Text style={{ fontWeight: '500', fontSize: scaler(15) }}>{Language.event_hosted_by}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: scaler(15) }}>
                            <ImageLoader
                                placeholderSource={Images.ic_home_profile}
                                source={{ uri: getImageUrl(event?.creator_of_event?.image, { width: scaler(70), type: 'users' }) ?? Images.ic_image_placeholder }}
                                style={{ height: scaler(50), width: scaler(50), borderRadius: scaler(23) }} />
                            <Text style={{ marginLeft: scaler(10) }}>
                                {event?.creator_of_event?.first_name + ' ' + event?.creator_of_event?.last_name}
                            </Text>
                        </View>
                    </>}

                    {event?.event_group?.name && event.status == 1 ?
                        <>
                            <Text style={{ fontWeight: '500', fontSize: scaler(15) }}>{Language.group}</Text>
                            <ListItem
                                textContainerStyle={{ justifyContent: 'center' }}
                                containerStyle={{ paddingVertical: scaler(10), paddingHorizontal: 0 }}
                                defaultIcon={Images.ic_group_placeholder}
                                title={event?.event_group?.name}
                                // highlight={}
                                icon={event?.event_group?.image ? { uri: getImageUrl(event?.event_group?.image, { width: scaler(50), type: 'groups' }) } : undefined}
                                // subtitle={event?.event_group?.city + ", " + (event?.event_group?.state ? (event?.event_group?.state + ", ") : "") + event?.event_group?.country}
                                subtitle={getCityOnly(event?.event_group?.city, event?.event_group?.state, event?.event_group?.country)}
                                // customView={is_group_member ? <Image style={{ alignSelf: 'center', height: scaler(20), width: scaler(20) }} source={Images?.ic_member_tick} /> : null}
                                onPress={() => {
                                    dispatch(setActiveGroup(event?.event_group))
                                    NavigationService.navigate("GroupChatScreen", { id: event?.event_group?._id })
                                }}
                                onPressImage={() => {
                                    dispatch(setActiveGroup(event?.event_group))
                                    setTimeout(() => {
                                        NavigationService.navigate("GroupDetail", { id: event?.event_group?._id })
                                    }, 0);
                                }}
                            />
                        </> : null}

                    {event?.details ?
                        <><Text style={{ fontWeight: '500', fontSize: scaler(15) }}>{Language.about_event}</Text>
                            <Text autoLink style={styles.about}>{event?.details}</Text>
                        </> : <View />
                    }
                    {event?.is_admin ?
                        <TouchableOpacity style={{ marginTop: scaler(20), flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => NavigationService.navigate('EventMembers', { id: event?._id })}>
                            <Text style={{ flex: 1 }}>{Language.members}</Text>
                            <Text style={styles.address} >{event?.total_event_members_count}</Text>
                            <Image style={{ height: scaler(14), resizeMode: 'contain', marginLeft: scaler(15) }} source={Images.ic_right} />
                        </TouchableOpacity>
                        : undefined}
                </View>
                <View style={{ height: 1, width: '90%', backgroundColor: '#DBDBDB', alignSelf: 'center' }} />
            </ScrollView>

            {event?.status == 1 ?
                <>
                    {(event?.is_admin || event?.is_event_member) ?
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: scaler(10) }}>
                            {eventDate >= new Date() ?
                                <View style={{ flex: 1 }}>
                                    <Button onPress={() => {
                                        try {
                                            const startDate = eventDate?.toISOString()
                                            const endDate = event?.event_end_time ? new Date(event?.event_end_date_time).toISOString() : add(eventDate, { minutes: 1 }).toISOString()
                                            presentEventCreatingDialog({
                                                startDate,
                                                endDate,
                                                allDay: false,
                                                location: event?.address,
                                                title: '"' + event?.name + '" event from Picnic Groups',
                                                notes: event?.name
                                            }).then(res => {
                                                console.log("Res", res);

                                            }).catch(e => {
                                                console.log("E", e);
                                            })
                                        }
                                        catch (e) {
                                            console.log("Error", e);

                                        }
                                    }} title={Language.add_to_calender} />
                                </View> : undefined}
                            <View style={{ flex: 1 }}>
                                <Button title={Language.start_chat}
                                    onPress={() => NavigationService.navigate("EventChats", { id: event?._id })}
                                    fontColor={eventDate >= new Date() ? 'black' : 'white'}
                                    backgroundColor={eventDate >= new Date() ? 'white' : colors.colorPrimary}
                                    buttonStyle={{
                                        borderColor: 'black',
                                        borderWidth: eventDate >= new Date() ? scaler(1) : 0
                                    }}
                                    textStyle={{ fontWeight: '400' }} />
                            </View>
                        </View> :
                        (endSales >= new Date() &&
                            ((event?.capacity - event?.total_sold_tickets) > 0 || event?.capacity_type != 'limited')) ?
                            <View style={{ marginHorizontal: scaler(10) }}>
                                <Button title={isCancelledByMember ? Language.want_to_book_again : Language.confirm}
                                    disabled={calculateButtonDisability()}
                                    onPress={() => {
                                        event?.ticket_type == 'multiple' ? NavigationService.navigate('SelectTicket', { id: event?._id }) :
                                            NavigationService.navigate('BookEvent', { id: event?._id })
                                    }}
                                />
                            </View> : null
                    }
                </> :
                event?.is_event_member ?
                    <>
                        <View style={{ paddingVertical: scaler(5), paddingHorizontal: scaler(10), backgroundColor: colors.colorPlaceholder }} >
                            <Text style={{ fontStyle: 'italic', color: colors.colorWhite, textAlign: 'center', fontSize: scaler(12) }} >{Language.event_is_no_longer_available}</Text>
                        </View>
                        <Button title={Language.chat}
                            onPress={() => NavigationService.navigate("EventChats", { id: event?._id })}
                            fontColor={'black'}
                            paddingVertical={scaler(10)}
                            backgroundColor={colors.colorWhite}
                            buttonStyle={{
                                borderColor: 'black',
                                borderWidth: 1
                            }}
                            textStyle={{ fontWeight: '400' }} />
                    </> : undefined
            }

        </SafeAreaViewWithStatusBar>
    )
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

const TicketPlans = ({ name, currency, amount: price, total_free_tickets, total_free_tickets_consumed }: any) => {
    const free_tickets = (total_free_tickets || 0) - (total_free_tickets_consumed || 0)
    return <View style={{ padding: scaler(10), overflow: 'hidden', flexDirection: 'row', alignItems: 'center', borderBottomColor: colors.colorGreyText, borderBottomWidth: 0.7, justifyContent: 'flex-end' }}>
        <View style={{ flexGrow: 1, maxWidth: width / 1.4, paddingRight: scaler(10) }} >
            <Text style={{ fontSize: scaler(14), fontWeight: '500' }}>{name}</Text>
            {free_tickets > 0 ? <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(5) }} >
                <Image style={{ width: scaler(18), aspectRatio: 1 }} source={Images.ic_free_ticket_icon} />
                <Text style={{ color: colors.colorPrimary, fontSize: scaler(12) }} > {free_tickets} {Language.x_free_ticket_available}</Text>
            </View> : null}
        </View>
        <Text style={{ fontSize: scaler(14), fontWeight: '500' }}>
            {formatAmount(currency, price)}
        </Text>
    </View>
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
        // textTransform: 'capitalize',
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
        // flex: 1
    },
    dateTitle: {
        fontSize: scaler(12),
        color: colors.colorPrimary,
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
    },
    ticketId: {
        fontSize: scaler(15),
        fontWeight: '500',
        color: colors.colorBlackText,
        textAlign: 'center'
    },
    placeholder: {
        width: width,
        height: width,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors?.colorFadedPrimary
    },
    eventImage: {
        height: scaler(100),
        width: scaler(100)
    },
    subHeading: {
        width: '100%',
        top: scaler(30),
        position: 'absolute',
        flexDirection: 'row',
        padding: scaler(20),
        justifyContent: 'space-between'
    },
    ticketInfo: {
        fontSize: scaler(14),
        fontWeight: '500',
        color: colors.colorPlaceholder,
        lineHeight: scaler(23)
    },
    ticketInfoTitle: {
        fontSize: scaler(14),
        fontWeight: '500',
        color: colors.colorPlaceholder,
        lineHeight: scaler(23),
        flex: 1,
        paddingEnd: scaler(10),
    },
    planView: {
        backgroundColor: colors.colorWhite,
        borderRadius: scaler(5),
    },
    customSlide: {
        backgroundColor: colors?.colorFadedPrimary,
        // alignItems: 'center',
        // justifyContent: 'center',
        overflow: 'hidden',
        // marginHorizontal: scaler(2),
        width: width,
        height: width,
        aspectRatio: 1 / 1,
        // borderRadius: scaler(10),
        // height: width*5/9
    },
    customImage: {
        // backgroundColor:'red',
        height: '100%',
        width: '100%',
        resizeMode: 'cover'
    },
    playButton: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        alignSelf: 'center',
        top: width / 2 - scaler(40),
    },
    bulletContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        top: -scaler(20),
        zIndex: 2,
    },
    bulletStyle: {
        width: scaler(6),
        height: scaler(6),
        backgroundColor: colors.colorBlack,
        borderRadius: scaler(8),
        marginHorizontal: scaler(3),
    },
    selectedBulletStyle: {
        width: scaler(16),
        height: scaler(6),
        backgroundColor: colors.colorBlack,
        borderRadius: scaler(8),
        marginHorizontal: scaler(3),
    }
})
