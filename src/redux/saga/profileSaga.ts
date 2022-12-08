import * as ApiProvider from 'api/APIProvider';
import { setLoadingAction } from "app-store/actions";
import { setNotificationSettings, setUserGroups, setUserUpcomingPastEvents } from 'app-store/actions/profileActions';
import { call, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import Database from 'src/database/Database';
import IntercomService from 'src/intercom/IntercomService';
import Language, { updateLanguageDirect } from 'src/language/Language';
import { NavigationService, WaitTill, _showErrorMessage, _showSuccessMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* getProfile({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        const uData = Database.getStoredValue("userData")
        let res = yield call(ApiProvider._getProfile);
        if (res.status == 200) {
            const { notification_settings, ...userData } = res?.data
            if (userData?.language) {
                const selectedLanguage = Database.getStoredValue('selectedLanguage')
                if (userData?.language != selectedLanguage) {
                    updateLanguageDirect(userData?.language)
                }
            }
            yield put(setNotificationSettings({
                ...notification_settings,
                is_notification_enabled: userData?.is_notification_enabled
            }))
            Database.setUserData({ ...userData, is_premium: userData?.is_premium ? uData?.is_premium : false })
            IntercomService.updateUser(userData)
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

function* updateProfile({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        const uData = Database.getStoredValue("userData")
        let res = yield call(ApiProvider._updateProfile, payload);
        if (res.status == 200) {
            _showSuccessMessage(res.message);
            const { notification_settings, ...userData } = res?.data
            yield put(setNotificationSettings({
                ...notification_settings,
                is_notification_enabled: userData?.is_notification_enabled
            }))
            Database.setUserData({ ...userData, is_premium: userData?.is_premium ? uData?.is_premium : false })
            IntercomService.updateUser(userData)
            NavigationService.replace("Settings")
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

function* updateNotificationSetting({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));

    try {
        let res = yield call(ApiProvider._updateNotificationSetting, payload);
        if (res.status == 200) {

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


function* updatePassword({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));

    try {
        let res = yield call(ApiProvider._updatePassword, payload);
        if (res.status == 200) {
            _showSuccessMessage(res.message);
            NavigationService.goBack()
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

function* checkEmail({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));

    try {
        let res = yield call(ApiProvider._checkEmail, { email: payload?.email });
        if (res.status == 200) {
            payload?.onSuccess()
        } else if (res.status == 400) {
            payload?.onSuccess(res.message)
            // _showErrorMessage(res.message);
        } else {
            // _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

function* _getMyAllGroups({ type, payload, }: action): Generator<any, any, any> {
    let groups: any[] = yield select(state => state?.userGroupsEvents?.groups);
    if (!groups?.length)
        yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getMyAllGroups, null, payload?.page);
        yield put(setLoadingAction(false));
        if (res.status == 200) {
            if (payload.onSuccess) payload.onSuccess({
                pagination: {
                    currentPage: res?.data?.pagination?.currentPage,
                    totalPages: res?.data?.pagination?.totalPages,
                    perPage: res?.data?.pagination?.limit
                },
                data: res?.data?.data
            })
            if (res?.data?.pagination?.currentPage == 1) groups = []
            yield put(setUserGroups([...groups, ...res?.data?.data]))

        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

function* _getUpcomingPastEvents({ type, payload, }: action): Generator<any, any, any> {
    const event_filter_type: 'upcoming' | 'past' = payload?.event_filter_type
    let events: any[] = yield select(state => state?.userGroupsEvents?.[event_filter_type]);
    if (!events?.length)
        yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getUpcomingPastEvents, payload, payload?.body?.page);
        yield put(setLoadingAction(false));
        if (res.status == 200) {
            if (payload?.body?.onSuccess) payload?.body?.onSuccess({
                pagination: {
                    currentPage: res?.data?.pagination?.currentPage,
                    totalPages: res?.data?.pagination?.totalPages,
                    perPage: res?.data?.pagination?.limit
                },
                data: res?.data?.data
            })
            if (res?.data?.pagination?.currentPage == 1) events = []
            yield put(setUserUpcomingPastEvents({ type: event_filter_type, data: [...events, ...res?.data?.data] }))
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

function* _paypalTrackSeller({ type, payload, }: action): Generator<any, any, any> {
    try {
        let res = yield call(ApiProvider._paypalTrackSeller);
        if (res.status === 200) {
            let authorized = ''
            let action_url: any = {}
            const userData = Database.getStoredValue('userData')
            if (res?.data?.links) {
                action_url = res?.data?.links.find((link: any) => link.rel === 'action_url');
            } else {
                authorized = res?.data?.paypal_merchant_id
                if ((authorized) && !userData?.paypal_merchant_id) {
                    Database.setUserData({ ...userData, paypal_merchant_id: authorized })
                }
            }
            Database.updatePaypalDetails({
                errorMessages: res?.data?.messages || [],
                isPaypalConnected: authorized && !res?.data?.messages?.length ? true : false,
                paypal_merchant_id: authorized,
                paypal_primary_email: res?.data?.paypal_primary_email,
                actionUrl: action_url?.href
            })
            yield WaitTill(200);
            payload?.onSuccess && payload?.onSuccess(true)
        } else if (res.status == 400) {
            yield put(setLoadingAction(false));
            // _showErrorMessage(res.message);
        } else {
            yield put(setLoadingAction(false));
            _showErrorMessage(Language.something_went_wrong);
        }
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

// Watcher: watch auth request
export default function* watchProfile() {
    yield takeLatest(ActionTypes.GET_PROFILE, getProfile);
    yield takeLatest(ActionTypes.UPDATE_NOTIFICATION_SETTINGS, updateNotificationSetting);
    yield takeLatest(ActionTypes.UPDATE_PROFILE, updateProfile);
    yield takeLatest(ActionTypes.UPDATE_PASSWORD, updatePassword);
    yield takeLatest(ActionTypes.GET_USER_GROUPS, _getMyAllGroups);
    yield takeEvery(ActionTypes.GET_USER_UPCOMING_PAST_EVENTS, _getUpcomingPastEvents);
    yield takeEvery(ActionTypes.PAYPAL_TRACK_SELLER, _paypalTrackSeller);
    // yield takeLatest(ActionTypes.GET_USER_GROUPS, _getMyAllGroups);

};