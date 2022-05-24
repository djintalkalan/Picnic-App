import { createEvent, uploadFile } from 'app-store/actions';
import { colors, Images } from 'assets';
import { Button, MyHeader, Stepper, Text, TextInput, useKeyboardService } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import Database from 'database/Database';
import { round } from 'lodash';
import React, { FC, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { dateFormat, scaler } from 'utils';

type FormType = {
    paypalId: string;
    policy: string;
    taxRate: string;
    taxPrice: string;
};

const CreateEvent3: FC<any> = props => {
    const [isPayByCash, setIsPayByCash] = useState(false)
    const [isPayByPaypal, setIsPayByPaypal] = useState(false)
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
    const eventDetail = props?.route?.params?.data;
    const keyboardValues = useKeyboardService()



    const onSubmit = useCallback(
        (data) => {
            if (!data?.policy?.trim()) {
                setError("policy", { message: Language.write_refund_policy })
                return
            }
            if (!eventDetail?.image && eventDetail?.eventImage?.path) {
                dispatch(
                    uploadFile({
                        image: eventDetail?.eventImage,
                        onSuccess: url => {
                            eventDetail.image = url;
                            callCreateEventApi(data, isPayByPaypal, isPayByCash);
                        },
                        prefixType: 'events',
                    }),
                );
            } else {
                callCreateEventApi(data, isPayByPaypal, isPayByCash);
            }
        },
        [props, isPayByPaypal, isPayByCash],
    );


    const callCreateEventApi = useCallback((data, isPayByPaypal, isPayByCash) => {
        const { latitude, longitude, address, otherData } =
            eventDetail?.location ?? {};

        const { startTime, endTime, eventDate } = eventDetail?.eventDateTime
        let payload = {
            image: eventDetail?.image,
            name: eventDetail?.eventName?.trim(),
            group_id: eventDetail?.myGroup?.id,
            is_online_event: eventDetail?.isOnlineEvent ? '1' : '0',
            short_description: eventDetail?.aboutEvent?.trim(),
            address: address?.main_text + (((address?.main_text && address?.secondary_text ? ", " : "") + address?.secondary_text)?.trim() || ""),
            city: otherData?.city,
            state: otherData?.state,
            country: otherData?.country,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
            },
            capacity_type: eventDetail?.isUnlimitedCapacity ? 'unlimited' : 'limited',
            capacity: eventDetail?.capacity,
            is_free_event: '0',
            event_fees: eventDetail?.ticketPrice?.toString(),
            event_date: dateFormat(eventDate, "YYYY-MM-DD"),
            event_start_time: dateFormat(startTime, "HH:mm:ss"),
            event_end_time: data?.endTime ? dateFormat(endTime, "HH:mm") : "",
            details: eventDetail?.additionalInfo?.trim(),
            event_currency: eventDetail?.currency.toLowerCase(),
            payment_method: isPayByCash && isPayByPaypal ? ['cash', 'paypal'] : isPayByPaypal ? ['paypal'] : ['cash'],
            payment_email: data?.paypalId?.trim(),
            event_refund_policy: data?.policy?.trim(),
            event_tax_rate: data?.taxRate,
            event_tax_amount: data?.taxPrice,
        };
        dispatch(
            createEvent({
                data: payload,
                onSuccess: () => {
                    Database.setSelectedLocation(
                        Database.getStoredValue('selectedLocation'),
                    );
                },
            }),
        );
    }, []);

    const calculateButtonDisability = useCallback(() => {
        if ((!isPayByPaypal && !isPayByCash) ||
            (isPayByPaypal && !getValues('paypalId'))
        ) {
            return true;
        }

        return false;
    }, [isPayByPaypal, isPayByCash]);

    console.log('taxPrice', ((parseFloat(getValues('taxRate')) / 100) * eventDetail?.ticketPrice).toString(), parseFloat(getValues('taxRate')));


    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <MyHeader title={Language.host_an_event} />
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps={'handled'}>
                <Stepper step={3} totalSteps={3} paddingHorizontal={scaler(20)} />

                <View style={styles.eventView}>
                    <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500' }}>
                        {Language.select_payment_options}
                    </Text>
                    <TouchableOpacity style={styles.payView} onPress={() => setIsPayByCash(!isPayByCash)}>
                        <Image source={Images.ic_empty_wallet} style={{ height: scaler(16), width: scaler(19) }} />
                        <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{Language.pay_by_cash}</Text>
                        <MaterialIcons name={isPayByCash ? 'check-circle' : 'radio-button-unchecked'} size={scaler(20)} color={colors.colorPrimary} />
                    </TouchableOpacity>
                    <View style={{ height: scaler(1), width: '95%', backgroundColor: '#EBEBEB', alignSelf: 'center' }} />
                    <TouchableOpacity style={styles.payView} onPress={() => setIsPayByPaypal(!isPayByPaypal)}>
                        <Image source={Images.ic_paypal} style={{ height: scaler(16), width: scaler(19) }} />
                        <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{Language.pay_by_paypal}</Text>
                        <MaterialIcons name={isPayByPaypal ? 'check-circle' : 'radio-button-unchecked'} size={scaler(20)} color={colors.colorPrimary} />
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        width: '100%',
                        paddingHorizontal: scaler(20),
                        paddingVertical: scaler(15),
                    }}>

                    <Text>{Language.tax_rate} (%)</Text>
                    <TextInput
                        containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                        placeholder={
                            Language.enter_the_tax_rate
                        }
                        style={{ paddingLeft: scaler(20) }}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'taxRate'}
                        maxLength={5}
                        keyboardType={'decimal-pad'}
                        onChangeText={(_) => {
                            setValue('taxPrice',
                                (0 < parseFloat(_) && parseFloat(_) < 29.9) ? (round(((parseFloat(_) / 100) * parseFloat(eventDetail?.ticketPrice)), 2)).toString() : '')
                        }}
                        iconSize={scaler(18)}
                        // icon={Images.ic_ticket}
                        rules={{
                            validate: (v: string) => {
                                v = v?.trim()
                                if (parseFloat(v) > 29.90 || parseFloat(v) < 0) {
                                    return Language.tax_rate_limit
                                }
                                try {
                                    if ((v?.includes(".") && (v?.indexOf(".") != v?.lastIndexOf(".")) || (v.split(".")?.[1]?.trim()?.length > 2))) {
                                        return Language.tax_rate_limit
                                    }
                                }
                                catch (e) { }

                            }
                        }}
                        control={control}
                        errors={errors}
                    />

                    <Text style={{ marginTop: scaler(10) }}>{Language.tax_amount}</Text>
                    <TextInput
                        containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                        placeholder={
                            'Tax Price'
                        }
                        style={{ paddingLeft: scaler(20) }}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'taxPrice'}
                        disabled={true}
                        iconSize={scaler(18)}
                        control={control}
                        errors={errors}
                    />

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
                    </View>

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
