import * as ApiProvider from 'api/APIProvider';
import { deleteEventSuccess, getEventMembers, joinEventSuccess, pinEventSuccess, setAllEvents, setEventDetail, setLoadingAction, setMyGroups, updateEventDetail } from "app-store/actions";
import { store } from 'app-store/store';
import { defaultLocation } from 'custom-components';
import Database from 'database';
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { EMIT_JOIN_ROOM, SocketService } from 'socket';
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
        if (res.status == 200) {
            if (res?.data?.event?.is_admin)
                yield put(getEventMembers(payload))
            yield put(setEventDetail({ eventId: payload, data: res?.data }))
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
            yield put(joinEventSuccess(payload))
            // if (navigationRef.current?.getCurrentRoute()?.name == "GroupDetail") {
            //     yield put(getGroupDetail(payload))
            // }
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

};