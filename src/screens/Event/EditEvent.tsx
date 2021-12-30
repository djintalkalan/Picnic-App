import { RootState } from 'app-store';
import { createEvent, getEventDetail, getMyGroups, uploadFile } from 'app-store/actions';
import { colors, Images } from 'assets';
import {
    Button,
    CheckBox,
    FixedDropdown,
    MyHeader, Text,
    TextInput
} from 'custom-components';
import Database, { ILocation, useDatabase } from 'database';
import { isEqual } from 'lodash';
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
import { SafeAreaView } from 'react-native-safe-area-context';
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
    stringToDate
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
};

const DropDownData = ['USD', 'EUR', 'GBP', 'COP'];

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
    const [isPayByCash, setIsPayByCash] = useState(false)
    const [isPayByPaypal, setIsPayByPaypal] = useState(false)
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
    const { event, eventMembers, is_event_joined } = useSelector((state: RootState) => ({
        event: state?.event?.eventDetail?.event,
        eventMembers: state?.event?.eventDetail?.eventMembers,
        is_event_joined: state?.event?.eventDetail?.is_event_joined
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
            (errors && (errors.eventName || errors.location || errors.eventDate || errors.ticketPrice || errors.currency || errors.startTime || errors.capacity))
        )
            return true;
        return false;
    }, [errors]);

    const pickImage = useCallback(() => {
        setTimeout(() => {
            ImagePicker.openPicker(ProfileImagePickerOptions)
                .then(image => {
                    console.log(image);
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
    }, [])


    useLayoutEffect(() => {
        // console.log("payload", props)
        InteractionManager.runAfterInteractions(() => {
            dispatch(getEventDetail(props?.route?.params?.id))
        })
    }, [])


    useEffect(() => {
        if (event) {
            console.log('event is', event)
            locationRef.current = {
                latitude: event?.location?.coordinates[1],
                longitude: event?.location?.coordinates[0],
                address: {
                    main_text: getShortAddress(event?.address, event?.state, event?.city),
                    secondary_text: event?.city + ", " + event?.state + ", " + event?.country
                },
                otherData: {
                    city: event?.city,
                    state: event?.state,
                    country: event?.country
                }
            }
            eventDateTime.current = {
                eventDate: stringToDate(event?.event_date, "YYYY-MM-DD", "-"),
                startTime: stringToDate(event?.event_date + " " + event?.event_start_time, "YYYY-MM-DD", "-"),
                endTime: event?.event_end_time ? stringToDate(event?.event_date + " " + event?.event_end_time, "YYYY-MM-DD", "-") : new Date(),
                selectedType: 'eventDate',
            }
            selectedGroupRef.current = event?.event_group
            setIsOnlineEvent(event?.is_online_event ? true : false)
            setIsUnlimitedCapacity(event?.capacity_type == 'unlimited' ? true : false)
            setIsFreeEvent(event?.is_free_event ? true : false)
            setValue('eventName', event?.name)
            setValue('location', event?.address)
            setValue('selectGroup', event?.event_group?.name)
            setValue('aboutEvent', event?.short_description)
            setValue('capacity', event?.capacity?.toString())
            setValue('ticketPrice', event?.event_fees?.toString())
            setValue('eventDate', dateFormat(eventDateTime.current.eventDate, 'MMM DD, YYYY'))
            setValue('startTime', dateFormat(eventDateTime.current.startTime, 'hh:mm A'))
            setValue('endTime', event?.event_end_time ? dateFormat(eventDateTime.current.endTime, 'hh:mm A') : '')
            setValue('additionalInfo', event?.details)
            setValue('currency', event?.event_currency)
            setValue('paypalId', event?.payment_email)
            setValue('policy', event?.event_refund_policy)
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
                            console.log('URL is ', url);
                            uploadedImage.current = url;
                            callCreateEventApi(data, isFreeEvent, isUnlimitedCapacity, isOnlineEvent);
                        },
                        prefixType: 'events',
                    }),
                );
            } else {
                callCreateEventApi(data, isFreeEvent, isUnlimitedCapacity, isOnlineEvent);
            }
        },
        [eventImage, isFreeEvent, isUnlimitedCapacity, isOnlineEvent],
    );

    const callCreateEventApi = useCallback((data, isFreeEvent, isUnlimitedCapacity, isOnlineEvent) => {

        const { latitude, longitude, address, otherData } =
            locationRef.current ?? {};

        const { startTime, endTime, eventDate } = eventDateTime.current
        let payload = {

            _id: props?.route?.params?.id,
            image: uploadedImage?.current || undefined,
            name: data?.eventName,
            group_id: selectedGroupRef.current._id,
            is_online_event: isOnlineEvent ? '1' : '0',
            short_description: data?.aboutEvent,
            address: address?.main_text + ', ' + address?.secondary_text,
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
            event_fees: data?.ticketPrice ?? 0,
            event_date: dateFormat(eventDate, "YYYY-MM-DD"),
            event_start_time: dateFormat(startTime, "HH:mm:ss"),
            event_end_time: data?.endTime ? dateFormat(endTime, "HH:mm") : "",
            details: data?.additionalInfo,
            event_currency: data?.currency.toLowerCase(),
            payment_method: ['paypal'],
            payment_email: "test@picnic.com",
            event_refund_policy: "Test Policy"
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

    return (
        <SafeAreaView style={styles.container}>
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
                            required={Language.group_purpose_required}
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
                                        setValue("location", location?.otherData?.city + (location?.otherData?.state ? (", " + location?.otherData?.state) : "") + (location?.otherData?.country ? (", " + location?.otherData?.country) : ""), { shouldValidate: true })
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
                            limit={400}
                            multiline
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
                        <TouchableOpacity onPress={() => setIsFreeEvent(!isFreeEvent)} style={{ flexDirection: 'row' }}>
                            <CheckBox checked={isFreeEvent}
                                setChecked={(b) => {
                                    if (b) {
                                        clearErrors('ticketPrice')
                                        setValue('ticketPrice', "")
                                    }
                                    setIsFreeEvent(b)
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
                        keyboardType={'number-pad'}
                        disabled={isUnlimitedCapacity ? true : false}
                        required={
                            isUnlimitedCapacity ? undefined : Language.capacity_required
                        }
                        control={control}
                        errors={errors}
                    />

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
                        style={{ minHeight: scaler(80), textAlignVertical: 'top' }}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        control={control}
                        errors={errors}
                    />
                    {userData?.is_premium ?

                        <><View style={{ marginTop: scaler(15) }}>
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
                        </View><View
                            style={{
                                width: '100%',
                                paddingVertical: scaler(10),
                            }}>
                                {isPayByPaypal ?
                                    <TextInput
                                        containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                                        placeholder={Language.paypal_id}
                                        borderColor={colors.colorTextInputBackground}
                                        backgroundColor={colors.colorTextInputBackground}
                                        name={'paypalId'}
                                        required={Language.paypal_id_required}
                                        control={control}
                                        errors={errors} /> : undefined}
                                <View style={{ flex: 1, width: '100%' }}>
                                    <TextInput
                                        placeholder={Language.write_refund_policy}
                                        name={'policy'}
                                        multiline
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
            </ScrollView>
        </SafeAreaView>
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
