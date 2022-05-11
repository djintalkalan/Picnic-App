import { RootState } from 'app-store';
import { createEvent, getEventDetail, getMyGroups, restorePurchase, uploadFile } from 'app-store/actions';
import { colors, Images } from 'assets';
import {
    Button,
    CheckBox,
    FixedDropdown,
    MyHeader, Text,
    TextInput,
    useKeyboardService
} from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import Database, { ILocation, useDatabase } from 'database';
import { isEqual, round } from 'lodash';
import React, { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Image,
    InteractionManager,
    StyleSheet,
    TextInput as RNTextInput,
    TouchableOpacity,
    View
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import Language from 'src/language/Language';
import {
    dateFormat,
    getImageUrl,
    getShortAddress,
    NavigationService,
    ProfileImagePickerOptions,
    scaler,
    stringToDate,
    _hidePopUpAlert,
    _showPopUpAlert
} from 'utils';

type FormType = {
    eventName: string;
    selectGroup: string;
    location: string;
    aboutEvent: string;
    capacity: string;
    ticketPrice: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    additionalInfo: string;
    currency: string;
    paypalId: string;
    policy: string;
    taxRate: string;
    taxPrice: string;
};

const DropDownData = ['USD', 'EUR', 'GBP'];

type IEventDateTime = {
    selectedType: "eventDate" | "startTime" | "endTime",
    eventDate: Date,
    startTime: Date,
    endTime: Date,
}


const EditEvent: FC<any> = props => {
    const uploadedImage = useRef('');
    const [eventImage, setEventImage] = useState<any>();
    const locationRef = useRef<ILocation>();
    const locationInputRef = useRef<RNTextInput>(null);
    const selectedGroupRef = useRef<any>(null);
    const [isOnlineEvent, setIsOnlineEvent] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<Array<any>>([]);
    const [isGroupDropdown, setGroupDropdown] = useState(false);
    const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(false);
    const [isFreeEvent, setIsFreeEvent] = useState(false);
    const [isDropdown, setDropdown] = useState(false);
    const eventDateTime = useRef<IEventDateTime>({
        selectedType: 'eventDate',
        eventDate: new Date(),
        startTime: new Date(),
        endTime: new Date()
    });
    const [userData] = useDatabase("userData")
    const { event } = useSelector((state: RootState) => ({
        event: state?.eventDetails?.[props?.route?.params?.id]?.event,
    }), isEqual)


    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const { myGroups } = useSelector((state: RootState) => ({
        myGroups: state?.group?.myGroups
    }))


    const dispatch = useDispatch();
    const {
        control,
        getValues,
        setValue,
        handleSubmit,
        clearErrors,
        formState: { errors },
    } = useForm<FormType>({
        mode: 'onChange', defaultValues: { 'currency': 'USD' }
    });



    const calculateButtonDisability = useCallback(() => {
        if (
            !getValues('eventName') ||
            !getValues('location') ||
            !getValues('eventDate') ||
            !getValues('currency') ||
            !getValues('startTime') ||
            (!isFreeEvent && ((!paymentMethods?.length))) ||

            (errors && (errors.eventName || errors.location || errors.eventDate || errors.ticketPrice || errors.currency || errors.startTime || errors.capacity))
        )
            return true;
        return false;
    }, [errors, paymentMethods, isFreeEvent]);

    const pickImage = useCallback(() => {
        setTimeout(() => {
            ImagePicker.openPicker(ProfileImagePickerOptions)
                .then(image => {
                    uploadedImage.current = '';
                    setEventImage(image);
                })
                .catch(e => {
                    console.log(e);
                });
        }, 200);
    }, []);


    useEffect(() => {
        dispatch(getMyGroups())
        dispatch(restorePurchase())
    }, [])


    useLayoutEffect(() => {
        // console.log("payload", props)
        InteractionManager.runAfterInteractions(() => {
            dispatch(getEventDetail(props?.route?.params?.id))
        })
    }, [])


    useEffect(() => {
        if (event) {

            const main_text = getShortAddress(event?.address, event?.state, event?.city)
            let secondary_text = event?.city + ", " + event?.state + ", " + event?.country

            if (secondary_text?.includes(main_text)) {
                secondary_text = secondary_text?.replace(main_text + ",", "")?.trim();
            }
            if (secondary_text?.startsWith(",")) {
                secondary_text = secondary_text?.replace(",", "")?.trim()
            }
            if (secondary_text?.endsWith(",")) {
                secondary_text = secondary_text.substring(0, secondary_text.lastIndexOf(","))?.trim();
            }

            locationRef.current = (event?.location?.coordinates[0] && event?.location?.coordinates[1]) ? {
                latitude: event?.location?.coordinates[1],
                longitude: event?.location?.coordinates[0],
                address: {
                    main_text,
                    secondary_text,
                },
                otherData: {
                    city: event?.city,
                    state: event?.state,
                    country: event?.country
                }
            } : undefined

            // return
            eventDateTime.current = {
                eventDate: stringToDate(event?.event_date, "YYYY-MM-DD", "-"),
                startTime: stringToDate(event?.event_date + " " + event?.event_start_time, "YYYY-MM-DD", "-"),
                endTime: event?.event_end_time ? stringToDate(event?.event_date + " " + event?.event_end_time, "YYYY-MM-DD", "-") : new Date(),
                selectedType: 'eventDate',
            }
            selectedGroupRef.current = event?.event_group
            setPaymentMethods(event?.payment_method ?? []);
            setIsOnlineEvent(event?.is_online_event ? true : false)
            setIsUnlimitedCapacity(event?.capacity_type == 'unlimited' ? true : false)
            setIsFreeEvent(event?.is_free_event ? true : false)
            setValue('eventName', event?.name)
            setValue('location', event?.address)
            setValue('selectGroup', event?.event_group?.name)
            setValue('aboutEvent', event?.short_description)
            setValue('capacity', (event?.capacity || "")?.toString())
            setValue('ticketPrice', (event?.event_fees || "")?.toString())
            setValue('eventDate', dateFormat(eventDateTime.current.eventDate, 'MMM DD, YYYY'))
            setValue('startTime', dateFormat(eventDateTime.current.startTime, 'hh:mm A'))
            setValue('endTime', event?.event_end_time ? dateFormat(eventDateTime.current.endTime, 'hh:mm A') : '')
            setValue('additionalInfo', event?.details)
            setValue('currency', event?.event_currency?.toUpperCase())
            setValue('paypalId', event?.payment_email)
            setValue('policy', event?.event_refund_policy)
            setValue('taxRate', event?.event_tax_rate?.toString())
            setValue('taxPrice', event?.event_tax_amount?.toString())
            if (event?.image) {
                setEventImage({ uri: getImageUrl(event?.image, { type: 'events', width: scaler(100) }) })
            } else {
                setEventImage(null)
            }
        }
    }, [event])

    const onSubmit = useCallback(
        (data) => {
            if (!uploadedImage.current && eventImage?.path) {
                dispatch(
                    uploadFile({
                        image: eventImage,
                        onSuccess: url => {
                            uploadedImage.current = url;
                            callCreateEventApi(data, isFreeEvent, isUnlimitedCapacity, isOnlineEvent, paymentMethods);
                        },
                        prefixType: 'events',
                    }),
                );
            } else {
                callCreateEventApi(data, isFreeEvent, isUnlimitedCapacity, isOnlineEvent, paymentMethods);
            }
        },
        [eventImage, isFreeEvent, isUnlimitedCapacity, isOnlineEvent, paymentMethods],
    );

    const callCreateEventApi = useCallback((data, isFreeEvent, isUnlimitedCapacity, isOnlineEvent, paymentMethods) => {

        const { latitude, longitude, address, otherData } =
            locationRef.current ?? {};

        const { startTime, endTime, eventDate } = eventDateTime.current
        let payload = {
            _id: props?.route?.params?.id,
            image: uploadedImage?.current || undefined,
            name: data?.eventName,
            group_id: selectedGroupRef.current?.id ?? selectedGroupRef.current?._id,
            is_online_event: isOnlineEvent ? '1' : '0',
            short_description: data?.aboutEvent,
            address: (address?.main_text ? (address?.main_text + ', ') : "") + address?.secondary_text,
            city: otherData?.city,
            state: otherData?.state,
            country: otherData?.country,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
            },
            capacity_type: isUnlimitedCapacity ? 'unlimited' : 'limited',
            capacity: data?.capacity ?? 0,
            is_free_event: isFreeEvent ? '1' : '0',
            event_fees: data?.ticketPrice ? round(parseFloat(data?.ticketPrice), 2)?.toString() : "0",
            event_date: dateFormat(eventDate, "YYYY-MM-DD"),
            event_start_time: dateFormat(startTime, "HH:mm:ss"),
            event_end_time: data?.endTime ? dateFormat(endTime, "HH:mm") : "",
            details: data?.additionalInfo,
            event_currency: data?.currency.toLowerCase(),
            payment_method: paymentMethods,
            payment_email: data?.paypalId,
            event_refund_policy: data?.policy,
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


    const openDatePicker = useCallback((type: "eventDate" | "startTime" | "endTime") => {
        eventDateTime.current.selectedType = type
        setDatePickerVisibility(true);
    }, []);

    const keyboardValues = useKeyboardService()


    const getMinDate = useCallback(() => {
        const { startTime, endTime, eventDate, selectedType } = eventDateTime.current
        switch (selectedType) {
            case "eventDate":
                return new Date();
            case "startTime":
                if (eventDate && dateFormat(eventDate, "DD-MM-YYYY") == dateFormat(new Date(), "DD-MM-YYYY")) {
                    return new Date()
                } else {
                    return undefined
                }
            case "endTime":
                if (startTime) {
                    return startTime
                } else
                    if (eventDate && dateFormat(eventDate, "DD-MM-YYYY") == dateFormat(new Date(), "DD-MM-YYYY")) {
                        return new Date()
                    } else {
                        return undefined
                    }
            default:
                break;
        }

    }, [])

    const onSubscriptionSuccess = useCallback(() => {
        setIsFreeEvent(false)
    }, [])

    const openSubscriptionPopup = useCallback(() => {
        _showPopUpAlert({
            message: Language.join_now_to_access_payment_processing,
            buttonText: Language.join_now,
            onPressButton: () => {
                NavigationService.navigate("Subscription", {
                    from: 'editEvent',
                    onSuccess: onSubscriptionSuccess
                });
                _hidePopUpAlert()
            },
            cancelButtonText: Language.close,
        })
    }, [])


    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <MyHeader title={Language.edit_event} />
            <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps={'handled'}
                contentContainerStyle={{ alignItems: 'center' }}>
                <View>
                    <View style={styles.imageContainer}>
                        <Image
                            onError={err => {
                                setEventImage(Images.ic_event_placeholder);
                            }}
                            style={styles.image}
                            source={
                                eventImage
                                    ? eventImage?.path
                                        ? { uri: eventImage?.path }
                                        : eventImage
                                    : Images.ic_event_placeholder
                            }
                        />
                    </View>
                    <TouchableOpacity onPress={pickImage} style={styles.cameraButton}>
                        <Image style={styles.image} source={Images.ic_camera} />
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        width: '100%',
                        paddingHorizontal: scaler(20),
                        paddingVertical: scaler(15),
                    }}>
                    <TextInput
                        containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                        placeholder={Language.event_name}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'eventName'}
                        rules={{
                            validate: (v: string) => {
                                if (!v.trim()) {
                                    return Language.event_name_required
                                }
                                if (v?.length < 3)
                                    return Language.min_characters_event_name
                            }
                        }}
                        required={Language.event_name_required}
                        control={control}
                        errors={errors}
                    />
                    <View style={{ flex: 1, width: '100%' }}>
                        <TextInput
                            containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                            placeholder={Language.select_group}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            name={'selectGroup'}
                            icon={Images.ic_arrow_dropdown}
                            onPress={() => {
                                setGroupDropdown(!isGroupDropdown);
                            }}
                            required={Language.group_name_required}
                            control={control}
                            errors={errors}
                        />
                        <FixedDropdown
                            visible={isGroupDropdown}
                            data={myGroups.map((_, i) => ({ id: _?._id, data: _?.data, title: _?.name }))}
                            onSelect={data => {
                                setGroupDropdown(false);
                                selectedGroupRef.current = data;
                                setValue('selectGroup', data?.title, { shouldValidate: true });
                            }}
                        />
                        <TouchableOpacity style={styles.eventView} onPress={() => setIsOnlineEvent(!isOnlineEvent)}>
                            <CheckBox checked={isOnlineEvent} setChecked={setIsOnlineEvent} />
                            <Text style={{ marginLeft: scaler(5), fontSize: scaler(13), fontWeight: '400' }}>
                                {Language.online_event}
                            </Text>
                        </TouchableOpacity>

                        <TextInput
                            containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                            placeholder={Language.select_location}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            name={'location'}
                            ref={locationInputRef}
                            icon={Images.ic_gps}
                            onPress={() => {
                                NavigationService.navigate('SelectLocation', {
                                    prevSelectedLocation: locationRef.current,
                                    onSelectLocation: (location: ILocation) => {
                                        locationRef.current = location;
                                        // console.log("LOCATION:", location)
                                        // setValue("location", location?.otherData?.city + (location?.otherData?.state ? (", " + location?.otherData?.state) : "") + (location?.otherData?.country ? (", " + location?.otherData?.country) : ""), { shouldValidate: true })
                                        setValue("location", location?.address?.main_text + (location?.address?.secondary_text ? (", " + location?.address?.secondary_text) : ""), { shouldValidate: true })
                                        locationInputRef?.current?.setNativeProps({
                                            selection: {
                                                start: 0,
                                                end: 0,
                                            },
                                        });
                                    },
                                });
                            }}
                            required={Language.group_location_required}
                            control={control}
                            errors={errors}
                        />

                        <TextInput
                            placeholder={Language.write_something_about_event}
                            name={'aboutEvent'}
                            limit={2000}
                            multiline
                            keyboardValues={keyboardValues}
                            style={{ minHeight: scaler(80), textAlignVertical: 'top' }}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            control={control}
                            errors={errors}
                        />
                    </View>
                    <View style={styles.eventView1}>
                        <TouchableOpacity onPress={() => setIsUnlimitedCapacity(!isUnlimitedCapacity)} style={{ flexDirection: 'row' }}>
                            <CheckBox
                                checked={isUnlimitedCapacity}
                                setChecked={(b) => {
                                    if (b) {
                                        clearErrors('capacity')
                                        setValue('capacity', "")
                                    }
                                    setIsUnlimitedCapacity(b)
                                }}
                            />
                            <Text style={{ marginLeft: scaler(8), marginRight: scaler(18), fontSize: scaler(14) }}>
                                {Language.unlimited_capacity}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => userData?.is_premium ? setIsFreeEvent(!isFreeEvent) : openSubscriptionPopup()} style={{ flexDirection: 'row' }}>
                            <CheckBox checked={isFreeEvent}
                                setChecked={(b) => {
                                    if (userData?.is_premium) {
                                        if (b) {
                                            clearErrors('ticketPrice')
                                            setValue('ticketPrice', "")
                                        }
                                        setIsFreeEvent(b)
                                    }
                                    else {
                                        openSubscriptionPopup()
                                    }
                                }}
                            />
                            <Text style={{ marginLeft: scaler(8), fontSize: scaler(14) }}>{Language.free_event}</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                        placeholder={Language.capacity}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'capacity'}
                        maxLength={5}
                        keyboardType={'number-pad'}
                        disabled={isUnlimitedCapacity ? true : false}
                        required={
                            isUnlimitedCapacity ? undefined : Language.capacity_required
                        }
                        rules={{
                            validate: (v: string) => {
                                if (!isUnlimitedCapacity && parseInt(v) == 0) {
                                    return Language.invalid_capacity
                                }
                            }
                        }}
                        control={control}
                        errors={errors}
                    />

                    <View style={{ flex: 1, width: '100%' }} >
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', zIndex: 10 }}>
                            <View>
                                <TextInput
                                    containerStyle={{ marginEnd: scaler(4) }}
                                    borderColor={colors.colorTextInputBackground}
                                    backgroundColor={colors.colorTextInputBackground}
                                    name={'currency'}
                                    disabled={isFreeEvent ? true : false}
                                    icon={Images.ic_arrow_dropdown}
                                    onChangeText={(text) => {

                                    }}
                                    required={isFreeEvent ? undefined : Language.event_name_required}
                                    control={control}
                                    iconContainerStyle={{ end: scaler(4) }}
                                    onPress={() => { setDropdown(_ => !_) }}
                                    errors={errors}
                                />
                                <FixedDropdown
                                    visible={isDropdown}
                                    data={DropDownData.map((_, i) => ({ id: i, data: _, title: _ }))}
                                    onSelect={data => {
                                        setDropdown(false);
                                        setValue('currency', data?.title, { shouldValidate: true });
                                    }}
                                />
                            </View>
                            <TextInput
                                containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                                placeholder={
                                    Language.event_ticket_price + ' (' + Language.per_person + ')'
                                }
                                style={{ paddingLeft: scaler(20) }}
                                borderColor={colors.colorTextInputBackground}
                                backgroundColor={colors.colorTextInputBackground}
                                name={'ticketPrice'}
                                keyboardType={'number-pad'}
                                disabled={isFreeEvent ? true : false}
                                iconSize={scaler(18)}
                                rules={{
                                    validate: (v: string) => {
                                        if (parseFloat(v) > 9999.99) {
                                            return Language.event_max_price
                                        }
                                        try {
                                            if (parseInt(v) == 0 || (v?.includes(".") && (v?.indexOf(".") != v?.lastIndexOf(".") || v?.lastIndexOf(".") == v?.length - 1) || (v.split(".")?.[1]?.trim()?.length > 2))) {
                                                return Language.invalid_ticket_price
                                            }
                                        }
                                        catch (e) {

                                        }
                                    }
                                }}
                                icon={Images.ic_ticket}
                                required={
                                    isFreeEvent ? undefined : Language.ticket_price_required
                                }
                                control={control}
                                errors={errors}
                            />
                        </View>
                        <TextInput
                            containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                            placeholder={Language.select_date}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            style={{ fontSize: scaler(13) }}
                            name={'eventDate'}
                            onPress={() => (openDatePicker("eventDate"))}
                            required={Language.date_required}
                            icon={Images.ic_calender}
                            iconSize={scaler(20)}
                            control={control}
                            errors={errors}
                        />

                        <TextInput
                            containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                            placeholder={Language.select_start_time}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            name={'startTime'}
                            iconSize={scaler(18)}
                            required={Language.start_time_required}
                            onPress={() => (openDatePicker("startTime"))}
                            icon={Images.ic_clock}
                            control={control}
                            errors={errors}
                        />
                        <TextInput
                            containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                            placeholder={Language.select_end_time + ' (' + Language.optional + ")"}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            name={'endTime'}
                            onPress={() => (openDatePicker("endTime"))}
                            iconSize={scaler(18)}
                            icon={Images.ic_clock}
                            control={control}
                            errors={errors}
                        />

                        <TextInput
                            placeholder={Language.write_additional_information_about_event}
                            name={'additionalInfo'}
                            multiline
                            keyboardValues={keyboardValues}
                            style={{ minHeight: scaler(80), textAlignVertical: 'top' }}
                            borderColor={colors.colorTextInputBackground}
                            backgroundColor={colors.colorTextInputBackground}
                            control={control}
                            errors={errors}
                        />
                        {userData?.is_premium && !isFreeEvent ?

                            <><View style={{ marginTop: scaler(15) }}>
                                <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500' }}>
                                    {Language.select_payment_options}
                                </Text>
                                <TouchableOpacity style={styles.payView} onPress={() => paymentMethods?.includes('cash') ? setPaymentMethods(paymentMethods.filter(_ => _ != 'cash')) : setPaymentMethods([...paymentMethods, 'cash'])}>
                                    <Image source={Images.ic_empty_wallet} style={{ height: scaler(16), width: scaler(19) }} />
                                    <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{Language.pay_by_cash}</Text>
                                    <MaterialIcons name={paymentMethods?.includes('cash') ? 'check-circle' : 'radio-button-unchecked'} size={scaler(20)} color={colors.colorPrimary} />
                                </TouchableOpacity>
                                <View style={{ height: scaler(1), width: '95%', backgroundColor: '#EBEBEB', alignSelf: 'center' }} />
                                <TouchableOpacity style={styles.payView} onPress={() => paymentMethods?.includes('paypal') ? setPaymentMethods(paymentMethods.filter(_ => _ != 'paypal')) : setPaymentMethods([...paymentMethods, 'paypal'])}>
                                    <Image source={Images.ic_paypal} style={{ height: scaler(16), width: scaler(19) }} />
                                    <Text style={{ marginLeft: scaler(8), fontSize: scaler(14), fontWeight: '500', flex: 1 }}>{Language.pay_by_paypal}</Text>
                                    <MaterialIcons name={paymentMethods?.includes('paypal') ? 'check-circle' : 'radio-button-unchecked'} size={scaler(20)} color={colors.colorPrimary} />
                                </TouchableOpacity>
                            </View>

                                <View style={{ width: '100%', paddingBottom: scaler(10) }}>
                                    {paymentMethods?.includes('paypal') ?
                                        <TextInput
                                            containerStyle={{ flex: 1, marginEnd: scaler(4), marginBottom: scaler(10) }}
                                            placeholder={Language.paypal_id}
                                            borderColor={colors.colorTextInputBackground}
                                            backgroundColor={colors.colorTextInputBackground}
                                            name={'paypalId'}
                                            required={Language.paypal_id_required}
                                            control={control}
                                            errors={errors} /> : undefined}

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
                                                (0 < parseFloat(_) && parseFloat(_) < 29.9) ? (round(((parseFloat(_) / 100) * parseFloat(getValues('ticketPrice'))), 2)).toString() : '')
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

                                    <View style={{ flex: 1, width: '100%' }}>
                                        <TextInput
                                            placeholder={Language.write_refund_policy}
                                            name={'policy'}
                                            multiline
                                            keyboardValues={keyboardValues}
                                            required={Language.refund_policy_required}
                                            style={{ minHeight: scaler(150), textAlignVertical: 'top' }}
                                            limit={1000}
                                            borderColor={colors.colorTextInputBackground}
                                            backgroundColor={colors.colorTextInputBackground}
                                            control={control}
                                            errors={errors} />
                                    </View>

                                </View></>
                            : undefined}
                        <Button
                            disabled={calculateButtonDisability()}
                            containerStyle={{ marginTop: scaler(20) }}
                            title={Language.done}
                            onPress={() => handleSubmit((v) => onSubmit(v))()}
                        />

                        <DateTimePickerModal
                            style={{ zIndex: 20 }}
                            isVisible={isDatePickerVisible}
                            minimumDate={getMinDate()}
                            mode={(eventDateTime.current?.selectedType == 'eventDate') ? 'date' : "time"}
                            customConfirmButtonIOS={props => (
                                <Text
                                    onPress={props.onPress}
                                    style={{
                                        fontWeight: '500',
                                        fontSize: scaler(18),
                                        color: colors.colorPrimary,
                                        textAlign: 'center',
                                        padding: scaler(10),
                                    }}>
                                    {Language.confirm}
                                </Text>
                            )}
                            customCancelButtonIOS={props => (
                                <View
                                    style={{
                                        padding: scaler(7),
                                        backgroundColor: 'white',
                                        borderRadius: scaler(10),
                                        marginBottom: scaler(10),
                                    }}>
                                    <Text
                                        onPress={props.onPress}
                                        style={{
                                            fontWeight: '500',
                                            fontSize: scaler(18),
                                            color: colors.colorBlack,
                                            textAlign: 'center',
                                            padding: scaler(5),
                                        }}>
                                        {Language.close}
                                    </Text>
                                </View>
                            )}
                            date={eventDateTime.current?.[eventDateTime.current?.selectedType]}

                            //  eventDateTime.current?.[startTime]
                            //   maximumDate={sub(new Date(), {
                            //     years: 15,
                            //   })}
                            onConfirm={(date: Date) => {
                                const { selectedType } = eventDateTime.current
                                eventDateTime.current = { ...eventDateTime?.current, [selectedType]: date };
                                let hour = ((date?.getHours()) % 12 || 12) > 9 ? ((date?.getHours()) % 12 || 12) : '0' + ((date?.getHours()) % 12 || 12);
                                let min = date?.getMinutes() > 9 ? date?.getMinutes() : '0' + date?.getMinutes();
                                let isAMPM = date?.getHours() > 12 ? 'PM' : 'AM'
                                if (selectedType == 'eventDate') {
                                    setValue('eventDate', dateFormat(date, 'MMM DD, YYYY'), {
                                        shouldValidate: true,
                                    });
                                    setValue('startTime', "");
                                    setValue('endTime', "");
                                } else {
                                    setValue('endTime', "");
                                    setValue(selectedType, hour + ':' + min + ' ' + isAMPM, { shouldValidate: true })
                                }
                                setDatePickerVisibility(false);
                            }}
                            onCancel={() => {
                                setDatePickerVisibility(false);
                            }}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaViewWithStatusBar>
    );
};

export default EditEvent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center',
    },
    cameraButton: {
        position: 'absolute',
        overflow: 'hidden',
        borderRadius: scaler(20),
        borderWidth: scaler(1),
        borderColor: '#F6F6F7',
        height: scaler(35),
        width: scaler(35),
        end: 2,
        bottom: -5,
        padding: scaler(4),
        zIndex: 10,
        backgroundColor: colors.colorWhite,
    },
    imageContainer: {
        overflow: 'hidden',
        borderRadius: scaler(50),
        borderWidth: scaler(5),
        borderColor: '#EAEAEA',
        marginTop: scaler(20),
        height: scaler(100),
        width: scaler(100),
    },
    image: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain',
    },
    eventView: {
        marginTop: scaler(12),
        flexDirection: 'row',
        marginLeft: scaler(5),
    },
    eventView1: {
        marginTop: scaler(20),
        flexDirection: 'row',
        // marginHorizontal: scaler(25),
        alignItems: 'center',
        flex: 1
    },
    payView: { flexDirection: 'row', marginVertical: scaler(16), alignItems: 'center', marginHorizontal: scaler(5) }

});
