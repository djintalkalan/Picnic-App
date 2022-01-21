
import { joinEvent } from 'app-store/actions';
import { RootState } from 'app-store/store';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { Button, KeyboardHideView, MyHeader, TextInput } from 'custom-components';
import { isEqual } from 'lodash';
import React, { FC, Fragment, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import Language from 'src/language/Language';
import { getSymbol, scaler, _hidePopUpAlert, _showPopUpAlert } from 'utils';

type FormType = {
    noOfSeats: string;
}
const BookEvent: FC = (props: any) => {
    const [isPayByPaypal, setIsPayByPaypal] = useState()
    const [noOfTickets, setNoOfTickets] = useState()
    const [payMethodSelected, setPayMethodSelected] = useState(false);
    const { event } = useSelector((state: RootState) => ({
        event: state?.eventDetails?.[props?.route?.params?.id]?.event,
    }), isEqual)
    const {
        handleSubmit,
        formState: { errors },
    } = useForm<FormType>({
        mode: 'onChange',
    });
    const dispatch = useDispatch();


    const confirmReservation = useCallback((data) => {
        let payload = {
            resource_id: event?._id,
            no_of_tickets: noOfTickets,
            transaction_id: "",
            amount: event?.event_fees ?? '',
            currency: event?.event_currency ?? "",
            payment_method: event?.is_free_event ? "free" : isPayByPaypal ? 'paypal' : 'cash', // free, cash, paypal
            paid_via_email: "", //send when payment_method is paypal
            paid_via_option: "" // send when payment_method is paypal and paid by option is c card, debit card, email etc (e.g credit_card, debit_card, email)
        }
        dispatch(joinEvent(payload))
    }, [event, noOfTickets, isPayByPaypal])

    console.log('event group', event?.event_group)
    return (
        <SafeAreaView style={styles.container}>
            <MyHeader title={Language.confirm_reservation} />

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
                                {getSymbol(event?.event_currency) + event?.event_fees}
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
                        multiline={Platform.OS == 'ios' ? true : false}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        // control={control}
                        //@ts-ignore
                        onChangeText={setNoOfTickets}
                    // errors={errors}
                    />
                </View>
                <Text style={[styles.address, { fontSize: scaler(11), marginTop: scaler(10), marginLeft: scaler(5) }]} >
                    {(event?.capacity_type == 'limited' ? Language.available_seats + ' ' +
                        noOfTickets ?
                        Language.available_seats + ' ' + ((event?.capacity - event?.total_sold_tickets) - parseInt(noOfTickets || 0)) :
                        (event?.capacity - event?.total_sold_tickets) :
                        undefined)}
                </Text>
                {!event?.is_free_event ?
                    <>
                        <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center', marginVertical: scaler(16) }} />
                        <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500' }}>
                            {event?.payment_method?.length > 1 ? Language.select_payment_options : Language.payment_methods}
                        </Text>
                        {event?.payment_method.map((_, i) => {
                            return <Fragment key={i}>
                                <PaymentMethod
                                    type={_}
                                    isPayByPaypal={isPayByPaypal}
                                    setPayMethodSelected={setPayMethodSelected}
                                    setIsPayByPaypal={setIsPayByPaypal} />
                                {i == 0 ? <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center' }} /> : undefined}
                            </Fragment>
                        })}
                    </>
                    : null}

            </View>
            <KeyboardHideView>
                <View style={{ marginBottom: scaler(10), marginHorizontal: scaler(15) }}>
                    {!event?.is_free_event && event?.event_refund_policy ?
                        <Text style={{ fontSize: scaler(15), fontWeight: '400', color: colors.colorPrimary, alignSelf: 'center', marginBottom: scaler(15) }}>
                            {Language.read_refund_policy}
                        </Text> : undefined
                    }
                    {noOfTickets ?
                        <Button
                            title={event?.is_free_event ? Language.book_ticket
                                : Language.pay + ' ' + getSymbol(event?.event_currency) + (parseInt(noOfTickets) * event?.event_fees)}
                            onPress={event?.is_free_event ? handleSubmit((data) => confirmReservation(data)) : () => {
                                _showPopUpAlert({
                                    title: Language.confirm_payment_method,
                                    message: !isPayByPaypal ? Language.are_you_sure_you_want_to_pay_using + ' ' + Language.cash + '?'
                                        : Language.are_you_sure_you_want_to_pay_using + ' ' + Language.paypal + '?',
                                    onPressButton: handleSubmit((data) => { confirmReservation(data), _hidePopUpAlert() }),
                                    buttonText: Language.pay + ' ' + getSymbol(event?.event_currency) + (parseInt(noOfTickets) * event?.event_fees),
                                    buttonStyle: { width: '100%' }
                                })
                            }}
                            disabled={!payMethodSelected && !event?.is_free_event}
                        />
                        : undefined
                    }
                </View>
            </KeyboardHideView>
        </SafeAreaView>
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
        marginVertical: scaler(16),
        alignItems: 'center',
        marginHorizontal: scaler(5)
    }
})

const PaymentMethod = (props: { type: string, isPayByPaypal?: boolean, setIsPayByPaypal: any, setPayMethodSelected: any }) => {
    return (
        <TouchableOpacity style={styles.payView} onPress={() => { props?.setIsPayByPaypal(props?.type != 'cash'), props?.setPayMethodSelected(true) }}>
            <Image source={props?.type == 'cash' ? Images.ic_empty_wallet : Images.ic_paypal}
                style={{ height: scaler(16), width: scaler(19) }} />
            <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>
                {props?.type == 'cash' ? Language.pay_by_cash : Language?.pay_by_paypal}</Text>
            <MaterialIcons name={(props?.type == 'cash' && props?.isPayByPaypal == false) ||
                (props?.type != 'cash' && props?.isPayByPaypal) ? 'radio-button-on' : 'radio-button-off'}
                size={scaler(20)} color={colors.colorPrimary} />
        </TouchableOpacity>
    )
}

export default BookEvent;