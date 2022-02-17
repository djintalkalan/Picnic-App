import * as ApiProvider from 'api/APIProvider';
import { setAllEvents, setAllGroups, setLoadingAction, setLoadingMsg, tokenExpired as tokenExpiredAction } from "app-store/actions";
import { call, put, takeLatest } from "redux-saga/effects";
import Database from 'src/database/Database';
import Language from 'src/language/Language';
import { NavigationService, _hidePopUpAlert, _showErrorMessage, _showSuccessMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* doLogin({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    const firebaseToken = Database.getStoredValue('firebaseToken')
    try {
        let res = yield call(ApiProvider._loginApi, { ...payload, device_token: firebaseToken });
        yield put(setLoadingAction(false));
        if (res.status == 200) {
            _showSuccessMessage(res.message);
            const { access_token, notification_settings, ...userData } = res?.data
            Database.setMultipleValues({
                authToken: access_token,
                userData,
                isLogin: true
            })
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

function* forgotPassword({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));

    try {
        let res = yield call(ApiProvider._forgotPassword, payload);
        if (res.status == 200) {
            NavigationService.navigate("VerifyOTP", payload)
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

function* verifyOtp({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));

    try {
        let res = yield call(ApiProvider._verifyOtp, payload);
        if (res.status == 200) {
            NavigationService.replace("CreateNewPassword", payload)
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


function* resetPassword({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));

    try {
        let res = yield call(ApiProvider._resetPassword, payload);
        if (res.status == 200) {
            _showSuccessMessage(res.message);
            NavigationService.navigate("Login")
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

function* doSignUp({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    const firebaseToken = Database.getStoredValue('firebaseToken')
    try {
        let res = yield call(ApiProvider._signUp, { ...payload, device_token: firebaseToken });
        if (res.status == 200) {
            _showSuccessMessage(res?.message);
            const { access_token, notification_settings, location, ...userData } = res?.data
            Database.setMultipleValues({
                authToken: access_token,
                userData,
                isLogin: true
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

function* doLogout({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._logoutApi);
        if (res.status == 200) {
        } else if (res.status == 400) {
            // _showErrorMessage(res.message);
        } else {
            // _showErrorMessage(Language.something_went_wrong);
        }
        _hidePopUpAlert()
        yield put(tokenExpiredAction(false));
        yield put(setLoadingAction(false));

    }
    catch (error) {
        console.log("Catch Error", error);
        _hidePopUpAlert()
        yield put(tokenExpiredAction(false));
        yield put(setLoadingAction(false));
    }
}

function* deleteAccount({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._deleteAccount, payload);
        if (res.status == 200) {
            _showErrorMessage(res.message);
            _hidePopUpAlert()
            yield put(tokenExpiredAction(false));
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

function* tokenExpired({ type, payload, }: action): Generator<any, any, any> {
    if (payload) {
        yield put(setLoadingAction(true));
        yield put(setLoadingMsg("Logging out"));
    }
    try {
        Database.setMultipleValues({
            isLogin: false,
            userData: null,
            authToken: '',
        })

        yield put(setAllGroups([]))
        yield put(setAllEvents([]))



    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

// Watcher: watch auth request
export default function* watchAuth() {
    yield takeLatest(ActionTypes.DO_LOGIN, doLogin);
    yield takeLatest(ActionTypes.VERIFY_OTP, verifyOtp);
    yield takeLatest(ActionTypes.FORGOT_PASSWORD, forgotPassword);
    yield takeLatest(ActionTypes.RESET_PASSWORD, resetPassword);
    yield takeLatest(ActionTypes.DO_SIGN_UP, doSignUp);
    yield takeLatest(ActionTypes.DO_LOGOUT, doLogout);
    yield takeLatest(ActionTypes.TOKEN_EXPIRED, tokenExpired);
    yield takeLatest(ActionTypes.CHECK_EMAIL, checkEmail);
    yield takeLatest(ActionTypes.DELETE_ACCOUNT, deleteAccount);


};