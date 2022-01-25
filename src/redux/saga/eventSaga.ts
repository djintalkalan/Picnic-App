import * as ApiProvider from 'api/APIProvider';
import { deleteEventSuccess, getEventDetail, getEventMembers, joinEvent, joinEventSuccess, leaveEventSuccess, pinEventSuccess, removeEventMemberSuccess, setAllEvents, setEventDetail, setEventMembers, setLoadingAction, setMyGroups, updateEventDetail } from "app-store/actions";
import { store } from 'app-store/store';
import { defaultLocation } from 'custom-components';
import Database from 'database';
import { isEmpty } from 'lodash';
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { EMIT_JOIN_ROOM, EMIT_LEAVE_ROOM, SocketService } from 'socket';
import Language from 'src/language/Language';
import { NavigationService, _showErrorMessage, _showSuccessMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* _getMyGroups({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getMyGroups);
        if (res.status == 200) {
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
        let res = yield call(payload?.data?._id ? ApiProvider._updateEvent : ApiProvider._createEvent, payload?.data);
        if (res.status == 200) {
            _showSuccessMessage(res.message);
            if (payload?.data?._id) {
                yield put(updateEventDetail(res?.data))
            } else {
                SocketService?.emit(EMIT_JOIN_ROOM, {
                    resource_id: res?.data
                })
            }
            NavigationService.navigate('HomeEventTab')
            if (payload.onSuccess) payload.onSuccess(res?.data)

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
    if (!eventList?.length)
        yield put(setLoadingAction(true));
    try {
        const location = Database?.getStoredValue("selectedLocation", defaultLocation)
        let res = yield call(ApiProvider._getAllEvents, location, payload?.page);
        if (res.status == 200) {
            if (payload.onSuccess) payload.onSuccess({
                pagination: {
                    currentPage: res?.data?.pagination?.currentPage,
                    totalPages: res?.data?.pagination?.totalPages,
                    perPage: res?.data?.pagination?.limit
                },
                data: res?.data?.data
            })
            if (res?.data?.pagination?.currentPage == 1) eventList = []
            yield put(setAllEvents([...eventList, ...res?.data?.data]))

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

function* _getEventDetail({ type, payload, }: action): Generator<any, any, any> {
    // const state:RootState = 
    let event = store.getState()?.eventDetails?.[payload]?.event
    if (!event)
        yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getEventDetail, payload);
        if (res.status == 200 && !isEmpty(res.data.event)) {
            res.data.event.is_event_admin = res.data?.event?.is_admin ? true : false
            if (res?.data?.event?.is_admin)
                yield put(getEventMembers(payload))
            yield put(setEventDetail({ eventId: payload, data: res?.data }))
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
            NavigationService.goBack()
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

function* _deleteEvent({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._deleteEvent, payload);
        if (res.status == 200) {
            _showSuccessMessage(res.message)
            yield put(deleteEventSuccess(payload))
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
    const { resource_id, no_of_tickets, currency } = payload
    try {
        let res = yield call(ApiProvider._authorizePayment, { resource_id, no_of_tickets, currency });
        if (res.status == 200) {
            NavigationService.navigate("Payment", { data: { ...payload, res: res?.data } })
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
    const { res: R, ...rest } = payload
    try {
        let res = yield call(ApiProvider._capturePayment, { _id: R?._id });
        if (res.status == 200) {
            NavigationService.goBack()
            yield put(joinEvent(rest));
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