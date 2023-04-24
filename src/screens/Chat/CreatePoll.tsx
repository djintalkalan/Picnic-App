import { setLoadingAction } from "app-store/actions";
import { colors, Images } from "assets";
import { Button, MyHeader, Text, TextInput, useKeyboardService } from "custom-components";
import { SafeAreaViewWithStatusBar } from "custom-components/FocusAwareStatusBar";
import { add } from "date-fns";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { DeviceEventEmitter, EmitterSubscription, StyleSheet, View } from "react-native";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AntDesign from "react-native-vector-icons/AntDesign";
import { useDispatch } from "react-redux";
import { EMIT_SEND_EVENT_MESSAGE, EMIT_SEND_GROUP_MESSAGE, SocketService } from "socket";
import Language from "src/language/Language";
import { dateFormat, getReadableDate, getReadableTime, roundToNearest15, scaler, stringToDate, _showErrorMessage } from "utils";
const closeImage = AntDesign.getImageSourceSync("close", 50, colors.colorErrorRed)

interface FormType {
    question: string
    endDate?: Date | null,
    endTime?: Date | null,
}

let subscription: EmitterSubscription;

const CreatePoll: FC<any> = ({ route, navigation }) => {
    const { _id: resource_id, resource_type } = route?.params || {}
    const dispatch = useDispatch();
    const {
        control,
        getValues,
        setValue,
        resetField,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<FormType>({
        mode: 'onChange',
        defaultValues: (() => {
            const nextDate = roundToNearest15(add(new Date(), { days: 1 }))
            return {
                endDate: nextDate,
                endTime: nextDate
            }
        })()
    });

    const keyboardValues = useKeyboardService()

    const [datePickerVisibility, setDatePickerVisibility] = useState<'date' | 'time' | null>(null)
    const datePickerRef = useRef<DateTimePickerModal>(null)
    const [toggle, setToggle] = useState(true)

    const getMinDate = useCallback(() => {
        const currentDate = new Date();
        switch (datePickerVisibility) {
            case "date":
                return currentDate;
            default:
                return undefined
        }
    }, [datePickerVisibility])

    const getCurrentDate = () => {
        if (!datePickerVisibility) return undefined
        //@ts-ignore
        return (datePickerVisibility == 'date') ? (getValues('endDate') || undefined) : getValues('endTime') || stringToDate(dateFormat(getValues('endDate'), "YYYY-MM-DD"), "YYYY-MM-DD", "-")
    }

    useEffect(() => {

    }, [])

    const onSubmit = useCallback(() => handleSubmit((data: FormType) => {
        const { question, endDate, endTime } = data

        if (!endDate || !endTime) {
            _showErrorMessage(!endDate ? Language.end_date_required : Language.end_time_required)
            return
        }

        const currentDate = new Date()
        if (endTime <= currentDate) {
            _showErrorMessage(Language.end_date_greater_than_current)
            return
        }

        dispatch(setLoadingAction(true))

        if (subscription) {
            subscription?.remove()
        }

        subscription = DeviceEventEmitter.addListener("CreatePoll", (message: any) => {
            if (message?.poll?.question == question && message?.poll?.poll_ends_on == endTime?.toISOString()) {
                dispatch(setLoadingAction(false))
                navigation.goBack()
            }
        })

        SocketService.emit(resource_type == 'group' ? EMIT_SEND_GROUP_MESSAGE : EMIT_SEND_EVENT_MESSAGE, {
            resource_id,
            resource_type,
            message: "",
            message_type: "poll",
            poll: {
                question,
                poll_ends_on: endTime?.toISOString()
            }
        })

        setTimeout(() => {
            dispatch(setLoadingAction(false))
        }, 5000);

    })(), [resource_id, resource_type])


    useEffect(() => {
        if (subscription) return subscription.remove
    }, [])


    return <SafeAreaViewWithStatusBar style={styles.container} >
        <MyHeader title={Language.create_poll} />
        <View style={styles.innerContainer} >

            <Text style={styles.inputTitle}>
                {Language.poll_question}
            </Text>

            <TextInput
                placeholder={Language.type_question_here}
                name={'question'}
                limit={200}
                multiline
                required
                keyboardValues={keyboardValues}
                style={{ minHeight: scaler(80), textAlignVertical: 'top' }}
                borderColor={colors.colorTextInputBackground}
                backgroundColor={colors.colorTextInputBackground}
                control={control}
                errors={errors}
            />

            <Text style={[styles.inputTitle, { marginTop: scaler(20) }]}>
                {Language.poll_end_date}
            </Text>

            <View style={{ flexDirection: 'row' }}>
                <TextInput
                    containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                    placeholder={Language.cutoff_date}
                    borderColor={colors.colorTextInputBackground}
                    backgroundColor={colors.colorTextInputBackground}
                    style={{ fontSize: scaler(13) }}
                    name={'endDate'}
                    format={getReadableDate}
                    onPress={() => setDatePickerVisibility('date')}
                    icon={getValues('endDate') ? closeImage : Images.ic_calender}
                    onPressIcon={getValues('endDate') ? () => {
                        setValue('endDate', null)
                        setValue('endTime', null)
                        setToggle(_ => !_)
                    } : undefined}
                    iconSize={scaler(20)}
                    control={control}
                    errors={errors} />
                <TextInput
                    containerStyle={{ flex: 1, marginEnd: scaler(4) }}
                    placeholder={Language.cutoff_time}
                    borderColor={colors.colorTextInputBackground}
                    backgroundColor={colors.colorTextInputBackground}
                    name={'endTime'}
                    format={getReadableTime}
                    onPress={() => setDatePickerVisibility('time')}
                    iconSize={scaler(18)}
                    icon={getValues('endTime') ? closeImage : Images.ic_clock}
                    onPressIcon={getValues('endTime') ? () => {
                        setValue('endTime', null)
                        setToggle(_ => !_)
                    } : undefined}
                    control={control}
                    errors={errors} />
            </View>

        </View>
        <DateTimePickerModal
            ref={datePickerRef}
            locale={Language.getLanguage()}
            style={{ zIndex: 20 }}
            minuteInterval={15}
            isVisible={!!datePickerVisibility}
            minimumDate={getMinDate()}
            // maximumDate={stringToDate(event?.event_end_date + " " + (event?.event_end_time || "23:59"), "YYYY-MM-DD", "-")}
            mode={datePickerVisibility || undefined}
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
            customCancelButtonIOS={(props: any) => (
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
            //@ts-ignore
            date={getCurrentDate()}
            onConfirm={(cDate: Date) => {
                const cutoffDate = getValues('endDate')
                //@ts-ignore
                const date = datePickerVisibility == 'date' ? cDate : new Date(cutoffDate?.getFullYear(), cutoffDate.getMonth(), cutoffDate?.getDate(), cDate?.getHours(), cDate?.getMinutes(), cDate?.getSeconds());

                if (datePickerVisibility == 'date') {
                    try {
                        datePickerRef.current?.setState({
                            currentDate: stringToDate(dateFormat(date, "YYYY-MM-DD"), "YYYY-MM-DD", "-")
                        })
                    }
                    catch (e) {

                    }
                }
                setValue(datePickerVisibility == 'date' ? 'endDate' : "endTime", date)
                if (datePickerVisibility == 'date')
                    setValue("endTime", null)

                setDatePickerVisibility((_: any) => {
                    if (_ == 'date') {
                        setTimeout(() => {
                            setDatePickerVisibility('time');
                        }, 500);
                    }
                    return null
                })
            }}
            onCancel={() => {
                setDatePickerVisibility(null);
            }}
        />
        <Button onPress={onSubmit} title={Language.create_poll} containerStyle={{ margin: scaler(18) }} />
    </SafeAreaViewWithStatusBar>
}

export default CreatePoll


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    },
    innerContainer: {
        flex: 1,
        padding: scaler(18)
    },
    inputTitle: {
        marginRight: scaler(18), fontSize: scaler(14)
    }
})