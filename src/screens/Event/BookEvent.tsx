import { joinEvent } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { Button, KeyboardHideView, MyHeader, TextInput } from 'custom-components';
import React, { FC, Fragment, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { getSymbol, scaler, _hidePopUpAlert, _showPopUpAlert } from 'utils';

type FormType = {
    noOfSeats: string;
}
const BookEvent: FC = (props: any) => {
    const [isPayByPaypal, setIsPayByPaypal] = useState()
    const [noOfTickets, setNoOfTickets] = useState()
    const eventDetail = props?.route?.params;
    const {
        handleSubmit,
        formState: { errors },
    } = useForm<FormType>({
        mode: 'onChange',
    });
    const dispatch = useDispatch();


    const confirmReservation = useCallback((data) => {
        let payload = {
            resource_id: eventDetail?.id,
            no_of_tickets: noOfTickets,
            transaction_id: "",
            amount: eventDetail?.price ?? '',
            currency: eventDetail?.currency ?? "",
            payment_method: eventDetail?.isFree ? "free" : isPayByPaypal ? 'paypal' : 'cash', // free, cash, paypal
            paid_via_email: "", //send when payment_method is paypal
            paid_via_option: "" // send when payment_method is paypal and paid by option is c card, debit card, email etc (e.g credit_card, debit_card, email)
        }
        dispatch(joinEvent(payload))
    }, [eventDetail, noOfTickets, isPayByPaypal])


    return (
        <SafeAreaView style={styles.container}>
            <MyHeader title={Language.confirm_reservation} />

            <View style={{ margin: scaler(20), flex: 1 }}>
                <View style={styles.nameContainer}>
                    <View style={{ flex: 1, marginEnd: scaler(12) }} >
                        <Text style={styles.name} >{eventDetail?.name}</Text>
                        <Text style={styles.address} >{Language.refreshment}</Text>
                    </View>
                    <View >
                        {eventDetail?.isFree ?
                            <Text style={{ fontSize: scaler(19), fontWeight: '600' }}>
                                {Language.free}
                            </Text> :
                            <><Text style={{ fontSize: scaler(19), fontWeight: '600' }}>
                                {getSymbol(eventDetail?.currency) + eventDetail?.price}
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
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        // control={control}
                        //@ts-ignore
                        onChangeText={setNoOfTickets}
                    // errors={errors}
                    />
                </View>
                <Text style={[styles.address, { fontSize: scaler(11), marginTop: scaler(10), marginLeft: scaler(5) }]} >
                    {(eventDetail?.capacityType == 'limited' ? Language.available_seats + ' ' +
                        noOfTickets ?
                        Language.available_seats + ' ' + ((eventDetail?.capacity - eventDetail?.soldTickets) - parseInt(noOfTickets || 0)) :
                        (eventDetail?.capacity - eventDetail?.soldTickets) :
                        undefined)}
                </Text>
                {!eventDetail?.isFree ?
                    <>
                        <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center', marginVertical: scaler(16) }} />
                        <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500' }}>
                            {eventDetail?.paymentMethod?.length > 1 ? Language.select_payment_options : Language.payment_methods}
                        </Text>
                        {eventDetail?.paymentMethod.map((_, i) => {
                            return <Fragment key={i}>
                                <PaymentMethod
                                    type={_}
                                    isPayByPaypal={isPayByPaypal}
                                    setIsPayByPaypal={setIsPayByPaypal} />
                                {i == 0 ? <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center' }} /> : undefined}
                            </Fragment>
                        })}
                    </>
                    : null}

            </View>
            <KeyboardHideView>
                <View style={{ marginBottom: scaler(10), marginHorizontal: scaler(15) }}>
                    {!eventDetail?.isFree && eventDetail?.event_refund_policy ?
                        <Text style={{ fontSize: scaler(15), fontWeight: '400', color: colors.colorPrimary, alignSelf: 'center', marginBottom: scaler(15) }}>
                            {Language.read_refund_policy}
                        </Text> : undefined
                    }
                    {noOfTickets ?
                        <Button title={eventDetail?.isFree ? Language.book_ticket
                            : Language.pay + ' ' + getSymbol(eventDetail?.currency) + (parseInt(noOfTickets) * eventDetail?.price)}
                            onPress={eventDetail?.isFree ? handleSubmit((data) => confirmReservation(data)) : () => {
                                _showPopUpAlert({
                                    title: Language.confirm_payment_method,
                                    message: !isPayByPaypal ? Language.are_you_sure_you_want_to_pay_using + ' ' + Language.cash + '?'
                                        : Language.are_you_sure_you_want_to_pay_using + ' ' + Language.paypal + '?',
                                    onPressButton: handleSubmit((data) => { confirmReservation(data), _hidePopUpAlert() }),
                                    buttonText: Language.pay + ' ' + getSymbol(eventDetail?.currency) + (parseInt(noOfTickets) * eventDetail?.price),
                                    buttonStyle: { width: '100%' }
                                })
                            }} />
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

const PaymentMethod = (props: { type: string, isPayByPaypal?: boolean, setIsPayByPaypal: any }) => {
    return (
        <TouchableOpacity style={styles.payView} onPress={() => { props?.setIsPayByPaypal(props?.type != 'cash') }}>
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