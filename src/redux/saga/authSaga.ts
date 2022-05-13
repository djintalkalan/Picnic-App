import analytics from '@react-native-firebase/analytics';
import * as ApiProvider from 'api/APIProvider';
import { doLogin as doLoginAction, resetStateOnLogin, resetStateOnLogout, setLoadingAction, setLoadingMsg, tokenExpired as tokenExpiredAction } from "app-store/actions";
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
        if (res.status == 200) {
            yield put(resetStateOnLogin())
            ApiProvider.TOKEN_EXPIRED.current = false
            // _showSuccessMessage(res.message);
            const { access_token, notification_settings, ...userData } = res?.data
            try {
                if (!__DEV__) {
                    analytics().setUserId(userData?._id)
                    analytics().setUserProperties({
                        username: userData?.username,
                        fullName: userData?.first_name + (userData?.last_name ? (" " + userData?.last_name) : ""),
                        email: userData?.email
                    })
                }
            }
            catch (e) {
                console.log("Analytical Error", e);
            }

            Database.setMultipleValues({
                authToken: access_token,
                userData: { ...userData, is_premium: false },
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
            NavigationService.navigate("VerifyOtp", payload)
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
        const { isSignUp = false, ...rest } = payload
        let res = yield call(isSignUp ? ApiProvider._verifySignupOtp : ApiProvider._verifyOtp, rest);
        if (res.status == 200) {
            if (isSignUp) {
                if (res?.data?.resignUp) {
                    yield put(setLoadingAction(false));
                    return (
                        _showPopUpAlert({
                            title: Language.restore_account,
                            message: Language.do_you_want_to_restore + "\n",
                            buttonText: Language.yes_restore,
                            buttonStyle: { backgroundColor: colors.colorPrimary },
                            cancelButtonText: Language.create_a_new_account,
                            onPressCancel: () => {
                                _hidePopUpAlert()
                                NavigationService.replace("SignUp1", rest)
                            },
                            onPressButton: () => {
                                _hidePopUpAlert()
                                store.dispatch(doLoginAction(payload))
                            }
                        })
                    )
                }
                NavigationService.replace("SignUp1", rest)
                yield put(setLoadingAction(false));
                return
            }
            NavigationService.replace("CreateNewPassword", rest)
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
            return
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
    const { otp, ...rest } = payload
    const firebaseToken = Database.getStoredValue('firebaseToken')
    try {
        let res = yield call(ApiProvider._signUp, { ...rest, device_token: firebaseToken });
        if (res.status == 200) {
            _showSuccessMessage(res?.message);
            yield put(resetStateOnLogin())
            const { access_token, notification_settings, location, ...userData } = res?.data
            try {
                if (!__DEV__) {
                    analytics()?.setUserId(userData?._id)
                    analytics()?.setUserProperties({
                        username: userData?.username,
                        fullName: userData?.first_name + (userData?.last_name ? (" " + userData?.last_name) : ""),
                        email: userData?.email
                    })
                }
            }
            catch (e) {
                console.log("Analytical Error", e);
            }
            ApiProvider.TOKEN_EXPIRED.current = false
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
        const firebaseToken = Database.getStoredValue('firebaseToken')
        let res = yield call(ApiProvider._logoutApi, { device_token: firebaseToken });
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
        try {
            if (!__DEV__) {
                analytics().setUserId(null)
                analytics().setUserProperties({
                    username: null,
                    fullName: null,
                    email: null
                })
            }
        }
        catch (e) {
            console.log("Analytical Error", e);
        }
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
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}

function* restorePurchase({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(false));
    try {
        let res = yield call(ApiProvider._getActiveMembership);
        if (res?.status == 200) {
            const thisDate = stringToDate(dateFormat(new Date(), "YYYY-MM-DD"));
            const expireAt = res?.data?.expire_at ? stringToDate(res?.data?.expire_at, "YYYY-MM-DD") : thisDate;
            // if (expireAt >= new Date()) {
            if (expireAt < thisDate || !res.data || (res?.data?.is_premium != undefined && !res?.data?.is_premium)) {
                // _showErrorMessage(Language.you_are_not_a_member)
            } else {
                const oldUserData = Database.getStoredValue("userData")

                if (!oldUserData?.is_premium)
                    _showPopUpAlert({
                        title: Language.restore_purchase,
                        message: Language.do_you_want_to_restore_your_purchases,
                        buttonText: Language.restore,
                        onPressButton: () => {
                            _hidePopUpAlert()
                            _showSuccessMessage(Language.purchase_successfully_restored)
                            Database.setUserData({ ...oldUserData, is_premium: true })
                        }
                    })
            }

        } else if (res.status == 400) {
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