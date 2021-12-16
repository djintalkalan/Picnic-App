import * as ApiProvider from 'api/APIProvider';
import { setLoadingAction } from "app-store/actions";
import { setNotificationSettings } from 'app-store/actions/profileActions';
import { call, put, takeLatest } from "redux-saga/effects";
import Database from 'src/database/Database';
import Language from 'src/language/Language';
import { NavigationService, _showErrorMessage, _showSuccessMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* getProfile({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getProfile);
        if (res.status == 200) {
            const { notification_settings, ...userData } = res?.data
            yield put(setNotificationSettings({
                ...notification_settings,
                is_notification_enabled: userData?.is_notification_enabled
            }))
            Database.setUserData(userData)
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
        let res = yield call(ApiProvider._updateProfile, payload);
        if (res.status == 200) {
            _showSuccessMessage(res.message);
            const { notification_settings, ...userData } = res?.data
            yield put(setNotificationSettings({
                ...notification_settings,
                is_notification_enabled: userData?.is_notification_enabled
            }))
            Database.setUserData(userData)
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
// Watcher: watch auth request
export default function* watchProfile() {
    yield takeLatest(ActionTypes.GET_PROFILE, getProfile);
    yield takeLatest(ActionTypes.UPDATE_NOTIFICATION_SETTINGS, updateNotificationSetting);
    yield takeLatest(ActionTypes.UPDATE_PROFILE, updateProfile);
    yield takeLatest(ActionTypes.UPDATE_PASSWORD, updatePassword);

};