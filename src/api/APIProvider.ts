import { config } from 'api';
import { store } from 'app-store';
import { setLoadingAction } from 'app-store/actions';
import axios, { Method } from 'axios';
import { DeviceEventEmitter } from 'react-native';
import Database from 'src/database/Database';
import { LanguageType } from 'src/language/Language';
import { _showErrorMessage } from 'utils';

interface header {
    Accept: string;
    "Content-Type": string;
    Authorization?: string,
    "X-Platform-Type": string;
    accept_language?: LanguageType
}

async function callApi(urlString: string, header: header, body: any, methodType: Method, isMultipart: boolean | undefined) {
    if (config.REACTOTRON_STATUS == 'false') {
        console.log("-----------AXIOS  Api request is----------- ");
        console.log("url string " + urlString);
        console.log("header " + JSON.stringify(header));
        console.log("body " + JSON.stringify(body));
        console.log("methodType " + methodType)
    }
    return axios({
        method: methodType, //you can set what request you want to be
        url: urlString,
        data: isMultipart ? body : (methodType != "GET" && body) ? body : null,
        headers: header
    }).then(res => {
        if (config.REACTOTRON_STATUS == 'false') {
            console.log("-----------AXIOS  Api Response is----------- ");
            console.log("url string " + urlString);
            console.log("header " + JSON.stringify(header));
            console.log("body " + JSON.stringify(body));
            console.log("methodType " + methodType)
            console.log("\n ------ AXIOS RESPONSE " + urlString + " --------\n\n", res.data);
        }
        if (JSON.stringify(res.data).startsWith("<") || JSON.stringify(res.data).startsWith("\"<")) {
            DeviceEventEmitter.emit("STOP_LOADER_EVENT");
            setTimeout(() => {
                _showErrorMessage("A webpage is returned instead of a response")
            }, 500);
        } else if (res.data?.status == config.UNAUTHORIZED_ERROR_CODE) {
            DeviceEventEmitter.emit("TOKEN_EXPIRED")
            _showErrorMessage("Invalid Session. Please Login Again")
        }
        else
            return res.data
    }
    )
        .catch(e => {
            console.log("-----------AXIOS  Api catch is -----------\n" + urlString + "\n")
            console.log(e)
            console.log("catch Error" + JSON.stringify(e))
            if (e.response && e.response.data) {
                if (config.REACTOTRON_STATUS == 'false') {
                    console.log("catch response", JSON.stringify(e.response.data))
                }
                if (JSON.stringify(e.response.data).startsWith("<") || JSON.stringify(e.response.data).startsWith("\"<")) {
                    DeviceEventEmitter.emit("STOP_LOADER_EVENT");
                    setTimeout(() => {
                        _showErrorMessage("A webpage is returned instead of a response")
                    }, 500);
                }
                else {
                    if (e.response.data?.status == config.UNAUTHORIZED_ERROR_CODE) {
                        DeviceEventEmitter.emit("TOKEN_EXPIRED")
                        _showErrorMessage("Invalid Session. Please Login Again")
                    }
                    return e.response.data
                }
            }
            else {
                store.dispatch(setLoadingAction(false));
                throw new Error("Request Failed");
            }
        })
}

async function fetchApiData(urlString: string, body: any | null, methodType: Method) {
    const isMultipart = (body && body instanceof FormData) ? true : false
    const authToken = Database.getStoredValue('authToken')
    const selectedLanguage = Database.getStoredValue<LanguageType>('selectedLanguage') || "en"
    try {
        let header: header = {
            Accept: "application/json",
            "Content-Type": (isMultipart) ? "multipart/form-data" : "application/json",
            'X-Platform-Type': 'app',
            'Authorization': authToken ? ("Bearer " + authToken) : undefined,
            'accept_language': selectedLanguage
        }
        return callApi(urlString, header, body, methodType, isMultipart)
    } catch (error: any) {
        throw new Error(error)
    }
}


export const _signUp = async (body: any) => {
    console.log("---------- new_signup OTP Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/signup', body, "POST")
}

export const _loginApi = async (body: any) => {
    console.log("---------- _loginApi Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/login', body, "POST")
}

export const _logoutApi = async () => {
    console.log("---------- Logout Api Call ---------------")
    return fetchApiData(config.API_URL + 'logout', null, "GET")
}

export const _forgotPassword = async (body: any) => {
    console.log("---------- Forgot Password Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/forgot-password', body, "POST")
}

export const _resetPassword = async (body: any) => {
    console.log("---------- Reset Password Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/reset-password', body, "POST")
}

export const _checkEmail = async (body: any) => {
    console.log("---------- Reset Password Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/check-email', body, "POST")
}


export const _verifyOtp = async (body: any) => {
    console.log("---------- Verify Otp Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/verify-otp', body, "POST")
}