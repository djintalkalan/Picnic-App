
import { _totalSoldTickets } from 'api/APIProvider';
import { authorizePayment, joinEvent } from 'app-store/actions';
import { RootState } from 'app-store/store';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { Button, CheckBox, KeyboardHideView, MyHeader, TextInput } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { isEqual, round } from 'lodash';
import React, { FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
//@ts-ignore
import ReadMore from 'react-native-read-more-text';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import Language from 'src/language/Language';
import { formatAmount, scaler, _hidePopUpAlert, _showPopUpAlert } from 'utils';


type FormType = {
    noOfSeats: string;
    donationAmount: string;
    currency: string;
}


const BookEvent: FC = (props: any) => {
    const [noOfTickets, setNoOfTickets] = useState("")
    const [payMethodSelected, setPayMethodSelected] = useState<'paypal' | 'cash' | 'credit' | undefined>();
    const [selectedTicket, setSelectedTicket] = useState<any>({})
    const [toggle, setToggle] = useState(false)
    const [isUserDonating, setIsUserDonation] = useState(true)
    const { event } = useSelector((state: RootState) => ({
        event: state?.eventDetails?.[props?.route?.params?.id]?.event,
    }), isEqual)

    const {
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<FormType>({
        mode: 'onChange',
    });

    useEffect(() => {
        if (props?.route?.params?.selectedTicket) {
            setSelectedTicket(props?.route?.params?.selectedTicket)
        }
        else {
            setSelectedTicket({
                amount: event?.event_fees,
                event_tax_amount: event?.event_tax_amount,
                currency: event?.event_currency,
                capacity_type: event?.capacity_type,
                capacity: event?.capacity,
                sales_ends_on: event?.sales_ends_on,
                total_free_tickets: event?.total_free_tickets || 0,
                total_free_tickets_consumed: event?.total_free_tickets_consumed || 0
            })
        }
        if (event?.payment_method?.length == 1) {
            setPayMethodSelected(event?.payment_method[0])
        }
        fetchTicketData()
    }, [])

    const fetchTicketData = useCallback(() => {
        // if (!_.isEmpty(selectedTicket)) {
        _totalSoldTickets({ resource_id: props?.route?.params?.id, plan_id: props?.route?.params?.selectedTicket?._id }).then(res => {
            if (res?.status == 200) {
                console.log('res', res);
                res?.data?.tickets?.length && setSelectedTicket(res?.data?.tickets[0])
            } else console.log(res);
        }).catch(e => console.log(e))
        // }
    }, [])

    useEffect(() => {
        if (event?.is_donation_enabled && payMethodSelected != 'cash') {
            setValue('currency', event.event_currency.toUpperCase())
        }
    }, [event, payMethodSelected])


    const dispatch = useDispatch();


    const confirmReservation = useCallback((data) => {

        const getPaymentMethod = () => {
            if (event?.is_free_event) {
                if (event?.is_donation_enabled && isUserDonating) {
                    return payMethodSelected == 'credit' ? 'paypal' : payMethodSelected
                }
                return 'free'
            }
            return getTotalPayment()?.paidTicketsPrice > 0 ? (payMethodSelected == 'credit' ? 'paypal' : payMethodSelected) : 'free'
        }

        let payload = {
            resource_id: event?._id,
            no_of_tickets: noOfTickets?.toString(),
            plan_id: selectedTicket?._id ?? '',
            transaction_id: "",
            donation_amount: event.is_donation_enabled && (payMethodSelected == 'paypal' || payMethodSelected == 'credit') ? data.donationAmount : '0',
            is_donation: event?.is_free_event && event?.is_donation_enabled && isUserDonating ? '1' : '0',
            amount: selectedTicket?.amount ?? '',
            currency: selectedTicket?.currency ?? "",
            payment_method: getPaymentMethod(),
            paid_via_email: "", //send when payment_method is paypal
            paid_via_option: "" // send when payment_method is paypal and paid by option is c card, debit card, email etc (e.g credit_card, debit_card, email)
        }
        let action = joinEvent
        if (payMethodSelected && payMethodSelected != 'cash' && (payload?.is_donation == '1' || event?.is_free_event != 1)) {
            action = authorizePayment
        }
        dispatch(action(payload))
    }, [event, noOfTickets, payMethodSelected, selectedTicket, isUserDonating])



    const _renderTruncatedFooter = (handlePress: any) => {
        return (
            <Text style={{ color: colors.colorPrimary, marginTop: 5 }} onPress={handlePress}>
                Read more
            </Text>
        );
    }

    const _renderRevealedFooter = (handlePress: any) => {
        return (
            <Text style={{ color: colors.colorPrimary, marginTop: 5 }} onPress={handlePress}>
                Show less
            </Text>
        );
    }

    const _handleTextReady = () => {
        // ...
    }

    const free_tickets = useMemo(() => {
        const freeTicket = (selectedTicket?.total_free_tickets || 0) - (selectedTicket?.total_free_tickets_consumed || 0)
        return Math.max((freeTicket || 0), 0)
    }, [selectedTicket])

    const getTotalPayment = useCallback(() => {
        let paidTicketsSelected = free_tickets > parseInt(noOfTickets) ? 0 : parseInt(noOfTickets) - free_tickets
        let payment = {
            freeTicketsSelected: free_tickets > parseInt(noOfTickets) ? parseInt(noOfTickets) : free_tickets,
            paidTicketsSelected: paidTicketsSelected,
            paidTicketsPrice: round(paidTicketsSelected * (parseFloat(selectedTicket.amount + (selectedTicket.event_tax_amount ?? 0))), 2)
        }
        return payment
    }, [noOfTickets, free_tickets, selectedTicket])

    const onSubmit = useCallback(() => handleSubmit(data => {
        if (event?.is_free_event || getTotalPayment().paidTicketsSelected == 0)
            confirmReservation(data)
        else _showPopUpAlert({
            title: Language.confirm_payment_method,
            //@ts-ignore
            message: (payMethodSelected == 'cash' ? Language.are_you_sure_you_want_to_pay_using : Language.are_you_sure_you_want_to_pay_using) + ' ' + Language[payMethodSelected] + '?',
            onPressButton: (data) => { confirmReservation(data), _hidePopUpAlert() },
            buttonText: (payMethodSelected == 'cash' ? Language.reserve : Language.pay) + " " + formatAmount(selectedTicket.currency, getTotalPayment()?.paidTicketsPrice),
            buttonStyle: { width: '100%' }
        })
    })(), [event, noOfTickets, payMethodSelected, isUserDonating])

    const { availableSeats, allSeats } = useMemo(() => {
        return {
            allSeats: (selectedTicket?.capacity - (selectedTicket?.total_sold_tickets || 0)),
            availableSeats: ((selectedTicket?.capacity - (selectedTicket?.total_sold_tickets || 0)) - (parseInt(noOfTickets || '0')))
        }
    }, [noOfTickets, selectedTicket])


    const getTitle = () => {
        if (event?.is_free_event == 1) {
            if (event?.is_donation_enabled == 1 && isUserDonating && payMethodSelected != 'cash') {
                return Language.donate_and_book_event
            } else {
                return Language.reserve
            }
        }
        return payMethodSelected != 'cash' && getTotalPayment()?.paidTicketsPrice != 0 ? Language.pay + ' ' + formatAmount(selectedTicket.currency, getTotalPayment()?.paidTicketsPrice) : Language.reserve
    }


    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <MyHeader title={Language.confirm_reservation} />
            <ScrollView keyboardShouldPersistTaps={'handled'} enableResetScrollToCoords={false} >
                <View style={{ margin: scaler(20), flex: 1 }}>
                    <View style={styles.nameContainer}>
                        <View style={{ flex: 1, marginEnd: scaler(12) }} >
                            <Text style={styles.name} >{event?.name}</Text>
                            <Text style={styles.address} >{event?.event_group?.name}</Text>
                        </View>
                        <View >
                            {event?.is_free_event ?
                                <Text style={{ fontSize: scaler(19), fontWeight: '600' }}>
                                    {Language.free}
                                </Text> :
                                <><Text style={{ fontSize: scaler(19), fontWeight: '600' }}>
                                    {formatAmount(selectedTicket?.currency, selectedTicket?.amount)}
                                </Text><Text style={styles.address}>{Language.per_person}</Text></>
                            }
                        </View>
                    </View>
                    <View style={{ width: '100%', marginTop: scaler(10) }}>
                        <TextInput
                            placeholder={Language.how_many_seats + '?'}
                            name={'noOfSeats'}
                            required={Language.number_of_seats_is_required}
                            keyboardType='number-pad'
                            returnKeyType={'done'}
                            multiline={Platform.OS == 'ios' ? true : false}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            maxLength={5}
                            rules={{
                                validate: (v: string) => {
                                    if ((selectedTicket?.capacity_type != 'unlimited' && parseInt(v) > (selectedTicket?.capacity - (selectedTicket?.total_sold_tickets || 0))) || parseInt(v) == 0) {
                                        return Language.invalid_seat_quantity
                                    }
                                }
                            }}
                            control={control}
                            //@ts-ignore
                            onChangeText={setNoOfTickets}
                            errors={errors}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: scaler(10), }} >
                        <Text style={[styles.address, { fontSize: scaler(11), marginTop: scaler(0), marginLeft: scaler(5) }]} >
                            {(selectedTicket?.capacity_type == 'limited' ? Language.available_seats + ' ' + (availableSeats > -1 ? availableSeats : allSeats) :
                                undefined)}
                        </Text>
                        {free_tickets > 0 ? <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(3), marginBottom: scaler(6) }} >
                            <Image style={{ width: scaler(18), aspectRatio: 1 }} source={Images.ic_free_ticket_icon} />
                            <Text style={{ color: colors.colorPrimary, fontSize: scaler(12) }} > {free_tickets} {Language.x_free_ticket_available}</Text>
                        </View> : null}
                    </View>


                    {(!event?.is_free_event) ?
                        <>
                            <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center', marginVertical: scaler(16) }} />
                            {selectedTicket?.name ? <><Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500' }}>
                                {Language.plan_name}
                            </Text><Text style={[styles.address, { fontSize: scaler(13), marginTop: scaler(10), marginLeft: scaler(8), color: colors.colorBlackText }]}>
                                    {selectedTicket?.name}
                                </Text><View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center', marginVertical: scaler(16) }} /></> : null}
                            <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500' }}>
                                {Language.applicable_tax}
                            </Text>
                            <Text style={[styles.address, { fontSize: scaler(13), marginTop: scaler(10), marginLeft: scaler(8), color: colors.colorBlackText }]}>
                                {noOfTickets && selectedTicket.event_tax_amount ? formatAmount(selectedTicket.currency, round(getTotalPayment()?.paidTicketsSelected * selectedTicket?.event_tax_amount, 2)) : formatAmount(selectedTicket.currency, 0)}
                            </Text>
                            <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center', marginVertical: scaler(16) }} />
                            {getTotalPayment().paidTicketsSelected != 0 ? <>
                                <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500' }}>
                                    {event?.payment_method?.length > 1 ? Language.select_payment_options : Language.payment_methods}
                                </Text>
                                {event?.payment_method.map((_: any, i: any) => {
                                    return <Fragment key={i}>
                                        <PaymentMethod
                                            type={_}
                                            payMethodSelected={payMethodSelected}
                                            setPayMethodSelected={setPayMethodSelected}
                                            disabled={!event?.payment_api_username && _ != 'cash'}
                                            isDonation={event.is_donation_enabled} />
                                        {i == 0 ? <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center' }} /> : undefined}
                                    </Fragment>
                                })}
                                {event?.payment_method?.includes("paypal") ?
                                    <Fragment>
                                        <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center' }} />

                                        <PaymentMethod
                                            type={"credit"}
                                            payMethodSelected={payMethodSelected}
                                            setPayMethodSelected={setPayMethodSelected}
                                            disabled={!event?.payment_api_username}
                                            isDonation={event.is_donation_enabled} />
                                    </Fragment>
                                    : undefined}</> : undefined}
                        </>
                        : event.is_donation_enabled ?
                            <View>
                                <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center', marginVertical: scaler(16) }} />
                                <TouchableOpacity style={styles.eventView} onPress={() => setIsUserDonation(!isUserDonating)}>
                                    <CheckBox checked={isUserDonating} setChecked={setIsUserDonation} />
                                    <Text style={{ marginLeft: scaler(10), fontSize: scaler(14), fontWeight: '500' }}>
                                        {'Donate to ' + event.name}
                                    </Text>
                                </TouchableOpacity>

                                {/* <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500' }}>{Language.donation_description}</Text> */}
                                <ReadMore
                                    numberOfLines={4}
                                    renderTruncatedFooter={_renderTruncatedFooter}
                                    renderRevealedFooter={_renderRevealedFooter}
                                    onReady={_handleTextReady}>
                                    <Text style={[styles.address, { fontSize: scaler(13), marginLeft: scaler(8), color: colors.colorBlackText }]}>
                                        {event?.donation_description}
                                    </Text>
                                </ReadMore>

                                <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center', marginVertical: scaler(16) }} />
                                {isUserDonating && event?.payment_method.map((_: any, i: any) => {
                                    return <Fragment key={i}>
                                        <PaymentMethod
                                            type={_}
                                            payMethodSelected={payMethodSelected}
                                            setPayMethodSelected={setPayMethodSelected}
                                            disabled={!event?.payment_api_username && _ != 'cash'}
                                            isDonation={event.is_donation_enabled}
                                        />
                                        {i == 0 ? <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center' }} /> : undefined}
                                    </Fragment>
                                })}
                                {isUserDonating && event?.payment_method?.includes("paypal") ?
                                    <Fragment>
                                        <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center' }} />

                                        <PaymentMethod
                                            type={"credit"}
                                            payMethodSelected={payMethodSelected}
                                            setPayMethodSelected={setPayMethodSelected}
                                            disabled={!event?.payment_api_username}
                                            isDonation={event.is_donation_enabled} />
                                    </Fragment>
                                    : undefined}
                                {isUserDonating && payMethodSelected != 'cash' ?
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                        <TextInput
                                            containerStyle={{ marginEnd: scaler(4), width: '30%' }}
                                            borderColor={colors.colorTextInputBackground}
                                            backgroundColor={colors.colorTextInputBackground}
                                            name={'currency'}
                                            disabled={true}
                                            control={control}
                                        />
                                        <TextInput
                                            containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                                            placeholder={Language.donation_price}
                                            style={{ paddingLeft: scaler(20) }}
                                            borderColor={colors.colorTextInputBackground}
                                            backgroundColor={colors.colorTextInputBackground}
                                            name={'donationAmount'}
                                            returnKeyType={'done'}
                                            keyboardType={'decimal-pad'}
                                            iconSize={scaler(18)}
                                            icon={Images.ic_ticket}
                                            required={Language.donation_price_required}
                                            control={control}
                                            errors={errors}
                                        />
                                    </View>
                                    : undefined}
                            </View> : null
                    }

                </View>
            </ScrollView>
            <KeyboardHideView>
                <View style={{ marginBottom: scaler(10), marginHorizontal: scaler(15) }}>
                    {!event?.is_free_event && payMethodSelected != 'cash' && event?.event_refund_policy ?
                        <Text onPress={() => {
                            _showPopUpAlert({
                                message: event?.event_refund_policy,
                                cancelButtonText: null,
                                onPressButton: () => {
                                    _hidePopUpAlert()
                                },
                                buttonStyle: { backgroundColor: colors.colorErrorRed },
                                buttonText: Language.close,
                            })
                        }} style={{ fontSize: scaler(15), fontWeight: '400', color: colors.colorPrimary, alignSelf: 'center', marginBottom: scaler(15) }}>
                            {Language.read_refund_policy}
                        </Text> : undefined
                    }
                    {noOfTickets ?
                        <Button
                            title={getTitle()}
                            onPress={onSubmit}
                            disabled={!payMethodSelected && (!event?.is_free_event || (event.is_donation_enabled && isUserDonating)) && getTotalPayment().paidTicketsSelected != 0}
                        />
                        : undefined
                    }
                </View>
            </KeyboardHideView>
        </SafeAreaViewWithStatusBar>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    },
    nameContainer: {
        flexDirection: 'row',
    },
    address: {
        fontSize: scaler(12),
        fontWeight: '400',
        color: colors.colorGreyInactive,
        marginTop: scaler(2)
    },
    name: {
        fontSize: scaler(17),
        fontWeight: '600',
        color: "#272727",
    },
    payView: {
        flexDirection: 'row',
        paddingVertical: scaler(16),
        alignItems: 'center',
        marginHorizontal: scaler(5)
    },
    eventView: {
        // marginTop: scaler(12),
        flexDirection: 'row',
        marginLeft: scaler(5),
        marginBottom: scaler(16)
    },
})

