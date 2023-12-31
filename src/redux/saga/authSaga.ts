import AnalyticService from 'analytics';
import * as ApiProvider from 'api/APIProvider';
import { doLogin as doLoginAction, resetStateOnLogin, resetStateOnLogout, restorePurchase as restorePurchaseAction, setLoadingAction, setLoadingMsg, tokenExpired as tokenExpiredAction } from "app-store/actions";
import { colors } from 'assets/Colors';
import DeviceInfo from 'react-native-device-info';
import FastImage from 'react-native-fast-image';
import { call, put, takeLatest } from "redux-saga/effects";
import Database from 'src/database/Database';
import Language from 'src/language/Language';
import { dateFormat, NavigationService, stringToDate, WaitTill, _hidePopUpAlert, _showErrorMessage, _showPopUpAlert, _showSuccessMessage } from "utils";
import { store } from '..';
import ActionTypes, { action } from "../action-types";
let installer = "Other"
DeviceInfo.getInstallerPackageName().then((installerPackageName) => {
    console.log("installerPackageName", installerPackageName);
    installer = installerPackageName

    // Play Store: "com.android.vending"
    // Amazon: "com.amazon.venezia"
    // Samsung App Store: "com.sec.android.app.samsungapps"
    // iOS: "AppStore", "TestFlight", "Other"
});

