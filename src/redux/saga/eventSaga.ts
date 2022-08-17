import * as ApiProvider from 'api/APIProvider';
import { deleteEventSuccess, getAllEvents, getEventDetail, getEventMembers, joinEventSuccess, leaveEventSuccess, pinEventSuccess, removeEventMemberSuccess, setAllEvents, setEventDetail, setEventMembers, setLoadingAction, setMyGroups, updateEventDetail } from "app-store/actions";
import { setCreateEvent } from 'app-store/actions/createEventActions';
import { store } from 'app-store/store';
import { defaultLocation } from 'custom-components';
import Database from 'database';
import { isEmpty } from 'lodash';
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { EMIT_EVENT_DELETE, EMIT_JOIN_ROOM, EMIT_LEAVE_ROOM, SocketService } from 'socket';
import Language from 'src/language/Language';
import { NavigationService, _hidePopUpAlert, _showErrorMessage, _showPopUpAlert, _showSuccessMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* _getMyGroups({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getMyGroups);
        if (res.status == 200) {
            if (!res?.data?.length) {
                _showPopUpAlert({
                    title: Language.group_not_available,
                    message: Language.please_create_a_group,
                    buttonText: Language.create_group,
                    cancelButtonText: Language.go_to_home,
                    onPressButton: () => {
                        NavigationService.replace("CreateGroup")
                        _hidePopUpAlert()
                    },
                    onPressCancel: () => {
                        NavigationService.navigate("Home")
                        _hidePopUpAlert()
                    }
                })
            }
            yield put(setMyGroups(res.data))
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}


function* _verifyQrCode({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    const { onSuccess } = payload
    try {
        let res = yield call(ApiProvider._scanTicket, payload?.data);
        if (res.status == 200) {
            yield put(getEventMembers(payload?.data?.resource_id));
            _showSuccessMessage(res.message);
            onSuccess(true)
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
            onSuccess(false)

        } else {
            _showErrorMessage(Language.something_went_wrong);
            onSuccess(false)
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
        onSuccess(false)
    }
}

function* _getAllCurrencies({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getAllCurrencies);
        if (res.status == 200) {
            Database.setValue("currencies", res.data?.currencies)
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

function* _createEvent({ type, payload, }: action): Generator<any, any, any> {

    yield put(setLoadingAction(true));
    try {
        const { timezone, timezoneOffset, ...data } = store.getState().createEventState
        let res = yield call(data?._id ? ApiProvider._updateEvent : ApiProvider._createEvent, data);
        if (res.status == 200) {
            _showSuccessMessage(res.message);
            if (data?._id) {
                yield put(updateEventDetail(res?.data))
            } else {
                SocketService?.emit(EMIT_JOIN_ROOM, {
                    resource_id: res?.data
                })
            }
            NavigationService.navigate('HomeEventTab')
            // if (payload.onSuccess) payload.onSuccess(res?.data)
            yield put(getAllEvents({ page: 1 }))

        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}


function* _getAllEvents({ type, payload, }: action): Generator<any, any, any> {
    // const state:RootState = 
    let eventList = store.getState()?.event?.allEvents

    if (!eventList?.length && payload?.setLoader) payload?.setLoader(true)
    // payload?.setLoader && payload?.setLoader(true)

    //     yield put(setLoadingAction(true));
    try {
        const location = Database?.getStoredValue("selectedLocation", defaultLocation)
        let res = yield call(ApiProvider._getAllEvents, location, payload?.page);
        payload?.setLoader && payload?.setLoader(false)

        if (res.status == 200) {
            for (const index in res?.data?.data) {
                if (res?.data?.data[index].ticket_type == 'multiple') {
                    const leastTicket = res?.data?.data[index]?.ticket_plans?.reduce((p: any, c: any) => ((Math.min(p.amount, c.amount)) == c.amount ? c : p))

                    res.data.data[index].event_fees = leastTicket.amount?.toString()
                    res.data.data[index].event_tax_rate = leastTicket.event_tax_rate?.toString()
                    res.data.data[index].event_currency = leastTicket.currency

                    if (!res?.data?.data[index]?.capacity) {
                        const eventCapacityType = res?.data?.data[index]?.capacity_type
                        const totalCapacity = res?.data?.data[index]?.ticket_plans?.reduce((p: any, c: any) => (((c?.capacity_type || eventCapacityType) == 'unlimited' || (p?.capacity_type || eventCapacityType) == 'unlimited') ? { capacity_type: 'unlimited', capacity: 0 } : { capacity_type: 'limited', capacity: p?.capacity + c.capacity }))

                        res.data.data[index].capacity_type = totalCapacity?.capacity_type
                        res.data.data[index].capacity = totalCapacity?.capacity
                    }
                }
            }

            if (payload.onSuccess) payload.onSuccess({
                pagination: {
                    currentPage: res?.data?.pagination?.currentPage,
                    totalPages: res?.data?.pagination?.totalPages,
                    perPage: res?.data?.pagination?.limit
                },
                data: res?.data?.data
            })
            if (res?.data?.pagination?.currentPage == 1) eventList = []
            yield put(setAllEvents(res?.data?.data))

        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
    }
    catch (error) {
        console.log("Catch Error", error);
        payload?.setLoader && payload?.setLoader(false)
    }
}

function* _getEventDetail({ type, payload, }: action): Generator<any, any, any> {
    // const state:RootState = 
    let event = store.getState()?.eventDetails?.[payload]?.event
    if (!event || type == ActionTypes.GET_EDIT_EVENT_DETAIL)
        yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getEventDetail, payload);
        if (res.status == 200 && !isEmpty(res.data.event)) {
            if (res?.data?.event?.status == 5) {
                console.log("SCREEN", NavigationService?.getCurrentScreen());
                const { name, params } = NavigationService?.getCurrentScreen() ?? {}
                if ((name == "EventDetail" || name == "EventChats") &&
                    params?.id == payload
                ) {
                    _showErrorMessage(Language.getString("this_event_is_deleted"), 5000)
                    NavigationService.navigate("Home")
                }
                yield put(deleteEventSuccess(payload))
                return
            }

            res.data.event.is_event_admin = res.data?.event?.is_admin ? true : false
            if (res?.data?.event?.ticket_type == 'multiple') {
                const leastTicket = res?.data?.event?.ticket_plans?.reduce((p: any, c: any) => ((Math.min(p.amount, c.amount)) == c.amount ? c : p))

                res.data.event.event_fees = leastTicket.amount?.toString()
                res.data.event.event_tax_rate = leastTicket.event_tax_rate?.toString()
                res.data.event.event_currency = leastTicket.currency?.toString()

                if (!res?.data?.event?.capacity) {
                    const eventCapacityType = res?.data?.event?.capacity_type
                    const totalCapacity = res?.data?.event?.ticket_plans?.reduce((p: any, c: any) => ((c?.capacity_type || eventCapacityType) == 'unlimited' || (p?.capacity_type || eventCapacityType) == 'unlimited' ? { capacity_type: 'unlimited', capacity: 0 } : { capacity_type: 'limited', capacity: p?.capacity + c.capacity }))

                    res.data.event.capacity_type = totalCapacity?.capacity_type
                    res.data.event.capacity = totalCapacity?.capacity
                }

            }
            if (res?.data?.event?.is_admin)
                yield put(getEventMembers(payload))
            yield put(setEventDetail({ eventId: payload, data: res?.data }))
            if (type == ActionTypes.GET_EDIT_EVENT_DETAIL) {
                yield put(setCreateEvent(res?.data?.event))
            }
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
            if (type == ActionTypes.GET_EDIT_EVENT_DETAIL)
                NavigationService.goBack()
        } else {
            _showErrorMessage(Language.something_went_wrong);
            NavigationService.goBack()
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
        if (type == ActionTypes.GET_EDIT_EVENT_DETAIL)
            NavigationService.goBack()
    }
}

function* _deleteEvent({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._deleteEvent, payload);
        if (res.status == 200) {
            _showSuccessMessage(res.message)
            NavigationService?.navigate("Home")
            // yield put(deleteEventSuccess(payload))
            SocketService.emit(EMIT_EVENT_DELETE, {
                resource_id: payload
            })
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

function* _pinUnpinEvent({ type, payload, }: action): Generator<any, any, any> {
    console.log(payload)

    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._pinUnpinEvent, payload);
        if (res.status == 200) {
            _showSuccessMessage(res.message);
            yield put(pinEventSuccess(payload?.resource_id))
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

function* _joinEvent({ type, payload, }: action): Generator<any, any, any> {
    try {
        yield put(setLoadingAction(true));
        let res = yield call(ApiProvider._joinEvent, payload);
        if (res.status == 200) {
            _showSuccessMessage(res?.message)
            SocketService.emit(EMIT_JOIN_ROOM, {
                resource_id: payload?.resource_id
            })
            yield put(joinEventSuccess(payload?.resource_id))
            yield put(getEventDetail(payload?.resource_id))
            NavigationService.navigate('EventDetail')
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
            if (res?.data?.invalid_resource) {
                yield put(getEventDetail(res?.data?.resource_id))
                NavigationService.goBack()
            }
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

function* _leaveEvent({ type, payload, }: action): Generator<any, any, any> {
    try {
        yield put(setLoadingAction(true));
        let res = yield call(ApiProvider._leaveEvent, payload);
        if (res.status == 200) {
            yield put(leaveEventSuccess(payload))
            yield put(getEventDetail(payload))
            SocketService?.emit(EMIT_LEAVE_ROOM, {
                resource_id: payload
            })
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

function* _getEventMembers({ type, payload, }: action): Generator<any, any, any> {
    try {
        let res = yield call(ApiProvider._getEventMembers, payload);
        if (res.status == 200) {
            yield put(setEventMembers({
                eventId: payload,
                data: { eventMembersCheckedIn: res?.data?.checked_in?.data, eventMembersNotCheckedIn: res?.data?.not_checked_in?.data }
            }))
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}


function* _removeEventMember({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._removeEventMember, payload);
        if (res.status == 200) {
            yield put(removeEventMemberSuccess({ eventId: payload?.resource_id, data: payload?.user_id }))
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

function* _authorizePayment({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    const { resource_id, no_of_tickets, currency, plan_id, donation_amount, is_donation } = payload
    try {
        let res = yield call(ApiProvider._authorizePayment, { resource_id, no_of_tickets, currency, plan_id, donation_amount, is_donation });
        if (res.status == 200) {
            if (res?.data?.is_payment_by_passed) {
                _showSuccessMessage(res?.message)
                SocketService.emit(EMIT_JOIN_ROOM, {
                    resource_id
                })
                yield put(joinEventSuccess(resource_id))
                yield put(getEventDetail(resource_id))
                NavigationService.navigate('EventDetail')
            }
            else NavigationService.navigate("Payment", { data: { ...payload, res: res?.data } })
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

function* _capturePayment({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    const { res: { _id }, token, PayerID: payer_id, resource_id } = payload
    try {
        let res = yield call(ApiProvider._capturePayment, { _id, token, payer_id });
        if (res.status == 200) {
            // NavigationService.goBack()
            // yield put(joinEvent(rest));
            _showSuccessMessage(res?.message)
            SocketService.emit(EMIT_JOIN_ROOM, {
                resource_id: resource_id
            })
            yield put(joinEventSuccess(resource_id))
            yield put(getEventDetail(resource_id))
            NavigationService.navigate('EventDetail')
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}


// Watcher: watch auth request
export default function* watchEvents() {
    yield takeEvery(ActionTypes.GET_MY_GROUPS, _getMyGroups);
    yield takeEvery(ActionTypes.GET_ALL_CURRENCIES, _getAllCurrencies);
    yield takeLatest(ActionTypes.CREATE_EVENT, _createEvent);
    yield takeLatest(ActionTypes.GET_ALL_EVENTS, _getAllEvents);
    yield takeLatest(ActionTypes.GET_EVENT_DETAIL, _getEventDetail);
    yield takeLatest(ActionTypes.GET_EDIT_EVENT_DETAIL, _getEventDetail);
    yield takeLatest(ActionTypes.DELETE_EVENT, _deleteEvent);
    yield takeLatest(ActionTypes.PIN_EVENT, _pinUnpinEvent);
    yield takeLatest(ActionTypes.JOIN_EVENT, _joinEvent);
    yield takeLatest(ActionTypes.LEAVE_EVENT, _leaveEvent);
    yield takeLatest(ActionTypes.GET_EVENT_MEMBERS, _getEventMembers);
    yield takeLatest(ActionTypes.REMOVE_EVENT_MEMBER, _removeEventMember);
    yield takeLatest(ActionTypes.VERIFY_QR_CODE, _verifyQrCode);
    yield takeLatest(ActionTypes.AUTHORIZE_PAYMENT, _authorizePayment);
    yield takeLatest(ActionTypes.CAPTURE_PAYMENT, _capturePayment);
};