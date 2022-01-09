import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { Button, MyHeader, TextInput } from 'custom-components';
import React, { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Language from 'src/language/Language';
import { getSymbol, scaler } from 'utils';

type FormType = {
    noOfSeats: string;
}
let totalPrice: string;
const BookEvent: FC = (props: any) => {
    const [isPayByCash, setIsPayByCash] = useState(false)
    const [isPayByPaypal, setIsPayByPaypal] = useState(false)
    const eventDetail = props?.route?.params;
    const {
        getValues,
        control,
        formState: { errors },
    } = useForm<FormType>({
        mode: 'onChange',
    });

    console.log(typeof parseInt(totalPrice))

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
                        <Text style={{ fontSize: scaler(19), fontWeight: '600' }}>{getSymbol(eventDetail?.currency) + eventDetail?.price}</Text>
                        <Text style={styles.address} >{Language.per_person}</Text>
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
                        control={control}
                        onChange={() => totalPrice = getValues('noOfSeats')}
                        errors={errors}
                    />
                </View>
                <Text style={[styles.address, { fontSize: scaler(11), marginTop: scaler(10), marginLeft: scaler(5) }]} >{Language.available_seats + ' ' +
                    (eventDetail?.capacityType == 'limited' ?
                        eventDetail?.capacity - eventDetail?.soldTickets :
                        Language.unlimited)}
                </Text>
                <View style={{ height: 1, width: '100%', backgroundColor: '#DBDBDB', alignSelf: 'center', marginVertical: scaler(16) }} />
                <View >
                    <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500' }}>
                        {Language.select_payment_options}
                    </Text>
                    <TouchableOpacity style={styles.payView} onPress={() => setIsPayByCash(!isPayByCash)}>
                        <Image source={Images.ic_empty_wallet} style={{ height: scaler(16), width: scaler(19) }} />
                        <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{Language.pay_by_cash}</Text>
                        <MaterialIcons name={isPayByCash ? 'radio-button-on' : 'radio-button-off'} size={scaler(20)} color={colors.colorPrimary} />
                    </TouchableOpacity>
                    <View style={{ height: scaler(1), width: '95%', backgroundColor: '#EBEBEB', alignSelf: 'center' }} />
                    <TouchableOpacity style={styles.payView} onPress={() => setIsPayByPaypal(!isPayByPaypal)}>
                        <Image source={Images.ic_paypal} style={{ height: scaler(16), width: scaler(19) }} />
                        <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{Language.pay_by_paypal}</Text>
                        <MaterialIcons name={isPayByPaypal ? 'radio-button-on' : 'radio-button-off'} size={scaler(20)} color={colors.colorPrimary} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ marginBottom: scaler(10), marginHorizontal: scaler(15) }}>
                <Text style={{ fontSize: scaler(15), fontWeight: '400', color: colors.colorPrimary, alignSelf: 'center' }}>
                    {Language.read_refund_policy}
                </Text>
                {getValues('noOfSeats') ?
                    <Button title={Language.pay + ' ' + getSymbol(eventDetail?.currency) + (totalPrice * eventDetail?.price)} />
                    : undefined
                }
            </View>
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

export default BookEvent;