function* doLogin({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    const firebaseToken = Database.getStoredValue('firebaseToken')
    const { isSignUp = false, ...rest } = payload
    try {
        let res = yield call(isSignUp ? ApiProvider._restoreAccount : ApiProvider._loginApi, { ...rest, device_token: firebaseToken });
        yield put(setLoadingAction(false));
        if (res?.status == 200) {
            if (res?.data?.is_two_factor_enabled == '1') {
                NavigationService.navigate('VerifyOtp', { is2FA: true, ...rest });
            }
            else {
                yield put(resetStateOnLogin())
                ApiProvider.TOKEN_EXPIRED.current = false
                // _showSuccessMessage(res.message);
                const { access_token, notification_settings, ...userData } = res?.data
                yield call(AnalyticService.setUserData, userData, 1)
                if (userData?.is_premium == 1 && userData?.type != 'trial') {
                    userData.is_premium = false
                }
                Database.setMultipleValues({
                    authToken: access_token,
                    userData: userData,
                    isLogin: true
                })
                const isRestored = Database.getOtherBool("restored_" + userData?._id);
                if (isRestored) {
                    yield call(WaitTill, 100);
                    yield put(restorePurchaseAction({ noAlert: true }))
                }
            }
        } else if (res?.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error 1", error);
        yield put(setLoadingAction(false));
    }
}

function* forgotPassword({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));

    try {
        let res = yield call(ApiProvider._forgotPassword, payload);
        if (res?.status == 200) {
            NavigationService.navigate("VerifyOtp", payload)
        } else if (res?.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error 2", error);
        yield put(setLoadingAction(false));
    }
}

const showRestoreAlert = (payload: any) => {
    const { isSignUp, ...rest } = payload
    _showPopUpAlert({
        title: Language.restore_account,
        message: Language.do_you_want_to_restore + "\n",
        buttonText: Language.yes_restore,
        buttonStyle: { backgroundColor: colors.colorPrimary },
        cancelButtonText: Language.create_a_new_account,
        onPressCancel: () => {
            _showPopUpAlert({
                title: Language.warning,
                message: Language.create_new_account_warning,
                buttonText: Language.yes_continue,
                cancelButtonText: Language.no_go_back,
                onPressCancel: () => showRestoreAlert(payload),
                onPressButton: () => {
                    _hidePopUpAlert()
                    NavigationService.replace("SignUp1", rest)
                }
            })
        },
        onPressButton: () => {
            _hidePopUpAlert()
            store.dispatch(doLoginAction(payload))
        }
    })
}

function* verifyOtp({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        const { isSignUp = false, is2FA = false, ...rest } = payload
        if (is2FA) rest.device_token = Database.getStoredValue('firebaseToken')
        let res = yield call(isSignUp || is2FA ? ApiProvider._verifySignupOtp : ApiProvider._verifyOtp, rest);
        if (res?.status == 200) {
            if (isSignUp) {
                if (res?.data?.resignUp) {
                    yield put(setLoadingAction(false));
                    return showRestoreAlert(payload)
                }
                NavigationService.replace("SignUp1", rest)
                yield put(setLoadingAction(false));
                return
            }
            if (is2FA) {
                yield put(resetStateOnLogin())
                ApiProvider.TOKEN_EXPIRED.current = false
                // _showSuccessMessage(res.message);
                const { access_token, notification_settings, ...userData } = res?.data
                // if (!__DEV__) {
                yield call(AnalyticService.setUserData, userData, 1)
                // }
                if (userData?.is_premium == 1 && userData?.type != 'trial') {
                    userData.is_premium = false
                }
                Database.setMultipleValues({
                    authToken: access_token,
                    userData: userData,
                    isLogin: true
                })
                return
            }
            NavigationService.replace("CreateNewPassword", rest)
        } else if (res?.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error 3", error);
        yield put(setLoadingAction(false));
    }
}


function* resetPassword({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));

    try {
        let res = yield call(ApiProvider._resetPassword, payload);
        if (res?.status == 200) {
            _showSuccessMessage(res.message);
            NavigationService.navigate("Login")
        } else if (res?.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error 4", error);
        yield put(setLoadingAction(false));
    }
}

function* checkEmail({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));

    try {
        let res = yield call(ApiProvider._checkEmail, { email: payload?.email });
        if (res?.status == 200) {
            payload?.onSuccess()
            return
        } else if (res?.status == 400) {
            payload?.onSuccess(res.message)
            // _showErrorMessage(res.message);
        } else {
            // _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error 5", error);
        yield put(setLoadingAction(false));
    }
}

function* doSignUp({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    const { otp, ...rest } = payload
    const firebaseToken = Database.getStoredValue('firebaseToken')
    try {
        let res = yield call(ApiProvider._signUp, { ...rest, device_token: firebaseToken });
        if (res?.status == 200) {
            _showSuccessMessage(res?.message);
            yield put(resetStateOnLogin())
            const { access_token, notification_settings, location, ...userData } = res?.data
            // if (!__DEV__) {
            yield call(AnalyticService.setUserData, userData, 2)
            // }
            ApiProvider.TOKEN_EXPIRED.current = false
            Database.setMultipleValues({
                authToken: access_token,
                userData,
                isLogin: true
            })
        } else if (res?.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error 6", error);
        yield put(setLoadingAction(false));
    }
}

function* doLogout({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        const firebaseToken = Database.getStoredValue('firebaseToken')
        let res = yield call(ApiProvider._logoutApi, { device_token: firebaseToken });
        if (res?.status == 200) {
        } else if (res?.status == 400) {
            // _showErrorMessage(res.message);
        } else {
            // _showErrorMessage(Language.something_went_wrong);
        }
        _hidePopUpAlert()
        yield put(tokenExpiredAction(false));
        yield put(setLoadingAction(false));

    }
    catch (error) {
        console.log("Catch Error 7", error);
        _hidePopUpAlert()
        yield put(tokenExpiredAction(false));
        yield put(setLoadingAction(false));
    }
}

function* deleteAccount({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._deleteAccount, payload);
        if (res?.status == 200) {
            _showErrorMessage(res.message);
            _hidePopUpAlert()
            yield put(tokenExpiredAction(false));
        } else if (res?.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error 8", error);
        yield put(setLoadingAction(false));
    }
}

function* tokenExpired({ type, payload, }: action): Generator<any, any, any> {
    if (payload) {
        yield put(setLoadingAction(true));
        yield put(setLoadingMsg("Logging out"));
    }
    try {
        // if (!__DEV__) {
        yield put(setLoadingAction(true));
        yield call(AnalyticService.clearUserData)
        yield put(setLoadingAction(false));
        // }
        Database.setMultipleValues({
            isLogin: false,
            userData: null,
            authToken: '',
        })
        yield call(WaitTill, 1000)
        yield put(resetStateOnLogout())
        FastImage.clearMemoryCache()
    }
    catch (error) {
        console.log("Catch Error 9", error);
        yield put(setLoadingAction(false));
    }
}

function* restorePurchase({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(false));
    try {
        let res = yield call(ApiProvider._getActiveMembership);
        if (res?.status == 200) {
            let thisDate = stringToDate(dateFormat(new Date(), "YYYY-MM-DD"));
            let expireAt = res?.data?.expire_at ? stringToDate(res?.data?.expire_at, "YYYY-MM-DD") : thisDate;
            if (res?.data?.expire_at_unix) {
                expireAt = new Date(parseInt(res?.data?.expire_at_unix))
                thisDate = new Date()
            }
            const oldUserData = Database.getStoredValue("userData")
            // if (expireAt >= new Date()) {
            if (expireAt < thisDate || !res.data || (res?.data?.is_premium != undefined && !res?.data?.is_premium)) {
                // _showErrorMessage(Language.you_are_not_a_member)
                Database.setOtherBool("restored_" + oldUserData?._id, false)
            } else {
                if (!oldUserData?.is_premium) {
                    if (payload?.noAlert) {
                        Database.setUserData({ ...oldUserData, is_premium: true })
                        Database.setOtherBool("restored_" + oldUserData?._id, true)
                    } else {
                        _showPopUpAlert({
                            title: Language.enjoy_premium_benefits,
                            message: Language.do_you_want_to_restore_your_purchases,
                            buttonText: Language.restore_free,
                            isClose: true,
                            onPressButton: () => {
                                _hidePopUpAlert()
                                _showSuccessMessage(Language.purchase_successfully_restored)
                                Database.setUserData({ ...oldUserData, is_premium: true })
                                Database.setOtherBool("restored_" + oldUserData?._id, true)
                            }
                        })
                    }
                }
            }

        } else if (res?.status == 400) {
            // _showErrorMessage(res.message);
        } else {
            // _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error 10", error);
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
    yield takeLatest(ActionTypes.RESTORE_PURCHASE, restorePurchase);


};