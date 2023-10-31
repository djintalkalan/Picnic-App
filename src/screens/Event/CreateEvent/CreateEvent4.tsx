import { createEvent, setLoadingAction, uploadFileArray } from 'app-store/actions';
import { updateCreateEvent } from 'app-store/actions/createEventActions';
import { store } from 'app-store/store';
import { Images, colors } from 'assets';
import { BackButton, Button, CheckBox, MyHeader, Stepper, Text, TextInput, useKeyboardService } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { IPaypalConnection, useDatabase } from 'database';
import { round } from 'lodash';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import FeatureFlagService from 'src/featureflag/FeatureFlagService';
import FeatureFlagWrapper from 'src/featureflag/FeatureFlagWrapper';
import Language from 'src/language/Language';
import { NavigationService, scaler } from 'utils';

type FormType = {
    // paypalEmail: string;
    // apiUserName: string;
    // apiPassword: string;
    // apiSignature: string;
    policy: string;
    taxRate: string;
    taxPrice: string;
};
const { height, width } = Dimensions.get('screen')

const CreateEvent4: FC<any> = props => {
    const [isBookingDisabled, setBookingDisabled] = useState(true);
    const [isPayByCash, setIsPayByCash] = useState(false)
    const [isSecure, setSecure] = useState(true)
    const [infoVisible, setInfoVisible] = useState<boolean>(false)
    const uploadedImage = useRef('');
    const uploadedImageArray = useRef<Array<any>>([]);
    const [isPayByPaypal, setIsPayByPaypal] = useState(false)
    const { current: event } = useRef(store.getState().createEventState)
    const [{ isPaypalConnected }] = useDatabase<IPaypalConnection>("paypalConnection", {})
    const [isPayByBitcoin, setIsPayByBitcoin] = useState(false)
    const [featureFlag, setFeatureFlag] = useState(false)

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


    useEffect(() => {
        setEventValues()
    }, [])

    useEffect(() => {
        event?.payment_method && event?.payment_method?.includes('paypal') && isPaypalConnected && setIsPayByPaypal(true)
    }, [isPaypalConnected])

    useEffect(() => {
        FeatureFlagService.checkFlag("enable-lightning").then((result) => {
            if (result) {
                setFeatureFlag(true);
            }
        })
    }, [])

    const setEventValues = useCallback(() => {
        console.log("event", event);
        // console.log("userData?.paypal_merchant_id", userData?.paypal_merchant_id);
        event?.payment_method && event?.payment_method?.includes('cash') && setIsPayByCash(true)
        featureFlag && event?.payment_method && event?.payment_method?.includes('bitcoin') && setIsPayByBitcoin(true)
        // setValue('paypalEmail', event?.payment_email ?? '')
        // setValue('apiUserName', event?.payment_api_username ?? '')
        // setValue('apiPassword', event?.payment_api_password ?? '')
        // setValue('apiSignature', event?.payment_api_signature ?? '')
        uploadedImage.current = event?.image?.path ? '' : event.image
        if (event.is_donation_enabled != 1) {
            setValue('taxRate', event?.event_tax_rate?.toString() || '')
            setValue('taxPrice', event?.event_tax_rate ? (round(((parseFloat(event?.event_tax_rate?.toString()) / 100) * parseFloat(event?.event_fees.toString())), 2)).toString() : '')
            setValue('policy', event?.event_refund_policy ?? '')
        }
        // if (event?.payment_api_signature || event?.is_creators_paypal_configured == 1) {
        //     setPaypalBusinessAccount(true)
        // }
        setBookingDisabled(parseInt(event?.is_booking_disabled?.toString() || '0') == 1)
    }, [])

    const callCreateEventApi = useCallback(data => {
        const payload: any = {
            // is_creators_paypal_configured: usePaypalBusinessAccount ? '1' : '0',
            is_booking_disabled: isBookingDisabled ? '1' : '0',
            payment_method: (() => { const methods = []; isPayByCash && methods.push('cash'); isPayByPaypal && methods.push('paypal'); featureFlag && isPayByBitcoin && methods.push('bitcoin'); return methods; })(),
            // payment_email: !usePaypalBusinessAccount && data?.paypalEmail?.trim() || '',
            // payment_api_username: usePaypalBusinessAccount && data?.apiUserName?.trim() || '',
            // payment_api_password: usePaypalBusinessAccount && data?.apiPassword?.trim() || '',
            // payment_api_signature: usePaypalBusinessAccount && data?.apiSignature?.trim() || '',
            payment_email: event?.payment_email?.length ? null : undefined,
            payment_api_username: event?.payment_api_username?.length ? null : undefined,
            payment_api_password: event?.payment_api_password?.length ? null : undefined,
            payment_api_signature: event?.payment_api_signature?.length ? null : undefined,
            is_creators_paypal_configured: isPaypalConnected ? 1 : 0,
            image: uploadedImage.current,
            event_images: [...event.event_images.filter(_ => _?._id), ...uploadedImageArray.current]
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
        // return console.log(payload);
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
    }, [isPayByPaypal, isPayByCash, isPayByBitcoin, isBookingDisabled, isPaypalConnected]);

    const onSubmit = useCallback(() => handleSubmit((data) => {
        if (!data?.policy?.trim() && event.is_donation_enabled != 1 && isPayByPaypal) {
            setError("policy", { message: Language.write_refund_policy })
            return
        }
        let tempArray = event.event_images.filter(_ => !_?._id)
        if (event.image?.path || tempArray.length > 0) {
            dispatch(uploadFileArray(
                {
                    image: [...tempArray, ...(event.image?.path ? [{ ...event.image, isProfile: true }] : [])],
                    onSuccess: (imageArray, profileImage) => {
                        dispatch(setLoadingAction(false))
                        if (profileImage)
                            uploadedImage.current = profileImage
                        uploadedImageArray.current = [...imageArray];
                        callCreateEventApi(data);
                    },
                    prefixType: 'events',
                }),
            )
        } else {
            callCreateEventApi(data);
        }
    })(), [callCreateEventApi, event, isPayByPaypal],);

    const calculateButtonDisability = useCallback(() => {
        if ((!isPayByPaypal && !isPayByCash && !isPayByBitcoin) && !isBookingDisabled
        ) {
            return true;
        }
        return false;
    }, [isPayByPaypal, isPayByCash, isPayByBitcoin, isBookingDisabled]);

    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            {infoVisible ? <View style={{ flex: 1 }}>
                <BackButton onPress={() => setInfoVisible(false)} />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                    <Image
                        style={{
                            height: width,
                            aspectRatio: 1800 / 1118,
                            resizeMode: 'contain',
                            alignSelf: 'center',
                            transform: [{ rotate: '90deg' }]
                        }}
                        source={Images.ic_paypal_info} />
                </View>
            </View> :
                <><MyHeader title={event?._id ? event?.is_copied_event != '0' ? Language.copy_event : Language.edit_event : Language.host_an_event} /><ScrollView enableResetScrollToCoords={false} nestedScrollEnabled keyboardShouldPersistTaps={'handled'}>
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

                        <FeatureFlagWrapper flag='enable-lightning'>
                            <TouchableOpacity style={styles.payView} onPress={() => {
                                setIsPayByBitcoin(!isPayByBitcoin)
                            }}>
                                <Image source={Images.ic_bitcoin} style={{ height: scaler(16), width: scaler(19), resizeMode: "contain" }} />
                                <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{event.is_donation_enabled == 1 ? Language.accept_in_bitcoin : Language.pay_by_bitcoin}</Text>
                                <MaterialIcons name={isPayByBitcoin ? 'check-circle' : 'radio-button-unchecked'} size={scaler(20)} color={colors.colorPrimary} />
                            </TouchableOpacity>
                        </FeatureFlagWrapper>
                        <View style={{ height: scaler(1), width: '95%', backgroundColor: '#EBEBEB', alignSelf: 'center' }} />

                        <TouchableOpacity style={styles.payView} onPress={() => {
                            if (!isPayByPaypal && !isPaypalConnected) {
                                NavigationService.navigate('PaypalDetails', {
                                    onSuccess: () => {
                                        setIsPayByPaypal(true)
                                    }
                                })
                            } else {
                                setIsPayByPaypal(!isPayByPaypal)
                            }
                        }}>
                            <Image source={Images.ic_paypal} style={{ height: scaler(16), width: scaler(19) }} />
                            <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{event.is_donation_enabled == 1 ? Language.accept_in_paypal : Language.pay_with_paypal}</Text>
                            <MaterialIcons name={isPayByPaypal ? 'check-circle' : 'radio-button-unchecked'} size={scaler(20)} color={colors.colorPrimary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => {
                        setBookingDisabled(!isBookingDisabled)
                    }} style={{ flexDirection: 'row', marginTop: scaler(20), marginHorizontal: scaler(15), alignItems: 'center' }}>
                        <CheckBox checked={isBookingDisabled} />
                        <Text style={{ color: colors.colorBlack, fontWeight: '500', flex: 1, marginLeft: scaler(10), fontSize: scaler(14) }}>{Language.save_the_date}</Text>
                    </TouchableOpacity>

                    <View
                        style={{
                            width: '100%',
                            paddingHorizontal: scaler(20),
                            paddingVertical: scaler(15),
                        }}>
                        {event.is_donation_enabled != 1 ?
                            <><Text>{Language.tax_rate} (%)</Text>
                                <TextInput
                                    containerStyle={{ flex: 1, marginEnd: scaler(4), paddingBottom: scaler(10) }}
                                    placeholder={Language.enter_the_tax_rate}
                                    style={{ paddingLeft: scaler(20) }}
                                    borderColor={colors.colorTextInputBackground}
                                    backgroundColor={colors.colorTextInputBackground}
                                    name={'taxRate'}
                                    maxLength={5}
                                    returnKeyType={'done'}
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
                                    <><Text style={{ marginBottom: scaler(10) }}>{Language.tax_amount}</Text>
                                        <TextInput
                                            containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                                            placeholder={Language.tax_price}
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

                        {event.is_donation_enabled != 1 && isPayByPaypal ?
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
                                    errors={errors} />
                            </View> : undefined}



                        <Button
                            disabled={calculateButtonDisability()}
                            containerStyle={{ marginTop: scaler(20) }}
                            title={Language.finish}
                            onPress={onSubmit} />
                    </View>
                </ScrollView></>}
        </SafeAreaViewWithStatusBar>
    );
};

export default CreateEvent4;

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