const PaymentMethod = (props: { type: string, payMethodSelected: any, setPayMethodSelected: any, isDonation: number, disabled: boolean }) => {
    const { icon, image, text } = useMemo(() => {
        const val = {
            icon: props?.payMethodSelected == props?.type ? 'radio-button-on' : 'radio-button-off',
            image: Images.ic_empty_wallet,
            text: (props?.isDonation ? Language.donate_by_cash : Language.pay_by_cash),
        }
        switch (props?.type) {

            case "paypal":
                val.image = Images.ic_paypal
                val.text = (props?.isDonation ? Language.donate_by_paypal : Language?.pay_by_paypal)
                break;
            case "credit":
                val.image = Images.ic_credit_card
                val.text = (props?.isDonation ? Language.donate_by_credit : Language?.pay_by_credit)
                break;

        }
        return val
    }, [props?.type, props?.isDonation, props?.payMethodSelected])
    return (
        <TouchableOpacity style={[styles.payView, { backgroundColor: props?.disabled ? '' : '' }]} onPress={() => { props?.setPayMethodSelected(props?.type) }} disabled={props?.disabled} >
            <Image source={image}
                style={{ height: scaler(16), width: scaler(19), tintColor: props.disabled ? colors.colorGreyText : undefined }} />
            <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1, color: props.disabled ? colors.colorGreyInactive : '' }}>{text}</Text>
            <MaterialIcons name={icon}
                size={scaler(20)} color={props.disabled ? colors.colorGreyText : colors.colorPrimary} />
        </TouchableOpacity>
    )
}

export default BookEvent;