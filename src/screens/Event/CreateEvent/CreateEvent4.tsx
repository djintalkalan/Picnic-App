import { createEvent } from 'app-store/actions';
import { updateCreateEvent } from 'app-store/actions/createEventActions';
import { store } from 'app-store/store';
import { colors, Images } from 'assets';
import { Button, MyHeader, Stepper, Text, TextInput, useKeyboardService } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { round } from 'lodash';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { scaler } from 'utils';

type FormType = {
    paypalId: string;
    policy: string;
    taxRate: string;
    taxPrice: string;
};

const CreateEvent3: FC<any> = props => {
    const [isPayByCash, setIsPayByCash] = useState(false)
    const [isPayByPaypal, setIsPayByPaypal] = useState(false)
    const { current: event } = useRef(store.getState().createEventState)
    const dispatch = useDispatch()
    const {
        control,
        handleSubmit,
        getValues,
        setValue,
        setError,
        formState: { errors },
    } = useForm<FormType>({
        mode: 'onChange',
    });
    const keyboardValues = useKeyboardService()

    console.log('event', event)

    useEffect(() => {
        setEventValues()
    }, [])

    const setEventValues = useCallback(() => {
        event?.payment_method && event?.payment_method?.includes('cash') && setIsPayByCash(true)
        event?.payment_method && event?.payment_method?.includes('paypal') && setIsPayByPaypal(true)
        setValue('paypalId', event?.payment_email ?? '')
        if (event.is_donation_enabled != 1) {
            setValue('taxRate', event?.event_tax_rate?.toString() || '')
            setValue('taxPrice', event?.event_tax_rate ? (round(((parseFloat(event?.event_tax_rate?.toString()) / 100) * parseFloat(event?.event_fees.toString())), 2)).toString() : '')
            setValue('policy', event?.event_refund_policy ?? '')
        }
    }, [])

    const onSubmit = useCallback(
        (data) => {
            if (!data?.policy?.trim() && event.is_donation_enabled != 1) {
                setError("policy", { message: Language.write_refund_policy })
                return
            }
            callCreateEventApi(data, isPayByPaypal, isPayByCash);
        },
        [isPayByPaypal, isPayByCash],
    );


    const callCreateEventApi = useCallback((data, isPayByPaypal, isPayByCash) => {

        const payload: any = {
            payment_method: isPayByCash && isPayByPaypal ? ['cash', 'paypal'] : isPayByPaypal ? ['paypal'] : ['cash'],
            payment_email: data?.paypalId?.trim() ?? ''
        };
        if (event.is_free_event != 1) {
            payload.event_tax_rate = data?.taxRate || '0'
            payload.event_refund_policy = data?.policy?.trim()
            if (event.ticket_type == 'single') {
                payload.event_tax_amount = data?.taxPrice || '0'
                payload.ticket_plans = []
            }
            else {
                payload.ticket_plans = event.ticket_plans?.map(_ => ({
                    ..._,
                    event_tax_rate: data?.taxRate || '0',
                    event_tax_amount: (round(((parseFloat(data?.taxRate || 0) / 100) * parseFloat(_?.amount.toString())), 2)).toString(),
                }))
                payload.event_tax_amount = '0'
                payload.event_currency = payload.ticket_plans[0].currency
            }
        }
        dispatch(updateCreateEvent(payload))
        setTimeout(() => {
            // return console.log('store.getState().createEventState', store.getState().createEventState);
            dispatch(
                createEvent(
                    // {
                    // data: {payload},
                    // onSuccess: () => {
                    //     Database.setSelectedLocation(
                    //         Database.getStoredValue('selectedLocation'),
                    //     );
                    // },
                    // }
                ),
            );

        }, 0);
    }, []);

    const calculateButtonDisability = useCallback(() => {
        if ((!isPayByPaypal && !isPayByCash) ||
            (isPayByPaypal && !getValues('paypalId'))
        ) {
            return true;
        }

        return false;
    }, [isPayByPaypal, isPayByCash]);



    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <MyHeader title={event?._id ? event?.is_copied_event != '0' ? Language.copy_event : Language.edit_event : Language.host_an_event} />
            <ScrollView enableResetScrollToCoords={false} nestedScrollEnabled keyboardShouldPersistTaps={'handled'}>
                <Stepper step={4} totalSteps={4} paddingHorizontal={scaler(20)} />

                <View style={styles.eventView}>
                    <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500' }}>
                        {event.is_donation_enabled == 1 ? Language.select_donation_options : Language.select_payment_options}
                    </Text>
                    <TouchableOpacity style={styles.payView} onPress={() => setIsPayByCash(!isPayByCash)}>
                        <Image source={Images.ic_empty_wallet} style={{ height: scaler(16), width: scaler(19) }} />
                        <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{event.is_donation_enabled == 1 ? Language.accept_in_cash : Language.pay_by_cash}</Text>
                        <MaterialIcons name={isPayByCash ? 'check-circle' : 'radio-button-unchecked'} size={scaler(20)} color={colors.colorPrimary} />
                    </TouchableOpacity>
                    <View style={{ height: scaler(1), width: '95%', backgroundColor: '#EBEBEB', alignSelf: 'center' }} />
                    <TouchableOpacity style={styles.payView} onPress={() => setIsPayByPaypal(!isPayByPaypal)}>
                        <Image source={Images.ic_paypal} style={{ height: scaler(16), width: scaler(19) }} />
                        <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{event.is_donation_enabled == 1 ? Language.accept_in_paypal : Language.pay_by_paypal}</Text>
                        <MaterialIcons name={isPayByPaypal ? 'check-circle' : 'radio-button-unchecked'} size={scaler(20)} color={colors.colorPrimary} />
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        width: '100%',
                        paddingHorizontal: scaler(20),
                        paddingVertical: scaler(15),
                    }}>

                    {event.is_donation_enabled != 1 ?
                        <><Text>{Language.tax_rate} (%)</Text>
                            <TextInput
                                containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                                placeholder={Language.enter_the_tax_rate}
                                style={{ paddingLeft: scaler(20) }}
                                borderColor={colors.colorTextInputBackground}
                                backgroundColor={colors.colorTextInputBackground}
                                name={'taxRate'}
                                maxLength={5}
                                keyboardType={'decimal-pad'}
                                onChangeText={event.ticket_type == 'single' ? (_) => {
                                    setValue('taxPrice',
                                        // (0 < parseFloat(_) && parseFloat(_) < 29.9) ? (round(((parseFloat(_) / 100) * event?.event_fees), 2)).toString() : '');
                                        // onChangeText={(_) => {

                                        (0 < parseFloat(_) && parseFloat(_) < 29.9) ? (round(((parseFloat(_) / 100) * parseFloat(event?.event_fees.toString())), 2)).toString() : '');

                                } : undefined}
                                iconSize={scaler(18)}
                                // icon={Images.ic_ticket}
                                rules={{
                                    validate: (v: string) => {
                                        v = v?.trim();
                                        if (parseFloat(v) > 29.90 || parseFloat(v) < 0) {
                                            return Language.tax_rate_limit;
                                        }
                                        try {
                                            if ((v?.includes(".") && (v?.indexOf(".") != v?.lastIndexOf(".")) || (v.split(".")?.[1]?.trim()?.length > 2))) {
                                                return Language.tax_rate_limit;
                                            }
                                        }
                                        catch (e) { }

                                    }
                                }}
                                control={control}
                                errors={errors} />
                            {event.ticket_type == 'single' ?
                                <><Text style={{ marginTop: scaler(10) }}>{Language.tax_amount}</Text>
                                    <TextInput
                                        containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                                        placeholder={'Tax Price'}
                                        style={{ paddingLeft: scaler(20) }}
                                        borderColor={colors.colorTextInputBackground}
                                        backgroundColor={colors.colorTextInputBackground}
                                        name={'taxPrice'}
                                        disabled={true}
                                        iconSize={scaler(18)}
                                        control={control}
                                        errors={errors} /></>
                                : undefined}</>
                        : undefined}

                    {isPayByPaypal ?
                        <TextInput
                            containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                            placeholder={Language.paypal_id}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            name={'paypalId'}
                            required={
                                Language.paypal_id_required
                            }
                            control={control}
                            errors={errors}
                        /> : undefined
                    }
                    {event.is_donation_enabled != 1 ?
                        <View style={{ flex: 1, width: '100%' }}>
                            <TextInput
                                placeholder={Language.write_refund_policy}
                                name={'policy'}
                                multiline
                                keyboardValues={keyboardValues}
                                style={{ minHeight: scaler(200), textAlignVertical: 'top' }}
                                limit={1000}
                                required={Language.refund_policy_required}
                                borderColor={colors.colorTextInputBackground}
                                backgroundColor={colors.colorTextInputBackground}
                                control={control}
                                errors={errors}
                            />
                        </View> : undefined}

                    <Button
                        disabled={calculateButtonDisability()}
                        containerStyle={{ marginTop: scaler(20) }}
                        title={Language.finish}
                        onPress={handleSubmit((data) => onSubmit(data))}
                    />
                </View>
            </ScrollView>
        </SafeAreaViewWithStatusBar>
    );
};

export default CreateEvent3;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center',
    },

    image: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain',
    },
    eventView: {
        marginTop: scaler(25),
        marginHorizontal: scaler(15),
    },
    payView: {
        flexDirection: 'row',
        marginVertical: scaler(16),
        alignItems: 'center',
        marginHorizontal: scaler(5)
    }
});
